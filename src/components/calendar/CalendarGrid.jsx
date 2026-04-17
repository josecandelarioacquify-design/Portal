import React from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, isToday } from 'date-fns'
import { cn } from '@/lib/utils'

const eventTypeColors = {
  milestone: 'bg-gray-600',
  meeting: 'bg-gray-400',
  deadline: 'bg-red-500',
  review: 'bg-amber-500',
  delivery: 'bg-emerald-500',
  other: 'bg-slate-400',
}

export default function CalendarGrid({ currentMonth, events, onSelectDay, selectedDay }) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getEventsForDay = (day) => events.filter(e => isSameDay(new Date(e.date), day))

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-xs font-medium text-muted-foreground">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day)
          const inMonth = isSameMonth(day, currentMonth)
          const isSelected = selectedDay && isSameDay(day, selectedDay)
          return (
            <div
              key={i}
              onClick={() => onSelectDay(day)}
              className={cn(
                "min-h-[80px] md:min-h-[100px] p-2 border-b border-r border-border/30 cursor-pointer transition-colors hover:bg-muted/50",
                !inMonth && "bg-muted/30",
                isSelected && "bg-primary/5"
              )}
            >
              <span className={cn(
                "text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full",
                !inMonth && "text-muted-foreground/30",
                isToday(day) && "bg-primary text-white",
                isSelected && !isToday(day) && "bg-primary/20 text-primary"
              )}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((event, j) => (
                  <div key={j} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] truncate bg-muted/80">
                    <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', eventTypeColors[event.event_type] || eventTypeColors.other)} />
                    <span className="truncate text-foreground/80">{event.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3} more</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
