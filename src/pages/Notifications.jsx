import React, { useState } from 'react'
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, AlertCircle, Send, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import useCurrentUser from '../hooks/useCurrentUser'
import useNotifications from '../hooks/useNotifications'

const typeConfig = {
  info:    { icon: Info,          className: 'bg-blue-50 text-blue-500',     dot: 'bg-blue-500' },
  success: { icon: CheckCircle,   className: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
  warning: { icon: AlertTriangle, className: 'bg-amber-50 text-amber-600',   dot: 'bg-amber-500' },
  alert:   { icon: AlertCircle,   className: 'bg-red-50 text-red-500',       dot: 'bg-red-500' },
}

const emptyForm = { client_email: '', title: '', message: '', type: 'info' }

export default function Notifications() {
  const { isAdmin } = useCurrentUser()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const queryClient = useQueryClient()
  const [showCompose, setShowCompose] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [sending, setSending] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    setSending(true)
    await supabase.from('notifications').insert([form])
    setSending(false)
    setForm(emptyForm)
    setShowCompose(false)
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowCompose(!showCompose)}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          )}
        </div>
      </div>

      {isAdmin && showCompose && (
        <form onSubmit={handleSend} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-foreground">New Notification</h3>
            <button type="button" onClick={() => setShowCompose(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Client Email</label>
              <input
                required
                type="email"
                value={form.client_email}
                onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
                placeholder="client@example.com"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="alert">Alert</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Title</label>
            <input
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Notification title"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Message <span className="text-muted-foreground/50">(optional)</span></label>
            <textarea
              rows={3}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Additional details..."
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const tc = typeConfig[n.type] || typeConfig.info
            const Icon = tc.icon
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markAsRead.mutate(n.id)}
                className={cn(
                  "bg-card rounded-xl p-4 border border-border/50 flex items-start gap-4 transition-all duration-200",
                  !n.is_read ? "hover:shadow-sm cursor-pointer" : "opacity-60"
                )}
              >
                <div className={cn("p-2.5 rounded-xl shrink-0", tc.className)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <span className="text-[11px] text-muted-foreground/50 whitespace-nowrap shrink-0">
                      {format(new Date(n.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  {n.message && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                  )}
                  {isAdmin && (
                    <p className="text-[10px] text-muted-foreground/40 mt-1.5">To: {n.client_email}</p>
                  )}
                </div>
                {!n.is_read && (
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", tc.dot)} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
