import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

export const dynamic = "force-dynamic"

/**
 * Endpoint para auto-login após pagamento Cakto
 * Recebe email e token de setup, cria conta Supabase e retorna sessão
 */
export async function POST(request: NextRequest) {
    try {
        const { email, token } = await request.json()

        if (!email || !token) {
            return NextResponse.json(
                { error: "Email e token são obrigatórios" },
                { status: 400 }
            )
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !serviceRoleKey) {
            console.error("Supabase credentials missing")
            return NextResponse.json(
                { error: "Configuração do servidor incompleta" },
                { status: 500 }
            )
        }

        // Usar service role para operações administrativas
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // Verificar se o token é válido e não expirou
        const { data: userData, error: userError } = await supabaseAdmin
            .from("users")
            .select("id, setup_token, setup_token_expires, subscription_status")
            .eq("email", email)
            .eq("setup_token", token)
            .single()

        if (userError || !userData) {
            console.error("Token inválido ou usuário não encontrado:", userError)
            return NextResponse.json(
                { error: "Token inválido ou expirado" },
                { status: 401 }
            )
        }

        // Verificar se o token expirou
        if (userData.setup_token_expires && new Date(userData.setup_token_expires) < new Date()) {
            return NextResponse.json(
                { error: "Token expirado. Solicite um novo link de acesso." },
                { status: 401 }
            )
        }

        // Gerar senha temporária segura
        const temporaryPassword = crypto.randomBytes(32).toString("hex")

        // Verificar se usuário já tem conta no Supabase Auth
        const { data: existingAuthUser } = await supabaseAdmin.auth.admin.getUserById(userData.id)

        let authUserId: string

        if (existingAuthUser?.user) {
            // Usuário já existe, atualizar senha
            authUserId = existingAuthUser.user.id
            await supabaseAdmin.auth.admin.updateUserById(authUserId, {
                password: temporaryPassword
            })
        } else {
            // Criar novo usuário no Supabase Auth
            const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: email,
                password: temporaryPassword,
                email_confirm: true, // Auto-confirmar email
                user_metadata: {
                    subscription_status: userData.subscription_status
                }
            })

            if (authError || !newAuthUser.user) {
                console.error("Erro ao criar usuário no Supabase Auth:", authError)
                return NextResponse.json(
                    { error: "Erro ao criar conta de acesso" },
                    { status: 500 }
                )
            }

            authUserId = newAuthUser.user.id

            // Atualizar o ID do usuário na tabela users
            await supabaseAdmin
                .from("users")
                .update({ id: authUserId })
                .eq("email", email)
        }

        // Limpar token de setup (já foi usado)
        await supabaseAdmin
            .from("users")
            .update({
                setup_token: null,
                setup_token_expires: null
            })
            .eq("email", email)

        // Criar sessão para o usuário
        const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email
        })

        if (sessionError || !sessionData) {
            console.error("Erro ao gerar link de sessão:", sessionError)
            return NextResponse.json(
                { error: "Erro ao criar sessão" },
                { status: 500 }
            )
        }

        // Fazer login com a senha temporária
        const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
        const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: temporaryPassword
        })

        if (signInError || !signInData.session) {
            console.error("Erro ao fazer login:", signInError)
            return NextResponse.json(
                { error: "Erro ao criar sessão de login" },
                { status: 500 }
            )
        }

        console.log(`✅ Auto-login realizado com sucesso para ${email}`)

        return NextResponse.json({
            success: true,
            session: signInData.session,
            user: signInData.user
        })

    } catch (error) {
        console.error("Erro no auto-login:", error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
