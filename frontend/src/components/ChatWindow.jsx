import React, { useState, useEffect } from 'react'
import { Send, Loader, MessageSquare, Upload, FileText, X, Brain, Zap } from 'lucide-react'
import { qaAPI, wingmanAPI, documentsAPI, uploadAPI, handleApiError } from '../services/api'

const ChatWindow = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState('')
  const [documents, setDocuments] = useState([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadStatus, setUploadStatus] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // Load documents on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await documentsAPI.getAll()
        setDocuments(response.data.documents || [])
      } catch (error) {
        console.error('Error loading documents:', error)
        setDocuments([])
      }
    }
    
    loadDocuments()
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'question',
      content: inputMessage,
      timestamp: new Date(),
      documentId: selectedDocument
    }

    // Add user message to chat
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Call both QA and Wingman APIs simultaneously
      const qaRequestData = {
        question: inputMessage,
        topK: 3
      }
      
      if (selectedDocument) {
        qaRequestData.documentId = selectedDocument
      }

      const wingmanRequestData = {
        question: inputMessage
      }

      // Make both API calls in parallel
      const [qaResponse, wingmanResponse] = await Promise.allSettled([
        qaAPI.ask(qaRequestData),
        wingmanAPI.chat(wingmanRequestData)
      ])

      // Process QA response
      if (qaResponse.status === 'fulfilled') {
        const qaMessage = {
          id: Date.now() + 1,
          type: 'answer',
          service: 'qa',
          content: qaResponse.value.data.answer,
          confidence: qaResponse.value.data.confidence,
          timestamp: new Date(),
          sources: qaResponse.value.data.sources
        }
        setMessages(prev => [...prev, qaMessage])
      } else {
        console.error('RAG Service API error:', qaResponse.reason)
        const qaErrorMessage = {
          id: Date.now() + 1,
          type: 'answer',
          service: 'qa',
          content: 'RAG服务暂时不可用，请稍后重试。',
          confidence: 0,
          timestamp: new Date(),
          error: true
        }
        setMessages(prev => [...prev, qaErrorMessage])
      }

      // Process Wingman response
      if (wingmanResponse.status === 'fulfilled') {
        const wingmanMessage = {
          id: Date.now() + 2,
          type: 'answer',
          service: 'wingman',
          content: wingmanResponse.value.data.answer || wingmanResponse.value.data.response,
          timestamp: new Date(),
          priority: 1 // OCBC AI has higher priority
        }
        setMessages(prev => [...prev, wingmanMessage])
      } else {
        console.error('OCBC AI API error:', wingmanResponse.reason)
        const wingmanErrorMessage = {
          id: Date.now() + 2,
          type: 'answer',
          service: 'wingman',
          content: 'OCBC AI服务暂时不可用，请稍后重试。',
          timestamp: new Date(),
          error: true
        }
        setMessages(prev => [...prev, wingmanErrorMessage])
      }

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Fallback mechanism
      let fallbackMessage = '系统暂时无法提供AI回答。请稍后重试或联系技术支持。'
      
      const fallbackMessageObj = {
        id: Date.now() + 1,
        type: 'answer',
        content: fallbackMessage,
        timestamp: new Date(),
        fallback: true
      }

      setMessages(prev => [...prev, fallbackMessageObj])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['.pdf', '.docx', '.doc', '.txt']
      const fileExtension = file.name.toLowerCase().slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2)
      
      if (!allowedTypes.includes('.' + fileExtension)) {
        setUploadStatus({
          type: 'error',
          message: `Unsupported file type: .${fileExtension}. Supported types: PDF, DOCX, DOC, TXT`,
        })
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setUploadStatus({
          type: 'error',
          message: 'File size too large. Maximum size is 10MB.',
        })
        return
      }

      setUploadFile(file)
      setUploadStatus(null)
      
      // Auto-fill title from filename if not set
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, "")) // Remove extension
      }
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    
    if (!uploadFile) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a file to upload',
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('document', uploadFile)
      formData.append('title', uploadTitle || uploadFile.name.replace(/\.[^/.]+$/, ""))
      formData.append('description', uploadDescription)
      formData.append('userId', 1) // Use valid user ID (1 for alice) instead of string

      const response = await uploadAPI.upload(formData)
      
      // Refresh documents list
      const docsResponse = await documentsAPI.getAll()
      setDocuments(docsResponse.data.documents || [])
      
      setUploadStatus({
        type: 'success',
        message: 'Document uploaded successfully!',
        documentId: response.data.document.id,
      })
      
      // Auto-select the newly uploaded document
      setSelectedDocument(response.data.document.id)
      
      // Reset form
      setUploadFile(null)
      setUploadTitle('')
      setUploadDescription('')
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowUploadModal(false)
      }, 2000)
      
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: handleApiError(error).message,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const closeUploadModal = () => {
    setShowUploadModal(false)
    setUploadFile(null)
    setUploadTitle('')
    setUploadDescription('')
    setUploadStatus(null)
  }

  const MessageBubble = ({ message }) => {
    if (message.type === 'question') {
      return (
        <div className="flex justify-end mb-4">
          <div className="bg-primary-600 text-white rounded-lg px-4 py-2 max-w-3/4">
            <p className="text-sm">{message.content}</p>
            <p className="text-xs text-primary-200 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      )
    }

    if (message.type === 'answer') {
      const isFallback = message.fallback
      const isError = message.error
      const service = message.service
      
      // Determine service-specific styling
      const getServiceStyle = () => {
        if (isError) return 'bg-red-50 border-red-200'
        if (isFallback) return 'bg-yellow-50 border-yellow-200'
        
        switch (service) {
          case 'wingman':
            return 'bg-blue-50 border-blue-200'
          case 'qa':
            return 'bg-green-50 border-green-200'
          default:
            return 'bg-white border-gray-200'
        }
      }
      
      const getServiceIcon = () => {
        switch (service) {
          case 'wingman':
            return <Brain className="h-4 w-4 text-blue-600" />
          case 'qa':
            return <Zap className="h-4 w-4 text-green-600" />
          default:
            return <MessageSquare className="h-4 w-4 text-gray-600" />
        }
      }
      
      const getServiceName = () => {
        switch (service) {
          case 'wingman':
            return 'OCBC AI'
          case 'qa':
            return 'RAG Service'
          default:
            return 'AI Assistant'
        }
      }
      
      return (
        <div className="flex justify-start mb-4">
          <div className={`${getServiceStyle()} border rounded-lg px-4 py-3 max-w-3/4`}>
            {/* Service Header */}
            <div className="flex items-center mb-2">
              {getServiceIcon()}
              <span className="text-xs font-medium ml-2">
                {getServiceName()}
                {message.priority && (
                  <span className="ml-1 text-xs text-blue-600">(优先级: {message.priority})</span>
                )}
              </span>
            </div>
            
            {isFallback && (
              <div className="flex items-center mb-2">
                <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  💡 降级回答
                </div>
              </div>
            )}
            
            {isError && (
              <div className="flex items-center mb-2">
                <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  ⚠️ 服务暂时不可用
                </div>
              </div>
            )}
            
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {/* QA-specific information */}
            {service === 'qa' && message.confidence && (
              <p className="text-xs text-gray-500 mt-1">
                置信度: {(message.confidence * 100).toFixed(1)}%
              </p>
            )}
            
            {service === 'qa' && message.sources && message.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-600 font-medium mb-1">来源文档:</p>
                {message.sources.map((source, index) => (
                  <div key={index} className="text-xs text-gray-500 mb-1">
                    • {source.documentTitle} (匹配度: {source.score.toFixed(3)})
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-400 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      )
    }

    if (message.type === 'error') {
      return (
        <div className="flex justify-start mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 max-w-3/4">
            <p className="text-sm text-red-800">{message.content}</p>
            <p className="text-xs text-red-600 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      )
    }

    return null
  }

  const StatusMessage = ({ status }) => {
    if (!status) return null

    const getStatusClass = () => {
      switch (status.type) {
        case 'success':
          return 'bg-green-50 border-green-200 text-green-800'
        case 'error':
          return 'bg-red-50 border-red-200 text-red-800'
        default:
          return 'bg-gray-50 border-gray-200 text-gray-800'
      }
    }

    return (
      <div className={`p-3 rounded-lg border ${getStatusClass()} text-sm`}>
        {status.message}
        {status.documentId && (
          <p className="text-xs opacity-75 mt-1">
            Document ID: {status.documentId}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">多AI服务聊天助手</h3>
        </div>
        <div className="flex items-center space-x-4">
          {/* Document Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Document:</span>
            <select
              value={selectedDocument}
              onChange={(e) => setSelectedDocument(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option key="all" value="">All Documents</option>
              {documents.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.title}
                </option>
              ))}
            </select>
          </div>
          
          {/* Upload Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </button>
          
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm">开始与多AI服务聊天助手对话</p>
            <p className="text-xs mt-1">
              输入问题，将同时获得OCBC AI和本地RAG服务的智能回答
            </p>
            <div className="mt-4 text-xs text-gray-400">
              <p key="wingman">OCBC AI: 企业级AI助手（优先级最高）</p>
              <p key="qa">RAG Service: 基于文档的智能问答</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center">
                <Loader className="h-4 w-4 text-gray-400 animate-spin mr-2" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 input"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Document</h3>
              <button
                onClick={closeUploadModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    {uploadFile ? (
                      <div className="flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-400" />
                        <div className="ml-4 text-left">
                          <p className="text-sm font-medium text-gray-900">
                            {uploadFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadFile(null)}
                          className="ml-4 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="upload-file"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500"
                          >
                            <span>Select a file</span>
                            <input
                              id="upload-file"
                              name="upload-file"
                              type="file"
                              className="sr-only"
                              onChange={handleFileSelect}
                              accept=".pdf,.docx,.doc,.txt"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOCX, DOC, or TXT up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="upload-title" className="block text-sm font-medium text-gray-700">
                  Document Title
                </label>
                <input
                  type="text"
                  id="upload-title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="input mt-1"
                  placeholder="Enter document title"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="upload-description" className="block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  id="upload-description"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={2}
                  className="input mt-1"
                  placeholder="Brief description of the document"
                />
              </div>

              {/* Status Message */}
              {uploadStatus && <StatusMessage status={uploadStatus} />}

              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Document'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatWindow