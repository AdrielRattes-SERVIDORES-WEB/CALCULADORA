export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
  subscription_status: "free" | "premium"
  cakto_subscription_id?: string
  subscription_end_date?: string
  free_calculations_used: number
  free_calculations_reset_date: string
  // Campos para setup de senha pós-compra
  setup_token?: string
  setup_token_expires?: string
  // Dados do cliente vindos da Cakto
  cakto_customer_name?: string
  cakto_customer_phone?: string
}

export interface Calculation {
  id: string
  user_id: string
  cost_price: number
  margin_percent: number
  quantity: number
  free_shipping: boolean
  selling_price: number
  commission: number
  profit: number
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  cakto_subscription_id: string
  status: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

// Mercado Livre Types
export type MLAdLevel = 'classico' | 'premium'
export type MLShippingMode = 'padrao' | 'full' | 'flex'

export interface MLCalculationParams {
  adLevel: MLAdLevel
  customTaxRate?: number  // Taxa personalizada (sobrescreve padrão)
  shippingMode: MLShippingMode
  motoboyFee?: number     // Obrigatório apenas para Flex
}

export interface MLCalculationResult {
  precoVenda: number
  taxaMLReais: number
  taxaFixaML: number
  custoLogistico: number
  reembolsoFlex: number
  repasseLiquido: number
  lucroLiquido: number
  margemReal: number
  adLevel: MLAdLevel
  shippingMode: MLShippingMode
  isFreteGratis: boolean
  error: boolean
  message?: string
}

// Amazon Types
export type AmazonLogisticMode = 'fbm' | 'fba' | 'dba'

export interface AmazonCalculationResult {
  price: number
  taxRate: number
  taxAmount: number
  revenuePostTax: number
  custoLogistico: number
  repasseLiquido: number
  lucroLiquido: number
  margemReal: number
  logisticMode: AmazonLogisticMode
  tierInfo: string
  error: boolean
  message?: string
}

