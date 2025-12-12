"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crown, Loader2, Check } from "lucide-react"

interface PremiumModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail: string
}

export function PremiumModal({ open, onOpenChange, userEmail }: PremiumModalProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
        }),
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Erro ao criar sessão de checkout:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Crown className="h-6 w-6 text-yellow-500" />
            Upgrade para Premium
          </DialogTitle>
          <DialogDescription className="text-center">
            Você atingiu o limite de cálculos gratuitos. Assine o plano Premium para continuar usando a calculadora.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600 mb-2">R$ 9,90</p>
            <p className="text-gray-600">por mês</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm">Cálculos ilimitados</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm">Histórico completo de simulações</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm">Exportação de dados (PDF/CSV)</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm">Configurações personalizadas</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm">Suporte prioritário</span>
            </div>
          </div>

          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700"
            size="lg"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assinar Premium Agora
          </Button>

          <p className="text-xs text-center text-gray-500">
            Pagamento seguro processado pelo Stripe. Cancele a qualquer momento.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
