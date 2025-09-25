import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  RefreshCw,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical
} from 'lucide-react'
import { documentsAPI, handleApiError } from '../services/api'

const Documents = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDocument, setSelectedDocument] = useState(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', { searchTerm, statusFilter, typeFilter, page: currentPage }],
    queryFn: () => documentsAPI.getAll({
      search: searchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      page: currentPage,
      limit: 10
    }),
    keepPreviousData: true
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => documentsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
    onError: (error) => {
      alert(handleApiError(error).message)
    }
  })

  const reprocessMutation = useMutation({
    mutationFn: (id) => documentsAPI.reprocess(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
    onError: (error) => {
      alert(handleApiError(error).message)
    }
  })

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  const handleReprocess = (id) => {
    if (window.confirm('Reprocess this document?')) {
      reprocessMutation.mutate(id)
    }
  }

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      ready: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      error: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const TypeBadge = ({ type }) => {
    const typeColors = {
      pdf: 'bg-red-100 text-red-800',
      docx: 'bg-blue-100 text-blue-800',
      doc: 'bg-indigo-100 text-indigo-800',
      txt: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type.toUpperCase()}
      </span>
    )
  }

  const DocumentActions = ({ document }) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setSelectedDocument(document)}
        className="text-gray-400 hover:text-gray-600"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleReprocess(document._id)}
        className="text-blue-400 hover:text-blue-600"
        title="Reprocess"
        disabled={reprocessMutation.isLoading}
      >
        <RefreshCw className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDelete(document._id, document.title)}
        className="text-red-400 hover:text-red-600"
        title="Delete"
        disabled={deleteMutation.isLoading}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )

  const DocumentModal = ({ document, onClose }) => {
    if (!document) return null

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Document Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <p className="mt-1 text-sm text-gray-900">{document.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1">
                  <TypeBadge type={document.type} />
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1">
                  <StatusBadge status={document.status} />
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Size</label>
              <p className="mt-1 text-sm text-gray-900">
                {document.size ? (document.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Word Count</label>
              <p className="mt-1 text-sm text-gray-900">
                {document.wordCount?.toLocaleString() || 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(document.createdAt).toLocaleString()}
              </p>
            </div>

            {document.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{document.description}</p>
              </div>
            )}

            {document.error && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Error</label>
                <p className="mt-1 text-sm text-red-600">{document.error}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage and view all your uploaded documents
        </p>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="ready">Ready</option>
              <option value="error">Error</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="doc">DOC</option>
              <option value="txt">TXT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600">
              {data.stats.total}
            </div>
            <div className="text-sm text-gray-600">Total Documents</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.stats.ready}
            </div>
            <div className="text-sm text-gray-600">Ready</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.stats.processing}
            </div>
            <div className="text-sm text-gray-600">Processing</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-red-600">
              {data.stats.error}
            </div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className="card">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              Error loading documents: {handleApiError(error).message}
            </div>
          ) : data?.documents?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No documents found</p>
              <p className="text-sm mt-1">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Upload your first document to get started'
                }
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.documents?.map((document) => (
                  <tr key={document._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {document.title}
                          </div>
                          {document.description && (
                            <div className="text-sm text-gray-500">
                              {document.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TypeBadge type={document.type} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={document.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {document.size ? (document.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(document.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DocumentActions document={document} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 10, data.pagination.total)}
                </span> of{' '}
                <span className="font-medium">{data.pagination.total}</span> documents
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.pagination.totalPages))}
                  disabled={currentPage === data.pagination.totalPages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Modal */}
      <DocumentModal 
        document={selectedDocument} 
        onClose={() => setSelectedDocument(null)} 
      />
    </div>
  )
}

export default Documents