import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      // Store token in localStorage
      localStorage.setItem('session_token', token)
      // Redirect to dashboard
      navigate('/dashboard', { replace: true })
    } else {
      // No token, redirect to login
      navigate('/login?error=no_token', { replace: true })
    }
  }, [searchParams, navigate])

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '60vh', 
      color: '#888' 
    }}>
      Logging in...
    </div>
  )
}
