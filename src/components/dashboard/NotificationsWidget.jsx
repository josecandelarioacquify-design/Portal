import React from 'react'
import { Link } from 'react-router-dom'
import { Bell, Info, CheckCircle, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import useNotifications from '@/hooks/useNotifications'

const typeConfig = {
  info:    { icon: Info,          className: 'bg-blue-50 text-blue-500',       dot: 'bg-blue-500' },
  success: { icon: CheckCircle,   className: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
  warning: { icon: AlertTriangle, className: 'bg-amber-50 text-amber-600',     dot: 'bg-amber-500' },
  alert:   { icon: AlertCircle,   className: 'bg-red-50 text-red-500',         dot: 'bg-red-500' },
}

export default function NotificationsWidget() {
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const recent = notifications.slice(0, 4)

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <Link
          to="/notifications"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {recent.length === 0 ? (
          <div className="flex flex-col items-center py-6 gap-2">
            <Bell className="w-8 h-8 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          recent.map(n => {
            const tc = typeConfig[n.type] || typeConfig.info
            const Icon = tc.icon
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markAsRead.mutate(n.id)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl transition-colors",
                  !n.is_read
                    ? "hover:bg-muted/50 cursor-pointer"
                    : "opacity-50"
                )}
              >
                <div className={cn("p-2 rounded-lg shrink-0", tc.className)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                  {n.message && (
                    <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[11px] text-muted-foreground/50 whitespace-nowrap">
                    {format(new Date(n.created_at), 'MMM d')}
                  </span>
                  {!n.is_read && (
                    <div className={cn("w-1.5 h-1.5 rounded-full", tc.dot)} />
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
