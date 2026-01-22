"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, DollarSign, TrendingUp, CreditCard, Globe, Percent, Undo, RefreshCcw, Barcode, ChevronDown, User, Wallet, ShoppingCart, Undo2, Layers, ArrowUpRight } from "lucide-react"
import { DateRange } from "react-day-picker"
import { startOfDay, endOfDay, differenceInDays, addDays, format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"

import { MetricCard } from "@/components/dashboard/metric-card"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { DateFilter } from "@/components/dashboard/date-range-filter"
import { ProductFilter } from "@/components/dashboard/product-filter"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"

// Mock Data structure
interface DashboardData {
    netValue: number
    salesCount: number
    avgTicket: number
    oneClickSales: number
    checkoutConversion: number
    expressConversion: number
    referenceConversion: number
    orderBumpSales: number
    upsellSales: number
    recoveredSales: number
    refunds: number
    chartData: any[]
}

const mockData: DashboardData = {
    netValue: 0,
    salesCount: 0,
    avgTicket: 0,
    oneClickSales: 0,
    checkoutConversion: 0,
    expressConversion: 0,
    referenceConversion: 0,
    orderBumpSales: 0,
    upsellSales: 0,
    recoveredSales: 0,
    refunds: 0,
    chartData: []
}

export default function DashboardPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = React.useState(true)
    const [userEmail, setUserEmail] = React.useState<string | null>(null)

    // Filters
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: startOfDay(new Date()),
        to: endOfDay(new Date())
    })
    const [selectedProductId, setSelectedProductId] = React.useState<string | null>("all")
    const [products, setProducts] = React.useState<any[]>([])

    // Data
    const [data, setData] = React.useState<DashboardData>(mockData)

    // Initial Load
    React.useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/')
                return
            }
            setUserEmail(user.email || null)

            // Fetch Products
            const { data: productsData } = await supabase.from('products').select('id, name')
            if (productsData) {
                setProducts(productsData)
            }

            setLoading(false)
        }
        init()
    }, [router, supabase])

    // Fetch Dashboard Data (Mock implementation for now, replaced with real query logic later)
    React.useEffect(() => {
        if (!dateRange?.from) return;

        const today = new Date();
        const from = dateRange.from;
        const to = dateRange.to || dateRange.from;
        const daysDiff = differenceInDays(to, from);

        let chartData = [];

        if (daysDiff === 0) {
            // Case: Single Day (Hourly View) - Today or Past Date
            const isToday = isSameDay(from, today);
            const currentHour = new Date().getHours();

            // Label base: "Hoje" or "1 jan"
            let dateLabel = format(from, "d MMM", { locale: ptBR });
            if (isToday) dateLabel = "Hoje";

            for (let i = 0; i <= 23; i++) {
                const label = `${dateLabel}, ${i}:00`;

                // If Today, nullify future hours. If Past, show all.
                const isFuture = isToday && i > currentHour;

                chartData.push({
                    date: label,
                    value: isFuture ? null : 0,
                    count: isFuture ? null : 0
                });
            }
            // Add 23:59 endpoint
            chartData.push({
                date: `${dateLabel}, 23:59`,
                value: isToday ? null : 0,
                count: isToday ? null : 0
            });
        } else {
            // Case: Range (Daily)
            for (let i = 0; i <= daysDiff; i++) {
                const currentDay = addDays(from, i);
                let label = format(currentDay, "d MMM", { locale: ptBR });

                // If it's today, show "Hoje"
                if (isSameDay(currentDay, today)) {
                    label = "Hoje";
                } else {
                    // Capitalize month (jan -> Jan)
                    label = label.charAt(0).toUpperCase() + label.slice(1);
                }

                chartData.push({ date: label, value: 0, count: 0 });
            }
        }

        setData({
            netValue: 0, // 10489.89 example from user, keeping 0 for now as per "0,00" in image default
            salesCount: 0,
            avgTicket: 0,
            oneClickSales: 0,
            checkoutConversion: 0,
            expressConversion: 0,
            referenceConversion: 0,
            orderBumpSales: 0,
            upsellSales: 0,
            recoveredSales: 0,
            refunds: 0,
            chartData: chartData
        })

    }, [dateRange, selectedProductId])

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(val)
    const formatNumber = (val: number) => val.toString()
    const formatPercent = (val: number) => `${val}%`

    return (
        <div className="flex flex-col h-full w-full font-sans cursor-default bg-background">
            {/* Header / Top Bar */}
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
                    {/* Page Title & Actions */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                        <div className="flex items-center gap-2">
                            <DateFilter date={dateRange} setDate={setDateRange} />
                            <ProductFilter
                                products={products}
                                selectedProductId={selectedProductId}
                                onSelectProduct={setSelectedProductId}
                            />
                        </div>
                    </div>

                    {/* Top Section: Chart + 2 Main Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Chart takes 2 columns */}
                        <div className="md:col-span-2">
                            <SalesChart data={data.chartData} />
                        </div>

                        {/* Main Cards Stack */}
                        <div className="space-y-6 flex flex-col">
                            <div className="flex-1">
                                <MetricCard
                                    title="Valor líquido"
                                    value={formatCurrency(data.netValue)}
                                    icon={Wallet}
                                    type="$"
                                />
                            </div>
                            <div className="flex-1">
                                <MetricCard
                                    title="Vendas"
                                    value={formatNumber(data.salesCount)}
                                    icon={ShoppingCart}
                                    type="N"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Remaining Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <MetricCard title="Ticket médio" value={formatCurrency(data.avgTicket)} icon={DollarSign} type="$" />
                        <MetricCard title="Vendas 1-click da rede KwizaPay" value={formatCurrency(data.oneClickSales)} subValue="0%" icon={Globe} type="$" />
                        <MetricCard title="Conversão checkout" value={formatPercent(data.checkoutConversion)} icon={Percent} type="%" />

                        <MetricCard title="Conversão express" value={formatPercent(data.expressConversion)} icon={CreditCard} type="%" />
                        <MetricCard title="Conversão referência" value={formatPercent(data.referenceConversion)} icon={Barcode} type="%" />
                        <MetricCard title="Vendas order bump" value={formatCurrency(data.orderBumpSales)} subValue="0%" icon={Layers} type="$" />

                        <MetricCard title="Vendas upsell" value={formatCurrency(data.upsellSales)} subValue="0%" icon={ArrowUpRight} type="$" />
                        <MetricCard title="Vendas recuperadas" value={formatCurrency(data.recoveredSales)} subValue="0%" icon={RefreshCcw} type="$" />
                        <MetricCard title="Reembolso" value={formatCurrency(data.refunds)} subValue="0%" icon={Undo2} type="$" />
                    </div>
                </div>
            </main>
        </div>
    )
}
