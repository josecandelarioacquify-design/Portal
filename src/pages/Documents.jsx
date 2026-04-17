import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, FileText, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import useCurrentUser from '../hooks/useCurrentUser'

const categoryConfig = {
  contract: { label: 'Contract', className: 'bg-gray-100 text-gray-700' },
  proposal: { label: 'Proposal', className: 'bg-gray-200 text-gray-700' },
  report: { label: 'Report', className: 'bg-fuchsia-50 text-fuchsia-600' },
  invoice: { label: 'Invoice', className: 'bg-amber-50 text-amber-600' },
  deliverable: { label: 'Deliverable', className: 'bg-emerald-50 text-emerald-600' },
  brief: { label: 'Brief', className: 'bg-pink-50 text-pink-600' },
  other: { label: 'Other', className: 'bg-gray-100 text-gray-500' },
}

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-500' },
  pending_review: { label: 'Pending Review', className: 'bg-amber-50 text-amber-600' },
  approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-600' },
  signed: { label: 'Signed', className: 'bg-gray-100 text-gray-700' },
  archived: { label: 'Archived', className: 'bg-gray-50 text-gray-400' },
}

export default function Documents() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const { user, isAdmin } = useCurrentUser()

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

  const filtered = documents.filter(d => {
    const matchSearch = d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.project_name?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'all' || d.category === categoryFilter
    return matchSearch && matchCategory
  })

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Documents</h1>
        <p className="text-muted-foreground mt-1">Access all your project documents in one place.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-44 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="all">All Categories</option>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No documents found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(doc => {
            const cat = categoryConfig[doc.category] || categoryConfig.other
            const st = statusConfig[doc.status] || statusConfig.draft
            return (
              <div key={doc.id} className="bg-card rounded-xl p-5 border border-border/50 hover:shadow-md hover:border-primary/20 transition-all duration-300 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/5 shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{doc.title}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {doc.project_name && (
                      <span className="text-xs text-muted-foreground">{doc.project_name}</span>
                    )}
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full', cat.className)}>{cat.label}</span>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border border-gray-200', st.className)}>{st.label}</span>
                    {doc.version && (
                      <span className="text-[10px] text-muted-foreground/50">v{doc.version}</span>
                    )}
                  </div>
                </div>
                <div className="hidden sm:block text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {doc.updated_at ? format(new Date(doc.updated_at), 'MMM d, yyyy') : ''}
                  </p>
                </div>
                {doc.file_url && (
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
