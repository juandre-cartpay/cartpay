"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Undo2, Calendar, Wallet, DollarSign, Users, LogOut, Gift, ListTodo, Share2, Globe, Webhook, Ghost, Blocks, Store, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

import Image from "next/image"

const sidebarSections = [
    {
        title: "Geral",
        items: [
            { title: "Dashboard", href: "/", icon: LayoutDashboard },
            { title: "Produtos", href: "/products", icon: Package },
            { title: "Vitrine", href: "/store", icon: Store },
            { title: "Vendas", href: "/sales", icon: DollarSign },
            { title: "Reembolsos", href: "/refunds", icon: Undo2 },
            { title: "Assinaturas", href: "/subscriptions", icon: Calendar },
            { title: "Financeiro", href: "/finance", icon: Wallet },
            { title: "Indique e Ganhe", href: "/referrals", icon: Gift },
            { title: "Afiliados", href: "/affiliates", icon: Users },
            { title: "Wizalog", href: "/wizalog", icon: ListTodo },
        ]
    },
    {
        title: "Avançado",
        items: [
            { title: "Integrações", href: "/integrations", icon: Blocks },
            { title: "Domínios", href: "/domains", icon: Globe },
            { title: "Webhooks", href: "/webhooks", icon: Webhook },
        ]
    },
    {
        title: "KwizaApps",
        items: [
            { title: "CloWiza", href: "/clowiza", icon: Ghost },
        ]
    }
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [collapsedSections, setCollapsedSections] = React.useState<string[]>([])

    const toggleSection = (title: string) => {
        setCollapsedSections(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        )
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <div className="flex w-64 flex-col border-r bg-background h-full">
            {/* Logo Section */}
            <div className="flex h-16 items-center border-b px-6 gap-2 shrink-0">
                <Image
                    src="/logo-icon.png"
                    alt="KwizaPay"
                    width={32}
                    height={32}
                    className="rounded-lg w-8 h-8"
                />
                <span className="text-2xl font-bold tracking-tighter">
                    <span className="text-foreground">Kwiza</span>
                    <span className="text-foreground">Pay</span>
                </span>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 overflow-y-auto py-6 px-3">
                <nav className="space-y-6">
                    {sidebarSections.map((section, sectionIndex) => {
                        const isCollapsible = section.title !== "Geral"
                        const isCollapsed = collapsedSections.includes(section.title)

                        return (
                            <div key={sectionIndex} className="space-y-1">
                                {section.title && (
                                    <div
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2 text-sm font-semibold text-foreground tracking-wider opacity-90 select-none",
                                            isCollapsible ? "cursor-pointer hover:bg-accent/50 rounded-md transition-colors" : ""
                                        )}
                                        onClick={() => isCollapsible && toggleSection(section.title)}
                                    >
                                        {section.title}
                                        {isCollapsible && (
                                            isCollapsed ? (
                                                <ChevronRight className="h-4 w-4 opacity-50" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            )
                                        )}
                                    </div>
                                )}
                                <div className={cn("space-y-1 transition-all overflow-hidden", isCollapsible && isCollapsed ? "h-0 opacity-0" : "h-auto opacity-100")}>
                                    {section.items.map((item, itemIndex) => {
                                        const Icon = item.icon
                                        const isActive = item.href === '/'
                                            ? pathname === '/'
                                            : pathname === item.href || pathname?.startsWith(`${item.href}/`)

                                        return (
                                            <Link
                                                key={itemIndex}
                                                href={item.href}
                                                className={cn(
                                                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground relative overflow-hidden",
                                                    isActive
                                                        ? "bg-accent text-accent-foreground after:absolute after:right-0 after:top-0 after:h-full after:w-1 after:bg-[oklch(0.55_0.22_264.53)] after:shadow-[-6px_0_24px_2px_oklch(0.55_0.22_264.53)] after:rounded-l-sm"
                                                        : "text-foreground"
                                                )}>
                                                <Icon className="h-4 w-4 shrink-0" />
                                                <span>{item.title}</span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </nav>
            </div>

            {/* Footer Section (Sair) */}
            <div className="border-t p-4 shrink-0">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div >
    )
}
