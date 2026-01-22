import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Resend with the provided key
const resend = new Resend('re_4ZcKms3b_CuRRUBRADX6X2H2sUfzpVGRR')

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("SUPABASE_SERVICE_ROLE_KEY is missing")
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
        }

        // Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Get dynamic base URL from request headers
        const host = request.headers.get('host')
        const protocol = request.headers.get('x-forwarded-proto') || 'http'
        const baseUrl = `${protocol}://${host}`

        // Generate Password Recovery Link
        // This link points to Supabase, which then redirects to our callback, which redirects to update-password
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email,
            options: {
                redirectTo: `${baseUrl}/update-password`
            }
        })

        if (error) {
            console.error("Error generating link:", error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        const { action_link } = data.properties

        // Send Email via Resend
        await resend.emails.send({
            from: 'KwizaPay <naoresponder@kwizapay.com>',
            to: email,
            subject: 'Redefinir a senha da KwizaPay',
            html: `
                <div style="font-family: sans-serif; font-size: 16px; color: #333333; line-height: 1.5; max-width: 450px; margin: 0 auto; text-align: left;">
                    <p style="margin: 0 0 16px 0;">Olá,</p>
                    <p style="margin: 0 0 16px 0;">Clique neste link para redefinir a senha de login na KwizaPay com sua conta.</p>
                    <p style="margin: 0 0 24px 0;">
                        <a href="${action_link}" style="color: #0055ff; text-decoration: underline;">Redefinir senha</a>
                    </p>
                    <p style="margin: 0 0 24px 0;">Se você não solicitou a redefinição da sua senha, ignore este e-mail.</p>
                    <p style="margin: 0; color: #333333;">Obrigado,<br>Equipe KwizaPay</p>
                </div>
            `
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Unexpected error in send-recovery:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
