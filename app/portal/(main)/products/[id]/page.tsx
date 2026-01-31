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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import {
    ChevronLeft,

    LayoutDashboard,
    CreditCard,
    Tag,
    MousePointer2,
    Workflow,
    Users2,
    Share2,
    Info,
    User,
    Smartphone,
    FileText,
    Plus,
    Trash2,
    Link as LinkIcon,
    ExternalLink,
    Link2,
    X
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { updateProduct, createOffer, deleteOffer } from "../actions"
import { EmailInput } from "@/components/ui/email-input"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { SuccessNotification } from "@/components/ui/success-notification"

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const router = useRouter()
    const [loading, setLoading] = React.useState(true)
    const [saving, setSaving] = React.useState(false)
    const [currentTab, setCurrentTab] = React.useState("details")
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const tabs = [
        { id: "details", label: "Detalhes", icon: LayoutDashboard },
        { id: "payments", label: "Pagamentos", icon: CreditCard },
        { id: "offers", label: "Ofertas", icon: Tag },
        { id: "pixels", label: "Pixels", icon: MousePointer2 },
        { id: "funnel", label: "Funil", icon: Workflow },
        { id: "coproduction", label: "Co-produção", icon: Users2 },
        { id: "affiliates", label: "Afiliados", icon: Share2 },
    ]

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert("O arquivo é muito grande. O tamanho máximo permitido é 10MB.")
                return
            }
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }
    const [product, setProduct] = React.useState<any>(null)
    const [productName, setProductName] = React.useState("")
    const [supportEmail, setSupportEmail] = React.useState("")
    const [message, setMessage] = React.useState<string | null>(null)
    const [errors, setErrors] = React.useState<Record<string, string>>({})

    // Payments State
    const [paymentSettings, setPaymentSettings] = React.useState({
        express: true,
        reference: false
    })

    const [defaultMethod, setDefaultMethod] = React.useState("express")

    // Offers State
    const [offers, setOffers] = React.useState<any[]>([])
    const [isCreatingOffer, setIsCreatingOffer] = React.useState(false)
    const [isDeletingOffer, setIsDeletingOffer] = React.useState<string | null>(null)

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
            setSupportEmail(data.support_email || "")

            // Payment settings sync
            setPaymentSettings({
                express: data.payment_express_enabled ?? true,
                reference: data.payment_reference_enabled ?? false
            })
            if (data.payment_default_method) {
                setDefaultMethod(data.payment_default_method)
            }

            // Fetch Offers
            const { data: offersData } = await supabase
                .from('offers')
                .select('*')
                .eq('product_id', id)
                .order('created_at', { ascending: false })

            setOffers(offersData || [])

            setLoading(false)
        }

        fetchProduct()
    }, [id, router])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)
        setErrors({})

        const formData = new FormData(e.currentTarget)
        const newErrors: Record<string, string> = {}

        // Validation Logic
        const whatsapp = formData.get("support_whatsapp") as string
        if (!whatsapp || whatsapp.trim() === "") {
            newErrors.support_whatsapp = "O número de suporte é obrigatório"
        }

        const email = formData.get("support_email") as string
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email || !emailRegex.test(email)) {
            newErrors.support_email = "O e-mail de suporte deve ser um e-mail válido"
        }

        const url = formData.get("sales_page_url") as string
        if (url) {
            try {
                new URL(url)
            } catch (_) {
                newErrors.sales_page_url = "A URL da página de vendas deve ser uma URL válida"
            }
        } else {
            newErrors.sales_page_url = "A URL da página de vendas é obrigatória"
        }

        const deliveryUrl = formData.get("confirmation_email_body") as string
        if (deliveryUrl) {
            try {
                new URL(deliveryUrl)
            } catch (_) {
                newErrors.confirmation_email_body = "A URL de acesso ao produto deve ser válida"
            }
        } else {
            newErrors.confirmation_email_body = "A URL de acesso ao produto é obrigatória"
        }

        // Image Validation
        const imageFile = formData.get("image") as File
        if ((!imageFile || imageFile.size === 0) && !product.image_url) {
            newErrors.image = "A imagem do produto é obrigatória"
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setSaving(false)
            return
        }

        try {
            await updateProduct(id, formData)
            setMessage("Alterações salvas com sucesso!")
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
                <Spinner className="h-8 w-8 text-foreground" />
            </div>
        )
    }

    if (!product) return null

    // Helper to render tabs
    const NavTab = ({ active, icon: Icon, label, tabId }: { active?: boolean, icon: any, label: string, tabId: string }) => (
        <button
            type="button"
            onClick={() => setCurrentTab(tabId)}
            className={`group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap relative overflow-hidden ${currentTab === tabId
                ? "bg-accent text-foreground after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[oklch(0.55_0.22_264.53)] after:shadow-[0_-4px_16px_2px_oklch(0.55_0.22_264.53)]"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
                }`}>
            <Icon className="h-4 w-4 shrink-0" />
            {label}
        </button>
    )

    return (
        <div className="flex flex-col h-full w-full font-sans bg-background overflow-hidden">
            {/* Top Navigation - Global Header */}
            <SuccessNotification
                message={message || ""}
                isVisible={!!message && !message.includes("Erro")}
                onClose={() => setMessage(null)}
            />
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



                            {/* Navigation Tabs */}
                            <div className="flex flex-1 items-center justify-start w-full xl:w-auto overflow-x-auto pb-2 mb-[-8px] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
                                <div className="flex items-center gap-1 p-1 border border-border rounded-full min-w-max">
                                    {tabs.map(tab => (
                                        <NavTab key={tab.id} tabId={tab.id} icon={tab.icon} label={tab.label} />
                                    ))}
                                    <Button
                                        onClick={() => document.getElementById('product-form-submit')?.click()}
                                        disabled={saving}
                                        className="bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold h-9 px-4 rounded-full"
                                    >
                                        {saving ? <Spinner className="h-3 w-3 mr-2" /> : null}
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
                                <form onSubmit={handleSubmit} className="border border-border rounded-xl bg-background overflow-hidden main-content-card">
                                    <button type="submit" id="product-form-submit" className="hidden" />

                                    {/* Header Section */}
                                    <div className="flex items-center gap-3 p-6 border-b border-border/50">
                                        <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                                        <h2 className="text-lg font-normal">Detalhes do Produto</h2>
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex flex-col lg:flex-row gap-8 p-8">
                                        {/* Left Column - Form Fields */}
                                        <div className="flex-1 space-y-6">
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-foreground font-normal">Nome do Produto</Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        value={productName}
                                                        onChange={(e) => setProductName(e.target.value)}
                                                        required
                                                        className="bg-background h-12 border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="description" className="text-foreground font-normal">Descrição</Label>
                                                    <Textarea
                                                        id="description"
                                                        name="description"
                                                        defaultValue={product.description || ''}
                                                        placeholder="Descreva seu produto da melhor forma"
                                                        className="min-h-[140px] bg-background border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground resize-y p-4"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="guarantee_days" className="text-foreground font-normal">Período de Garantia (Dias)</Label>
                                                    <Input
                                                        id="guarantee_days"
                                                        name="guarantee_days"
                                                        type="number"
                                                        max={30}
                                                        min={7}
                                                        defaultValue={product.guarantee_days || 7}
                                                        className="bg-background h-12 border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (val < 7) e.target.value = "7";
                                                            if (val > 7) e.target.value = "7";
                                                        }}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="support_whatsapp" className="text-foreground font-normal">WhatsApp de Suporte</Label>
                                                        <Input
                                                            id="support_whatsapp"
                                                            name="support_whatsapp"
                                                            placeholder="(000) 000-000-000"
                                                            defaultValue={product.support_whatsapp || ''}
                                                            className={`bg-background h-12 border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground ${errors.support_whatsapp ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                            maxLength={16}
                                                            onChange={(e) => {
                                                                let value = e.target.value.replace(/\D/g, "");
                                                                if (value.startsWith("244")) value = value.substring(3);
                                                                value = value.substring(0, 9);

                                                                if (value.length === 0) {
                                                                    e.target.value = "";
                                                                    return;
                                                                }

                                                                let formatted = "+244";
                                                                if (value.length > 0) formatted += " " + value.substring(0, 3);
                                                                if (value.length > 3) formatted += " " + value.substring(3, 6);
                                                                if (value.length > 6) formatted += " " + value.substring(6, 9);

                                                                e.target.value = formatted;
                                                            }}
                                                        />
                                                        {errors.support_whatsapp && <p className="text-red-500 text-sm mt-1">{errors.support_whatsapp}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="support_email" className="text-foreground font-normal">E-mail de suporte</Label>
                                                        <EmailInput
                                                            id="support_email"
                                                            name="support_email"
                                                            placeholder="support@example.com"
                                                            value={supportEmail}
                                                            onChange={(e) => setSupportEmail(e.target.value)}
                                                            className={`bg-background h-12 border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground ${errors.support_email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                        />
                                                        {errors.support_email && <p className="text-red-500 text-sm mt-1">{errors.support_email}</p>}
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
                                                            className={`pl-10 bg-background h-12 border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground ${errors.sales_page_url ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                        />
                                                    </div>
                                                    {errors.sales_page_url && <p className="text-red-500 text-sm mt-1">{errors.sales_page_url}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="confirmation_email_body" className="text-foreground font-normal">Acesso ao Produto (URL)</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                            <LinkIcon className="h-4 w-4" />
                                                        </span>
                                                        <Input
                                                            id="confirmation_email_body"
                                                            name="confirmation_email_body"
                                                            placeholder="https://drive.google.com/..."
                                                            defaultValue={product.confirmation_email_body || ''}
                                                            className={`pl-10 bg-background h-12 border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground ${errors.confirmation_email_body ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                        />
                                                    </div>
                                                    {errors.confirmation_email_body && <p className="text-red-500 text-sm mt-1">{errors.confirmation_email_body}</p>}
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
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`border-2 border-dashed ${errors.image ? "border-red-500" : "border-foreground/30"} rounded-xl flex flex-col items-center justify-center text-center gap-4 min-h-[220px] cursor-pointer hover:border-foreground transition-colors overflow-hidden relative group`}
                                                >
                                                    {previewUrl || product.image_url ? (
                                                        <div className="absolute inset-0 w-full h-full">
                                                            <img
                                                                src={previewUrl || product.image_url}
                                                                alt="Preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                                <p className="text-white text-sm font-medium">Alterar imagem</p>
                                                            </div>
                                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-full"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setPreviewUrl(null);
                                                                        setProduct({ ...product, image_url: null });
                                                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                                                    }}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-muted-foreground">
                                                                <Tag className="h-6 w-6" />
                                                            </div>
                                                            <div className="space-y-1 p-4">
                                                                <p className="text-sm font-medium">Arraste e solte uma imagem, ou clique para selecionar.</p>
                                                                <p className="text-xs text-muted-foreground">PNG, JPG ou JPEG até 10MB.</p>
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
                                                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                                            </div>

                                            {/* Info Card Widget */}
                                            <div className="space-y-6 border border-foreground/30 rounded-xl p-6">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-foreground font-normal text-sm">Tipo do Produto</Label>
                                                        <div className="flex">
                                                            <span className="inline-flex items-center rounded-full border border-foreground/20 bg-transparent px-3 py-1 text-sm font-normal text-foreground">
                                                                {product.type === 'digital' ? 'Digital' : 'Físico'}
                                                            </span>
                                                            <input type="hidden" name="type" value={product.type} />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-foreground font-normal text-sm">Tipo do pagamento</Label>
                                                        <div className="flex">
                                                            <span className="inline-flex items-center rounded-full border border-foreground/20 bg-transparent px-3 py-1 text-sm font-normal text-foreground">
                                                                {product.payment_type === 'single' ? 'Pagamento Único' : 'Assinatura'}
                                                            </span>
                                                            <input type="hidden" name="payment_type" value={product.payment_type} />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-foreground font-normal text-sm">Status</Label>
                                                        <div className="flex">
                                                            <span className="inline-flex items-center rounded-full border border-foreground/20 bg-transparent px-3 py-1 text-sm font-normal text-foreground">
                                                                {product.status === 'draft' ? 'Rascunho' :
                                                                    product.status === 'active' ? 'Ativo' :
                                                                        product.status === 'inactive' ? 'Inativo' :
                                                                            product.status === 'disabled' ? 'Desativado' : product.status}
                                                            </span>
                                                            <input type="hidden" name="status" value={product.status} />
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
                                        </div>
                                    </div>
                                </form>
                            ) : currentTab === 'payments' ? (
                                <form onSubmit={handleSubmit} className="border border-border rounded-xl bg-background overflow-hidden main-content-card">
                                    {/* Header Section */}
                                    <div className="flex items-center gap-3 p-6 border-b border-border/50">
                                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                                        <h2 className="text-lg font-normal">Pagamentos</h2>
                                    </div>

                                    <div className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            {/* Left Column: Payment Methods */}
                                            <div className="space-y-6">
                                                <div className="space-y-1">
                                                    <h3 className="text-base font-semibold text-foreground">Métodos de Pagamento</h3>
                                                    <p className="text-sm text-muted-foreground">Selecione quais métodos de pagamento estarão disponíveis no checkout</p>
                                                </div>

                                                <div className="space-y-4 pt-2">
                                                    {/* Multicaixa Express */}
                                                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/40">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src="/multicaixa-express-new.png"
                                                                alt="Multicaixa Express"
                                                                className="h-8 w-8 object-contain"
                                                            />
                                                            <span className="font-medium text-foreground">Multicaixa Express</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            role="switch"
                                                            aria-checked={paymentSettings.express}
                                                            onClick={() => {
                                                                const newState = !paymentSettings.express;
                                                                setPaymentSettings(prev => ({ ...prev, express: newState }));
                                                                // If disabling default method, switch default
                                                                if (!newState && defaultMethod === 'express' && paymentSettings.reference) {
                                                                    setDefaultMethod('reference');
                                                                }
                                                            }}
                                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${paymentSettings.express ? 'bg-[oklch(0.55_0.22_264.53)]' : 'bg-input'}`}
                                                        >
                                                            <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${paymentSettings.express ? 'translate-x-5' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>

                                                    {/* Referência */}
                                                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/40">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="h-5 w-5 text-foreground/70" />
                                                            <span className="font-medium text-foreground">Referência</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            role="switch"
                                                            aria-checked={paymentSettings.reference}
                                                            onClick={() => {
                                                                const newState = !paymentSettings.reference;
                                                                setPaymentSettings(prev => ({ ...prev, reference: newState }));
                                                                // If disabling default method, switch default
                                                                if (!newState && defaultMethod === 'reference' && paymentSettings.express) {
                                                                    setDefaultMethod('express');
                                                                }
                                                            }}
                                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${paymentSettings.reference ? 'bg-[oklch(0.55_0.22_264.53)]' : 'bg-input'}`}
                                                        >
                                                            <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${paymentSettings.reference ? 'translate-x-5' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>


                                        </div>
                                    </div>
                                    {/* Helper inputs for form submission if needed later */}
                                    <input type="hidden" name="payment_express_enabled" value={String(paymentSettings.express)} />
                                    <input type="hidden" name="payment_reference_enabled" value={String(paymentSettings.reference)} />
                                    <input type="hidden" name="payment_default_method" value={defaultMethod} />
                                </form>
                            ) : currentTab === 'offers' ? (
                                <div className="border border-border rounded-xl bg-background overflow-hidden main-content-card animate-in fade-in-50">
                                    {/* Header Section */}
                                    <div className="flex items-center justify-between p-6 border-b border-border/50">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <Tag className="h-5 w-5 text-muted-foreground" />
                                                <h2 className="text-lg font-normal">Ofertas</h2>
                                            </div>
                                            <p className="text-sm text-muted-foreground pl-8">Gerencie as ofertas do produto e configure os checkouts</p>
                                        </div>
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button className="bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold h-9 px-6 rounded-full transition-all hover:scale-[1.02] shadow-sm">
                                                    Criar Oferta
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                                                <form
                                                    action={async (formData) => {
                                                        setIsCreatingOffer(true);
                                                        try {
                                                            await createOffer(formData);
                                                            // Refresh offers locally
                                                            const supabase = createClient();
                                                            const { data: offersData } = await supabase
                                                                .from('offers')
                                                                .select('*')
                                                                .eq('product_id', id)
                                                                .order('created_at', { ascending: false });
                                                            setOffers(offersData || []);

                                                            // Close sheet (hacky but works for now without controlled state)
                                                            document.getElementById('close-offer-sheet')?.click();
                                                        } catch (e) {
                                                            console.error(e);
                                                        } finally {
                                                            setIsCreatingOffer(false);
                                                        }
                                                    }}
                                                    className="flex flex-col h-full"
                                                >
                                                    <input type="hidden" name="product_id" value={id} />
                                                    <SheetHeader>
                                                        <SheetTitle>Criar nova oferta</SheetTitle>
                                                        <SheetDescription>
                                                            Crie uma nova oferta para seu produto digital
                                                        </SheetDescription>
                                                    </SheetHeader>

                                                    <div className="flex-1 overflow-y-auto py-6">
                                                        <div className="grid gap-6">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="offer-name">Nome da Oferta</Label>
                                                                <Input id="offer-name" name="name" placeholder="Ex: Promoção de Verão" className="h-10" required />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="offer-price">Preço</Label>
                                                                <Input
                                                                    id="offer-price"
                                                                    name="price"
                                                                    placeholder="0,00 Kz"
                                                                    className="h-10"
                                                                    required
                                                                    onChange={(e) => {
                                                                        const value = e.target.value.replace(/\D/g, "");
                                                                        if (value) {
                                                                            const floatValue = parseFloat(value) / 100;
                                                                            e.target.value = floatValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                                                        }
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="offer-original-price">Preço Original (sem desconto) - opcional</Label>
                                                                <Input
                                                                    id="offer-original-price"
                                                                    name="original_price"
                                                                    placeholder="0,00 Kz"
                                                                    className="h-10"
                                                                    onChange={(e) => {
                                                                        const value = e.target.value.replace(/\D/g, "");
                                                                        if (value) {
                                                                            const floatValue = parseFloat(value) / 100;
                                                                            e.target.value = floatValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                                                        }
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Domínio</Label>
                                                                <Select name="domain" defaultValue="platform">
                                                                    <SelectTrigger className="h-10">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="platform">Domínio da plataforma (padrão)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="offer-slug">Slug da URL</Label>
                                                                <Input id="offer-slug" name="slug" placeholder="minha-oferta" className="h-10" required />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <SheetFooter className="mt-auto pt-4">
                                                        <div className="flex w-full justify-end gap-2">
                                                            <SheetClose asChild>
                                                                <Button id="close-offer-sheet" variant="outline" type="button" className="h-9 px-6 rounded-full">Cancelar</Button>
                                                            </SheetClose>
                                                            <Button type="submit" disabled={isCreatingOffer} className="bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold h-9 px-6 rounded-full transition-all hover:scale-[1.02] shadow-sm">
                                                                {isCreatingOffer ? <Spinner className="h-4 w-4 mr-2" /> : null}
                                                                Criar Oferta
                                                            </Button>
                                                        </div>
                                                    </SheetFooter>
                                                </form>
                                            </SheetContent>
                                        </Sheet>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6">
                                        <div className="border border-border rounded-lg overflow-hidden">
                                            {/* Table Header */}
                                            <div className="flex items-center w-full px-6 py-3 border-b border-border bg-muted/20">
                                                <div className="flex-[2] text-sm font-medium text-foreground tracking-wider">Nome</div>
                                                <div className="flex-[2] text-sm font-medium text-foreground tracking-wider">Preço (sem desconto)</div>
                                                <div className="flex-1 text-sm font-medium text-foreground tracking-wider">Preço</div>
                                                <div className="flex-1 text-sm font-medium text-foreground tracking-wider">Link</div>
                                                <div className="flex-1 text-sm font-medium text-foreground tracking-wider">Checkout</div>
                                                <div className="flex-[0.5] text-sm font-medium text-foreground tracking-wider text-right">Ações</div>
                                            </div>

                                            {/* Offer List */}
                                            {offers.length > 0 ? (
                                                <div className="divide-y divide-border">
                                                    {offers.map((offer) => (
                                                        <div key={offer.id} className="flex items-center w-full px-6 py-4 hover:bg-muted/5 transition-colors">
                                                            <div className="flex-[2] text-sm font-medium text-foreground">{offer.name}</div>
                                                            <div className="flex-[2] text-sm text-muted-foreground">
                                                                {offer.original_price
                                                                    ? new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(offer.original_price)
                                                                    : '-'
                                                                }
                                                            </div>
                                                            <div className="flex-1 text-sm font-medium text-foreground">
                                                                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(offer.price)}
                                                            </div>
                                                            <div className="flex-1 flex items-center gap-2">
                                                                {/* Mock Link logic for now */}
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                                    <LinkIcon className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="flex-1 flex items-center gap-2">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="flex-[0.5] flex justify-end">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                    disabled={isDeletingOffer === offer.id}
                                                                    onClick={async () => {
                                                                        if (confirm("Tem certeza que deseja excluir esta oferta?")) {
                                                                            setIsDeletingOffer(offer.id);
                                                                            await deleteOffer(offer.id, id);
                                                                            setOffers(prev => prev.filter(o => o.id !== offer.id));
                                                                            setIsDeletingOffer(null);
                                                                        }
                                                                    }}
                                                                >
                                                                    {isDeletingOffer === offer.id ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                                    <p className="text-muted-foreground font-medium">Nenhuma oferta criada ainda</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-border rounded-xl bg-background overflow-hidden main-content-card animate-in fade-in-50">
                                    {(() => {
                                        const tab = tabs.find(t => t.id === currentTab);
                                        const Icon = tab?.icon || Info;
                                        return (
                                            <div className="flex items-center gap-3 p-6 border-b border-border/50">
                                                <Icon className="h-5 w-5 text-muted-foreground" />
                                                <h2 className="text-lg font-normal">{tab?.label}</h2>
                                            </div>
                                        )
                                    })()}
                                    <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground p-8 text-center">
                                        <Info className="h-10 w-10 mb-4 opacity-50" />
                                        <h3 className="text-lg font-medium text-foreground">Funcionalidade em desenvolvimento</h3>
                                        <p className="max-w-md mt-2">A aba <span className="font-semibold text-foreground capitalize">{tabs.find(t => t.id === currentTab)?.label}</span> estará disponível em breve com novas funcionalidades.</p>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </main>
            </div >
        </div >
    )
}
