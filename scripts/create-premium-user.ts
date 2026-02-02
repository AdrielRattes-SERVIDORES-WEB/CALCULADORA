// Script para criar usuário premium no Supabase
// Execute com: npx ts-node scripts/create-premium-user.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jrnvehptmgmoonafbacg.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não definida!')
    console.log('Por favor, adicione SUPABASE_SERVICE_ROLE_KEY no .env.local')
    console.log('Você encontra essa chave no Supabase Dashboard > Settings > API > service_role key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createPremiumUser() {
    const email = 'adrielrattes@gmail.com'
    const password = '12345678'

    console.log('🔄 Criando usuário premium...')

    try {
        // 1. Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        })

        if (authError) {
            if (authError.message.includes('already been registered')) {
                console.log('⚠️ Usuário já existe no Auth, atualizando...')

                // Buscar usuário existente
                const { data: users } = await supabase.auth.admin.listUsers()
                const existingUser = users?.users?.find(u => u.email === email)

                if (existingUser) {
                    // Atualizar senha
                    await supabase.auth.admin.updateUserById(existingUser.id, {
                        password
                    })
                    console.log('✅ Senha atualizada!')

                    // Atualizar na tabela users
                    await supabase
                        .from('users')
                        .upsert({
                            id: existingUser.id,
                            email,
                            subscription_status: 'premium',
                            subscription_end: new Date('2099-12-31').toISOString()
                        })

                    console.log('✅ Usuário atualizado como premium!')
                    return
                }
            }
            throw authError
        }

        // 2. Criar entrada na tabela users
        if (authData.user) {
            const { error: dbError } = await supabase
                .from('users')
                .upsert({
                    id: authData.user.id,
                    email,
                    subscription_status: 'premium',
                    subscription_end: new Date('2099-12-31').toISOString()
                })

            if (dbError) {
                console.error('❌ Erro ao criar na tabela users:', dbError)
            } else {
                console.log('✅ Usuário criado com sucesso!')
            }
        }

        console.log('📧 Email:', email)
        console.log('🔑 Senha:', password)
        console.log('👑 Status: Premium')

    } catch (error) {
        console.error('❌ Erro:', error)
    }
}

createPremiumUser()
