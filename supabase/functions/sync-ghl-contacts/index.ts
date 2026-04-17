import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GHL_API_KEY = Deno.env.get('GHL_API_KEY')!
const LOCATION_ID = 'FKUImUgy0Xtx4FmHcXTX'
const GHL_BASE = 'https://rest.gohighlevel.com/v1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify caller is an authenticated admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await anonClient.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { data: profile } = await anonClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response('Forbidden', { status: 403 })
    }

    // Use service role to write to Supabase
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Paginate through all GHL contacts
    let allContacts: any[] = []
    let skip = 0
    const limit = 100

    while (true) {
      const res = await fetch(
        `${GHL_BASE}/contacts/?locationId=${LOCATION_ID}&limit=${limit}&skip=${skip}`,
        {
          headers: {
            Authorization: `Bearer ${GHL_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!res.ok) {
        const err = await res.text()
        throw new Error(`GHL API error ${res.status}: ${err}`)
      }

      const json = await res.json()
      const contacts = json.contacts ?? []
      allContacts = [...allContacts, ...contacts]

      if (contacts.length < limit) break
      skip += limit
    }

    // Map to our table schema
    const rows = allContacts.map((c: any) => ({
      ghl_id: c.id,
      location_id: c.locationId ?? LOCATION_ID,
      first_name: c.firstName ?? null,
      last_name: c.lastName ?? null,
      email: c.email ?? null,
      phone: c.phone ?? null,
      tags: c.tags ?? [],
      source: c.source ?? null,
      pipeline_stage: c.opportunities?.[0]?.pipelineStageName ?? null,
      pipeline_name: c.opportunities?.[0]?.pipelineName ?? null,
      ghl_created_at: c.dateAdded ?? null,
      synced_at: new Date().toISOString(),
    }))

    const { error } = await serviceClient
      .from('ghl_contacts')
      .upsert(rows, { onConflict: 'ghl_id' })

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, synced: rows.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
