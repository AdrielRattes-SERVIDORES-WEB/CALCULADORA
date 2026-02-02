import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseServiceKey) {
        return NextResponse.json(
            { error: 'SUPABASE_SERVICE_ROLE_KEY não configurada' },
            { status: 500 }
        )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    const { email, password } = await request.json()

    if (!email || !password) {
        return NextResponse.json(
            { error: 'Email e senha são obrigatórios' },
            { status: 400 }
        )
    }

    try {
        // 1. Verificar se usuário já existe
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === email)

        let userId: string

        if (existingUser) {
            // Atualizar senha do usuário existente
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                existingUser.id,
                { password }
            )

            if (updateError) {
                return NextResponse.json(
                    { error: `Erro ao atualizar usuário: ${updateError.message}` },
                    { status: 500 }
                )
            }

            userId = existingUser.id
            console.log('✅ Senha atualizada para usuário existente:', email)
        } else {
            // Criar novo usuário
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true
            })

            if (authError) {
                return NextResponse.json(
                    { error: `Erro ao criar usuário: ${authError.message}` },
                    { status: 500 }
                )
            }

            userId = authData.user!.id
            console.log('✅ Novo usuário criado:', email)
        }

        // 2. Criar/Atualizar na tabela users como premium
        const { error: dbError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                email,
                subscription_status: 'premium',
                subscription_end: new Date('2099-12-31').toISOString(),
                free_calculations_used: 0,
                free_calculations_reset_date: new Date().toISOString().split('T')[0]
            })

        if (dbError) {
            console.error('Erro ao criar na tabela users:', dbError)
            // Não retorna erro, pois o usuário auth foi criado
        }

        return NextResponse.json({
            success: true,
            message: `Usuário ${email} criado/atualizado com sucesso como premium!`,
            userId
        })

    } catch (error: any) {
        console.error('Erro:', error)
        return NextResponse.json(
            { error: error.message || 'Erro interno' },
            { status: 500 }
        )
    }
}
