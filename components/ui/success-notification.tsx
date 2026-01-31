
"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SuccessNotificationProps {
    message: string
    onClose: () => void
    isVisible: boolean
}

export function SuccessNotification({ message, onClose, isVisible }: SuccessNotificationProps) {
    const [show, setShow] = React.useState(isVisible)

    React.useEffect(() => {
        setShow(isVisible)
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose()
            }, 4000)
            return () => clearTimeout(timer)
        }
    }, [isVisible, onClose])

    if (!show) return null

    return (
        <div className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-3 overflow-hidden rounded-lg border border-emerald-500/30 bg-black/40 p-3 pr-10 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-in-out",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        )}>
            {/* Glow Effect - Smaller & Subtler */}
            <div className="absolute -right-4 -top-8 h-20 w-20 rounded-full bg-emerald-500/20 blur-2xl" />

            {/* Icon - Smaller */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Check className="h-3.5 w-3.5 stroke-[3px]" />
            </div>

            {/* Content - Compact text */}
            <div className="flex flex-col relative z-10">
                <span className="font-medium text-white text-sm tracking-wide">
                    {message}
                </span>
            </div>

            {/* Close Button - Adjusted */}
            <button
                onClick={onClose}
                className="absolute right-2 top-2 rounded-full p-0.5 text-zinc-400 hover:text-white transition-colors"
                type="button"
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    )
}
