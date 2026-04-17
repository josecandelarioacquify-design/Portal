import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { addMonths, subMonths, format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import CalendarGrid from '../components/calendar/CalendarGrid'
import DayEvents from '../components/calendar/DayEvents'
import useCurrentUser from '../hooks/useCurrentUser'

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date())
  const { user, isAdmin } = useCurrentUser()

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

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">View your full project schedule.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
            className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
            className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setCurrentMonth(new Date()); setSelectedDay(new Date()) }}
            className="px-3 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <CalendarGrid
          currentMonth={currentMonth}
          events={events}
          onSelectDay={setSelectedDay}
          selectedDay={selectedDay}
        />
        <DayEvents selectedDay={selectedDay} events={events} />
      </div>
    </div>
  )
}
