import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import useCurrentUser from './useCurrentUser'

export default function useGHLContacts() {
  const { user, isAdmin } = useCurrentUser()
  const queryClient = useQueryClient()

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['ghl_contacts', user?.email],
    queryFn: async () => {
      let query = supabase
        .from('ghl_contacts')
        .select('*')
        .order('synced_at', { ascending: false })

      if (!isAdmin) query = query.eq('email', user.email)

      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  const syncContacts = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await supabase.functions.invoke('sync-ghl-contacts', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      if (res.error) throw new Error(res.error.message)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ghl_contacts'] }),
  })

  return { contacts, isLoading, syncContacts }
}
