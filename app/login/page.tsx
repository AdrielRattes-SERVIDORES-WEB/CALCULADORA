"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calculator, Crown, ArrowLeft } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            console.log("Tentando login com:", email)
            const supabase = getSupabaseClient()

            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            console.log("Resultado do login:", { data, error: signInError })

            if (signInError) {
                console.error("Erro de login:", signInError)
                if (signInError.message.includes("Invalid login")) {
                    setError("Email ou senha incorretos")
                } else if (signInError.message.includes("Email not confirmed")) {
                    setError("Email não confirmado. Verifique sua caixa de entrada.")
                } else {
                    setError(signInError.message)
                }
                return
            }

            console.log("Login bem sucedido! Redirecionando...")
            // Login bem sucedido - redirecionar para a calculadora
            router.push("/")
        } catch (err: any) {
            console.error("Erro catch:", err)
            setError(err.message || "Erro ao fazer login")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #044A05 0%, #033303 100%)' }}>
            {/* Header */}
            <header className="py-6 px-4">
                <div className="container mx-auto">
                    <Link href="/landing" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors w-fit">
                        <ArrowLeft className="h-5 w-5" />
                        <span>Voltar</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-0 shadow-2xl">
                    <CardContent className="p-8">
                        {/* Logo */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="w-16 h-16 bg-[#044A05] rounded-2xl flex items-center justify-center">
                                    <Calculator className="h-8 w-8 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <Crown className="h-4 w-4 text-yellow-800" />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                            Bem-vindo de volta!
                        </h1>
                        <p className="text-gray-500 text-center mb-8">
                            Acesse sua conta premium
                        </p>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 border-gray-200 focus:border-[#42B395] focus:ring-[#42B395]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 border-gray-200 focus:border-[#42B395] focus:ring-[#42B395]"
                                />
                            </div>

                            {error && (
                                <Alert variant="destructive" className="bg-red-50 border-red-200">
                                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#42B395] hover:bg-[#3a9f84] text-white text-lg rounded-full"
                            >
                                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                Entrar
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-gray-500 text-sm mb-4">
                                Ainda não é assinante?
                            </p>
                            <Link
                                href="/landing#oferta"
                                className="inline-flex items-center justify-center w-full h-12 px-6 border-2 border-[#42B395] text-[#044A05] font-semibold rounded-full hover:bg-[#42B395]/10 transition-colors"
                            >
                                Quero minha Calculadora!
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <footer className="py-6 px-4 text-center">
                <p className="text-white/50 text-sm">
                    © 2025 Lucre 360 - Todos os direitos reservados
                </p>
            </footer>
        </div>
    )
}
