import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { 
  Brain, 
  MessageSquare, 
  FileText, 
  Code, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Loader2 
} from 'lucide-react'
import { copilotAPI } from '../services/api'

const Copilot = () => {
  const [activeTab, setActiveTab] = useState('enhance-qa')
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState('')

  // 查询 Copilot 状态和能力
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['copilot-status'],
    queryFn: () => copilotAPI.getStatus(),
    refetchInterval: 30000, // 每30秒刷新一次状态
  })

  const { data: capabilitiesData } = useQuery({
    queryKey: ['copilot-capabilities'],
    queryFn: () => copilotAPI.getCapabilities(),
  })

  // 增强问答
  const enhanceQAMutation = useMutation({
    mutationFn: (data) => copilotAPI.enhanceQA(data),
    onSuccess: (data) => {
      setResult(data.data?.answer || data.data?.result || '操作成功')
    },
    onError: (error) => {
      setResult(`错误: ${error.response?.data?.error || error.message}`)
    }
  })

  // 文档摘要
  const summarizeMutation = useMutation({
    mutationFn: (data) => copilotAPI.summarize(data),
    onSuccess: (data) => {
      setResult(data.data?.summary || data.data?.result || '摘要生成成功')
    },
    onError: (error) => {
      setResult(`错误: ${error.response?.data?.error || error.message}`)
    }
  })

  // 代码生成
  const generateCodeMutation = useMutation({
    mutationFn: (data) => copilotAPI.generateCode(data),
    onSuccess: (data) => {
      setResult(data.data?.code || data.data?.result || '代码生成成功')
    },
    onError: (error) => {
      setResult(`错误: ${error.response?.data?.error || error.message}`)
    }
  })

  const handleSubmit = () => {
    if (!inputText.trim()) return

    setResult('')
    
    const data = { text: inputText }
    
    switch (activeTab) {
      case 'enhance-qa':
        enhanceQAMutation.mutate(data)
        break
      case 'summarize':
        summarizeMutation.mutate(data)
        break
      case 'generate-code':
        generateCodeMutation.mutate(data)
        break
      default:
        break
    }
  }

  const isLoading = enhanceQAMutation.isPending || summarizeMutation.isPending || generateCodeMutation.isPending

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Microsoft Copilot</h1>
          </div>
          <p className="text-gray-600">使用 AI 增强的智能助手进行问答、摘要和代码生成</p>
        </div>

        {/* 状态指示器 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {statusLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : statusData?.data?.status === 'connected' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                Copilot 服务: {statusLoading ? '检查中...' : statusData?.data?.status || '未知'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              最后更新: {statusData?.data?.lastChecked ? new Date(statusData.data.lastChecked).toLocaleString() : '未知'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 功能卡片 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">功能</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('enhance-qa')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                    activeTab === 'enhance-qa' 
                      ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <Zap className="h-5 w-5" />
                  <span>增强问答</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('summarize')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                    activeTab === 'summarize' 
                      ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  <span>文档摘要</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('generate-code')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                    activeTab === 'generate-code' 
                      ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <Code className="h-5 w-5" />
                  <span>代码生成</span>
                </button>
              </div>
            </div>

            {/* 能力信息 */}
            {capabilitiesData?.data && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">支持的功能</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {capabilitiesData.data.capabilities?.map((capability, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{capability}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 输入和输出面板 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                {activeTab === 'enhance-qa' && '增强问答'}
                {activeTab === 'summarize' && '文档摘要'}
                {activeTab === 'generate-code' && '代码生成'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {activeTab === 'enhance-qa' && '输入您的问题'}
                    {activeTab === 'summarize' && '输入要摘要的文本'}
                    {activeTab === 'generate-code' && '输入代码需求描述'}
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      activeTab === 'enhance-qa' ? '例如：请解释一下什么是机器学习？' :
                      activeTab === 'summarize' ? '粘贴需要摘要的文档内容...' :
                      '例如：请帮我写一个Python函数来计算斐波那契数列'
                    }
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                  />
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !inputText.trim()}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                  <span>
                    {isLoading ? '处理中...' : 
                     activeTab === 'enhance-qa' ? '增强问答' :
                     activeTab === 'summarize' ? '生成摘要' : '生成代码'}
                  </span>
                </button>
              </div>
            </div>

            {/* 结果展示 */}
            {result && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">结果</h3>
                <div className="prose max-w-none">
                  {activeTab === 'generate-code' ? (
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                      <code>{result}</code>
                    </pre>
                  ) : (
                    <div className="text-gray-700 whitespace-pre-wrap">{result}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Copilot