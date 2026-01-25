"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreVertical, ChevronLeft, ChevronRight, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { createProduct, deleteProduct } from "./actions"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function ProductsPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = React.useState("my_products")
    const [products, setProducts] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchProducts = async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })

            if (!error && data) {
                setProducts(data)
            }
            setLoading(false)
        }

        fetchProducts()

    }, [])

    const handleDeleteProduct = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm("Tem certeza que deseja excluir este produto?")) return
        try {
            await deleteProduct(id)
            setProducts(prev => prev.filter(p => p.id !== id))
        } catch (error) {
            console.error("Error deleting product:", error)
            alert("Erro ao excluir produto")
        }
    }

    return (
        <div className="flex flex-col h-full w-full font-sans cursor-default bg-background">
            {/* Header / Top Bar for Mobile/Tablet Consistency */}
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
                <div className="flex flex-1 items-center justify-end">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <span className="sr-only">Menu do usuário</span>
                    </Button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-background">
                <div className="mx-auto w-[90%] xl:w-[80%] max-w-7xl py-8 space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Produtos</h1>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button className="bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold transition-all hover:scale-[1.02] shadow-sm">
                                    Criar produto
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                                <form action={createProduct} className="flex flex-col h-full">
                                    <SheetHeader>
                                        <SheetTitle>Criar novo produto</SheetTitle>
                                        <SheetDescription>
                                            Adicione um novo produto ao seu catálogo. Você pode editar mais detalhes após a criação.
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="flex-1 overflow-y-auto py-6">
                                        <div className="grid gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nome do Produto</Label>
                                                <Input name="name" id="name" placeholder="Digite o nome do produto" className="h-10" required />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Tipo de Produto</Label>
                                                <Select name="type" defaultValue="digital">
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="digital">Produto Digital</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Tipo de Pagamento</Label>
                                                <Select name="payment_type" defaultValue="single">
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="single">Pagamento Único</SelectItem>
                                                        <SelectItem value="subscription">Assinatura</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <SheetFooter className="mt-auto border-t pt-4">
                                        <div className="flex w-full justify-end gap-2">
                                            <SheetClose asChild>
                                                <Button variant="outline" type="button">Cancelar</Button>
                                            </SheetClose>
                                            <Button type="submit" className="bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold">
                                                Criar produto
                                            </Button>
                                        </div>
                                    </SheetFooter>
                                </form>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Main Content Card */}
                    <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border flex flex-col min-h-[500px]">

                        {/* Tabs */}
                        <div className="px-6 pt-6 pb-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setActiveTab('my_products')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'my_products'
                                        ? 'bg-[oklch(0.55_0.22_264.53)]/10 text-[oklch(0.55_0.22_264.53)]'
                                        : 'text-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    Meus produtos
                                </button>
                                <button
                                    onClick={() => setActiveTab('coproductions')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'coproductions'
                                        ? 'bg-[oklch(0.55_0.22_264.53)]/10 text-[oklch(0.55_0.22_264.53)]'
                                        : 'text-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    Minhas co-produções
                                </button>
                                <button
                                    onClick={() => setActiveTab('affiliations')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'affiliations'
                                        ? 'bg-[oklch(0.55_0.22_264.53)]/10 text-[oklch(0.55_0.22_264.53)]'
                                        : 'text-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    Minhas afiliações
                                </button>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="relative w-full sm:max-w-xs">
                                <Input
                                    placeholder="Buscar produtos..."
                                    className="pr-10 pl-4 h-10 border-input bg-background rounded-lg focus-visible:ring-1 focus-visible:ring-[oklch(0.55_0.22_264.53)]"
                                />
                                <Search className="absolute right-3 top-2.5 h-5 w-5 text-foreground/50" />
                            </div>

                            <div className="relative w-full sm:w-auto">
                                <select
                                    className="w-full sm:w-[180px] appearance-none h-10 pl-4 pr-10 bg-background border border-input rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[oklch(0.55_0.22_264.53)] transition-colors cursor-pointer text-foreground"
                                    defaultValue="Todos"
                                >
                                    <option>Todos</option>
                                    <option>Ativo</option>
                                    <option>Em análise</option>
                                    <option>Recusado</option>
                                    <option>Rascunho</option>
                                    <option>Banido</option>
                                </select>
                                <div className="absolute right-3 top-0 h-full flex items-center pointer-events-none text-foreground">
                                    <div className="flex flex-col gap-[2px]">
                                        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
                                            <path d="M4 0L7.4641 4.5H0.535898L4 0Z" fill="currentColor" />
                                        </svg>
                                        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4 5L0.535898 0.5L7.4641 0.5L4 5Z" fill="currentColor" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table Structure */}
                        <div className="flex w-full items-center gap-4 px-6 py-3 border-y border-border mt-2 bg-muted/20">
                            <div className="flex-1 text-[13px] font-medium text-foreground tracking-wider">Criado em</div>
                            <div className="flex-1 text-[13px] font-medium text-foreground tracking-wider">Produto</div>
                            <div className="flex-[2] text-[13px] font-medium text-foreground tracking-wider">Tipo</div>
                            <div className="flex-1 text-[13px] font-medium text-foreground tracking-wider">Status</div>
                            <div className="w-[80px] text-[13px] font-medium text-foreground tracking-wider text-right pr-2">Ações</div>
                        </div>

                        {/* Table Body */}
                        <div className="flex-1 flex flex-col min-h-[300px]">
                            {loading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <p className="text-muted-foreground">Carregando...</p>
                                </div>
                            ) : products.length > 0 ? (
                                <div className="w-full">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex w-full items-center gap-4 px-6 py-4 border-b border-border hover:bg-muted/30 transition-colors cursor-default"
                                        >
                                            <div className="flex-1 text-sm font-normal text-foreground">
                                                {format(new Date(product.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                            </div>
                                            <div className="flex-1 text-sm font-normal text-foreground">
                                                {product.name}
                                            </div>
                                            <div className="flex-[2] text-sm font-normal text-foreground">
                                                {product.type === 'digital' ? 'Produto Digital' : product.type}
                                                <span className="ml-1">
                                                    ({product.payment_type === 'single' ? 'Pagamento único' : 'Assinatura'})
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <span className="inline-flex items-center rounded-full bg-yellow-400/10 px-2.5 py-0.5 text-xs font-medium text-yellow-500">
                                                    {product.status === 'draft' ? 'Rascunho' : product.status}
                                                </span>
                                            </div>
                                            <div className="w-[80px] text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={(e) => e.stopPropagation()} // Prevent row click
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation()
                                                            router.push(`/products/${product.id}`)
                                                        }}>
                                                            Editar produto
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => handleDeleteProduct(product.id, e)}
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                        >
                                                            Excluir produto
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                                    <p className="text-foreground font-medium">Nenhum produto encontrado.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
