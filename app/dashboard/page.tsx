"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogOut } from "lucide-react"

export default function DashboardPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = React.useState(false)
    const [userEmail, setUserEmail] = React.useState<string | null>(null)

    React.useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserEmail(user.email || null)
            } else {
                router.push('/')
            }
        }
        getUser()
    }, [router, supabase])

    const handleSignOut = async () => {
        setLoading(true)
        try {
            await supabase.auth.signOut()
            router.push('/')
            router.refresh()
        } catch (error) {
            console.error("Error signing out:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4 font-sans">
            <div className="w-full max-w-md space-y-6">
                <div className="flex flex-col items-center text-center mb-6">
                    <span className="text-4xl font-bold tracking-tighter mb-2">
                        <span className="text-[oklch(0.55_0.22_264.53)]">Cart</span>
                        <span className="text-foreground">pay</span>
                    </span>
                </div>

                <Card className="border-border/50 bg-card shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold tracking-tight">Bem vindo a Cartpay</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4 text-center">
                        {userEmail && (
                            <p className="text-muted-foreground">
                                Logado como: <span className="font-medium text-foreground">{userEmail}</span>
                            </p>
                        )}

                        <div className="pt-4">
                            <Button
                                variant="destructive"
                                className="w-full font-bold h-11"
                                onClick={handleSignOut}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sair
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
