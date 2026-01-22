"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { HelpCircle, Check, ChevronsUpDown, Loader2, X } from "lucide-react"

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
import { createClient } from "@/lib/supabase/client"

const countries = [
    { value: "angola", label: "Angola" },
]

export default function RegisterPage() {
    const router = useRouter()
    const supabase = createClient()

    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("angola")

    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState(false)

    // Validation States
    const [emailError, setEmailError] = React.useState<string | null>(null)
    const [confirmEmailError, setConfirmEmailError] = React.useState<string | null>(null)
    const [passwordError, setPasswordError] = React.useState<string | null>(null)
    const [termsError, setTermsError] = React.useState(false)

    const [formData, setFormData] = React.useState({
        email: "",
        confirmEmail: "",
        password: "",
        terms: false
    })

    const validateEmail = (value: string) => {
        if (!value) {
            setEmailError("Esse campo é obrigatório")
            return false
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
            setEmailError("O e-mail deve ser válido")
            return false
        }
        setEmailError(null)
        return true
    }

    const validateConfirmEmail = (email: string, confirm: string) => {
        if (!confirm) {
            setConfirmEmailError("Esse campo é obrigatório")
            return false
        }
        if (email !== confirm) {
            setConfirmEmailError("Os dois e-mails devem ser iguais.")
            return false
        }
        setConfirmEmailError(null)
        return true
    }

    const validatePassword = (value: string) => {
        if (!value) {
            setPasswordError("Esse campo é obrigatório")
            return false
        }
        setPasswordError(null)
        return true
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData({ ...formData, [id]: value })
        if (error) setError(null)

        // Real-time validation if error exists
        if (id === 'email' && emailError) {
            validateEmail(value)
        }
        if (id === 'confirmEmail' && confirmEmailError) {
            validateConfirmEmail(formData.email, value) // Check against current form email, not new state yet potentially? actually formData.email is old state. 
            // Better to pass logic explicitly:
            if (value && formData.email !== value) {
                // Wait, confirmEmail checks generally need both values.
                // Let's stick to the simple check:
                // If I'm changing confirmEmail, check against formData.email
                // If I'm changing email, strictly I should check confirmEmail validity too, but let's keep it simple.
            }
            if (value !== formData.email) setConfirmEmailError("Os dois e-mails devem ser iguais.")
            else setConfirmEmailError(null)
        }

        // Correcting the above logic slightly for clarity in the implementation block below
    }

    // Better implementation of handleChange to handle the dependencies correctly
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        const newFormData = { ...formData, [id]: value }
        setFormData(newFormData)
        if (error) setError(null)

        if (id === 'email') {
            if (emailError) validateEmail(value)
            // Also re-validate match if confirm email is filled
            if (newFormData.confirmEmail) {
                if (newFormData.confirmEmail !== value) setConfirmEmailError("Os dois e-mails devem ser iguais.")
                else setConfirmEmailError(null)
            }
        }

        if (id === 'confirmEmail') {
            if (confirmEmailError) {
                validateConfirmEmail(newFormData.email, value)
            }
        }

        if (id === 'password') {
            if (passwordError) validatePassword(value)
        }
    }


    const handleCheckedChange = (checked: boolean) => {
        setFormData({ ...formData, terms: checked })
        if (checked) setTermsError(false)
        if (error) setError(null)
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setEmailError(null)
        setConfirmEmailError(null)
        setPasswordError(null)
        setTermsError(false)

        const isEmailValid = validateEmail(formData.email)
        const isConfirmValid = validateConfirmEmail(formData.email, formData.confirmEmail)
        const isPasswordValid = validatePassword(formData.password)
        const isTermsValid = formData.terms

        if (!isTermsValid) {
            setTermsError(true)
        }

        if (!isEmailValid || !isConfirmValid || !isPasswordValid || !isTermsValid) {
            setLoading(false)
            return
        }

        try {
            // Check if user already exists in profiles (workaround for Supabase enumeration protection)
            const { data: existingUser } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', formData.email)
                .maybeSingle()

            if (existingUser) {
                throw new Error("User already registered")
            }

            const { error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        country: value,
                    },
                },
            })

            if (signUpError) {
                throw signUpError
            }

            router.push('/onboarding')
            router.refresh()
        } catch (err: any) {
            let errorMessage = "Ocorreu um erro ao criar a conta."
            if (err.message === "User already registered") {
                errorMessage = "Este e-mail já está em uso."
            } else if (err.message.includes("Password should be at least")) {
                errorMessage = "A senha deve ter no mínimo 6 caracteres."
            }
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4 font-sans">
                <Card className="w-full max-w-md border-border/50 bg-card shadow-lg">
                    <CardContent className="space-y-4 pt-6 pb-6 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold">Conta criada com sucesso!</h2>
                        <p className="text-muted-foreground">
                            Verifique seu e-mail para confirmar seu cadastro.
                        </p>
                        <Button
                            className="w-full bg-[oklch(0.55_0.22_264.53)] text-white mt-4"
                            onClick={() => router.push('/')}
                        >
                            Ir para o Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4 font-sans">
            <div className="w-full max-w-md space-y-6">
                {/* Header Outside Card */}
                <div className="flex flex-col items-center text-center">
                    {/* Logo Section - Text Only */}
                    <div className="mb-6 flex items-center justify-center gap-3">
                        <Image
                            src="/logo-icon.png"
                            alt="KwizaPay"
                            width={48}
                            height={48}
                            className="rounded-xl w-12 h-12 shadow-sm"
                        />
                        <span className="text-4xl font-bold tracking-tighter">
                            <span className="text-foreground">Kwiza</span>
                            <span className="text-foreground">Pay</span>
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
                        <form onSubmit={handleSignUp} className="space-y-4" noValidate>

                            {/* E-mail */}
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    className={`h-11 bg-muted/20 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all focus-visible:border-[oklch(0.55_0.22_264.53)] focus-visible:shadow-[0_0_0_3px_oklch(0.55_0.22_264.53)/0.2] ${emailError ? "border-red-500" : ""
                                        }`}
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onBlur={() => validateEmail(formData.email)}
                                />
                                {emailError && (
                                    <p className="text-xs text-red-500">{emailError}</p>
                                )}
                            </div>

                            {/* Repetir E-mail */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmEmail">Repetir e-mail</Label>
                                <Input
                                    id="confirmEmail"
                                    type="email"
                                    required
                                    className={`h-11 bg-muted/20 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all focus-visible:border-[oklch(0.55_0.22_264.53)] focus-visible:shadow-[0_0_0_3px_oklch(0.55_0.22_264.53)/0.2] ${confirmEmailError ? "border-red-500" : ""
                                        }`}
                                    value={formData.confirmEmail}
                                    onChange={handleInputChange}
                                    onBlur={() => validateConfirmEmail(formData.email, formData.confirmEmail)}
                                />
                                {confirmEmailError && (
                                    <p className="text-xs text-red-500">{confirmEmailError}</p>
                                )}
                            </div>

                            {/* Senha */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    className={`h-11 bg-muted/20 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all focus-visible:border-[oklch(0.55_0.22_264.53)] focus-visible:shadow-[0_0_0_3px_oklch(0.55_0.22_264.53)/0.2] ${passwordError ? "border-red-500" : ""
                                        }`}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    onBlur={() => validatePassword(formData.password)}
                                />
                                {passwordError && (
                                    <p className="text-xs text-red-500">{passwordError}</p>
                                )}
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
                                            className="w-full justify-between h-11 bg-muted/20 border-input font-normal hover:bg-muted/30 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[oklch(0.55_0.22_264.53)] focus-visible:shadow-[0_0_0_3px_oklch(0.55_0.22_264.53)/0.2] transition-all"
                                            type="button"
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
                                <Checkbox
                                    id="terms"
                                    className={`mt-1 data-[state=checked]:bg-[oklch(0.55_0.22_264.53)] data-[state=checked]:border-[oklch(0.55_0.22_264.53)] ${termsError ? "border-red-500" : ""}`}
                                    checked={formData.terms}
                                    onCheckedChange={handleCheckedChange}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <label
                                        htmlFor="terms"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground font-normal"
                                    >
                                        Eu li e aceito os <Link href="#" className="underline hover:text-foreground">termos de uso</Link>, <Link href="#" className="underline hover:text-foreground">termos de licença de uso de software</Link>, <Link href="#" className="underline hover:text-foreground">política de conteúdo</Link> da KwizaPay
                                    </label>
                                    {termsError && (
                                        <p className="text-xs text-red-500 mt-1">(Esse campo é obrigatório)</p>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-3 p-4 text-sm text-red-600 bg-red-50 border-l-4 border-red-400 rounded-sm">
                                    <X className="h-5 w-5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button
                                className="w-full bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold text-lg h-12 shadow-sm transition-all mt-4 hover:scale-[1.01]"
                                disabled={loading}
                                type="submit"
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar conta"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
