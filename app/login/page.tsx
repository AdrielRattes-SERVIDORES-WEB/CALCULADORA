"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calculator, Crown } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

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
            const supabase = getSupabaseClient()
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (signInError) {
                if (signInError.message.includes("Invalid login")) {
                    setError("Email ou senha incorretos")
                } else {
                    setError(signInError.message)
                }
                return
            }

            // Login bem sucedido - redirecionar para a calculadora
            router.push("/")
        } catch (err: any) {
            setError(err.message || "Erro ao fazer login")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <Calculator className="h-12 w-12 text-orange-600" />
                            <Crown className="h-5 w-5 text-yellow-500 absolute -top-1 -right-1" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Entrar na Calculadora</CardTitle>
                    <CardDescription>
                        Acesse sua conta premium
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Entrar
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>
                            Não é assinante?{" "}
                            <a
                                href={process.env.NEXT_PUBLIC_CAKTO_URL || "https://pay.cakto.com.br/DAR7YWr"}
                                className="text-orange-600 underline"
                            >
                                Assine agora
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
