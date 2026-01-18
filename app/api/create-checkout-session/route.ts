import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    // Verificar se a variável de ambiente está configurada
    const checkoutUrl = process.env.CAKTO_CHECKOUT_URL

    if (!checkoutUrl) {
      console.error("ERRO: CAKTO_CHECKOUT_URL não está configurada no .env.local")
      return NextResponse.json({
        error: "Pagamento não configurado. Verifique CAKTO_CHECKOUT_URL no .env.local"
      }, { status: 500 })
    }

    console.log("Checkout URL configurada:", checkoutUrl)

    // Adicionar email como parâmetro para pré-preencher no checkout
    const url = new URL(checkoutUrl)
    url.searchParams.set("email", email)

    console.log("Redirecionando para:", url.toString())

    return NextResponse.json({ url: url.toString() })
  } catch (error: any) {
    console.error("Erro ao criar sessão de checkout:", error)
    return NextResponse.json({
      error: error.message || "Erro interno do servidor"
    }, { status: 500 })
  }
}
