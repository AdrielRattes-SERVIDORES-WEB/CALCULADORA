-- =====================================================
-- MIGRATION: Adicionar campos Cakto ao banco de dados
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Adicionar coluna cakto_subscription_id na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cakto_subscription_id TEXT;

-- 2. Remover coluna stripe_customer_id (opcional - pode manter para histórico)
-- ALTER TABLE users DROP COLUMN IF EXISTS stripe_customer_id;

-- 3. Atualizar tabela subscriptions para usar cakto_subscription_id
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS cakto_subscription_id TEXT;

-- 4. Criar constraint única para cakto_subscription_id (para upsert)
ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_cakto_subscription_id_unique 
UNIQUE (cakto_subscription_id);

-- 5. Migrar dados de stripe_subscription_id para cakto_subscription_id (se necessário)
-- UPDATE subscriptions SET cakto_subscription_id = stripe_subscription_id;

-- 6. (Opcional) Remover coluna stripe_subscription_id após migração
-- ALTER TABLE subscriptions DROP COLUMN IF EXISTS stripe_subscription_id;
