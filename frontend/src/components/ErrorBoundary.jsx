import React from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error to console
    console.error('Error caught by boundary:', error, errorInfo)
    
    // You can also log to an error reporting service here
    // logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    // Optionally reset app state or navigate to home
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              Something went wrong
            </h2>
            
            <p className="mt-2 text-sm text-gray-600">
              We apologize for the inconvenience. Please try refreshing the page or go back home.
            </p>

            {this.props.showDetails && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  Error Details
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded-md text-xs font-mono overflow-auto">
                  <p className="text-red-600">{this.state.error.toString()}</p>
                  <pre className="mt-2 text-gray-700">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </button>
            </div>

            {this.props.contactSupport && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  If the problem persists, please{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    contact support
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.defaultProps = {
  showDetails: false,
  contactSupport: true
}

export default ErrorBoundary