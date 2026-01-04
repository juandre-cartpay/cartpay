import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function ForgotPasswordPage() {
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
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                className="h-11 bg-muted/20"
                            />
                        </div>

                        <Button className="w-full bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold text-lg h-12 shadow-sm transition-all mt-2 hover:scale-[1.01]">
                            Redefinir senha
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
