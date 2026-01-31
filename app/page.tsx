"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Crown, History, Download, Settings, ExternalLink, LogOut, User, AlertTriangle, Truck, ShoppingBag, Loader2, Lock } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { MarketplaceCard } from "@/components/marketplace-card"
import type { User as UserType, Calculation, MLAdLevel, MLShippingMode, MLCalculationResult, AmazonLogisticMode, AmazonCalculationResult } from "@/types/database"

export default function ShopeeCalculator() {
  const [costPrice, setCostPrice] = useState("")
  const [margin, setMargin] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [freeShipping, setFreeShipping] = useState("false")

  const [resultShopee, setResultShopee] = useState<any>(null)
  const [resultML, setResultML] = useState<any>(null)
  const [resultAmazon, setResultAmazon] = useState<any>(null)

  const [user, setUser] = useState<UserType | null>(null)
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [connectionError, setConnectionError] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  // Email premium fixo (seu email)
  const PREMIUM_EMAIL = "adrielrattes@gmail.com"

  // ML-specific states
  const [mlAdLevel, setMlAdLevel] = useState<MLAdLevel>('premium')
  const [mlCustomTax, setMlCustomTax] = useState('')
  const [mlShippingMode, setMlShippingMode] = useState<MLShippingMode>('padrao')
  const [motoboyFee, setMotoboyFee] = useState('')

  // Amazon-specific states
  const [amazonLogisticMode, setAmazonLogisticMode] = useState<AmazonLogisticMode>('dba')
  const [amazonTaxRate, setAmazonTaxRate] = useState('14')
  const [amazonLogisticFee, setAmazonLogisticFee] = useState('')


  // Helper to wrap DB calls with timeout - OTIMIZADO para 3s
  const safeDbCall = async (promise: Promise<any>, timeoutMs = 3000) => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("DB_TIMEOUT")), timeoutMs)
    )
    try {
      const result = await Promise.race([promise, timeoutPromise])
      return { result, error: null }
    } catch (error) {
      return { result: null, error }
    }
  }

  useEffect(() => {
    const supabase = getSupabaseClient()

    // Verifica se usuário tem permissão (premium ou email autorizado)
    const hasAccess = (userData: UserType) => {
      return userData.subscription_status === "premium" || userData.email === PREMIUM_EMAIL
    }

    const checkUser = async () => {
      try {
        setConnectionError(false)

        // 1. Auth Check com timeout curto (3s)
        console.log("Starting checkUser...")
        const { result: authResult, error: authTimeout } = await safeDbCall(supabase.auth.getUser(), 3000)

        if (authTimeout || !authResult?.data?.user) {
          if (authTimeout) console.warn("Auth check timed out")

          // Limpar sessões inválidas
          if (authResult?.error?.message?.includes("Invalid Refresh Token") || authResult?.error?.message?.includes("Refresh Token Not Found")) {
            console.warn("Stale session detected, clearing...")
            supabase.auth.signOut()
          }

          // Sistema fechado - sem usuário = sem acesso
          setAccessDenied(true)
          setIsLoading(false)
          return
        }

        const authUser = authResult.data.user
        console.log("User found:", authUser.id)

        // 2. DB Check with Timeout
        const { result: dbData, error: dbError } = await safeDbCall(
          supabase.from("users").select("*").eq("id", authUser.id).single()
        )

        if (dbError) {
          console.error("DB connection failed:", dbError)
          setConnectionError(true)
          setIsLoading(false)
          return
        }

        const userData = dbData?.data

        if (userData) {
          // Verificar se tem acesso premium
          if (!hasAccess(userData)) {
            console.warn("User exists but not premium:", userData.email)
            setAccessDenied(true)
            setIsLoading(false)
            return
          }

          setUser(userData)
          loadCalculations(userData.id)
        } else {
          // Usuário auth existe mas não no DB - verificar se é o email premium
          if (authUser.email === PREMIUM_EMAIL) {
            // Criar usuário premium para o admin
            const { result: newUserResult } = await safeDbCall(
              supabase.from("users").upsert([{
                id: authUser.id,
                email: authUser.email,
                subscription_status: "premium",
                free_calculations_used: 0,
                free_calculations_reset_date: new Date().toISOString().split("T")[0],
              }]).select().single()
            )

            if (newUserResult?.data) {
              setUser(newUserResult.data)
              loadCalculations(newUserResult.data.id)
            }
          } else {
            // Não autorizado
            setAccessDenied(true)
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Critical checkUser error:", error)
        setAccessDenied(true)
        setIsLoading(false)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Re-verificar acesso após login
        const { result: dbData } = await safeDbCall(
          supabase.from("users").select("*").eq("id", session.user.id).single()
        )

        if (dbData?.data) {
          if (hasAccess(dbData.data)) {
            setUser(dbData.data)
            setAccessDenied(false)
            loadCalculations(dbData.data.id)
          } else {
            setAccessDenied(true)
          }
        } else if (session.user.email === PREMIUM_EMAIL) {
          // Criar usuário premium admin
          const { result: newUserResult } = await safeDbCall(
            supabase.from("users").upsert([{
              id: session.user.id,
              email: session.user.email,
              subscription_status: "premium",
              free_calculations_used: 0,
              free_calculations_reset_date: new Date().toISOString().split("T")[0],
            }]).select().single()
          )
          if (newUserResult?.data) {
            setUser(newUserResult.data)
            setAccessDenied(false)
            loadCalculations(newUserResult.data.id)
          }
        } else {
          setAccessDenied(true)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setCalculations([])
        setResultML(null)
        setResultAmazon(null)
        setAccessDenied(true)
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

  const calculateGeneric = (
    cost: number,
    marginPercent: number,
    qty: number,
    hasFreeship: boolean,
    platform: 'shopee' | 'ml' | 'amazon'
  ) => {
    let taxaVariavel = 0
    let taxaFixa = 0
    let taxBreakdown = ""

    if (platform === 'shopee') {
      // Shopee: 18% + 2% + 4% (Frete Extra) + 4.00 Fixo (Simplificado)
      taxaVariavel = hasFreeship ? 0.24 : 0.20
      taxaFixa = 4.0
      taxBreakdown = hasFreeship
        ? "18% + 2% + 4% (Extra) + R$ 4,00"
        : "18% + 2% + R$ 4,00"
    } else if (platform === 'ml') {
      // ML: Estimativa - Clássico 11% a 14% / Premium 16% a 19% + Custo Fixo
      // Vamos usar uma média conservadora para Premium
      taxaVariavel = 0.18
      taxaFixa = 6.0 // Taxa fixa comum em ML para itens < 79
      taxBreakdown = "Est. 18% + R$ 6,00 (Premium)"
    } else if (platform === 'amazon') {
      // Amazon: Referral 8% - 15% + Closing Fees
      taxaVariavel = 0.15
      taxaFixa = 0 // Amazon geralmente não tem taxa fixa por item no plano Pro, mas tem no individual
      taxBreakdown = "Est. 15% (Referral)"
    }

    const marginDecimal = marginPercent / 100
    const divisor = 1 - (taxaVariavel + marginDecimal)

    if (divisor <= 0) {
      return {
        error: true,
        message: "Margem + Taxas ultrapassam 100%. Reduza a margem.",
        sellingPrice: 0, costPrice: 0, taxaFixa: 0, taxasVariaveisReais: 0, taxaVariavelPercentual: 0,
        lucroLiquidoReais: 0, margemRealPercentual: 0, totalVenda: 0, totalCusto: 0, totalTaxaFixa: 0,
        totalTaxasVariaveis: 0, totalLucroLiquido: 0, valorRestante: 0, quantity: qty, taxBreakdown
      }
    }

    const sellingPrice = (cost + taxaFixa) / divisor
    const taxasVariaveisReais = sellingPrice * taxaVariavel
    const lucroLiquidoReais = sellingPrice * marginDecimal

    return {
      sellingPrice,
      costPrice: cost,
      taxaFixa,
      taxasVariaveisReais,
      taxaVariavelPercentual: taxaVariavel * 100,
      lucroLiquidoReais,
      margemRealPercentual: (lucroLiquidoReais / sellingPrice) * 100,
      totalVenda: sellingPrice * qty,
      totalCusto: cost * qty,
      totalTaxaFixa: taxaFixa * qty,
      totalTaxasVariaveis: taxasVariaveisReais * qty,
      totalLucroLiquido: lucroLiquidoReais * qty,
      valorRestante: (lucroLiquidoReais + cost) * qty,
      valorRestantePorUnidade: lucroLiquidoReais + cost,
      quantity: qty,
      taxBreakdown,
      error: false
    }
  }


  // ============ MERCADO LIVRE CALCULATION ============

  // TAXAS DE COMISSÃO (por Nível de Anúncio)
  const ML_AD_LEVEL_RATES = {
    classico: 0.14,   // 14% (padrão, pode variar por categoria)
    premium: 0.19     // 19% (padrão, pode variar por categoria)
  }

  // CUSTOS LOGÍSTICOS (por Modalidade de Envio)
  const ML_SHIPPING_COSTS = {
    padrao: {
      taxaFixa: 6.00,           // < R$ 79
      custoFreteGratis: 22.45   // >= R$ 79
    },
    full: {
      taxaManuseio: 6.25,       // < R$ 79
      custoFreteFull: 22.45     // >= R$ 79
    },
    flex: {
      taxaFixa: 6.75,           // < R$ 79 (adicional à lógica do motoboy)
      reembolsoML: 8.90         // Valor médio de reembolso do ML
    }
  }

  // Funções auxiliares para cálculo ML
  const calcularDespesasLogisticas = (
    mode: MLShippingMode,
    isFreteGratis: boolean,
    motoboyFee?: number
  ): number => {
    switch (mode) {
      case 'padrao':
        return isFreteGratis
          ? ML_SHIPPING_COSTS.padrao.custoFreteGratis
          : ML_SHIPPING_COSTS.padrao.taxaFixa

      case 'full':
        return isFreteGratis
          ? ML_SHIPPING_COSTS.full.custoFreteFull
          : ML_SHIPPING_COSTS.full.taxaManuseio

      case 'flex':
        const custoMotoboy = motoboyFee || 0
        const reembolso = ML_SHIPPING_COSTS.flex.reembolsoML
        const custoLogistico = Math.max(0, custoMotoboy - reembolso)

        return isFreteGratis
          ? custoLogistico
          : custoLogistico + ML_SHIPPING_COSTS.flex.taxaFixa

      default:
        return 0
    }
  }

  const obterTaxaFixaML = (mode: MLShippingMode, isFreteGratis: boolean): number => {
    if (isFreteGratis) return 0

    switch (mode) {
      case 'padrao':
        return ML_SHIPPING_COSTS.padrao.taxaFixa
      case 'full':
        return ML_SHIPPING_COSTS.full.taxaManuseio
      case 'flex':
        return ML_SHIPPING_COSTS.flex.taxaFixa
      default:
        return 0
    }
  }

  const calcularCustoLogisticoFinal = (
    mode: MLShippingMode,
    isFreteGratis: boolean,
    motoboyFee?: number
  ): number => {
    switch (mode) {
      case 'padrao':
        return isFreteGratis ? ML_SHIPPING_COSTS.padrao.custoFreteGratis : 0

      case 'full':
        return isFreteGratis ? ML_SHIPPING_COSTS.full.custoFreteFull : 0

      case 'flex':
        const custoMotoboy = motoboyFee || 0
        const reembolso = ML_SHIPPING_COSTS.flex.reembolsoML
        return Math.max(0, custoMotoboy - reembolso)

      default:
        return 0
    }
  }

  // Função principal de cálculo ML
  const calculateMLPrice = (
    cost: number,
    marginPercent: number,
    adLevel: MLAdLevel,
    shippingMode: MLShippingMode,
    customTaxRate?: number,
    motoboyFee?: number
  ): MLCalculationResult | { error: boolean; message: string } => {
    // 1. Determinar taxa de comissão
    const taxaComissao = customTaxRate
      ? customTaxRate / 100
      : ML_AD_LEVEL_RATES[adLevel]

    const marginDecimal = marginPercent / 100
    const divisor = 1 - (taxaComissao + marginDecimal)

    if (divisor <= 0) {
      return {
        error: true,
        message: "Margem + Taxas ultrapassam 100%. Reduza a margem."
      }
    }

    // 2. Calcular despesas fixas baseado na modalidade logística
    let despesasFixas = 0
    let isFreteGratis = false

    // Tentativa A: Assumir produto < R$ 79
    despesasFixas = calcularDespesasLogisticas(
      shippingMode,
      false, // não é frete grátis ainda
      motoboyFee
    )

    let precoVenda = (cost + despesasFixas) / divisor

    // 3. Verificação: Produto ficou >= R$ 79?
    if (precoVenda >= 79) {
      isFreteGratis = true
      despesasFixas = calcularDespesasLogisticas(
        shippingMode,
        true, // agora é frete grátis
        motoboyFee
      )
      precoVenda = (cost + despesasFixas) / divisor
    }

    // 4. Cálculos detalhados para relatório
    const taxaMLReais = precoVenda * taxaComissao
    const taxaFixaML = obterTaxaFixaML(shippingMode, isFreteGratis)
    const custoLogistico = calcularCustoLogisticoFinal(
      shippingMode,
      isFreteGratis,
      motoboyFee
    )

    // Repasse = Preço - Taxa ML - Custo Logístico + Reembolso (se Flex)
    let repasseLiquido = precoVenda - taxaMLReais - custoLogistico

    if (shippingMode === 'flex' && motoboyFee) {
      repasseLiquido += ML_SHIPPING_COSTS.flex.reembolsoML
    }

    const lucroLiquido = repasseLiquido - cost

    // Se Flex, descontar pagamento do motoboy do lucro
    const lucroFinal = shippingMode === 'flex'
      ? lucroLiquido - (motoboyFee || 0)
      : lucroLiquido

    const margemReal = (lucroFinal / precoVenda) * 100

    return {
      precoVenda,
      taxaMLReais,
      taxaFixaML,
      custoLogistico,
      reembolsoFlex: shippingMode === 'flex' ? ML_SHIPPING_COSTS.flex.reembolsoML : 0,
      repasseLiquido,
      lucroLiquido: lucroFinal,
      margemReal,
      adLevel,
      shippingMode,
      isFreteGratis,
      error: false
    }
  }


  // ============ AMAZON CALCULATION ============

  const calculateAmazonPrice = (
    cost: number,
    marginPercent: number,
    logisticMode: AmazonLogisticMode,
    taxRatePercent?: number,
    fixedLogisticFeeInput?: number
  ): AmazonCalculationResult | { error: boolean; message: string } => {
    const taxRate = taxRatePercent ? taxRatePercent / 100 : 0.14
    const margin = marginPercent / 100
    const divisor = 1 - (taxRate + margin)

    if (divisor <= 0) {
      return {
        error: true,
        message: "Margem + Taxas ultrapassam 100%. Reduza a margem."
      }
    }

    // Helper: Fórmula de Markup Reverso
    const calcReverse = (fee: number) => (cost + fee) / divisor

    let finalPrice = 0
    let usedLogisticFee = 0
    let tierInfo = ''

    if (logisticMode === 'dba') {
      // --- LÓGICA SMART DBA (Testa as faixas de preço) ---

      // 1. Tenta Faixa Super Econômica (R$ 4.50)
      const attempt1 = calcReverse(4.50)

      if (attempt1 <= 30.00) {
        finalPrice = attempt1
        usedLogisticFee = 4.50
        tierInfo = 'Faixa 1 (≤ R$30)'
      } else {
        // 2. Tenta Faixa Econômica (R$ 6.50)
        const attempt2 = calcReverse(6.50)
        if (attempt2 <= 49.99) {
          finalPrice = attempt2
          usedLogisticFee = 6.50
          tierInfo = 'Faixa 2 (R$30-50)'
        } else {
          // 3. Tenta Faixa Intermediária (R$ 6.75)
          const attempt3 = calcReverse(6.75)
          if (attempt3 <= 78.99) {
            finalPrice = attempt3
            usedLogisticFee = 6.75
            tierInfo = 'Faixa 3 (R$50-79)'
          } else {
            // 4. Faixa Peso (>79) - Usa o input do usuário
            usedLogisticFee = fixedLogisticFeeInput || 0
            finalPrice = calcReverse(usedLogisticFee)
            tierInfo = 'Faixa Peso (> R$79)'
          }
        }
      }
    } else {
      // FBM ou FBA (Usa valor direto)
      usedLogisticFee = fixedLogisticFeeInput || 0
      finalPrice = calcReverse(usedLogisticFee)
      tierInfo = logisticMode === 'fba' ? 'Tabela FBA' : 'Envio Próprio'
    }

    // --- PADRONIZAÇÃO DE RETORNO (Financeiro) ---
    const taxAmount = finalPrice * taxRate
    const revenuePostTax = finalPrice - taxAmount
    const repasseLiquido = revenuePostTax - usedLogisticFee
    const lucroLiquido = repasseLiquido - cost

    return {
      price: finalPrice,
      taxRate,
      taxAmount,
      revenuePostTax,
      custoLogistico: usedLogisticFee,
      repasseLiquido,
      lucroLiquido,
      margemReal: (lucroLiquido / finalPrice) * 100,
      logisticMode,
      tierInfo,
      error: false
    }
  }


  const calculatePrice = async () => {
    const cost = Number.parseFloat(costPrice)
    const marginPercent = Number.parseFloat(margin)
    const qty = Number.parseInt(quantity) || 1
    const hasFreeship = freeShipping === "true"

    if (!cost || !marginPercent) return

    // Sistema fechado - apenas usuário premium pode calcular
    if (!user) {
      return
    }

    // Shopee Calculation
    const shopeeResult = calculateGeneric(cost, marginPercent, qty, hasFreeship, 'shopee')
    setResultShopee(shopeeResult)

    // Todos os marketplaces disponíveis para usuário premium
    const mlResult = calculateMLPrice(
      cost,
      marginPercent,
      mlAdLevel,
      mlShippingMode,
      mlCustomTax ? parseFloat(mlCustomTax) : undefined,
      mlShippingMode === 'flex' ? parseFloat(motoboyFee) : undefined
    )
    setResultML(mlResult)

    // Amazon with Smart DBA
    const amazonResult = calculateAmazonPrice(
      cost,
      marginPercent,
      amazonLogisticMode,
      amazonTaxRate ? parseFloat(amazonTaxRate) : undefined,
      amazonLogisticFee ? parseFloat(amazonLogisticFee) : undefined
    )
    setResultAmazon(amazonResult)

    // Salvar cálculo no histórico
    const supabase = getSupabaseClient()

    if (!shopeeResult.error) {
      const { data: newCalculation } = await supabase
        .from("calculations")
        .insert({
          user_id: user.id,
          cost_price: cost,
          margin_percent: marginPercent,
          quantity: qty,
          free_shipping: hasFreeship,
          selling_price: shopeeResult.sellingPrice,
          commission: shopeeResult.taxasVariaveisReais + shopeeResult.taxaFixa,
          profit: shopeeResult.lucroLiquidoReais,
        })
        .select()
        .single()

      if (newCalculation) {
        setCalculations([newCalculation, ...calculations])
      }
    }
  }

  const handleSignOut = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  const exportToPDF = () => {
    alert("Funcionalidade de exportação em desenvolvimento!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex h-[80vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              <p className="text-gray-500">Carregando...</p>
            </div>
          </div>
        ) : accessDenied ? (
          <div className="flex h-[80vh] items-center justify-center">
            <Card className="max-w-md mx-auto text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Lock className="h-12 w-12 text-orange-600" />
                </div>
                <CardTitle className="text-2xl">Acesso Exclusivo</CardTitle>
                <CardDescription>
                  Esta calculadora é exclusiva para assinantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Para ter acesso à calculadora completa de Shopee, Mercado Livre e Amazon, você precisa ser um assinante premium.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    className="bg-orange-600 hover:bg-orange-700 w-full"
                    onClick={() => window.location.href = process.env.NEXT_PUBLIC_CAKTO_URL || 'https://pay.cakto.com.br/DAR7YWr'}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Assinar Agora
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Já é assinante? <a href="/login" className="text-orange-600 underline">Faça login</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              {connectionError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex flex-col items-center justify-center gap-2 text-red-800 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold">Erro de Conexão ou Permissão</span>
                  </div>
                  <p>Não foi possível carregar seu perfil. O banco de dados pode estar bloqueando a criação do usuário.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-white border-red-200 hover:bg-red-50 text-red-700"
                    onClick={() => window.location.reload()}
                  >
                    Tentar Novamente
                  </Button>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Calculator className="h-8 w-8 text-orange-600" />
                <h1 className="text-3xl font-bold text-gray-900">Calculadora Multi-Marketplace</h1>
                {user?.subscription_status === "premium" && <Crown className="h-6 w-6 text-yellow-500" />}
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {user
                  ? "Compare seus preços na Shopee, Mercado Livre e Amazon simultaneamente."
                  : "Calcule o preço ideal para vender na Shopee."}
              </p>

              <div className="flex items-center justify-center gap-4 mt-4">
                {user && (
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      <User className="h-3 w-3 mr-1" />
                      {user.email}
                    </Badge>
                    <Badge className="bg-yellow-500 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Input Section - Takes up 4 columns or full width if mobile */}
              <div className="lg:col-span-4">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-orange-600" />
                      Dados do Produto
                    </CardTitle>
                    <CardDescription>Preencha para calcular</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
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
                          <Label htmlFor="no-freeship">Não participa</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="freeship" />
                          <Label htmlFor="freeship">Participa (+ taxas)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* ML Configuration - Only for logged users */}
                    {user && (
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700">
                          Configurações Mercado Livre
                        </h3>

                        {/* Nível do Anúncio */}
                        <div className="space-y-2">
                          <Label htmlFor="ml-ad-level">Nível do Anúncio</Label>
                          <Select value={mlAdLevel} onValueChange={(v) => setMlAdLevel(v as MLAdLevel)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="classico">Clássico (~14%)</SelectItem>
                              <SelectItem value="premium">Premium (~19%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Taxa Personalizada */}
                        <div className="space-y-2">
                          <Label htmlFor="ml-custom-tax">
                            Taxa Personalizada (%)
                            <span className="text-xs text-gray-500 ml-2">
                              Opcional - varia por categoria
                            </span>
                          </Label>
                          <Input
                            id="ml-custom-tax"
                            type="number"
                            step="0.1"
                            placeholder={mlAdLevel === 'classico' ? '14.0' : '19.0'}
                            value={mlCustomTax}
                            onChange={(e) => setMlCustomTax(e.target.value)}
                          />
                        </div>

                        {/* Modalidade de Envio */}
                        <div className="space-y-2">
                          <Label htmlFor="ml-shipping">Modalidade de Envio</Label>
                          <Select value={mlShippingMode} onValueChange={(v) => setMlShippingMode(v as MLShippingMode)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="padrao">Padrão (Agência/Coleta)</SelectItem>
                              <SelectItem value="full">Full (Estoque ML)</SelectItem>
                              <SelectItem value="flex">Flex (Motoboy)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Custo Motoboy (apenas Flex) */}
                        {mlShippingMode === 'flex' && (
                          <div className="space-y-2">
                            <Label htmlFor="motoboy-fee">
                              Custo do Motoboy (R$)
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                              id="motoboy-fee"
                              type="number"
                              step="0.01"
                              placeholder="Ex: 12.00"
                              value={motoboyFee}
                              onChange={(e) => setMotoboyFee(e.target.value)}
                            />
                            <p className="text-xs text-gray-500">
                              ML reembolsa ~R$ 8,90. Você paga a diferença.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Amazon Configuration - Only for logged users */}
                    {user && (
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700">
                          Configurações Amazon
                        </h3>

                        {/* Modo de Logística */}
                        <div className="space-y-2">
                          <Label htmlFor="amazon-logistic">Modo de Logística</Label>
                          <Select value={amazonLogisticMode} onValueChange={(v) => setAmazonLogisticMode(v as AmazonLogisticMode)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fbm">FBM (Envio Próprio)</SelectItem>
                              <SelectItem value="fba">FBA (Logística Amazon)</SelectItem>
                              <SelectItem value="dba">DBA (Delivery by Amazon)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Taxa de Comissão */}
                        <div className="space-y-2">
                          <Label htmlFor="amazon-tax">
                            Taxa de Comissão (%)
                          </Label>
                          <Input
                            id="amazon-tax"
                            type="number"
                            step="0.1"
                            placeholder="14.0"
                            value={amazonTaxRate}
                            onChange={(e) => setAmazonTaxRate(e.target.value)}
                          />
                        </div>

                        {/* Custo Logístico (condicional por modo) */}
                        <div className="space-y-2">
                          <Label htmlFor="amazon-fee">
                            {amazonLogisticMode === 'fbm'
                              ? 'Custo de Envio (Se não cobrar do cliente)'
                              : amazonLogisticMode === 'fba'
                                ? 'Tarifa FBA (Tabela de Peso)'
                                : 'Tarifa Peso (Apenas se preço > R$ 79)'}
                          </Label>
                          <Input
                            id="amazon-fee"
                            type="number"
                            step="0.01"
                            placeholder="Ex: 8.00"
                            value={amazonLogisticFee}
                            onChange={(e) => setAmazonLogisticFee(e.target.value)}
                          />
                          {amazonLogisticMode === 'dba' && (
                            <p className="text-xs text-blue-600">
                              💡 DBA Smart: O sistema testa faixas automáticas (R$ 4.50 a R$ 6.75).
                              Só insira valor se o preço final for &gt; R$ 79.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <Button onClick={calculatePrice} className="w-full bg-orange-600 hover:bg-orange-700" size="lg">
                      Calcular Preços
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Results Section - Takes up 8 columns */}
              <div className="lg:col-span-8 space-y-6">

                {/* Premium user: Grid of 3 marketplaces */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    {resultShopee && (
                      <MarketplaceCard
                        title="Shopee"
                        icon={<ShoppingBag className="h-5 w-5" />}
                        colorClass="text-orange-600"
                        result={resultShopee}
                      />
                    )}
                    {!resultShopee && (
                      <div className="h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center p-8 text-gray-400">
                        Shopee
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-1">
                    {resultML && (
                      <MarketplaceCard
                        title="Mercado Livre"
                        icon={<Truck className="h-5 w-5" />}
                        colorClass="text-yellow-600"
                        result={resultML}
                      />
                    )}
                    {!resultML && (
                      <div className="h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center p-8 text-gray-400">
                        Mercado Livre
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-1">
                    {resultAmazon && (
                      <MarketplaceCard
                        title="Amazon"
                        icon={<ShoppingBag className="h-5 w-5" />}
                        colorClass="text-blue-600"
                        result={resultAmazon}
                      />
                    )}
                    {!resultAmazon && (
                      <div className="h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center p-8 text-gray-400">
                        Amazon
                      </div>
                    )}
                  </div>
                </div>

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
                        <CardTitle>Histórico de Cálculos (Shopee)</CardTitle>
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
                Essa é uma estimativa com base na política oficial dos marketplaces e pode variar conforme categoria ou promoções.
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}

