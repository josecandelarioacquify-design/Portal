import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoadingAuth(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoadingAuth(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const navigateToLogin = () => {
    window.location.href = '/login'
  }

  const authError = !isLoadingAuth && !session
    ? { type: 'auth_required' }
    : null

  return (
    <AuthContext.Provider value={{
      session,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      navigateToLogin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
