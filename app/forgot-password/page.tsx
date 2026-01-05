"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Check } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [success, setSuccess] = React.useState(false)
    const [error, setError] = React.useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch('/api/send-recovery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Erro ao enviar e-mail")
            }

            setSuccess(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4 font-sans">
                <div className="w-full max-w-md space-y-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-2 flex items-center justify-center">
                            <span className="text-4xl font-bold tracking-tighter">
                                <span className="text-[oklch(0.55_0.22_264.53)]">Cart</span>
                                <span className="text-foreground">pay</span>
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Redefinir a senha</h1>
                        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                            Você receberá um e-mail com instruções para redefinir a senha
                        </p>
                    </div>

                    <Card className="border-border/50 bg-card shadow-lg">
                        <CardContent className="space-y-6 pt-10 pb-10 flex flex-col items-center justify-center text-center">
                            <div className="flex items-center justify-center">
                                <div className="rounded-full bg-emerald-100 p-4">
                                    <Check className="h-10 w-10 text-emerald-500" strokeWidth={3} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg text-foreground">E-mail enviado! Verifique a sua<br />caixa de entrada</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4 font-sans">
            <div className="w-full max-w-md space-y-6">
                {/* Header Outside Card */}
                <div className="flex flex-col items-center text-center">
                    {/* Logo Section - Text Only */}
                    <div className="mb-2 flex items-center justify-center">
                        <span className="text-4xl font-bold tracking-tighter">
                            <span className="text-[oklch(0.55_0.22_264.53)]">Cart</span>
                            <span className="text-foreground">pay</span>
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight">
                        Redefinir a senha
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                        Você receberá um e-mail com instruções para redefinir a senha
                    </p>
                </div>

                {/* Card Section */}
                <Card className="border-border/50 bg-card shadow-lg">
                    <CardContent className="space-y-4 pt-6 pb-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    className="h-11 bg-muted/20 focus-visible:ring-0 focus-visible:border-[oklch(0.55_0.22_264.53)]"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold text-lg h-12 shadow-sm transition-all mt-2 hover:scale-[1.01]"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Redefinir senha"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
