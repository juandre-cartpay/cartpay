import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4 font-sans">
      <Card className="w-full max-w-md shadow-lg border-border/50 bg-card">
        <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="mb-6 flex items-center justify-center space-x-1">
                {/* Logo Icon */}
                <div className="relative h-10 w-10">
                   <Image src="/logo.png" alt="Cartpay Logo" fill className="object-contain" priority />
                </div>
                {/* Logo Text */}
                <div className="text-3xl font-bold tracking-tighter flex items-center">
                   {/* Explicitly using the blue from the theme or chart-2 as a best guess for 'logo blue' */}
                   {/* Using inline style or JIT class for specific color if needed, but trying chart-2 var first */}
                    <span className="text-[oklch(0.55_0.22_264.53)]">Cart</span>
                    <span className="text-foreground">pay</span>
                </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center tracking-tight">
                Entrar na sua conta
            </CardTitle>
            <CardDescription className="text-center font-normal">
                Ou <Link href="/register" className="text-[oklch(0.55_0.22_264.53)] font-medium hover:underline">fazer cadastro</Link>
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="nome@exemplo.com" required className="h-11 bg-muted/20" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="••••••••" required className="h-11 bg-muted/20" />
            </div>
            <div className="flex items-center justify-end">
                <Link href="#" className="text-sm font-medium text-[oklch(0.55_0.22_264.53)] hover:underline">
                    Esqueceu a senha?
                </Link>
            </div>
        </CardContent>
        <CardFooter className="pb-8">
            <Button className="w-full bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold text-lg h-12 shadow-sm transition-all hover:scale-[1.01]">
                Entrar
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
