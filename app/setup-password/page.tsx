"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock, CheckCircle, Crown } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

// Componente interno que usa useSearchParams
function SetupPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [validating, setValidating] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [userEmail, setUserEmail] = useState("")

    const token = searchParams.get("token")
    const email = searchParams.get("email")

    useEffect(() => {
        const validateToken = async () => {
            if (!token || !email) {
                setError("Link inválido. Solicite um novo acesso.")
                setValidating(false)
                return
            }

            try {
                const supabase = getSupabaseClient()

                // Verificar se o token é válido
                const { data: userData, error: userError } = await supabase
                    .from("users")
                    .select("email, setup_token, setup_token_expires")
                    .eq("email", email)
                    .eq("setup_token", token)
                    .single()

                if (userError || !userData) {
                    setError("Link expirado ou inválido. Entre em contato com o suporte.")
                    setValidating(false)
                    return
                }

                // Verificar se o token expirou (24 horas)
                if (userData.setup_token_expires) {
                    const expiresAt = new Date(userData.setup_token_expires)
                    if (expiresAt < new Date()) {
                        setError("Este link expirou. Entre em contato com o suporte.")
                        setValidating(false)
                        return
                    }
                }

                setUserEmail(userData.email)
                setValidating(false)
            } catch (err) {
                console.error("Erro ao validar token:", err)
                setError("Erro ao validar acesso. Tente novamente.")
                setValidating(false)
            }
        }

        validateToken()
    }, [token, email])

    const handleSetupPassword = async () => {
        if (password !== confirmPassword) {
            setError("As senhas não coincidem")
            return
        }

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres")
            return
        }

        setLoading(true)
        setError("")

        try {
            const response = await fetch("/api/setup-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail, password, token })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Erro ao configurar senha")
            }

            setSuccess(true)

            // Auto login após criar senha
            const supabase = getSupabaseClient()
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: userEmail,
                password
            })

            if (signInError) {
                console.error("Erro no auto-login:", signInError)
            }

            // Redirecionar para a calculadora após 2 segundos
            setTimeout(() => {
                router.push("/")
            }, 2000)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (validating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center p-8">
                        <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
                        <p className="text-gray-600">Validando seu acesso...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error && !userEmail) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center p-8">
                        <div className="text-red-500 mb-4">
                            <Lock className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-gray-800 font-semibold mb-2">Acesso Inválido</p>
                        <p className="text-gray-600">{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center p-8">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Senha Criada!</h2>
                        <p className="text-gray-600 mb-4">
                            Sua conta está pronta. Redirecionando para a calculadora...
                        </p>
                        <Loader2 className="h-6 w-6 animate-spin text-orange-600 mx-auto" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        <Crown className="h-12 w-12 text-yellow-500" />
                    </div>
                    <CardTitle>Crie sua Senha</CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                        Olá! Configure sua senha para acessar a calculadora.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Email: <strong>{userEmail}</strong>
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Nova Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Senha</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        onClick={handleSetupPassword}
                        disabled={loading || !password || !confirmPassword}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Criar Senha e Acessar
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

// Componente de Loading para Suspense
function LoadingFallback() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardContent className="text-center p-8">
                    <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
                    <p className="text-gray-600">Carregando...</p>
                </CardContent>
            </Card>
        </div>
    )
}

// Export default com Suspense boundary
export default function SetupPasswordPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SetupPasswordContent />
        </Suspense>
    )
}
