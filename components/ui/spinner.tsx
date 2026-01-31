import { cn } from "@/lib/utils";

export const Spinner = ({ className, ...props }: React.ComponentProps<"svg">) => {
    return (
        <svg
            className={cn("animate-spin", className)}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="1" />
            <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
            <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.25" />
            <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.75" />
            <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.25" />
            <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.75" />
            <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
            <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="1" />
        </svg>
    );
};
