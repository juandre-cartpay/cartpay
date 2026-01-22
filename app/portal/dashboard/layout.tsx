import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {children}
            </main>
        </div>
    )
}
