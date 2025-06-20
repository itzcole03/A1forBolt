import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'


interface User {
  id: string
  username: string
  email: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
    error: null,
  })
  
  const navigate = useNavigate()
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token and get user data
      axios.get('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setState(prev => ({
          ...prev,
          user: response.data,
          loading: false
        }))
      })
      .catch(() => {
        localStorage.removeItem('token')
        setState(prev => ({
          ...prev,
          token: null,
          user: null,
          loading: false
        }))
      })
    } else {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])
  
  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post('/api/v1/auth/token', {
        username,
        password
      })
      
      const { token, user } = response.data
      localStorage.setItem('token', token)
      setState(prev => ({
        ...prev,
        token,
        user,
        error: null
      }))
      
      navigate('/')
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Invalid credentials'
      }))
    }
  }
  
  const logout = () => {
    localStorage.removeItem('token')
    setState({
      user: null,
      token: null,
      loading: false,
      error: null
    })
    navigate('/login')
  }
  
  return {
    ...state,
    login,
    logout
  }
}
