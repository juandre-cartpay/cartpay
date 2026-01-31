"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface EmailInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onValueChange?: (value: string) => void
}

export function EmailInput({ className, value, onChange, onBlur, id, name, ...props }: EmailInputProps) {
    const [suggestions, setSuggestions] = React.useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = React.useState(false)
    const commonDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'yahoo.com', 'yahoo.com.br', 'uol.com.br']

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value

        // Propagate change
        if (onChange) onChange(e)

        // Suggestion Logic
        if (val.includes('@')) {
            const [username, domainPart] = val.split('@')
            if (username && domainPart !== undefined) {
                const matches = commonDomains.filter(d => d.startsWith(domainPart))
                if (matches.length > 0) {
                    const suggs = matches.map(d => `${username}@${d}`)
                    if (suggs.length === 1 && suggs[0] === val) {
                        setShowSuggestions(false)
                    } else {
                        setSuggestions(suggs)
                        setShowSuggestions(true)
                    }
                    return
                }
            }
        }
        setShowSuggestions(false)
    }

    const selectSuggestion = (sugg: string) => {
        // Create a synthetic event or call onChange directly if possible,
        // We need to pass id and name so generic handlers (like in Register page) work
        const event = {
            target: { value: sugg, id, name },
            currentTarget: { value: sugg, id, name },
            bubbles: true,
            cancelable: true,
            defaultPrevented: false,
            eventPhase: 3,
            isTrusted: true,
            nativeEvent: new Event('change'),
            preventDefault: () => { },
            stopPropagation: () => { },
            persist: () => { },
            type: 'change'
        } as unknown as React.ChangeEvent<HTMLInputElement>

        if (onChange) onChange(event)

        setShowSuggestions(false)
    }

    return (
        <div className="relative w-full">
            <Input
                id={id}
                name={name}
                type="email"
                autoComplete="email"
                className={cn(className)}
                value={value}
                onChange={handleInputChange}
                onBlur={(e) => {
                    if (onBlur) onBlur(e)
                    setTimeout(() => setShowSuggestions(false), 200)
                }}
                {...props}
            />
            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-card border border-border mt-1 rounded-md shadow-lg max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
                    {suggestions.map((sugg) => (
                        <li
                            key={sugg}
                            className="px-4 py-2 text-sm hover:bg-muted cursor-pointer text-foreground"
                            onMouseDown={(e) => {
                                e.preventDefault()
                                selectSuggestion(sugg)
                            }}
                        >
                            {sugg}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
