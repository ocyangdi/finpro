import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        logout()
      }
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  const isAuthenticated = () => {
    return !!localStorage.getItem('token')
  }

  const getToken = () => {
    return localStorage.getItem('token')
  }

  const hasRole = (role) => {
    return user?.role === role
  }

  // Redirect to intended page after login
  const redirectToIntended = () => {
    const from = location.state?.from?.pathname || '/dashboard'
    navigate(from, { replace: true })
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    getToken,
    hasRole,
    redirectToIntended
  }
}

export default useAuth