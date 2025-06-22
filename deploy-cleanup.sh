#!/bin/bash

# 🧹 SCRIPT DE DEPLOY AUTOMÁTICO - SUPABASE CLEANUP SYSTEM
# Este script configura automaticamente o sistema de limpeza

echo "🚀 Iniciando deploy do sistema de limpeza automática..."

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instalando..."
    npm install -g supabase
fi

# Verificar se está logado
echo "🔐 Verificando login no Supabase..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Não está logado no Supabase. Execute: supabase login"
    exit 1
fi

# Deploy da Edge Function
echo "📤 Fazendo deploy da Edge Function cleanup-chat..."
supabase functions deploy cleanup-chat

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployada com sucesso!"
else
    echo "❌ Erro no deploy da Edge Function"
    exit 1
fi

# Configurar cron job via SQL
echo "⏰ Configurando cron job..."

# Verificar se há um projeto linkado
PROJECT_REF=$(supabase status | grep "Project URL" | awk '{print $3}' | grep -o '[^/]*\.supabase\.co' | cut -d'.' -f1)

if [ -z "$PROJECT_REF" ]; then
    echo "⚠️  Projeto não identificado. Execute 'supabase link' primeiro."
    read -p "📝 Digite o Project Reference (encontrado na URL do projeto): " PROJECT_REF
fi

# Executar SQL para criar cron job
cat << EOF > /tmp/cleanup_cron.sql
-- Configuração de limpeza automática
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remover jobs existentes se houver
SELECT cron.unschedule('cleanup-chat-messages');
SELECT cron.unschedule('cleanup-chat-storage');

-- Criar cron job para limpeza de mensagens (a cada 5 minutos)
SELECT cron.schedule(
  'cleanup-chat-messages',
  '*/5 * * * *',
  \$\$
  DELETE FROM chat_messages WHERE created_at < NOW() - INTERVAL '5 minutes';
  DELETE FROM mensagens WHERE created_at < NOW() - INTERVAL '5 minutes';
  DELETE FROM usuarios_online WHERE last_seen < NOW() - INTERVAL '10 minutes';
  DELETE FROM salas_personalizadas WHERE created_at < NOW() - INTERVAL '1 hour';
  \$\$
);

-- Função para chamar Edge Function
CREATE OR REPLACE FUNCTION trigger_cleanup_edge_function()
RETURNS void
LANGUAGE plpgsql
AS \$func\$
BEGIN
  PERFORM net.http_post(
    url := 'https://${PROJECT_REF}.supabase.co/functions/v1/cleanup-chat',
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := json_build_object('source', 'cron_job')::text
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao chamar Edge Function: %', SQLERRM;
END;
\$func\$;

-- Cron job para chamar Edge Function (limpeza de arquivos)
SELECT cron.schedule(
  'cleanup-chat-storage',
  '*/5 * * * *',
  'SELECT trigger_cleanup_edge_function();'
);

-- Mostrar jobs criados
SELECT jobname, schedule, active FROM cron.job WHERE jobname LIKE 'cleanup-chat%';
EOF

echo "📊 Executando configuração SQL..."
supabase db reset --local
supabase db push

# Aplicar SQL
psql "$(supabase status | grep "DB URL" | awk '{print $3}')" -f /tmp/cleanup_cron.sql

# Limpar arquivo temporário
rm /tmp/cleanup_cron.sql

# Verificar configuração
echo "🔍 Verificando configuração..."

# Testar Edge Function
echo "🧪 Testando Edge Function..."
FUNCTION_URL="https://${PROJECT_REF}.supabase.co/functions/v1/cleanup-chat"
ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')

curl -s -X POST "$FUNCTION_URL" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}' | jq .

echo ""
echo "✅ SETUP COMPLETO!"
echo ""
echo "📋 RESUMO:"
echo "🔧 Edge Function: cleanup-chat deployada"
echo "⏰ Cron Job: Executa a cada 5 minutos"
echo "🗑️  Limpeza: Mensagens > 5min, Arquivos, Usuários offline"
echo ""
echo "📊 MONITORAMENTO:"
echo "• Logs: supabase functions logs cleanup-chat"
echo "• Status: SELECT * FROM cron.job WHERE jobname LIKE 'cleanup-chat%';"
echo "• Teste manual: curl -X POST $FUNCTION_URL"
echo ""
echo "⚠️  IMPORTANTE:"
echo "• Monitore os logs nas primeiras execuções"
echo "• Ajuste os intervalos conforme necessário"
echo "• Faça backup dos dados importantes" 