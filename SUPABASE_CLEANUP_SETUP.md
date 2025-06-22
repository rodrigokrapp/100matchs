# 🧹 SUPABASE AUTO CLEANUP SYSTEM

Sistema de limpeza automática para mensagens de chat e arquivos antigos no Supabase.

## 📋 FUNCIONALIDADES

✅ **Limpeza de mensagens antigas** (mais de 5 minutos)
✅ **Remoção de arquivos do Storage** associados às mensagens
✅ **Limpeza de usuários online** antigos (mais de 10 minutos)
✅ **Remoção de salas personalizadas** antigas (mais de 1 hora)
✅ **Limpeza de arquivos órfãos** no Storage
✅ **Execução automática a cada 5 minutos**

## 🚀 SETUP COMPLETO

### 1. Deploy da Edge Function

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Fazer deploy da função
supabase functions deploy cleanup-chat
```

### 2. Configurar Variáveis de Ambiente

No painel do Supabase, vá em **Settings > Edge Functions** e adicione:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key
```

### 3. Configurar Cron Job (Opção 1 - SQL)

Execute no **SQL Editor** do Supabase:

```sql
-- Instalar extensão pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Criar cron job para limpeza automática
SELECT cron.schedule(
  'cleanup-chat-messages',
  '*/5 * * * *',
  $$
  DELETE FROM chat_messages WHERE created_at < NOW() - INTERVAL '5 minutes';
  DELETE FROM mensagens WHERE created_at < NOW() - INTERVAL '5 minutes';
  DELETE FROM usuarios_online WHERE last_seen < NOW() - INTERVAL '10 minutes';
  DELETE FROM salas_personalizadas WHERE created_at < NOW() - INTERVAL '1 hour';
  $$
);
```

### 4. Configurar Webhook (Opção 2 - Edge Function)

Crie um webhook no Supabase que chama a Edge Function:

```sql
-- Função para chamar Edge Function
CREATE OR REPLACE FUNCTION trigger_cleanup_edge_function()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://seu-projeto.supabase.co/functions/v1/cleanup-chat',
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer seu-service-role-key'
    ),
    body := json_build_object('source', 'cron_job')::text
  );
END;
$$;

-- Agendar execução
SELECT cron.schedule(
  'cleanup-chat-storage',
  '*/5 * * * *',
  'SELECT trigger_cleanup_edge_function();'
);
```

### 5. Configurar Storage Bucket

Crie um bucket chamado `chat-uploads` no Supabase Storage:

1. Vá em **Storage** no painel do Supabase
2. Clique em **New bucket**
3. Nome: `chat-uploads`
4. Público: **Habilitado**

### 6. Configurar Políticas RLS

```sql
-- Política para permitir leitura/escrita no bucket
CREATE POLICY "Public Access" ON storage.objects
FOR ALL USING (bucket_id = 'chat-uploads');

-- Política para permitir upload
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat-uploads');

-- Política para permitir delete (para limpeza)
CREATE POLICY "Allow delete" ON storage.objects
FOR DELETE USING (bucket_id = 'chat-uploads');
```

## 🎛️ CONFIGURAÇÕES CUSTOMIZÁVEIS

### Alterar Intervalo de Limpeza

Para alterar o intervalo de limpeza, edite o cron:

```sql
-- Alterar para 10 minutos
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-chat-messages'),
  schedule := '*/10 * * * *'
);
```

### Alterar Tempo de Retenção

Na Edge Function, altere a linha:

```typescript
// De 5 para 10 minutos de retenção
const cincoMinutosAtras = new Date(Date.now() - 10 * 60 * 1000).toISOString()
```

## 📊 MONITORAMENTO

### Verificar Jobs Ativos

```sql
-- Listar cron jobs
SELECT * FROM cron.job WHERE jobname LIKE 'cleanup-chat%';

-- Ver execuções recentes
SELECT * FROM cron.job_run_details 
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname LIKE 'cleanup-chat%')
ORDER BY start_time DESC LIMIT 10;
```

### Testar Edge Function Manualmente

```bash
# Testar via curl
curl -X POST https://seu-projeto.supabase.co/functions/v1/cleanup-chat \
  -H "Authorization: Bearer seu-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Logs da Edge Function

```bash
# Ver logs em tempo real
supabase functions logs cleanup-chat

# Ver logs específicos
supabase functions logs cleanup-chat --filter="cleanup"
```

## 🔧 TROUBLESHOOTING

### Problema: Cron job não executa

```sql
-- Verificar se pg_cron está instalado
SELECT name, default_version, installed_version 
FROM pg_available_extensions 
WHERE name = 'pg_cron';

-- Verificar configuração do cron
SHOW cron.database_name;
```

### Problema: Edge Function falha

1. Verificar logs: `supabase functions logs cleanup-chat`
2. Verificar variáveis de ambiente
3. Verificar permissões do service role key

### Problema: Arquivos não são deletados

1. Verificar se o bucket `chat-uploads` existe
2. Verificar políticas RLS do Storage
3. Verificar se os nomes dos arquivos estão corretos

## 📈 MÉTRICAS

A Edge Function retorna estatísticas:

```json
{
  "success": true,
  "timestamp": "2024-01-01T12:00:00Z",
  "stats": {
    "mensagens_deletadas": 150,
    "arquivos_deletados": 25,
    "usuarios_online_limpos": 10,
    "salas_limpas": 5
  }
}
```

## 🛡️ SEGURANÇA

- ✅ Usa Service Role Key para máximas permissões
- ✅ Políticas RLS configuradas corretamente
- ✅ Logs detalhados para auditoria
- ✅ Tratamento de erros robusto

## 🚨 IMPORTANTE

⚠️ **BACKUP**: Antes de ativar, faça backup dos dados importantes!
⚠️ **TESTE**: Teste primeiro em ambiente de desenvolvimento!
⚠️ **MONITORAMENTO**: Monitore logs nas primeiras execuções!

---

## 📞 SUPORTE

Se tiver problemas:
1. Verifique os logs da Edge Function
2. Verifique os logs do cron job
3. Teste manualmente a Edge Function
4. Verifique as configurações de Storage 