"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Crown, Loader2, ArrowRight } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [setupUrl, setSetupUrl] = useState<string | null>(null)
  const [isExistingUser, setIsExistingUser] = useState(false)

  // O email pode vir da URL do checkout ou ser recuperado do localStorage
  const emailFromUrl = searchParams.get("email")

  useEffect(() => {
    const checkUserStatus = async () => {
      // Aguardar processamento do webhook da Cakto (3 segundos)
      await new Promise(resolve => setTimeout(resolve, 3000))

      const email = emailFromUrl || localStorage.getItem("checkout_email")

      if (!email) {
        setLoading(false)
        return
      }

      try {
        const supabase = getSupabaseClient()

        // Verificar se o usuário já tem auth (usuário existente)
        const { data: authData } = await supabase.auth.getUser()

        if (authData?.user) {
          // Usuário já logado - é um upgrade
          setIsExistingUser(true)
          setLoading(false)
          return
        }

        // Buscar dados do usuário para ver se precisa criar senha
        const { data: userData } = await supabase
          .from("users")
          .select("setup_token, email")
          .eq("email", email)
          .single()

        if (userData?.setup_token) {
          // Novo usuário - precisa criar senha
          const url = `/setup-password?token=${userData.setup_token}&email=${encodeURIComponent(email)}`
          setSetupUrl(url)
        } else if (userData) {
          // Usuário existe mas sem token - pode já ter configurado senha
          setIsExistingUser(true)
        }
      } catch (error) {
        console.error("Erro ao verificar status:", error)
      }

      setLoading(false)
    }

    checkUserStatus()
  }, [emailFromUrl])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600">Processando seu pagamento...</p>
            <p className="text-sm text-gray-500 mt-2">Aguarde enquanto confirmamos sua assinatura.</p>
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
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            {setupUrl ? "Pagamento Confirmado!" : "Bem-vindo ao Premium!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {setupUrl
              ? "Seu pagamento foi aprovado! Agora configure sua senha para acessar."
              : "Sua assinatura foi ativada com sucesso! Agora você tem acesso a todos os recursos premium."
            }
          </p>

          <ul className="text-sm text-left space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Cálculos ilimitados
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Histórico completo
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Exportação de dados
            </li>
          </ul>

          {setupUrl ? (
            <Button
              onClick={() => router.push(setupUrl)}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Criar Senha e Acessar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/")}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isExistingUser ? "Voltar à Calculadora" : "Começar a usar"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
