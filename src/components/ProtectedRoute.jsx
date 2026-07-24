import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-ink/50">Memuat...</p>
      </div>
    )
  }

  if (!isAdmin) return <Navigate to="/admin/login" replace />

  return children
}
