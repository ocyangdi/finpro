import React from 'react'
import Layout from '../components/Layout'
import ChatWindow from '../components/ChatWindow'

const Chat = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Chat Assistant</h1>
        <p className="mt-1 text-sm text-gray-600">
          Interactive chat interface for asking questions about your financial documents
        </p>
      </div>

      {/* Chat Window */}
      <div className="h-[600px]">
        <ChatWindow />
      </div>

      {/* Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">How to Use</h2>
          </div>
          <div className="card-body">
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Ask specific questions about your financial documents</li>
              <li>• The AI will search through all available documents</li>
              <li>• Responses include confidence scores and source references</li>
              <li>• Use clear and concise language for best results</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Features</h2>
          </div>
          <div className="card-body">
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Real-time conversation with AI assistant</li>
              <li>• Document-based question answering</li>
              <li>• Source citation and confidence scoring</li>
              <li>• Clean and intuitive user interface</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat