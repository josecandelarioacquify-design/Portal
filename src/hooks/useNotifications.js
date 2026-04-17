import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import useCurrentUser from './useCurrentUser'

export default function useNotifications() {
  const { user, isAdmin } = useCurrentUser()
  const queryClient = useQueryClient()

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: async () => {
      let query = supabase.from('notifications').select('*').order('created_at', { ascending: false })
      if (!isAdmin) query = query.eq('client_email', user.email)
      const { data } = await query
      return data || []
    },
    enabled: !!user,
  })

  useEffect(() => {
    if (!user) return
    const channelName = `notifications-realtime-${user.id}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', user.email] })
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user?.id, queryClient])

  const markAsRead = useMutation({
    mutationFn: async (id) => {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', user?.email] }),
  })

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      let query = supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
      if (!isAdmin) query = query.eq('client_email', user.email)
      await query
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', user?.email] }),
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
