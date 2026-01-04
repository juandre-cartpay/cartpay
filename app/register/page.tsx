"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { HelpCircle, Check, ChevronsUpDown } from "lucide-react"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const countries = [
    { value: "angola", label: "Angola" },
]

export default function RegisterPage() {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("angola")

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
                        Criar nova conta
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Ou <Link href="/" className="text-[oklch(0.55_0.22_264.53)] font-medium hover:underline">entrar na sua conta existente</Link>
                    </p>
                </div>

                {/* Card Section */}
                <Card className="border-border/50 bg-card shadow-lg">
                    <CardContent className="space-y-4 pt-6">

                        {/* E-mail */}
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                className="h-11 bg-muted/20"
                            />
                        </div>

                        {/* Repetir E-mail */}
                        <div className="space-y-2">
                            <Label htmlFor="email-confirm">Repetir e-mail</Label>
                            <Input
                                id="email-confirm"
                                type="email"
                                required
                                className="h-11 bg-muted/20"
                            />
                        </div>

                        {/* Senha */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                className="h-11 bg-muted/20"
                            />
                        </div>

                        {/* País */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="country">País</Label>
                                <div className="group relative flex items-center">
                                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                    {/* Tooltip */}
                                    <div className="absolute left-1/2 bottom-full mb-2 hidden w-64 -translate-x-1/2 rounded-md bg-secondary text-secondary-foreground p-3 text-xs shadow-md group-hover:block z-50 border border-border">
                                        Selecione o país de registo da sua empresa. Se vende como pessoa singular, selecione o seu país de residência.
                                        <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-secondary"></div>
                                    </div>
                                </div>
                            </div>

                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between h-11 bg-muted/20 border-input font-normal hover:bg-muted/30"
                                    >
                                        {value
                                            ? countries.find((framework) => framework.value === value)?.label
                                            : "Selecione o país..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Procurar país..." />
                                        <CommandList>
                                            <CommandEmpty>Nenhum resultado.</CommandEmpty>
                                            <CommandGroup>
                                                {countries.map((framework) => (
                                                    <CommandItem
                                                        key={framework.value}
                                                        value={framework.value}
                                                        onSelect={(currentValue) => {
                                                            setValue(currentValue === value ? "" : currentValue)
                                                            setOpen(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                value === framework.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {framework.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start space-x-3 pt-2">
                            <Checkbox id="terms" className="mt-1 data-[state=checked]:bg-[oklch(0.55_0.22_264.53)] data-[state=checked]:border-[oklch(0.55_0.22_264.53)]" />
                            <div className="grid gap-1.5 leading-none">
                                <label
                                    htmlFor="terms"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground font-normal"
                                >
                                    Eu li e aceito os <Link href="#" className="underline hover:text-foreground">termos de uso</Link>, <Link href="#" className="underline hover:text-foreground">termos de licença de uso de software</Link>, <Link href="#" className="underline hover:text-foreground">política de conteúdo</Link> da Cartpay
                                </label>
                            </div>
                        </div>

                        <Button className="w-full bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold text-lg h-12 shadow-sm transition-all mt-4 hover:scale-[1.01]">
                            Criar conta
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
