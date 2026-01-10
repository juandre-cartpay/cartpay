import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
    title: string
    value: string
    subValue?: string
    icon: LucideIcon
    type: "$" | "N" | "%"
}

export function MetricCard({ title, value, subValue, icon: Icon, type }: MetricCardProps) {
    return (
        <Card className="border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-2 bg-muted rounded-full">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">{title}</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight">
                            {value}
                        </span>
                        {subValue && (
                            <p className="text-xs text-muted-foreground">
                                {subValue}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
