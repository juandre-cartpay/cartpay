"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

export default function ProductsPage() {
    return (
        <div className="flex flex-col h-full w-full font-sans cursor-default bg-background">
            {/* Header / Top Bar - Matched from Dashboard */}
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
                <div className="flex flex-1 items-center justify-end">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Menu do usuário</span>
                    </Button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-background">
                <div className="mx-auto w-[90%] xl:w-[80%] max-w-7xl py-8 space-y-8">
                    {/* Page Title */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Produtos</h1>
                    </div>
                </div>
            </main>
        </div>
    )
}
