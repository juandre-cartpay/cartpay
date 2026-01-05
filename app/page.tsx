"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Loader2, X } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [emailError, setEmailError] = React.useState<string | null>(null)

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (value && !emailRegex.test(value)) {
      setEmailError("O e-mail deve ser válido")
      return false
    }
    setEmailError(null)
    return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setEmailError(null)

    // Basic email validation
    if (!validateEmail(email)) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Check onboarding status
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('registration_type, revenue, instagram')
          .eq('id', data.user.id)
          .single()

        // If any required field is missing, force redirect to onboarding
        if (!profile?.registration_type || !profile?.revenue || !profile?.instagram) {
          router.push('/onboarding')
          router.refresh()
          return
        }
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      // Check for specific Supabase error message for invalid credentials
      if (err.message === "Invalid login credentials") {
        setError("Usuário ou senha incorreto.")
      } else {
        setError(err.message || "Erro ao fazer login. Verifique suas credenciais.")
      }
    } finally {
      setLoading(false)
    }
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
            Entrar na sua conta
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Ou <Link href="/register" className="text-[oklch(0.55_0.22_264.53)] font-medium hover:underline">fazer cadastro</Link>
          </p>
        </div>

        {/* Card Section */}
        <Card className="border-border/50 bg-card shadow-lg">
          <CardContent className="space-y-4 pt-6">
            <form onSubmit={handleLogin} className="space-y-4" noValidate>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  className={`h-11 bg-muted/20 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all focus-visible:border-[oklch(0.55_0.22_264.53)] focus-visible:shadow-[0_0_0_3px_oklch(0.55_0.22_264.53)/0.2] ${emailError ? "border-red-500" : ""
                    }`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) validateEmail(e.target.value)
                  }}
                  onBlur={() => validateEmail(email)}
                />
                {emailError && (
                  <p className="text-xs text-red-500">{emailError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  className="h-11 bg-muted/20 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[oklch(0.55_0.22_264.53)] focus-visible:shadow-[0_0_0_3px_oklch(0.55_0.22_264.53)/0.2] transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[oklch(0.55_0.22_264.53)] hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 text-sm text-red-600 bg-red-50 border-l-4 border-red-400 rounded-sm">
                  <X className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                className="w-full bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold text-lg h-12 shadow-sm transition-all mt-2 hover:scale-[1.01]"
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
