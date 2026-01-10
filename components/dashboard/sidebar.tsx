"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Package, Store, ShoppingCart, Undo2, Calendar, Wallet, DollarSign, Users, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

const sidebarItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Produtos", href: "/dashboard/products", icon: Package },
    { title: "Vendas", href: "/dashboard/sales", icon: ShoppingCart },
    { title: "Reembolsos", href: "/dashboard/refunds", icon: Undo2 },
    { title: "Assinaturas", href: "/dashboard/subscriptions", icon: Calendar },
    { title: "Financeiro", href: "/dashboard/finance", icon: Wallet },
    { title: "Indique e Ganhe", href: "/dashboard/referrals", icon: DollarSign },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <div className="flex w-64 flex-col border-r bg-background h-full">
            {/* Logo Section */}
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-2xl font-bold tracking-tighter">
                    <span className="text-[oklch(0.55_0.22_264.53)]">Cart</span>
                    <span className="text-foreground">pay</span>
                </span>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 overflow-y-auto py-6 px-3">
                <nav className="grid items-start gap-2">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Geral
                    </div>
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-accent/80 text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{item.title}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Footer Section (Sair) */}
            {/* Meta Faturamento */}
            <div className="px-4 py-4 space-y-2">
                <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Faturamento</span>
                    <span className="text-foreground">0 / 1M</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary/50 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-[oklch(0.55_0.22_264.53)] shadow-sm"
                        style={{ width: '0%' }}
                    />
                </div>
            </div>

            {/* Footer Section (Sair) */}
            <div className="border-t p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div>
    )
}
