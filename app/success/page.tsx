"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, Calculator, Crown } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import Link from "next/link"

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'setup-needed' | 'logged-in' | 'error'>('loading')
  const [message, setMessage] = useState("")
  const [setupUrl, setSetupUrl] = useState("")

  const email = searchParams.get("email")
  const token = searchParams.get("token")

  useEffect(() => {
    const processSuccess = async () => {
      // Se tem token e email, fazer auto-login
      if (token && email) {
        try {
          const supabase = getSupabaseClient()

          // Tentar auto-login
          const response = await fetch('/api/auth/auto-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, token }),
          })

          if (response.ok) {
            const data = await response.json()

            // Estabelecer sessão no cliente
            if (data.session) {
              await supabase.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
              })

              setStatus('logged-in')
              setMessage("Pagamento confirmado! Redirecionando para a calculadora...")

              // Redirecionar para calculadora após 2 segundos
              setTimeout(() => router.push("/"), 2000)
              return
            }
          } else {
            // Se auto-login falhar, redirecionar para setup de senha
            setSetupUrl(`/setup-password?token=${token}&email=${encodeURIComponent(email)}`)
            setStatus('setup-needed')
            setMessage("Pagamento confirmado! Agora crie sua senha para acessar.")
            return
          }
        } catch (error) {
          console.error("Erro no auto-login:", error)
          setSetupUrl(`/setup-password?token=${token}&email=${encodeURIComponent(email)}`)
          setStatus('setup-needed')
          setMessage("Pagamento confirmado! Agora crie sua senha para acessar.")
          return
        }
      }

      // Se só tem email, verificar se usuário já existe e pode fazer login
      if (email) {
        try {
          const supabase = getSupabaseClient()

          // Verificar se usuário já está logado
          const { data: authData } = await supabase.auth.getUser()

          if (authData?.user) {
            setStatus('logged-in')
            setMessage("Pagamento confirmado! Você já está logado.")
            // Redirecionar para calculadora após 2 segundos
            setTimeout(() => router.push("/"), 2000)
            return
          }

          // Verificar se usuário precisa criar senha
          const { data: userData } = await supabase
            .from("users")
            .select("setup_token, setup_token_expires")
            .eq("email", email)
            .single()

          if (userData?.setup_token) {
            // Tentar auto-login com o token
            const response = await fetch('/api/auth/auto-login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, token: userData.setup_token }),
            })

            if (response.ok) {
              const data = await response.json()

              if (data.session) {
                await supabase.auth.setSession({
                  access_token: data.session.access_token,
                  refresh_token: data.session.refresh_token,
                })

                setStatus('logged-in')
                setMessage("Pagamento confirmado! Redirecionando para a calculadora...")
                setTimeout(() => router.push("/"), 2000)
                return
              }
            }

            // Se auto-login falhar, oferecer setup de senha
            setSetupUrl(`/setup-password?token=${userData.setup_token}&email=${encodeURIComponent(email)}`)
            setStatus('setup-needed')
            setMessage("Pagamento confirmado! Crie sua senha para acessar.")
            return
          }

          // Usuário já tem conta, redirecionar para login
          setStatus('setup-needed')
          setSetupUrl("/login")
          setMessage("Pagamento confirmado! Faça login para acessar.")

        } catch (error) {
          console.error("Erro ao processar sucesso:", error)
          setStatus('setup-needed')
          setSetupUrl("/login")
          setMessage("Pagamento confirmado! Faça login para acessar sua conta.")
        }
      } else {
        // Sem email, mostrar mensagem genérica
        setStatus('setup-needed')
        setSetupUrl("/login")
        setMessage("Pagamento confirmado! Verifique seu email para os dados de acesso.")
      }
    }

    processSuccess()
  }, [email, token, router])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #044A05 0%, #033303 100%)' }}>
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="h-16 w-16 text-[#42B395] mx-auto mb-6 animate-spin" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Processando...
                </h1>
                <p className="text-gray-600">
                  Aguarde enquanto confirmamos seu pagamento.
                </p>
              </>
            )}

            {status === 'logged-in' && (
              <>
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-[#42B395] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  🎉 Pagamento Confirmado!
                </h1>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <p className="text-gray-500 text-sm">
                  Redirecionando para a calculadora...
                </p>
              </>
            )}

            {status === 'setup-needed' && (
              <>
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-[#42B395] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Crown className="h-5 w-5 text-yellow-800" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  🎉 Pagamento Confirmado!
                </h1>

                <p className="text-gray-600 mb-6">
                  {message}
                </p>

                <Button
                  size="lg"
                  onClick={() => router.push(setupUrl)}
                  className="w-full bg-[#42B395] hover:bg-[#3a9f84] text-white text-lg py-6 rounded-full"
                >
                  {setupUrl.includes('setup-password') ? 'Criar minha senha' : 'Acessar minha conta'}
                </Button>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-gray-500 text-sm">
                    Seu acesso é <strong className="text-[#044A05]">vitalício</strong>!
                  </p>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calculator className="h-10 w-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Ops! Algo deu errado
                </h1>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <Link
                  href="/landing"
                  className="text-[#42B395] hover:underline"
                >
                  Voltar para a página inicial
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <footer className="py-6 px-4 text-center">
        <p className="text-white/50 text-sm">
          © 2025 Lucre 360 - Todos os direitos reservados
        </p>
      </footer>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #044A05 0%, #033303 100%)' }}>
        <Loader2 className="h-12 w-12 text-white animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
