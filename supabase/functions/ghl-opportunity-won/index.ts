import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WEBHOOK_SECRET = Deno.env.get('GHL_WEBHOOK_SECRET')!
const PORTAL_URL     = Deno.env.get('PORTAL_URL') ?? 'https://acquify-portal.vercel.app'
const LOCATION_ID    = 'FKUImUgy0Xtx4FmHcXTX'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. Verify webhook secret
    const url = new URL(req.url)
    const secret = url.searchParams.get('secret')
    if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    console.log('GHL webhook received:', JSON.stringify(body))

    // 2. GHL sends contact fields at the root level
    const email = (body.email ?? '').toLowerCase().trim()

    console.log('Resolved contact email:', email)

    if (!email) {
      return new Response(
        JSON.stringify({ skipped: true, reason: 'contact has no email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const fullName     = body.full_name ?? ''
    const firstName    = body.first_name ?? fullName.split(' ')[0] ?? ''
    const lastName     = body.last_name  ?? fullName.split(' ').slice(1).join(' ') ?? ''
    const phone        = body.phone ?? null
    const ghlContactId = body.contact_id ?? null

    // 4. Service role client
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 5. Check if portal account already exists
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    let userId: string
    let created = false

    if (existingProfile) {
      // Already has an account — just update GHL info, no new invite
      userId = existingProfile.id
      await adminClient.from('profiles').update({
        ghl_contact_id: ghlContactId,
        full_name:      fullName || undefined,
        phone:          phone    || undefined,
      }).eq('id', userId)

      console.log(`Profile already exists for ${email}, updated GHL info.`)
    } else {
      // 6. Invite user — creates auth account + sends invite email automatically
      const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo: `${PORTAL_URL}/login`,
          data: { full_name: fullName },
        }
      )

      if (inviteError) throw inviteError

      userId  = invited.user.id
      created = true

      // 7. Create profile row
      const { error: profileError } = await adminClient.from('profiles').upsert({
        id:             userId,
        email,
        full_name:      fullName,
        phone,
        role:           'client',
        ghl_contact_id: ghlContactId,
        portal_status:  'pending',
      })

      if (profileError) throw profileError

      console.log(`Invited ${email} — portal account created (userId: ${userId})`)
    }

    // 8. Keep ghl_contacts in sync
    if (ghlContactId) {
      await adminClient.from('ghl_contacts').upsert({
        ghl_id:      ghlContactId,
        location_id: body.location?.id ?? LOCATION_ID,
        first_name:  firstName  || null,
        last_name:   lastName   || null,
        email,
        phone,
        tags:        body.tags ? [body.tags].flat() : [],
        synced_at:   new Date().toISOString(),
      }, { onConflict: 'ghl_id' })
    }

    return new Response(
      JSON.stringify({ success: true, userId, email, created }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err: any) {
    console.error('ghl-opportunity-won error:', err)
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
