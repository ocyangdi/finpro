// Format file size to human readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Validate file type
export const isValidFileType = (file, allowedTypes = ['pdf', 'docx', 'doc', 'txt']) => {
  const extension = file.name.split('.').pop().toLowerCase()
  return allowedTypes.includes(extension)
}

// Validate file size (default 10MB)
export const isValidFileSize = (file, maxSize = 10 * 1024 * 1024) => {
  return file.size <= maxSize
}

// Get file icon based on type
export const getFileIcon = (fileType) => {
  const icons = {
    pdf: '📄',
    docx: '📝',
    doc: '📝',
    txt: '📄',
    default: '📁'
  }
  return icons[fileType] || icons.default
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Format date to relative time
export const formatRelativeTime = (date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return new Date(date).toLocaleDateString()
}

// Generate random ID
export const generateId = (length = 8) => {
  return Math.random().toString(36).substr(2, length)
}

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

// Capitalize first letter
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Safe JSON parse
export const safeJsonParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str)
  } catch {
    return defaultValue
  }
}

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0
}

// Get query parameters from URL
export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search)
  const result = {}
  for (const [key, value] of params) {
    result[key] = value
  }
  return result
}

// Set query parameters in URL
export const setQueryParams = (params) => {
  const url = new URL(window.location)
  Object.keys(params).forEach(key => {
    if (params[key] === null || params[key] === undefined) {
      url.searchParams.delete(key)
    } else {
      url.searchParams.set(key, params[key])
    }
  })
  window.history.replaceState({}, '', url)
}

// Download file
export const downloadFile = (content, fileName, contentType = 'text/plain') => {
  const blob = new Blob([content], { type: contentType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Copy text to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export const validatePassword = (password) => {
  const minLength = 6
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return {
    isValid: password.length >= minLength,
    minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  }
}