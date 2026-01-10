"use client"

import * as React from "react"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DateFilterProps {
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
}

export function DateFilter({ date, setDate }: DateFilterProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedPreset, setSelectedPreset] = React.useState<string>("Hoje")

    const handlePreset = (preset: string) => {
        const today = new Date()
        setSelectedPreset(preset)

        switch (preset) {
            case "Hoje":
                setDate({ from: startOfDay(today), to: endOfDay(today) })
                setOpen(false)
                break
            case "Ontem":
                const yesterday = subDays(today, 1)
                setDate({ from: startOfDay(yesterday), to: endOfDay(yesterday) })
                setOpen(false)
                break
            case "Últimos 7 dias":
                setDate({ from: subDays(today, 6), to: endOfDay(today) })
                setOpen(false)
                break
            case "Últimos 30 dias":
                setDate({ from: subDays(today, 29), to: endOfDay(today) })
                setOpen(false)
                break
            case "Tempo todo":
                setDate({ from: new Date(2024, 0, 1), to: endOfDay(today) })
                setOpen(false)
                break
            default:
                break
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-[230px] justify-between text-left font-normal", !date && "text-muted-foreground")}>
                    {date?.from ? (
                        date.to ? (
                            <>
                                {format(date.from, "dd 'de' MMM", { locale: ptBR })} - {format(date.to, "dd 'de' MMM", { locale: ptBR })}
                            </>
                        ) : (
                            format(date.from, "dd 'de' MMM", { locale: ptBR })
                        )
                    ) : (
                        <span>Selecione uma data</span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <div className="flex flex-col bg-background border rounded-md shadow-md">
                    <div className="flex flex-col p-2 border-b border-border">
                        {["Hoje", "Últimos 7 dias", "Últimos 30 dias", "Tempo todo"].map((preset) => (
                            <Button
                                key={preset}
                                variant="ghost"
                                className={cn("justify-start font-normal text-sm h-8 px-2 w-full", selectedPreset === preset && "bg-accent text-accent-foreground font-medium")}
                                onClick={() => handlePreset(preset)}
                            >
                                {preset}
                            </Button>
                        ))}
                    </div>
                    <div className="p-2">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={(selected) => {
                                setDate(selected)
                                setSelectedPreset("Customizado")
                            }}
                            numberOfMonths={1}
                            locale={ptBR}
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
