"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Shield, Smartphone, Globe, AlertTriangle, Eye, Copy, Check, Terminal, Ghost, Lock, RefreshCcw } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function ClowizaPage() {
    const supabase = createClient()
    const [loading, setLoading] = React.useState(false)
    const [copied, setCopied] = React.useState(false)
    const [safePage, setSafePage] = React.useState("")
    const [offerPage, setOfferPage] = React.useState("")

    // State for the active link and stats
    const [activeLink, setActiveLink] = React.useState<any>(null)
    const [stats, setStats] = React.useState({
        allow: 0,
        block_geo: 0,
        block_device: 0
    })
    const [recentLogs, setRecentLogs] = React.useState<any[]>([])

    // Fetch existing link and stats on load
    React.useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Get the user's Clowiza Link (assuming 1 per user for MVP)
            const { data: links } = await supabase
                .from('clowiza_links')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)

            if (links && links.length > 0) {
                const link = links[0]
                setActiveLink(link)
                setSafePage(link.safe_page)
                setOfferPage(link.offer_page)

                // 2. Get Stats for this link
                fetchStats(link.id)
            }
        }
        fetchData()

        // Realtime Subscription
        const channel = supabase
            .channel('clowiza_updates')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'clowiza_logs' },
                (payload) => {
                    // Update stats in real-time if the log belongs to our link
                    const newLog = payload.new as any
                    if (activeLink && newLog.link_id === activeLink.id) {
                        setStats(prev => ({
                            ...prev,
                            [newLog.action_type]: (prev[newLog.action_type as keyof typeof prev] || 0) + 1
                        }))
                        // Optimistic update for log table
                        const logWithDefaults = { ...newLog, created_at: newLog.created_at || new Date().toISOString() }
                        setRecentLogs(prev => [logWithDefaults, ...prev].slice(0, 10))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [activeLink?.id])

    const fetchStats = async (linkId: string) => {
        // Count Allowed
        const { count: allowCount } = await supabase
            .from('clowiza_logs')
            .select('*', { count: 'exact', head: true })
            .eq('link_id', linkId)
            .eq('action_type', 'allow')

        // Count Bots (Geo)
        const { count: geoCount } = await supabase
            .from('clowiza_logs')
            .select('*', { count: 'exact', head: true })
            .eq('link_id', linkId)
            .eq('action_type', 'block_geo')

        // Count Spies (Device)
        const { count: deviceCount } = await supabase
            .from('clowiza_logs')
            .select('*', { count: 'exact', head: true })
            .eq('link_id', linkId)
            .eq('action_type', 'block_device')

        setStats({
            allow: allowCount || 0,
            block_geo: geoCount || 0,
            block_device: deviceCount || 0
        })

        // Get Recent Logs
        const { data: logs } = await supabase
            .from('clowiza_logs')
            .select('*')
            .eq('link_id', linkId)
            .order('created_at', { ascending: false })
            .limit(10)

        if (logs) setRecentLogs(logs)
    }

    const handleCreateLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Create or Update Link
            const linkData = {
                user_id: user.id,
                safe_page: safePage,
                offer_page: offerPage,
                is_active: true
            }

            let result
            if (activeLink) {
                result = await supabase
                    .from('clowiza_links')
                    .update(linkData)
                    .eq('id', activeLink.id)
                    .select()
                    .single()
            } else {
                result = await supabase
                    .from('clowiza_links')
                    .insert(linkData)
                    .select()
                    .single()
            }

            if (result.data) {
                setActiveLink(result.data)
                // Just use window.alert for simplicity, usually we'd use a toast
                console.log("Proteção Clowiza configurada com sucesso!")
            } else if (result.error) {
                console.error(result.error)
                alert("Erro ao salvar: " + result.error.message)
            }

        } catch (error) {
            console.error("Error creating clowiza link", error)
            alert("Erro ao salvar configuração.")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (!activeLink) return

        // Construct script URL dynamically pointing to Supabase Edge Function
        // NEXT_PUBLIC_SUPABASE_URL should be your Supabase Project URL (e.g. https://xyz.supabase.co)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://SEU_PROJETO.supabase.co"
        const scriptUrl = `${supabaseUrl}/functions/v1/clowiza-guard?id=${activeLink.id}`
        const scriptCode = `<script src="${scriptUrl}" async></script>`

        navigator.clipboard.writeText(scriptCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleRefreshStats = () => {
        if (activeLink) fetchStats(activeLink.id)
    }

    return (
        <div className="flex flex-col h-full w-full font-sans cursor-default bg-background p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto w-full space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[oklch(0.55_0.22_264.53)]/10 rounded-lg">
                            <Ghost className="h-8 w-8 text-[oklch(0.55_0.22_264.53)]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Clowiza</h1>
                            <p className="text-muted-foreground">O Guardião Automático KwizaPay - Proteção One-Click</p>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Configuration Panel - Left Column */}
                    <Card className="lg:col-span-1 h-fit border-[oklch(0.55_0.22_264.53)]/20 shadow-lg shadow-[oklch(0.55_0.22_264.53)]/5">
                        <form onSubmit={handleCreateLink}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-[oklch(0.55_0.22_264.53)]" />
                                    Configurar Proteção
                                </CardTitle>
                                <CardDescription>
                                    Crie um link seguro que filtra tráfego indesejado automaticamente.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="offer-page">Página da Oferta (Money Page)</Label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="offer-page"
                                            placeholder="https://seu-site.com/oferta-black"
                                            className="pl-9"
                                            value={offerPage}
                                            onChange={(e) => setOfferPage(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Visível apenas para: <span className="text-[oklch(0.55_0.22_264.53)] font-medium">Angola + Mobile</span>
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="safe-page">Página Segura (Safe Page)</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="safe-page"
                                            placeholder="https://g1.globo.com/artigo-neutro"
                                            className="pl-9"
                                            value={safePage}
                                            onChange={(e) => setSafePage(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Destino para: <span className="text-red-400 font-medium">Bots, Desktop e Outros Países</span>
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    type="submit"
                                    className="w-full bg-[oklch(0.55_0.22_264.53)] hover:bg-[oklch(0.55_0.22_264.53)]/90 text-white font-bold"
                                    disabled={loading}
                                >
                                    {loading ? <Spinner className="mr-2 h-4 w-4" /> : (activeLink ? "Atualizar Proteção" : "Criar Link Clowiza")}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Dashboard & Script - Right Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Security Generated Script */}
                        {activeLink ? (
                            <Card className="bg-slate-950 border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-slate-100 flex items-center gap-2 text-lg">
                                        <Terminal className="h-5 w-5 text-green-400" />
                                        Instalação do Agente
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Cole este código no topo do &lt;head&gt; da sua Página da Oferta.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-slate-900 rounded-md p-4 relative group">
                                        <code className="text-sm font-mono text-green-300 break-all">
                                            &lt;script src="{process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://SEU_PROJETO.supabase.co'}/functions/v1/clowiza-guard?id={activeLink.id}" async&gt;&lt;/script&gt;
                                        </code>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="absolute top-2 right-2 text-slate-400 hover:text-white hover:bg-slate-800"
                                            onClick={copyToClipboard}
                                        >
                                            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <div className="mt-4 flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                                        <Lock className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-blue-100">Segurança Ativa</p>
                                            <p className="text-xs text-blue-300">
                                                Este script verifica cada acesso via Edge Computing. Se o visitante não for de Angola ou estiver no  PC, ele será bloqueado instantaneamente.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-muted/30 border-dashed border-2">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <Shield className="h-12 w-12 text-muted-foreground/20 mb-4" />
                                    <h3 className="text-lg font-medium text-foreground">Aguardando Configuração</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Configure o link ao lado para gerar seu script de proteção e começar a filtrar o tráfego.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Real-time Stats */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Monitoramento em Tempo Real</h3>
                            <Button variant="outline" size="sm" onClick={handleRefreshStats}>
                                <RefreshCcw className="h-3 w-3 mr-2" />
                                Atualizar
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-card border-border">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Acessos Permitidos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{stats.allow}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Mobile • Angola</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Globe className="h-4 w-4" /> Bots Bloqueados
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-500">{stats.block_geo}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Filtro Geográfico</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Eye className="h-4 w-4" /> Espiões Bloqueados
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-orange-500">{stats.block_device}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Filtro de Dispositivo</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Logs Table (Real Data) */}
                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Registro de Bloqueios Recentes
                    </h2>
                    <div className="rounded-md border bg-card overflow-hidden">
                        {recentLogs.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hora</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ação</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Motivo</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">País</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLogs.map((log) => (
                                        <tr key={log.id} className="border-b last:border-0 hover:bg-muted/20">
                                            <td className="px-4 py-3 text-foreground">
                                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                                            </td>
                                            <td className="px-4 py-3">
                                                {log.action_type === 'allow' ? (
                                                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500 ring-1 ring-inset ring-green-500/20">Permitido</span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500 ring-1 ring-inset ring-red-500/20">Bloqueado</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {log.action_type === 'allow' ? 'Tráfego Limpo' :
                                                    log.action_type === 'block_geo' ? 'Geolocalização (Fora de AO)' : 'Dispositivo Desktop'}
                                            </td>
                                            <td className="px-4 py-3 text-foreground font-mono text-xs">{log.country || 'N/A'}</td>
                                            <td className="px-4 py-3 text-right text-muted-foreground font-mono text-xs">{log.ip_address ? '***' + log.ip_address.slice(-3) : '***'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                Nenhum registro encontrado. Assim que você instalar o script, os acessos aparecerão aqui.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
