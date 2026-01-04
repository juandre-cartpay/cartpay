import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {
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
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                className="h-11 bg-muted/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                className="h-11 bg-muted/20"
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
            <Button className="w-full bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold text-lg h-12 shadow-sm transition-all mt-2 hover:scale-[1.01]">
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
