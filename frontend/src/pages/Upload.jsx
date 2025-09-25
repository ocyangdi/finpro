import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Upload as UploadIcon, FileText, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { uploadAPI, handleApiError } from '../services/api'

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploadStatus, setUploadStatus] = useState(null)

  const uploadMutation = useMutation({
    mutationFn: (formData) => uploadAPI.upload(formData),
    onSuccess: (response) => {
      const data = response.data
      setUploadStatus({
        type: 'success',
        message: data.message || 'Document uploaded successfully!',
        documentId: data.document?.id,
      })
      setSelectedFile(null)
      setTitle('')
      setDescription('')
    },
    onError: (error) => {
      setUploadStatus({
        type: 'error',
        message: handleApiError(error).message,
      })
    },
  })

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

      setSelectedFile(file)
      setUploadStatus(null)
      
      // Auto-fill title from filename if not set
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, "")) // Remove extension
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a file to upload',
      })
      return
    }

    const formData = new FormData()
    formData.append('document', selectedFile)
    formData.append('title', title || selectedFile.name.replace(/\.[^/.]+$/, ""))
    formData.append('description', description)
    formData.append('userId', '1') // Use valid user ID (1 for alice) instead of string

    uploadMutation.mutate(formData)
  }

  const StatusMessage = ({ status }) => {
    if (!status) return null

    const getStatusIcon = () => {
      switch (status.type) {
        case 'success':
          return <CheckCircle className="h-5 w-5 text-green-500" />
        case 'error':
          return <AlertCircle className="h-5 w-5 text-red-500" />
        case 'processing':
          return <Loader className="h-5 w-5 text-blue-500 animate-spin" />
        default:
          return null
      }
    }

    const getStatusClass = () => {
      switch (status.type) {
        case 'success':
          return 'bg-green-50 border-green-200 text-green-800'
        case 'error':
          return 'bg-red-50 border-red-200 text-red-800'
        case 'processing':
          return 'bg-blue-50 border-blue-200 text-blue-800'
        default:
          return 'bg-gray-50 border-gray-200 text-gray-800'
      }
    }

    return (
      <div className={`p-4 rounded-lg border ${getStatusClass()} flex items-start space-x-3`}>
        {getStatusIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium">{status.message}</p>
          {status.documentId && (
            <p className="text-xs opacity-75 mt-1">
              Document ID: {status.documentId}
            </p>
          )}
        </div>
        <button
          onClick={() => setUploadStatus(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload PDF, Word, or text documents for AI-powered analysis
        </p>
      </div>

      {/* Upload Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Document Information</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    {selectedFile ? (
                      <div className="flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-400" />
                        <div className="ml-4 text-left">
                          <p className="text-sm font-medium text-gray-900">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="ml-4 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
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
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Document Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input mt-1"
                  placeholder="Enter document title"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="input mt-1"
                  placeholder="Brief description of the document"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploadMutation.isLoading || !selectedFile}
                className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadMutation.isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Upload Document'
                )}
              </button>
            </form>

            {/* Status Message */}
            {uploadStatus && <StatusMessage status={uploadStatus} />}
          </div>
        </div>

        {/* Right Column - Instructions */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Upload Guidelines</h2>
            </div>
            <div className="card-body space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-700">1</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Supported formats: PDF, DOCX, DOC, and TXT files
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-700">2</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Maximum file size: 10MB per document
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-700">3</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Documents are processed automatically for AI analysis
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-700">4</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Processing time varies based on document size and complexity
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Best Practices</h2>
            </div>
            <div className="card-body space-y-2 text-sm">
              <p className="text-gray-600">
                • Use clear, descriptive titles for better organization
              </p>
              <p className="text-gray-600">
                • Upload documents with well-structured text content
              </p>
              <p className="text-gray-600">
                • Avoid scanned documents with poor OCR quality
              </p>
              <p className="text-gray-600">
                • Break large documents into smaller, focused files
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Upload