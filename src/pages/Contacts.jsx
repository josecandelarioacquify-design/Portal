import React, { useState } from 'react'
import { Search, RefreshCw, User2, Phone, Mail, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import useCurrentUser from '../hooks/useCurrentUser'
import useGHLContacts from '../hooks/useGHLContacts'

export default function Contacts() {
  const { isAdmin } = useCurrentUser()
  const { contacts, isLoading, syncContacts } = useGHLContacts()
  const [search, setSearch] = useState('')

  const filtered = contacts.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.tags?.some(t => t.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? `${contacts.length} contact${contacts.length !== 1 ? 's' : ''} synced from GoHighLevel`
              : 'Your contact information'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => syncContacts.mutate()}
            disabled={syncContacts.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', syncContacts.isPending && 'animate-spin')} />
            {syncContacts.isPending ? 'Syncing...' : 'Sync GHL'}
          </button>
        )}
      </div>

      {/* Search — admin only */}
      {isAdmin && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, phone or tag..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary transition-colors"
          />
        </div>
      )}

      {/* Sync error */}
      {syncContacts.isError && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          Sync failed: {syncContacts.error?.message}
        </div>
      )}
      {syncContacts.isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl px-4 py-3 text-sm">
          Synced {syncContacts.data?.synced} contact{syncContacts.data?.synced !== 1 ? 's' : ''} successfully.
        </div>
      )}

      {/* Empty / loading states */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <User2 className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {contacts.length === 0
              ? isAdmin ? 'No contacts yet. Click "Sync GHL" to import.' : 'No contact information found.'
              : 'No contacts match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div
              key={c.id}
              className="bg-card rounded-2xl p-5 border border-border/50 flex items-start gap-4"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {(c.first_name?.[0] ?? c.email?.[0] ?? '?').toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="font-medium text-foreground">
                    {[c.first_name, c.last_name].filter(Boolean).join(' ') || '—'}
                  </p>
                  {c.pipeline_stage && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {c.pipeline_stage}
                    </span>
                  )}
                </div>

                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  {c.email && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {c.email}
                    </span>
                  )}
                  {c.phone && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {c.phone}
                    </span>
                  )}
                  {c.source && (
                    <span className="text-xs text-muted-foreground/50 capitalize">{c.source}</span>
                  )}
                </div>

                {c.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sync date — admin only */}
              {isAdmin && c.synced_at && (
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground/40">Synced</p>
                  <p className="text-[11px] text-muted-foreground/60">
                    {format(new Date(c.synced_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
