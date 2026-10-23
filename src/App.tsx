import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { SetupScreen } from './components/SetupScreen'
import { isSupabaseConfigured } from './lib/env'

const AuthScreen = lazy(() => import('./components/AuthScreen').then((module) => ({ default: module.AuthScreen })))
const Dashboard = lazy(() => import('./components/Dashboard').then((module) => ({ default: module.Dashboard })))

function LoadingScreen() {
  return <main className="loading-screen"><img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" /><div className="spinner" /><span>Güvenli oturum hazırlanıyor…</span></main>
}

function AuthenticatedApp() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? <Dashboard /> : <AuthScreen />
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupScreen />
  return <AuthProvider><Suspense fallback={<LoadingScreen />}><AuthenticatedApp /></Suspense></AuthProvider>
}
