import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
    return (
        <div className="flex min-h-screen bg-background">

            {/* Lado Esquerdo - Conteúdo */}
            <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 py-12 bg-background">

                <div className="max-w-xl animate-in fade-in slide-in-from-left-6 duration-1000">
                    {/* Logo - Agora junto do conteúdo */}
                    <div className="mb-12 flex items-center gap-3">
                        <Image
                            src="/logo-icon.png"
                            alt="Logotipo KwizaPay"
                            width={48}
                            height={48}
                            className="rounded-xl w-12 h-12 shadow-sm"
                        />
                        <span className="text-3xl lg:text-4xl font-bold tracking-tighter">
                            <span className="text-foreground">Kwiza</span>
                            <span className="text-foreground">Pay</span>
                        </span>
                    </div>

                    <div className="space-y-5">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                            Crie, venda e escale o seu curso online
                        </h1>

                        <p className="text-xl md:text-2xl lg:text-[25px] text-muted-foreground max-w-lg leading-tight font-normal">
                            Transforme o seu conhecimento em um negócio na internet
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href="http://app.localhost:3000">
                                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white shadow-xl shadow-[oklch(0.55_0.22_264.53)]/20 transition-all hover:scale-[1.02]">
                                    Comece agora
                                </Button>
                            </Link>

                            <Link href="#">
                                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 border-border hover:border-foreground/20 hover:bg-muted text-foreground shadow-sm transition-all hover:scale-[1.02]">
                                    Chame um gerente
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lado Direito - Imagem Full Height */}
            <div className="hidden md:block flex-1 relative bg-muted overflow-hidden h-screen">
                <Image
                    src="/yoga.webp"
                    alt="Instrutora usando a plataforma"
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>

        </div>
    )
}
