import { type NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { getSupabaseServer } from "@/lib/supabase-server"
import type Stripe from "stripe"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("Erro na verificação do webhook:", error)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userEmail = session.metadata?.user_email
  if (!userEmail) return

  const stripe = getStripe()
  const supabaseServer = getSupabaseServer()

  // Buscar subscription no Stripe
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

  // Atualizar usuário
  await supabaseServer
    .from("users")
    .update({
      subscription_status: "premium",
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq("email", userEmail)

  // Criar registro de subscription
  await supabaseServer.from("subscriptions").insert({
    user_id: (await supabaseServer.from("users").select("id").eq("email", userEmail).single()).data?.id,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  })
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const stripe = getStripe()
  const supabaseServer = getSupabaseServer()

  const customer = await stripe.customers.retrieve(subscription.customer as string)

  if ("email" in customer && customer.email) {
    const status = subscription.status === "active" ? "premium" : "free"

    await supabaseServer
      .from("users")
      .update({
        subscription_status: status,
        subscription_end_date:
          subscription.status === "active" ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      })
      .eq("email", customer.email)

    // Atualizar subscription
    await supabaseServer
      .from("subscriptions")
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id)
  }
}
