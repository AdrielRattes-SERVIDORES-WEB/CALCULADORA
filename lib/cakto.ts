// Cakto API Integration
// Documentation: https://docs.cakto.com.br

const CAKTO_API_URL = "https://api.cakto.com.br"
const TOKEN_ENDPOINT = "/public_api/token/"

interface CaktoTokenResponse {
    access_token: string
    expires_in: number
    token_type: string
    scope: string
}

interface CaktoToken {
    token: string
    expiresAt: number
}

let cachedToken: CaktoToken | null = null

/**
 * Obtém credenciais da Cakto das variáveis de ambiente
 */
function getCaktoCredentials() {
    const clientId = process.env.CAKTO_CLIENT_ID
    const clientSecret = process.env.CAKTO_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        throw new Error("Credenciais da Cakto não configuradas. Verifique CAKTO_CLIENT_ID e CAKTO_CLIENT_SECRET")
    }

    return { clientId, clientSecret }
}

/**
 * Obtém token de acesso via OAuth2
 * Implementa cache automático do token
 */
export async function getCaktoToken(): Promise<string> {
    // Verificar se o token em cache ainda é válido (com margem de 5 minutos)
    if (cachedToken && Date.now() < cachedToken.expiresAt - 300000) {
        return cachedToken.token
    }

    const { clientId, clientSecret } = getCaktoCredentials()

    const response = await fetch(`${CAKTO_API_URL}${TOKEN_ENDPOINT}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
        }),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        console.error("Erro ao obter token Cakto:", error)
        throw new Error("Falha na autenticação com a Cakto")
    }

    const data: CaktoTokenResponse = await response.json()

    // Cachear o token
    cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + data.expires_in * 1000,
    }

    return data.access_token
}

/**
 * Retorna a URL do checkout da Cakto
 */
export function getCaktoCheckoutUrl(): string {
    const url = process.env.CAKTO_CHECKOUT_URL
    if (!url) {
        throw new Error("CAKTO_CHECKOUT_URL não configurada")
    }
    return url
}

/**
 * Faz uma requisição autenticada para a API da Cakto
 */
export async function caktoApiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getCaktoToken()

    const response = await fetch(`${CAKTO_API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            ...options.headers,
        },
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        console.error(`Erro na API Cakto [${endpoint}]:`, error)
        throw new Error(`Erro na API Cakto: ${response.status}`)
    }

    return response.json()
}

/**
 * Tipos de eventos de webhook da Cakto
 */
export type CaktoWebhookEvent =
    | "purchase_approved"
    | "purchase_refunded"
    | "purchase_chargeback"
    | "subscription_cancelled"
    | "subscription_renewed"
    | "purchase_declined"
    | "pix_generated"
    | "boleto_generated"
    | "checkout_abandoned"

/**
 * Obtém o webhook secret para validação
 */
export function getCaktoWebhookSecret(): string {
    const secret = process.env.CAKTO_WEBHOOK_SECRET
    if (!secret) {
        console.warn("CAKTO_WEBHOOK_SECRET não configurado - webhooks não serão validados")
        return ""
    }
    return secret
}

/**
 * Valida a assinatura do webhook da Cakto
 * Retorna true se válido ou se não há secret configurado (modo permissivo)
 */
export function validateCaktoWebhook(signature: string | null, secret: string): boolean {
    if (!secret) {
        // Modo permissivo se não há secret configurado
        return true
    }

    if (!signature) {
        console.warn("Webhook recebido sem assinatura")
        return false
    }

    // Cakto pode usar diferentes métodos de validação
    // Verificar se a assinatura corresponde ao secret
    return signature === secret
}

export interface CaktoWebhookPayload {
    event: CaktoWebhookEvent
    customer: {
        email: string
        name?: string
        phone?: string
        document?: string
    }
    product?: {
        id: string
        name: string
        type?: "one_time" | "subscription"
    }
    offer?: {
        id: string
        name: string
    }
    subscription?: {
        id: string
        status: string
        next_billing_date?: string
    }
    order?: {
        id: string
        status: string
        payment_method?: string
        amount?: number
    }
    created_at?: string
}
