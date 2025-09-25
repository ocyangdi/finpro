import React, { useState, useEffect } from 'react'
import { Send, Loader, MessageSquare, Upload, FileText, X } from 'lucide-react'
import { qaAPI, documentsAPI, uploadAPI, handleApiError } from '../services/api'

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
      // Call the API endpoint with optional document filter
      const requestData = {
        question: inputMessage,
        topK: 3
      }
      
      if (selectedDocument) {
        requestData.documentId = selectedDocument
      }

      const response = await qaAPI.ask(requestData)

      const aiMessage = {
        id: Date.now() + 1,
        type: 'answer',
        content: response.data.answer,
        confidence: response.data.confidence,
        timestamp: new Date(),
        sources: response.data.sources
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
    console.error('Error sending message:', error)
    
    // 优雅降级机制：根据错误类型和问题内容提供不同的优雅回答
    let fallbackMessage = ''
    
    // 检查用户问题是否包含报销相关内容
    const isReimbursementQuestion = inputMessage.includes('报销') || 
                                   inputMessage.includes('报销流程') ||
                                   inputMessage.includes('怎么报销') ||
                                   inputMessage.includes('如何报销')
    
    if (isReimbursementQuestion) {
      // 报销相关的专门回答
      fallbackMessage = '💰 **报销基本定义**\n报销是指员工因公发生的合理费用，按照公司规定向企业申请补偿的过程。\n\n📋 **报销基本流程**\n\n1. **准备材料**\n   • 原始发票/收据（需符合税务规定）\n   • 费用明细说明\n   • 审批单据（如需要）\n\n2. **填写报销单**\n   • 填写费用项目、金额、日期\n   • 附上相关证明材料\n   • 签字确认\n\n3. **审批流程**\n   • 部门主管审批\n   • 财务部门审核\n   • 特殊情况需要额外审批\n\n4. **财务处理**\n   • 审核通过后打款\n   • 一般3-7个工作日内完成\n\n💡 **注意事项**\n• 发票抬头需与公司名称一致\n• 报销金额需符合公司规定\n• 及时报销，避免过期\n• 保留所有原始凭证备查'
    } else if (error.response?.status === 500) {
      // 服务器内部错误
      fallbackMessage = '抱歉，系统暂时遇到了一些技术问题。我仍然可以为您提供一些基本的财务分析建议：\n\n1. 财务报表分析通常包括资产负债表、利润表和现金流量表\n2. 关注关键财务比率如流动比率、资产负债率、净利润率\n3. 分析趋势变化和行业对比\n\n请稍后再试或联系技术支持。'
    } else if (error.response?.status === 400) {
      // 请求参数错误
      fallbackMessage = '您的问题格式可能需要调整。请尝试：\n\n• 使用更具体的问题描述\n• 确保问题与财务文档相关\n• 避免过于复杂的技术术语\n\n例如："如何分析公司的盈利能力？"或"什么是现金流量表？"'
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      // 网络连接问题
      fallbackMessage = '网络连接似乎不太稳定。以下是一些通用的财务分析要点：\n\n📊 **财务分析基础**\n• 盈利能力分析：关注毛利率、净利率\n• 偿债能力分析：流动比率、速动比率\n• 运营效率分析：存货周转率、应收账款周转率\n\n请检查网络连接后重试。'
    } else {
      // 其他错误
      fallbackMessage = '系统暂时无法提供AI回答。以下是一些财务文档分析的通用指导：\n\n💡 **文档分析建议**\n1. 首先了解文档的基本结构和内容\n2. 识别关键财务指标和数据\n3. 对比历史数据或行业标准\n4. 关注异常变化和趋势\n\n您可以稍后重试或上传相关文档获取更精准的分析。'
    }
    
    const fallbackMessageObj = {
      id: Date.now() + 1,
      type: 'answer',
      content: fallbackMessage,
      confidence: 0.3,
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
      formData.append('userId', 'demo-user') // For testing without auth

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
      
      return (
        <div className="flex justify-start mb-4">
          <div className={`${isFallback ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'} border rounded-lg px-4 py-3 max-w-3/4`}>
            {isFallback && (
              <div className="flex items-center mb-2">
                <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  💡 降级回答
                </div>
              </div>
            )}
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {message.confidence && (
              <p className="text-xs text-gray-500 mt-1">
                Confidence: {(message.confidence * 100).toFixed(1)}%
              </p>
            )}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-600 font-medium mb-1">Sources:</p>
                {message.sources.map((source, index) => (
                  <div key={index} className="text-xs text-gray-500 mb-1">
                    • {source.documentTitle} (score: {source.score.toFixed(3)})
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
          <h3 className="text-lg font-medium text-gray-900">AI Chat Assistant</h3>
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
              <option value="">All Documents</option>
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
            <p className="text-sm">Start a conversation with the AI assistant</p>
            <p className="text-xs mt-1">
              Ask questions about financial documents and get intelligent answers
            </p>
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