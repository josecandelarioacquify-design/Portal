import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function useCurrentUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Check profiles table for role and full_name
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data: profile }) => {
            setUser({
              ...user,
              full_name: profile?.full_name || user.email,
              role: profile?.role || 'client',
              email: user.email,
            })
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })
  }, [])

  const isAdmin = user?.role === 'admin'

  return { user, loading, isAdmin }
}
