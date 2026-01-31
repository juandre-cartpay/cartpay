"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ChevronRight, ChevronLeft, User, LogOut, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"

export default function OnboardingPage() {
    const router = useRouter()
    const supabase = createClient()
    // Start step as null to prevent flashing Step 1 before loading existing progress
    const [step, setStep] = React.useState<number | null>(null)
    const [showUserMenu, setShowUserMenu] = React.useState(false)
    const [userEmail, setUserEmail] = React.useState("")
    const [userId, setUserId] = React.useState("")
    const [isSaving, setIsSaving] = React.useState(false)
    const [answers, setAnswers] = React.useState({
        registrationType: "",
        revenue: "",
        followers: "",
        instagram: ""
    })

    React.useEffect(() => {
        const loadProgress = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserEmail(user.email || "")
                setUserId(user.id)

                // Fetch existing profile data to resume progress
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('registration_type, revenue, instagram')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    setAnswers({
                        registrationType: profile.registration_type || "",
                        revenue: profile.revenue || "",
                        followers: "",
                        instagram: profile.instagram || ""
                    })

                    // Smart Resume Logic based on missing fields
                    if (!profile.registration_type) {
                        setStep(1)
                    } else if (!profile.revenue) {
                        setStep(2)
                    } else if (!profile.instagram) {
                        setStep(3)
                    } else {
                        // If everything is present, default to Step 3 so they can finish/edit
                        setStep(3)
                    }
                } else {
                    // If no profile data found (error or null data from .single()), start at step 1
                    setStep(1)
                }
            } else {
                // If no user (shouldn't happen here usually, as auth guard should redirect), default to 1
                setStep(1)
            }
        }
        loadProgress()
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const saveAndAdvance = async (currentStep: number, dataToUpdate: any) => {
        setIsSaving(true)
        try {
            // Ensure we have an ID to update
            let targetId = userId
            if (!targetId) {
                const { data } = await supabase.auth.getUser()
                if (data.user) targetId = data.user.id
            }

            if (!targetId) return

            // Update Supabase
            const { error } = await supabase
                .from('profiles')
                .update(dataToUpdate)
                .eq('id', targetId)

            if (error) throw error

            if (currentStep < 3) {
                setStep(s => (s || 0) + 1)
            } else {
                router.push('/')
                router.refresh()
            }
        } catch (error) {
            console.error("Error saving progress:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleNext = () => {
        // Prepare data based on current step
        let data = {}
        if (step === 1) data = { registration_type: answers.registrationType }
        else if (step === 2) data = { revenue: answers.revenue }
        else if (step === 3) data = { instagram: answers.instagram }

        saveAndAdvance(step || 1, data)
    }

    const handleSelect = (key: string, value: string) => {
        setAnswers(prev => ({ ...prev, [key]: value }))

        // Map frontend keys to DB columns
        const dbColumn = key === 'registrationType' ? 'registration_type' : key

        // Auto-advance
        setTimeout(() => {
            saveAndAdvance(step || 1, { [dbColumn]: value })
        }, 250)
    }

    const handleInstagramChange = (value: string) => {
        const cleanValue = value.replace(/^@/, '')
        setAnswers(prev => ({ ...prev, instagram: cleanValue }))
    }

    const handleBack = () => {
        if (step && step > 1) {
            setStep(step - 1)
        }
    }

    // Step 1: Registration Type
    const renderStep1 = () => (
        <div className="space-y-8">
            <div className="space-y-2">
                {/* Titles outside */}
            </div>
            <div className="space-y-4">
                <div
                    className="flex items-start space-x-3 cursor-pointer group"
                    onClick={() => handleSelect('registrationType', 'seller')}
                >
                    <div className={`mt-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${answers.registrationType === 'seller' ? 'border-[oklch(0.55_0.22_264.53)]' : 'border-muted-foreground/30 group-hover:border-muted-foreground/50'}`}>
                        {answers.registrationType === 'seller' && <div className="h-3 w-3 rounded-full bg-[oklch(0.55_0.22_264.53)]" />}
                    </div>
                    <Label className="cursor-pointer font-normal text-base leading-tight pt-0.5 text-foreground/90">Quero vender produtos digitais. Sou um infoprodutor, co-produtor ou afiliado.</Label>
                </div>

                <div
                    className="flex items-start space-x-3 cursor-pointer group"
                    onClick={() => handleSelect('registrationType', 'buyer')}
                >
                    <div className={`mt-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${answers.registrationType === 'buyer' ? 'border-[oklch(0.55_0.22_264.53)]' : 'border-muted-foreground/30 group-hover:border-muted-foreground/50'}`}>
                        {answers.registrationType === 'buyer' && <div className="h-3 w-3 rounded-full bg-[oklch(0.55_0.22_264.53)]" />}
                    </div>
                    <Label className="cursor-pointer font-normal text-base leading-tight pt-0.5 text-foreground/90">Preciso de ajuda com um produto que comprei pela KwizaPay</Label>
                </div>
            </div>


        </div>
    )

    // Step 2: Revenue
    const renderStep2 = () => (
        <div className="space-y-8">
            <div className="space-y-2">
                {/* Titles outside */}
            </div>
            <div className="space-y-4">
                {[
                    "Ainda não faturei",
                    "Até 1.000.000 Kz",
                    "De 1.000.000 Kz a 5.000.000 Kz",
                    "De 5.000.000 Kz a 20.000.000 Kz",
                    "Mais de 20.000.000 Kz"
                ].map((option) => (
                    <div
                        key={option}
                        className="flex items-center space-x-3 cursor-pointer group"
                        onClick={() => handleSelect('revenue', option)}
                    >
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${answers.revenue === option ? 'border-[oklch(0.55_0.22_264.53)]' : 'border-muted-foreground/30 group-hover:border-muted-foreground/50'}`}>
                            {answers.revenue === option && <div className="h-3 w-3 rounded-full bg-[oklch(0.55_0.22_264.53)]" />}
                        </div>
                        <Label className="cursor-pointer font-normal text-base text-foreground/90">{option}</Label>
                    </div>
                ))}
            </div>


        </div>
    )

    // Step 3: Instagram (Simplified)
    const renderStep3 = () => (
        <div className="space-y-8">
            <div className="space-y-2">
                {/* Titles outside */}
            </div>
            <div className="space-y-6">
                <div className="space-y-3">
                    <Label htmlFor="instagram" className="text-base font-normal text-foreground">
                        Qual é o seu perfil?
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">@</span>
                        <Input
                            id="instagram"
                            placeholder=""
                            className="pl-8 h-12 text-base transition-all focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.22_264.53)]"
                            value={answers.instagram}
                            onChange={(e) => handleInstagramChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && answers.instagram.length > 1) {
                                    handleNext()
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="mt-8 flex justify-end">
                <Button
                    onClick={handleNext}
                    disabled={!answers.instagram || answers.instagram.length < 2 || isSaving}
                    className="bg-transparent border border-[oklch(0.55_0.22_264.53)] text-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/10 font-bold transition-all hover:scale-[1.02] shadow-sm min-w-[140px] h-11"
                >
                    {isSaving ? (
                        <Spinner className="h-4 w-4" />
                    ) : (
                        "Continuar"
                    )}
                </Button>
            </div>
        </div>
    )

    if (step === null) {
        return (
            <div className="min-h-screen w-full bg-muted/40 font-sans flex items-center justify-center">
                <Spinner className="h-10 w-10 text-foreground" />
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-background p-2 md:p-4 overflow-hidden font-sans">
            <div className="flex flex-col h-full w-full overflow-hidden rounded-xl border border-border bg-muted/40 shadow-xl relative">
                {/* Header */}
                <header className="w-full bg-card h-16 flex items-center justify-between px-6 shadow-sm border-b border-border/50 relative z-50 shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Logo with explicit colors from login page */}
                        <Image
                            src="/logo-icon.png"
                            alt="KwizaPay"
                            width={32}
                            height={32}
                            className="rounded-lg w-8 h-8"
                        />
                        <span className="text-2xl font-bold tracking-tighter cursor-default">
                            <span className="text-foreground">Kwiza</span>
                            <span className="text-foreground">Pay</span>
                        </span>
                    </div>

                    <div className="relative flex items-center gap-4">
                        <span className="text-sm font-medium text-foreground">
                            {userEmail || ''}
                        </span>
                        <div
                            className="h-10 w-10 rounded-full bg-muted/50 border border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <User className="h-5 w-5 text-muted-foreground" />
                        </div>

                        {showUserMenu && (
                            <div className="absolute right-0 top-12 w-48 bg-card rounded-lg shadow-lg border border-border/50 py-1 animate-in fade-in zoom-in-95 duration-200">
                                <div
                                    className="px-4 py-3 flex items-center gap-2 text-sm text-red-500 hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Sair</span>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 flex flex-col items-center justify-center p-4 space-y-8 overflow-y-auto">
                    <Card className="w-full max-w-2xl border-border/50 bg-card shadow-lg animate-in fade-in zoom-in-95 duration-300">
                        <CardContent className="p-10">
                            <h1 className="text-2xl font-bold text-foreground text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {step === 1 && "Qual é o seu tipo de cadastro?"}
                                {step === 2 && "Quanto você faturou com infoprodutos nos últimos 12 meses?"}
                                {step === 3 && "Qual é o seu Instagram?"}
                            </h1>

                            {step === 1 && renderStep1()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}
