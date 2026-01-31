import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { CaktoWebhookPayload } from "@/lib/cakto"
import { getCaktoWebhookSecret, validateCaktoWebhook } from "@/lib/cakto"
import crypto from "crypto"

export const dynamic = "force-dynamic"

// URL base do app para gerar link de setup
const getAppUrl = () => {
    return process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"
}

// Gera token único para setup de senha
const generateSetupToken = () => {
    return crypto.randomBytes(32).toString("hex")
}

/**
 * Webhook handler para eventos da Cakto
 * Configure este endpoint no painel da Cakto: Apps > Webhooks
 * URL: https://seu-dominio.com/api/webhook/cakto
 */
export async function POST(request: NextRequest) {
    try {
        // Validar assinatura do webhook (se configurado)
        const webhookSecret = getCaktoWebhookSecret()
        const signature = request.headers.get("x-cakto-signature") ||
            request.headers.get("x-webhook-secret") ||
            request.headers.get("authorization")

        if (webhookSecret && !validateCaktoWebhook(signature, webhookSecret)) {
            console.error("Webhook com assinatura inválida rejeitado")
            return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
        }

        const payload: CaktoWebhookPayload = await request.json()
        console.log("Webhook Cakto recebido:", payload.event, payload.customer?.email)

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !serviceRoleKey) {
            console.error("Supabase credentials missing for webhook")
            return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 })
        }

        // Usar service role para operações administrativas
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        const customerEmail = payload.customer?.email

        if (!customerEmail) {
            console.error("Webhook sem email do cliente")
            return NextResponse.json({ error: "Email não encontrado" }, { status: 400 })
        }

        switch (payload.event) {
            case "purchase_approved":
            case "subscription_renewed":
                await handleSubscriptionActivated(supabaseAdmin, customerEmail, payload)
                break

            case "subscription_cancelled":
            case "purchase_refunded":
                await handleSubscriptionCancelled(supabaseAdmin, customerEmail, payload)
                break

            case "purchase_chargeback":
                // Em caso de chargeback, cancelar imediatamente
                await handleSubscriptionCancelled(supabaseAdmin, customerEmail, payload)
                console.warn("CHARGEBACK recebido para:", customerEmail)
                break

            default:
                console.log(`Evento não tratado: ${payload.event}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error("Erro ao processar webhook Cakto:", error)
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
    }
}

async function handleSubscriptionActivated(
    supabase: ReturnType<typeof createClient>,
    email: string,
    payload: CaktoWebhookPayload
) {
    // Calcular data de expiração (30 dias a partir de agora ou próxima cobrança)
    let subscriptionEndDate: string

    if (payload.subscription?.next_billing_date) {
        subscriptionEndDate = new Date(payload.subscription.next_billing_date).toISOString()
    } else {
        // Padrão: 30 dias a partir de agora
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 30)
        subscriptionEndDate = endDate.toISOString()
    }

    // Gerar token de setup de senha (expira em 24h)
    const setupToken = generateSetupToken()
    const setupTokenExpires = new Date()
    setupTokenExpires.setHours(setupTokenExpires.getHours() + 24)

    // Verificar se usuário já existe
    const { data: existingUser } = await supabase
        .from("users")
        .select("id, subscription_status")
        .eq("email", email)
        .single()

    if (existingUser) {
        // Atualizar usuário existente para premium
        const { error: updateError } = await supabase
            .from("users")
            .update({
                subscription_status: "premium",
                subscription_end_date: subscriptionEndDate,
                cakto_subscription_id: payload.subscription?.id || payload.order?.id,
                cakto_customer_name: payload.customer?.name,
                cakto_customer_phone: payload.customer?.phone,
            })
            .eq("email", email)

        if (updateError) {
            console.error("Erro ao atualizar usuário:", updateError)
            throw updateError
        }

        console.log(`✅ Usuário existente ${email} atualizado para premium`)
    } else {
        // Criar novo usuário pré-cadastrado (sem auth ainda)
        const { error: insertError } = await supabase
            .from("users")
            .insert({
                id: crypto.randomUUID(), // ID temporário até criar auth
                email: email,
                subscription_status: "premium",
                subscription_end_date: subscriptionEndDate,
                cakto_subscription_id: payload.subscription?.id || payload.order?.id,
                cakto_customer_name: payload.customer?.name,
                cakto_customer_phone: payload.customer?.phone,
                setup_token: setupToken,
                setup_token_expires: setupTokenExpires.toISOString(),
                free_calculations_used: 0,
                free_calculations_reset_date: new Date().toISOString()
            })

        if (insertError) {
            console.error("Erro ao criar usuário:", insertError)
            throw insertError
        }

        // URL para setup de senha
        const appUrl = getAppUrl()
        const setupUrl = `${appUrl}/setup-password?token=${setupToken}&email=${encodeURIComponent(email)}`

        console.log(`✅ Novo usuário ${email} criado`)
        console.log(`🔗 Link de setup: ${setupUrl}`)

        // TODO: Integrar com serviço de email para enviar o link automaticamente
        // Por agora, o link aparece nos logs e na página de sucesso da Cakto
    }

    // Criar ou atualizar registro de subscription
    if (payload.subscription?.id) {
        const userId = existingUser?.id || (await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single()
        ).data?.id

        if (userId) {
            await supabase
                .from("subscriptions")
                .upsert({
                    user_id: userId,
                    cakto_subscription_id: payload.subscription.id,
                    status: "active",
                    current_period_start: new Date().toISOString(),
                    current_period_end: subscriptionEndDate,
                }, {
                    onConflict: "cakto_subscription_id"
                })
        }
    }

    console.log(`✅ Assinatura ativada para ${email} até ${subscriptionEndDate}`)
}

async function handleSubscriptionCancelled(
    supabase: ReturnType<typeof createClient>,
    email: string,
    payload: CaktoWebhookPayload
) {
    // Manter acesso até o fim do período pago, mas marcar como cancelando
    // Se for reembolso/chargeback, cancelar imediatamente
    const immediateCancel = payload.event === "purchase_refunded" || payload.event === "purchase_chargeback"

    const { error: userError } = await supabase
        .from("users")
        .update({
            subscription_status: immediateCancel ? "free" : "premium",
            // Se cancelamento imediato, limpa a data. Caso contrário, mantém até expirar
            ...(immediateCancel && { subscription_end_date: null, cakto_subscription_id: null }),
        })
        .eq("email", email)

    if (userError) {
        console.error("Erro ao cancelar assinatura:", userError)
        throw userError
    }

    // Atualizar status da subscription
    if (payload.subscription?.id) {
        await supabase
            .from("subscriptions")
            .update({
                status: immediateCancel ? "cancelled" : "cancelling",
            })
            .eq("cakto_subscription_id", payload.subscription.id)
    }

    console.log(`❌ Assinatura ${immediateCancel ? "cancelada" : "marcada para cancelamento"} para ${email}`)
}
