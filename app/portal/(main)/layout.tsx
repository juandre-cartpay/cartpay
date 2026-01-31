import { Sidebar } from "@/components/dashboard/sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Check if onboarding is complete
    const { data: profile } = await supabase
        .from('profiles')
        .select('registration_type, revenue, instagram')
        .eq('id', user.id)
        .single()

    const isOnboardingComplete = profile?.registration_type && profile?.revenue && profile?.instagram

    if (!isOnboardingComplete) {
        redirect('/onboarding')
    }

    return (
        <div className="h-screen w-full bg-background p-2 md:p-4 overflow-hidden">
            <div className="flex h-full w-full overflow-hidden rounded-xl border border-border bg-background shadow-xl">
                <Sidebar />
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {children}
                </main>
            </div>
        </div>
    )
}
