import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
    try {
        const { email, password, token } = await request.json()

        if (!email || !password || !token) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !serviceRoleKey) {
            console.error("Supabase credentials missing")
            return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 })
        }

        // Usar service role para operações administrativas
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // 1. Validar token novamente
        const { data: userData, error: userError } = await supabaseAdmin
            .from("users")
            .select("id, setup_token, setup_token_expires")
            .eq("email", email)
            .eq("setup_token", token)
            .single()

        if (userError || !userData) {
            return NextResponse.json({ error: "Token inválido" }, { status: 400 })
        }

        // 2. Verificar expiração
        if (userData.setup_token_expires) {
            const expiresAt = new Date(userData.setup_token_expires)
            if (expiresAt < new Date()) {
                return NextResponse.json({ error: "Token expirado" }, { status: 400 })
            }
        }

        // 3. Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Já confirmado pois pagou
            user_metadata: { source: "cakto" }
        })

        if (authError) {
            // Se o usuário já existe no auth, atualizar a senha
            if (authError.message?.includes("already been registered")) {
                const { data: users } = await supabaseAdmin.auth.admin.listUsers()
                const existingUser = users.users?.find(u => u.email === email)

                if (existingUser) {
                    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                        existingUser.id,
                        { password, email_confirm: true }
                    )

                    if (updateError) {
                        console.error("Erro ao atualizar senha:", updateError)
                        return NextResponse.json({ error: "Erro ao configurar senha" }, { status: 500 })
                    }
                }
            } else {
                console.error("Erro ao criar usuário auth:", authError)
                return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 })
            }
        }

        // 4. Limpar token de setup e atualizar ID do auth
        const authUserId = authData?.user?.id

        const updateData: any = {
            setup_token: null,
            setup_token_expires: null
        }

        // Se criou novo usuário no auth, atualizar o ID na tabela users
        if (authUserId && authUserId !== userData.id) {
            updateData.id = authUserId
        }

        await supabaseAdmin
            .from("users")
            .update(updateData)
            .eq("email", email)

        console.log(`✅ Senha configurada para ${email}`)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Erro ao configurar senha:", error)
        return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
    }
}
