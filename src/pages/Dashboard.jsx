import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { FolderOpen, CalendarDays, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import StatCard from '../components/dashboard/StatCard'
import ProjectStatusChart from '../components/dashboard/ProjectStatusChart'
import RecentActivity from '../components/dashboard/RecentActivity'
import UpcomingEventsThisWeek from '../components/dashboard/UpcomingEventsThisWeek'
import NotificationsWidget from '../components/dashboard/NotificationsWidget'
import useCurrentUser from '../hooks/useCurrentUser'

export default function Dashboard() {
  const { user, isAdmin } = useCurrentUser()

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', user?.email],
    queryFn: async () => {
      let query = supabase.from('projects').select('*').order('updated_at', { ascending: false })
      if (!isAdmin) query = query.eq('client_email', user.email)
      const { data } = await query
      return data || []
    },
    enabled: !!user,
  })

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', user?.email],
    queryFn: async () => {
      let query = supabase.from('documents').select('*').order('updated_at', { ascending: false })
      if (!isAdmin) query = query.eq('client_email', user.email)
      const { data } = await query
      return data || []
    },
    enabled: !!user,
  })

  const { data: events = [] } = useQuery({
    queryKey: ['events', user?.email],
    queryFn: async () => {
      let query = supabase.from('calendar_events').select('*').order('date', { ascending: false })
      if (!isAdmin) query = query.eq('client_email', user.email)
      const { data } = await query
      return data || []
    },
    enabled: !!user,
  })

  const activeProjects = projects.filter(p => p.status !== 'completed').length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
    : 0

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Welcome back, {user?.full_name || user?.email}</h1>
      </div>

      {/* Row 1 — Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active Projects" value={activeProjects} icon={FolderOpen} />
        <StatCard label="Completed" value={completedProjects} icon={TrendingUp} />
        <StatCard label="Avg Progress" value={`${avgProgress}%`} icon={CalendarDays} />
      </div>

      {/* Row 2 — Recent Activity + Notifications (directly below stats) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity projects={projects} documents={documents} events={events} />
        <NotificationsWidget />
      </div>

      {/* Row 3 — This Week (full width horizontal) */}
      <UpcomingEventsThisWeek events={events} />

      {/* Row 4 — Project Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectStatusChart projects={projects} />
        </div>
      </div>
    </div>
  )
}
