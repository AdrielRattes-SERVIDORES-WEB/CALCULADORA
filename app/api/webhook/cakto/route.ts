import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"
import type { CaktoWebhookPayload } from "@/lib/cakto"

export const dynamic = "force-dynamic"

/**
 * Webhook handler para eventos da Cakto
 * Configure este endpoint no painel da Cakto: Apps > Webhooks
 * URL: https://seu-dominio.com/api/webhook/cakto
 */
export async function POST(request: NextRequest) {
    try {
        const payload: CaktoWebhookPayload = await request.json()

        console.log("Webhook Cakto recebido:", payload.event, payload.customer?.email)

        const supabaseServer = getSupabaseServer()
        const customerEmail = payload.customer?.email

        if (!customerEmail) {
            console.error("Webhook sem email do cliente")
            return NextResponse.json({ error: "Email não encontrado" }, { status: 400 })
        }

        switch (payload.event) {
            case "purchase_approved":
            case "subscription_renewed":
                await handleSubscriptionActivated(supabaseServer, customerEmail, payload)
                break

            case "subscription_cancelled":
            case "purchase_refunded":
                await handleSubscriptionCancelled(supabaseServer, customerEmail, payload)
                break

            case "purchase_chargeback":
                // Em caso de chargeback, cancelar imediatamente
                await handleSubscriptionCancelled(supabaseServer, customerEmail, payload)
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
    supabase: ReturnType<typeof getSupabaseServer>,
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

    // Atualizar status do usuário para premium
    const { error: userError } = await supabase
        .from("users")
        .update({
            subscription_status: "premium",
            subscription_end_date: subscriptionEndDate,
            cakto_subscription_id: payload.subscription?.id || payload.order?.id,
        })
        .eq("email", email)

    if (userError) {
        console.error("Erro ao atualizar usuário:", userError)
        throw userError
    }

    // Buscar ID do usuário
    const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single()

    if (userData?.id && payload.subscription?.id) {
        // Criar ou atualizar registro de subscription
        await supabase
            .from("subscriptions")
            .upsert({
                user_id: userData.id,
                cakto_subscription_id: payload.subscription.id,
                status: "active",
                current_period_start: new Date().toISOString(),
                current_period_end: subscriptionEndDate,
            }, {
                onConflict: "cakto_subscription_id"
            })
    }

    console.log(`✅ Assinatura ativada para ${email} até ${subscriptionEndDate}`)
}

async function handleSubscriptionCancelled(
    supabase: ReturnType<typeof getSupabaseServer>,
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
