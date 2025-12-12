"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Crown, History, Download, Settings, ExternalLink, LogOut, User, AlertTriangle } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { AuthModal } from "@/components/auth-modal"
import { PremiumModal } from "@/components/premium-modal"
import type { User as UserType, Calculation } from "@/types/database"

export default function ShopeeCalculator() {
  const [costPrice, setCostPrice] = useState("")
  const [margin, setMargin] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [freeShipping, setFreeShipping] = useState("false")
  const [result, setResult] = useState<any>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [guestUsage, setGuestUsage] = useState(0)

  useEffect(() => {
    const supabase = getSupabaseClient()

    const checkDailyReset = (userData: UserType) => {
      if (userData.subscription_status === "premium") return userData

      const today = new Date().toISOString().split("T")[0]
      const resetDate = userData.free_calculations_reset_date?.split("T")[0]

      if (resetDate !== today) {
        // Reset needed - will be updated in database
        return { ...userData, free_calculations_used: 0, free_calculations_reset_date: new Date().toISOString() }
      }
      return userData
    }

    const checkUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const { data: userData } = await supabase.from("users").select("*").eq("id", authUser.id).single()

        if (userData) {
          const checkedUser = checkDailyReset(userData)
          if (checkedUser.free_calculations_used !== userData.free_calculations_used) {
            await supabase
              .from("users")
              .update({
                free_calculations_used: 0,
                free_calculations_reset_date: new Date().toISOString(),
              })
              .eq("id", userData.id)
          }
          setUser(checkedUser)
          loadCalculations(checkedUser.id)
        }
      } else {
        const savedUsage = localStorage.getItem("shopee-calc-guest-usage")
        const savedDate = localStorage.getItem("shopee-calc-guest-date")
        const today = new Date().toISOString().split("T")[0]

        if (savedDate !== today) {
          localStorage.setItem("shopee-calc-guest-usage", "0")
          localStorage.setItem("shopee-calc-guest-date", today)
          setGuestUsage(0)
        } else {
          setGuestUsage(savedUsage ? Number.parseInt(savedUsage) : 0)
        }
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Small delay to allow trigger to complete
        await new Promise((resolve) => setTimeout(resolve, 500))

        const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (userData) {
          const checkedUser = checkDailyReset(userData)
          if (checkedUser.free_calculations_used !== userData.free_calculations_used) {
            await supabase
              .from("users")
              .update({
                free_calculations_used: 0,
                free_calculations_reset_date: new Date().toISOString(),
              })
              .eq("id", userData.id)
          }
          setUser(checkedUser)
          loadCalculations(checkedUser.id)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setCalculations([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadCalculations = async (userId: string) => {
    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from("calculations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (data) setCalculations(data)
  }

  const calculatePrice = async () => {
    const cost = Number.parseFloat(costPrice)
    const marginPercent = Number.parseFloat(margin)
    const qty = Number.parseInt(quantity) || 1
    const hasFreeship = freeShipping === "true"

    if (!cost || !marginPercent) return

    if (!user) {
      if (guestUsage >= 3) {
        setShowAuthModal(true)
        return
      }
    } else if (user.subscription_status === "free" && user.free_calculations_used >= 3) {
      setShowPremiumModal(true)
      return
    }

    // Cenário A (Não participa): 20% (18% Comissão + 2% Transação)
    // Cenário B (Participa Frete Grátis): 24% (18% Comissão + 2% Transação + 4% Serviço Extra)
    const taxaVariavel = hasFreeship ? 0.24 : 0.2
    const taxaFixa = 4.0 // R$4.00 obrigatório por item vendido

    const marginDecimal = marginPercent / 100

    const divisor = 1 - (taxaVariavel + marginDecimal)

    // Prevent division by zero or negative prices
    if (divisor <= 0) {
      setResult({
        error: true,
        message: "A soma da margem + taxas excede 100%. Reduza a margem desejada.",
      })
      return
    }

    const sellingPrice = (cost + taxaFixa) / divisor

    const taxasVariaveisReais = sellingPrice * taxaVariavel
    const lucroLiquidoReais = sellingPrice * marginDecimal
    const custoTotal = cost + taxaFixa + taxasVariaveisReais
    const margemRealPercentual = (lucroLiquidoReais / sellingPrice) * 100

    const valorRestantePorUnidade = lucroLiquidoReais + cost

    const calculationResult = {
      // Main result
      sellingPrice: sellingPrice,
      // Cost breakdown
      costPrice: cost,
      taxaFixa: taxaFixa,
      taxasVariaveisReais: taxasVariaveisReais,
      taxaVariavelPercentual: taxaVariavel * 100,
      // Profit info
      lucroLiquidoReais: lucroLiquidoReais,
      margemRealPercentual: margemRealPercentual,
      totalVenda: sellingPrice * qty,
      totalCusto: cost * qty,
      totalTaxaFixa: taxaFixa * qty,
      totalTaxasVariaveis: taxasVariaveisReais * qty,
      totalLucroLiquido: lucroLiquidoReais * qty,
      valorRestante: valorRestantePorUnidade * qty,
      valorRestantePorUnidade: valorRestantePorUnidade,
      // Input params
      margin: marginPercent,
      quantity: qty,
      freeShipping: hasFreeship,
      // Detailed breakdown labels
      taxBreakdown: hasFreeship ? "18% Comissão + 2% Transação + 4% Frete Grátis" : "18% Comissão + 2% Transação",
    }

    setResult(calculationResult)

    const supabase = getSupabaseClient()

    if (user) {
      const { data: newCalculation } = await supabase
        .from("calculations")
        .insert({
          user_id: user.id,
          cost_price: cost,
          margin_percent: marginPercent,
          quantity: qty,
          free_shipping: hasFreeship,
          selling_price: sellingPrice,
          commission: taxasVariaveisReais + taxaFixa,
          profit: lucroLiquidoReais,
        })
        .select()
        .single()

      if (newCalculation) {
        setCalculations([newCalculation, ...calculations])
      }

      if (user.subscription_status === "free") {
        const newCount = user.free_calculations_used + 1
        await supabase.from("users").update({ free_calculations_used: newCount }).eq("id", user.id)

        setUser({ ...user, free_calculations_used: newCount })
      }
    } else {
      const newUsage = guestUsage + 1
      setGuestUsage(newUsage)
      localStorage.setItem("shopee-calc-guest-usage", newUsage.toString())
    }
  }

  const handleSignOut = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
  }

  const exportToPDF = () => {
    alert("Funcionalidade de exportação em desenvolvimento!")
  }

  const getRemainingCalculations = () => {
    if (!user) return `${3 - guestUsage} (sem login)`
    if (user.subscription_status === "premium") return "Ilimitado"
    return `${3 - user.free_calculations_used} hoje`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Calculadora Shopee</h1>
            {user?.subscription_status === "premium" && <Crown className="h-6 w-6 text-yellow-500" />}
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calcule o preço ideal de venda para garantir sua margem de lucro após comissões e taxas da Shopee
          </p>

          <div className="flex items-center justify-center gap-4 mt-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <User className="h-3 w-3 mr-1" />
                  {user.email}
                </Badge>
                {user.subscription_status === "free" && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Cálculos restantes: {getRemainingCalculations()}
                  </Badge>
                )}
                {user.subscription_status === "premium" && (
                  <Badge className="bg-yellow-500 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Versão Gratuita: {getRemainingCalculations()} cálculos restantes hoje
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-orange-600" />
                  Calculadora de Preços
                </CardTitle>
                <CardDescription>Preencha os dados do seu produto para calcular o preço ideal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost">Preço de Custo (R$)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 50.00"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="margin">Margem de Lucro (%)</Label>
                    <Input
                      id="margin"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 30"
                      value={margin}
                      onChange={(e) => setMargin(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade de Itens por Pedido</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Programa de Frete Grátis</Label>
                  <RadioGroup value={freeShipping} onValueChange={setFreeShipping}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="no-freeship" />
                      <Label htmlFor="no-freeship">Não participa (Taxa real: 20%)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="freeship" />
                      <Label htmlFor="freeship">Participa (Taxa real: 24%)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button onClick={calculatePrice} className="w-full bg-orange-600 hover:bg-orange-700" size="lg">
                  Calcular Preço Ideal
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {result && !result.error && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">Resultado do Cálculo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Preço de venda sugerido:</p>
                    <p className="text-3xl font-bold text-orange-600">R$ {result.sellingPrice.toFixed(2)}</p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="font-medium text-gray-700 border-b pb-2">Detalhamento de Custos:</div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Custo do produto:</span>
                      <span>R$ {result.costPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa fixa Shopee:</span>
                      <span>R$ {result.taxaFixa.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxas variáveis ({result.taxaVariavelPercentual}%):</span>
                      <span className="text-red-600">R$ {result.taxasVariaveisReais.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500 pl-2">({result.taxBreakdown})</div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Lucro líquido:</span>
                      <span className="text-green-600">R$ {result.lucroLiquidoReais.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Margem real sobre venda:</span>
                      <span>{result.margemRealPercentual.toFixed(1)}%</span>
                    </div>

                    {result.quantity > 1 && (
                      <>
                        <hr className="my-2" />
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          Totais para {result.quantity} unidades:
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total da venda:</span>
                          <span>R$ {result.totalVenda.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total de custos:</span>
                          <span className="text-red-600">
                            R$ {(result.totalCusto + result.totalTaxaFixa + result.totalTaxasVariaveis).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}

                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-lg bg-green-50 p-2 rounded-lg border border-green-200">
                      <span className="text-green-800">Valor que resta no final:</span>
                      <span className="text-green-600">R$ {result.valorRestante.toFixed(2)}</span>
                    </div>
                    {result.quantity > 1 && (
                      <div className="text-xs text-center text-gray-500">
                        (R$ {result.lucroLiquidoReais.toFixed(2)} por unidade × {result.quantity} unidades)
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-amber-700 font-medium mb-1">
                      <AlertTriangle className="h-3 w-3" />
                      Alerta de Correção
                    </div>
                    <p className="text-amber-600">
                      O cálculo incluiu a taxa fixa de R$ 4,00 e ajustou as porcentagens para a realidade atual da
                      Shopee para garantir seu lucro real.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {result && result.error && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Erro no Cálculo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-600">{result.message}</p>
                </CardContent>
              </Card>
            )}

            {(!user || user.subscription_status === "free") && (
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <Crown className="h-5 w-5" />
                    Plano Premium
                  </CardTitle>
                  <CardDescription>R$ 9,90/mês</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                      Cálculos ilimitados
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                      Histórico de simulações
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                      Personalização de taxas
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                      Exportar resultados
                    </li>
                  </ul>
                  <Button
                    onClick={() => (user ? setShowPremiumModal(true) : setShowAuthModal(true))}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {user ? "Assinar Premium" : "Fazer Login"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {user?.subscription_status === "premium" && (
          <div className="mt-8">
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-2" />
                  Histórico
                </TabsTrigger>
                <TabsTrigger value="export">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Cálculos</CardTitle>
                    <CardDescription>Suas últimas simulações salvas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {calculations.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Nenhum cálculo realizado ainda</p>
                    ) : (
                      <div className="space-y-4">
                        {calculations.map((calc) => (
                          <div key={calc.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm text-gray-500">
                                {new Date(calc.created_at).toLocaleDateString("pt-BR")}
                              </span>
                              <Badge variant={calc.free_shipping ? "default" : "secondary"}>
                                {calc.free_shipping ? "Frete Grátis" : "Sem Frete Grátis"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Custo:</span>
                                <p className="font-medium">R$ {Number(calc.cost_price).toFixed(2)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Margem:</span>
                                <p className="font-medium">{Number(calc.margin_percent).toFixed(1)}%</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Preço:</span>
                                <p className="font-medium">R$ {Number(calc.selling_price).toFixed(2)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Lucro:</span>
                                <p className="font-medium text-green-600">R$ {Number(calc.profit).toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="export">
                <Card>
                  <CardHeader>
                    <CardTitle>Exportar Dados</CardTitle>
                    <CardDescription>Baixe seus cálculos em diferentes formatos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={exportToPDF} variant="outline" className="w-full bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar como PDF
                    </Button>
                    <Button onClick={exportToPDF} variant="outline" className="w-full bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar como CSV
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações Avançadas</CardTitle>
                    <CardDescription>Personalize as taxas conforme sua categoria</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-gray-500 py-8">Funcionalidade em desenvolvimento</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p className="mb-2">
            Essa é uma estimativa com base na política oficial da Shopee e pode variar conforme categoria ou promoções.
          </p>
          <a
            href="https://seller.shopee.com.br/edu/article/18483/como-funciona-a-politica-de-comissao-para-vendedores-shopee"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700"
          >
            Política oficial de comissões da Shopee
            <ExternalLink className="h-3 w-3" />
          </a>
        </footer>

        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          onSuccess={() => {
            setShowAuthModal(false)
            window.location.reload()
          }}
        />

        {user && <PremiumModal open={showPremiumModal} onOpenChange={setShowPremiumModal} userEmail={user.email} />}
      </div>
    </div>
  )
}
