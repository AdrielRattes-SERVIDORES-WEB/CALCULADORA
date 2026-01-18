"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleSignUp = async () => {
    setLoading(true)
    setError("")
    try {
      const supabase = getSupabaseClient()
      const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("A conexão expirou. Verifique se o antivírus está bloqueando o acesso.")), 15000)
      )

      const { data, error } = (await Promise.race([
        supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        }),
        timeoutPromise,
      ])) as any

      if (error) throw error

      if (data.user) {
        // Trigger handle_new_user will create the user record automatically

        setMessage("Conta criada com sucesso! Verifique seu email para confirmar.")
        setTimeout(() => {
          onSuccess()
          onOpenChange(false)
        }, 2000)
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      if (error.message?.includes("Database error saving new user")) {
        setError("Erro: O banco de dados recusou o cadastro. Execute o script de correção 'Trigger' no Supabase.")
      } else {
        setError(error.message || "Erro ao criar conta")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    setLoading(true)
    setError("")

    try {
      const supabase = getSupabaseClient()

      // Create a specific timeout promise that rejects
      const timeoutPromise = new Promise((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id)
          reject(new Error("TIMEOUT_ERROR"))
        }, 30000) // 30 seconds timeout
      })

      // Wrap the sign in call
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      })

      const result = await Promise.race([signInPromise, timeoutPromise]) as any
      const { data, error } = result

      if (error) throw error

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      if (error.message === "TIMEOUT_ERROR" || error.message?.includes("expirou")) {
        console.warn("Login timeout prevented infinite loading.")
        setError("A conexão com o servidor (Supabase) está bloqueada ou muito lenta. Tente desativar temporariamente o 'Web Shield' do seu antivírus.")
      } else if (error.message?.includes("Database error saving new user")) {
        console.error("Trigger fail:", error)
        setError("Erro interno no banco de dados. O 'Gatilho de Criação' falhou. Por favor, execute o script de correção no Supabase.")
      } else {
        console.error("Signin error:", error)
        setError(error.message || "Erro ao entrar")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-orange-600" />
            Acesso à Calculadora
          </DialogTitle>
          <DialogDescription>
            Você atingiu o limite de 3 cálculos gratuitos. Crie uma conta grátis para desbloquear as calculadoras do Mercado Livre e Amazon, e ganhe mais 5 cálculos diários.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar Conta</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Senha</Label>
              <Input
                id="signin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleSignIn} disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Senha</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleSignUp} disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conta
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  )
}
