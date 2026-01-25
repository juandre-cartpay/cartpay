"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ChevronLeft,
    Loader2,
    LayoutDashboard,
    CreditCard,
    Tag,
    MousePointer2,
    Workflow,
    Users2,
    Share2,
    Info,
    User
} from "lucide-react"
import { updateProduct } from "../actions"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const router = useRouter()
    const [loading, setLoading] = React.useState(true)
    const [saving, setSaving] = React.useState(false)
    const [currentTab, setCurrentTab] = React.useState("details")
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }
    const [product, setProduct] = React.useState<any>(null)
    const [productName, setProductName] = React.useState("")
    const [message, setMessage] = React.useState<string | null>(null)

    React.useEffect(() => {
        const fetchProduct = async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error(error)
                router.push('/products')
                return
            }

            setProduct(data)
            setProductName(data.name || "")
            setLoading(false)
        }

        fetchProduct()
    }, [id, router])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        try {
            await updateProduct(id, formData)
            setMessage("Produto atualizado com sucesso!")
            setTimeout(() => setMessage(null), 3000)
        } catch (err) {
            console.error(err)
            setMessage("Erro ao atualizar produto.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-[oklch(0.55_0.22_264.53)]" />
            </div>
        )
    }

    if (!product) return null

    // Helper to render tabs
    const NavTab = ({ active, icon: Icon, label, tabId }: { active?: boolean, icon: any, label: string, tabId: string }) => (
        <button
            type="button"
            onClick={() => setCurrentTab(tabId)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${currentTab === tabId
                ? "bg-accent/50 text-foreground"
                : "text-foreground/70 hover:text-foreground hover:bg-accent/40"
                }`}>
            <Icon className="h-4 w-4 shrink-0" />
            {label}
        </button>
    )

    return (
        <div className="flex flex-col h-full w-full font-sans bg-background overflow-hidden">
            {/* Top Navigation - Global Header */}
            <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-6 gap-6 shrink-0">
                <div className="flex items-center gap-4 min-w-fit">
                    {/* Left blank for now or could be breadcrumb later */}
                </div>

                <div className="flex-1 flex justify-end items-center">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Menu do usuário</span>
                    </Button>
                </div>
            </header>

            {/* Main Content Wrapper - Splits into Fixed Product Header and Scrollable Form */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Product Header - Fixed Section */}
                <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 shrink-0 z-20">
                    <div className="mx-auto max-w-[1400px] px-8 py-4">
                        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">

                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" onClick={() => router.push('/products')} className="rounded-full -ml-3">
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <h1 className="text-xl font-normal tracking-tight text-foreground">{productName}</h1>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex flex-1 items-center justify-start w-full xl:w-auto overflow-x-auto gap-1 px-4 min-w-0 pb-2 mb-[-8px] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
                                <NavTab tabId="details" icon={LayoutDashboard} label="Detalhes" />
                                <NavTab tabId="payments" icon={CreditCard} label="Pagamentos" />
                                <NavTab tabId="offers" icon={Tag} label="Ofertas" />
                                <NavTab tabId="pixels" icon={MousePointer2} label="Pixels" />
                                <NavTab tabId="funnel" icon={Workflow} label="Funil" />
                                <NavTab tabId="coproduction" icon={Users2} label="Co-produção" />
                                <NavTab tabId="affiliates" icon={Share2} label="Afiliados" />
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="ml-4 pl-4 border-l border-border/50 hidden xl:block">
                                    <Button
                                        onClick={() => document.getElementById('product-form-submit')?.click()}
                                        disabled={saving}
                                        className="bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold h-9 px-4"
                                    >
                                        {saving ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                                        Salvar Alterações
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="mx-auto max-w-[1400px]">
                        {
                            currentTab === 'details' ? (
                                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
                                    <button type="submit" id="product-form-submit" className="hidden" />

                                    {/* Left Column - Form Fields */}
                                    <div className="flex-1 space-y-6">
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-3 pb-2">
                                                <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                                                <h2 className="text-lg font-normal">Detalhes do Produto</h2>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-foreground font-normal">Nome do Produto</Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        value={productName}
                                                        onChange={(e) => setProductName(e.target.value)}
                                                        required
                                                        className="bg-card h-12 border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="description" className="text-foreground font-normal">Descrição</Label>
                                                    <Textarea
                                                        id="description"
                                                        name="description"
                                                        defaultValue={product.description || ''}
                                                        placeholder="Descreva seu produto da melhor forma"
                                                        className="min-h-[140px] bg-card border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground resize-y p-4"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="guarantee_days" className="text-foreground font-normal">Período de Garantia (Dias)</Label>
                                                    <Input
                                                        id="guarantee_days"
                                                        name="guarantee_days"
                                                        type="number"
                                                        defaultValue={product.guarantee_days || 7}
                                                        className="bg-card h-12 border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="support_whatsapp" className="text-foreground font-normal">WhatsApp de Suporte</Label>
                                                        <Input
                                                            id="support_whatsapp"
                                                            name="support_whatsapp"
                                                            placeholder="(00) 00000-0000"
                                                            defaultValue={product.support_whatsapp || ''}
                                                            className="bg-card h-12 border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="support_email" className="text-foreground font-normal">E-mail de suporte</Label>
                                                        <Input
                                                            id="support_email"
                                                            name="support_email"
                                                            type="email"
                                                            placeholder="support@example.com"
                                                            defaultValue={product.support_email || ''}
                                                            className="bg-card h-12 border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="sales_page_url" className="text-foreground font-normal">Página de vendas (URL)</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                            <Share2 className="h-4 w-4" />
                                                        </span>
                                                        <Input
                                                            id="sales_page_url"
                                                            name="sales_page_url"
                                                            placeholder="https://example.com/sales-page"
                                                            defaultValue={product.sales_page_url || ''}
                                                            className="pl-10 bg-card h-12 border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="confirmation_email_body" className="text-foreground font-normal">E-mail de Confirmação de Compra</Label>
                                                    <Textarea
                                                        id="confirmation_email_body"
                                                        name="confirmation_email_body"
                                                        defaultValue={product.confirmation_email_body || ''}
                                                        placeholder="Obrigado pela sua compra! Seus detalhes de acesso estão abaixo:"
                                                        className="min-h-[140px] bg-card border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground resize-y p-4"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Widgets */}
                                    <div className="w-full lg:w-[400px] space-y-6">

                                        {/* Image Upload Widget */}
                                        <div className="space-y-2">
                                            <Label className="text-foreground font-normal">Imagem do Produto</Label>
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-foreground/30 rounded-xl flex flex-col items-center justify-center text-center gap-4 min-h-[220px] cursor-pointer hover:border-foreground transition-colors overflow-hidden relative group"
                                            >
                                                {previewUrl || product.image_url ? (
                                                    <div className="absolute inset-0 w-full h-full">
                                                        <img
                                                            src={previewUrl || product.image_url}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <p className="text-white text-sm font-medium">Alterar imagem</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-muted-foreground">
                                                            <Tag className="h-6 w-6" />
                                                        </div>
                                                        <div className="space-y-1 p-4">
                                                            <p className="text-sm font-medium">Arraste e solte uma imagem, ou clique para selecionar.</p>
                                                            <p className="text-xs text-muted-foreground">PNG, JPG ou JPEG até 5MB.</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                name="image"
                                                accept="image/png, image/jpeg, image/jpg"
                                                onChange={handleImageChange}
                                            />
                                        </div>

                                        {/* Info Card Widget */}
                                        <div className="space-y-6">
                                            <div className="space-y-4 pt-4">
                                                <div className="space-y-2">
                                                    <Label className="text-foreground font-normal text-sm">Tipo do Produto</Label>
                                                    <div className="flex">
                                                        <span className="inline-flex items-center rounded-md border border-foreground/20 bg-transparent px-3 py-1.5 text-sm font-normal text-foreground">
                                                            {product.type === 'digital' ? 'Digital' : 'Físico'}
                                                        </span>
                                                        <input type="hidden" name="type" value={product.type} />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-foreground font-normal text-sm">Tipo do pagamento</Label>
                                                    <div className="flex">
                                                        <span className="inline-flex items-center rounded-md border border-foreground/20 bg-transparent px-3 py-1.5 text-sm font-normal text-foreground">
                                                            {product.payment_type === 'single' ? 'Pagamento Único' : 'Assinatura'}
                                                        </span>
                                                        <input type="hidden" name="payment_type" value={product.payment_type} />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="status" className="text-foreground font-normal text-sm">Status</Label>
                                                    <div>
                                                        <Select name="status" defaultValue={product.status} disabled={product.status === 'draft'}>
                                                            <SelectTrigger className="w-fit h-9 bg-transparent border-foreground/20 px-3 text-sm font-normal text-foreground focus:ring-foreground [&>svg]:hidden disabled:opacity-100">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="draft" disabled>Rascunho</SelectItem>
                                                                <SelectItem value="active">Ativo</SelectItem>
                                                                <SelectItem value="inactive">Inativo</SelectItem>
                                                                <SelectItem value="disabled">Desativado</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-foreground font-normal text-sm">Data de criação</Label>
                                                    <div className="flex items-center gap-2 text-sm font-normal text-foreground">
                                                        {format(new Date(product.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Closing Right Column */}
                                    </div>
                                </form>
                            ) : (
                                <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground bg-card rounded-xl border border-border/50 p-8 text-center animate-in fade-in-50">
                                    <Info className="h-10 w-10 mb-4 opacity-50" />
                                    <h3 className="text-lg font-medium text-foreground">Funcionalidade em desenvolvimento</h3>
                                    <p className="max-w-md mt-2">A aba <span className="font-semibold text-foreground capitalize">{currentTab}</span> estará disponível em breve com novas funcionalidades.</p>
                                </div>
                            )
                        }
                    </div>
                </main>
            </div>
        </div>
    )
}
