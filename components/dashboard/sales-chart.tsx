"use client"

import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"

interface SalesChartProps {
    data: any[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-border/50 rounded-lg shadow-lg">
                <p className="text-sm font-medium mb-1">{label}</p>
                <p className="text-lg font-bold text-[oklch(0.55_0.22_264.53)]">
                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(payload[0].value)}
                </p>
                <p className="text-xs text-muted-foreground">
                    Vendas: {payload[0].payload.count || 0}
                </p>
            </div>
        )
    }
    return null
}

export function SalesChart({ data }: SalesChartProps) {
    // Calculando totais para exibir nos cantos se necessário, ou apenas renderizar
    const formattedData = useMemo(() => {
        if (!data || data.length === 0) return []
        return data.map(item => ({
            ...item,
            date: item.date, // Formato esperado "HH:mm" ou "DD/MM"
            value: Number(item.value),
            count: Number(item.count)
        }))
    }, [data])

    return (
        <Card className="border-border/50 bg-card shadow-sm h-[270px]">
            <CardContent className="p-6 h-full flex flex-col">
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="oklch(0.55 0.22 264.53)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="oklch(0.55 0.22 264.53)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                dy={10}
                                ticks={[formattedData[0]?.date, formattedData[formattedData.length - 1]?.date]}
                                interval={0}
                                padding={{ left: 30, right: 30 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="oklch(0.55 0.22 264.53)"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
