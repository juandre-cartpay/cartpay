"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, X } from "lucide-react"

export default function UpdatePasswordPage() {
    const router = useRouter()
    const supabase = createClient()
    const [password, setPassword] = React.useState("")
    const [confirmPassword, setConfirmPassword] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState("")
    const [accessToken, setAccessToken] = React.useState<string | null>(null)

    React.useEffect(() => {
        const handleSession = async () => {
            const hash = window.location.hash

            const getHashParams = (hash: string) => {
                const params: { [key: string]: string } = {}
                const hashString = hash.substring(1)
                const pairs = hashString.split('&')
                for (const pair of pairs) {
                    const [key, value] = pair.split('=')
                    if (key && value) {
                        params[key] = decodeURIComponent(value)
                    }
                }
                return params
            }

            if (hash && hash.includes('access_token')) {
                const params = getHashParams(hash)
                const token = params['access_token']
                const refreshToken = params['refresh_token']

                if (token) {
                    setAccessToken(token) // Store for API call

                    // Also set session locally for good measure/UX
                    if (refreshToken) {
                        await supabase.auth.setSession({
                            access_token: token,
                            refresh_token: refreshToken
                        })
                    }

                    // Clean URL
                    window.history.replaceState(null, '', window.location.pathname)
                }
            } else {
                // Try to get existing session if no hash
                const { data } = await supabase.auth.getSession()
                if (data.session?.access_token) {
                    setAccessToken(data.session.access_token)
                }
            }
        }

        handleSession()
    }, [supabase.auth])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (password !== confirmPassword) {
            setError("As senhas não coincidem")
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError("A senha deve ter no mínimo 6 caracteres")
            setLoading(false)
            return
        }

        if (!accessToken) {
            setError("Sessão não encontrada. Use o link do e-mail novamente.")
            setLoading(false)
            return
        }

        try {
            // Call our robust server-side endpoint
            const res = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password,
                    accessToken
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Falha ao atualizar senha")
            }

            router.push('/')
            router.refresh()

        } catch (err: any) {
            setError(err.message || "Erro ao atualizar a senha")
            setLoading(false)
        }
    }



    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4 font-sans">
            <div className="w-full max-w-md space-y-6">
                {/* Header Outside Card */}
                <div className="flex flex-col items-center text-center">
                    <div className="mb-2 flex items-center justify-center">
                        <span className="text-4xl font-bold tracking-tighter">
                            <span className="text-[oklch(0.55_0.22_264.53)]">Cart</span>
                            <span className="text-foreground">pay</span>
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight">
                        Alterar senha
                    </h1>
                </div>

                {/* Card Section */}
                <Card className="border-border/50 bg-card shadow-lg">
                    <CardContent className="space-y-4 pt-6 pb-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Nova senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    className={`h-11 bg-muted/20 focus-visible:ring-0 focus-visible:border-[oklch(0.55_0.22_264.53)] ${error && error !== "As senhas não coincidem" ? "border-red-500" : ""}`}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                {error && error.includes("caracteres") && <p className="text-xs text-red-500">{error}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Repetir nova senha</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    className={`h-11 bg-muted/20 focus-visible:ring-0 focus-visible:border-[oklch(0.55_0.22_264.53)] ${error === "As senhas não coincidem" ? "border-red-500" : ""}`}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                                {error === "As senhas não coincidem" && <p className="text-xs text-red-500">{error}</p>}
                            </div>

                            {error && !error.includes("caracteres") && error !== "As senhas não coincidem" && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                                    <X className="h-4 w-4" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold text-lg h-12 shadow-sm transition-all mt-2 hover:scale-[1.01]"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Alterar senha"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
