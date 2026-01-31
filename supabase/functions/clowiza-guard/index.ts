import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const url = new URL(req.url)
        const linkId = url.searchParams.get('id')?.replace('kwzw_', '')

        const jsHeaders = {
            ...corsHeaders,
            'Content-Type': 'application/javascript',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', // Never cache the decision
        }

        if (!linkId) {
            return new Response('console.error("Clowiza: ID missing");', { headers: jsHeaders })
        }

        // Initialize Supabase Client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Fetch Link Config
        const { data: link, error: linkError } = await supabaseClient
            .from('clowiza_links')
            .select('*')
            .eq('id', linkId)
            .single()

        if (linkError || !link) {
            return new Response('console.error("Clowiza: Link not found");', { headers: jsHeaders })
        }

        // 2. Control Switch
        if (!link.is_active) {
            return new Response('console.log("Clowiza: Inactive (Allowed)");', { headers: jsHeaders })
        }

        // 3. Analyze Visitor
        const country = req.headers.get('cf-ipcountry') || 'UNKNOWN'
        const userAgent = req.headers.get('user-agent') || ''
        const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || '0.0.0.0'

        const isAngola = country === 'AO'
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

        let decision = 'allow'
        let redirectUrl = link.offer_page
        let logType = 'allow'

        // 4. Elite Rules
        if (!isAngola) {
            decision = 'block'
            redirectUrl = link.safe_page
            logType = 'block_geo'
        } else if (!isMobile) {
            decision = 'block'
            redirectUrl = link.safe_page
            logType = 'block_device'
        }

        // 5. Async Log (Fire & Forget mostly, but we await for stability in serverless)
        await supabaseClient.from('clowiza_logs').insert({
            link_id: link.id,
            action_type: logType,
            ip_address: ip,
            country: country,
            user_agent: userAgent
        })

        // 6. Return JS Payload
        if (decision === 'block') {
            // THE KILL SWITCH: Wipe body and redirect immediately
            const script = `
        (function() {
          try {
            document.body.innerHTML = '';
            document.head.innerHTML = '';
            window.stop();
            window.location.replace("${redirectUrl}");
          } catch(e) {
            window.location.href = "${redirectUrl}";
          }
        })();
      `
            return new Response(script, { headers: jsHeaders })
        } else {
            // ALLOW: Return minimal footprint, maybe a console log for debugging if needed
            return new Response('/* Clowiza: Protection Active - Access Granted */', { headers: jsHeaders })
        }

    } catch (error) {
        // Fail Open: If server crashes, don't break the user's page, just log in console
        return new Response(`console.warn("Clowiza Error: ${error.message}");`, {
            headers: { ...corsHeaders, 'Content-Type': 'application/javascript' }
        })
    }
})
