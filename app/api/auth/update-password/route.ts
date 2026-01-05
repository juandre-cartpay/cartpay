
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { password, accessToken } = await request.json()

        if (!accessToken) {
            return NextResponse.json({ error: "Sessão inválida" }, { status: 401 })
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
        }

        // 1. Verify the token helps identify the user
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)

        if (userError || !user) {
            console.error("Invalid token:", userError)
            return NextResponse.json({ error: "Sessão expirada ou inválida" }, { status: 401 })
        }

        // 2. Use Admin Client to FORCE password update
        // This bypasses any client-side permission/session quirks for recovery
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: password, email_confirm: true }
        )

        if (updateError) {
            console.error("Admin update error:", updateError)
            throw updateError
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
    }
}
