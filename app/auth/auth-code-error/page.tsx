import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthCodeErrorPage() {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4 font-sans">
            <div className="flex flex-col items-center text-center space-y-6 max-w-md">
                <div className="rounded-full bg-red-100 p-4">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Link expirado ou inválido</h1>
                    <p className="text-muted-foreground">
                        O link de recuperação que você acessou é inválido ou já expirou. Por favor, solicite uma nova redefinição de senha.
                    </p>
                </div>

                <Button asChild className="bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold h-11 w-full max-w-xs">
                    <Link href="/forgot-password">
                        Tentar novamente
                    </Link>
                </Button>
            </div>
        </div>
    )
}
