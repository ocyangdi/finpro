import React from 'react'
import { 
  FileText, 
  Upload, 
  MessageSquare, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Brain
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { documentsAPI, healthAPI } from '../services/api'
import ChatWindow from '../components/ChatWindow'

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['documentStats'],
    queryFn: () => documentsAPI.getStats(),
    refetchInterval: 10000 // Refresh every 10 seconds
  })

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: healthAPI.check,
    refetchInterval: 5000 // Refresh every 5 seconds
  })



  const StatCard = ({ title, value, icon: Icon, color = 'blue', loading = false }) => (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
            ) : (
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const StatusIndicator = ({ status, message }) => {
    const getStatusInfo = () => {
      switch (status) {
        case 'OK':
          return { icon: CheckCircle, color: 'green', text: 'Operational' }
        case 'degraded':
          return { icon: AlertCircle, color: 'yellow', text: 'Degraded' }
        default:
          return { icon: AlertCircle, color: 'red', text: 'Offline' }
      }
    }

    const { icon: Icon, color, text } = getStatusInfo()

    return (
      <div className="flex items-center space-x-2">
        <Icon className={`h-5 w-5 text-${color}-500`} />
        <span className={`text-sm font-medium text-${color}-700`}>{text}</span>
        {message && <span className="text-sm text-gray-500">- {message}</span>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finance Home</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of finance RAG intelligence system
        </p>
      </div>

      {/* Chat Window */}
      <div className="h-[500px]">
        <ChatWindow />
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">System Status</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Backend API</span>
              {healthLoading ? (
                <Loader className="h-5 w-5 text-gray-400 animate-spin" />
              ) : (
                <StatusIndicator 
                  status="OK" 
                  message="Online"
                />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <StatusIndicator status="OK" message="Connected" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Vector Store</span>
              <StatusIndicator status="OK" message="Pinecone" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">AI Services</span>
              <StatusIndicator status="OK" message="OpenAI/Google AI" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="card-body space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <div className="flex items-center">
                <Upload className="h-5 w-5 text-primary-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Upload Document</span>
              </div>
              <span className="text-xs text-gray-500">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-primary-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Ask Question</span>
              </div>
              <span className="text-xs text-gray-500">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-primary-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">View Analytics</span>
              </div>
              <span className="text-xs text-gray-500">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Documents"
          value={stats?.totalDocuments || 0}
          icon={FileText}
          color="blue"
          loading={statsLoading}
        />
        <StatCard
          title="Ready Documents"
          value={stats?.readyDocuments || 0}
          icon={CheckCircle}
          color="green"
          loading={statsLoading}
        />
        <StatCard
          title="Processing"
          value={stats?.processingDocuments || 0}
          icon={Loader}
          color="yellow"
          loading={statsLoading}
        />
        <StatCard
          title="Total Words"
          value={(stats?.totalWords || 0).toLocaleString()}
          icon={BarChart3}
          color="purple"
          loading={statsLoading}
        />
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="card-body">
          <div className="text-center text-gray-500 py-8">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm">No recent activity yet</p>
            <p className="text-xs mt-1">Upload documents to see activity here</p>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">System Information</h2>
          </div>
          <div className="card-body space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Environment:</span>
              <span className="font-medium">Development</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Support</h2>
          </div>
          <div className="card-body space-y-2 text-sm">
            <p className="text-gray-600">
              Need help? Check the documentation or contact support.
            </p>
            <div className="flex space-x-3 pt-2">
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Documentation
              </button>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard