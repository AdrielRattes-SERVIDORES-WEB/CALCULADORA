export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
  subscription_status: "free" | "premium"
  stripe_customer_id?: string
  subscription_end_date?: string
  free_calculations_used: number
  free_calculations_reset_date: string
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
  stripe_subscription_id: string
  status: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}
