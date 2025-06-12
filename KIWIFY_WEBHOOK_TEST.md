# 🧪 TESTE COMPLETO - Webhook Kiwify

## 🎯 **OBJETIVO**
Verificar se o webhook está funcionando corretamente e diagnosticar problemas.

## 📋 **PRÉ-REQUISITOS**

### ✅ **Antes de testar:**
1. **Webhook configurado** na Kiwify
2. **Produto ativo** (R$ 5,90)
3. **Conta de teste** criada no seu site
4. **Logs do Supabase** abertos para monitoramento

## 🔍 **TESTE PASSO A PASSO**

### **PASSO 1: Preparar Ambiente**
```
1. Abrir Supabase Dashboard
2. Ir para: Edge Functions → kiwify-webhook → Logs
3. Deixar logs abertos em tempo real
4. Preparar conta de teste
```

### **PASSO 2: Criar Conta de Teste**
```
1. Ir para seu site
2. Criar conta com email: teste@seudominio.com
3. Confirmar que login funciona
4. Anotar email usado
```

### **PASSO 3: Iniciar Checkout**
```
1. Fazer login com conta de teste
2. Clicar "Seja Premium - R$ 5,90"
3. Verificar se redireciona para Kiwify
4. Confirmar URL: https://kiwify.app/fX3N0fp
```

### **PASSO 4: Simular Pagamento**
```
1. Na Kiwify, usar o MESMO EMAIL da conta de teste
2. Preencher dados de pagamento
3. Usar cartão de teste (se disponível)
4. Ou fazer pagamento real de valor baixo
```

### **PASSO 5: Monitorar Webhook**
```
1. Após pagamento, aguardar 1-2 minutos
2. Verificar logs do Supabase em tempo real
3. Procurar por mensagens do webhook
4. Anotar qualquer erro
```

## 📊 **LOGS ESPERADOS**

### **✅ Sucesso Completo:**
```
🔔 Webhook Kiwify recebido: {
  hasSignature: false,
  bodyLength: 1234,
  timestamp: "2024-01-01T10:00:00.000Z"
}

🎯 Processando evento Kiwify: order.paid
📊 Order ID: 12345
👤 Customer: teste@seudominio.com
💰 Amount: 590 BRL
📋 Payment Status: paid

💳 PAGAMENTO APROVADO NA KIWIFY: {
  orderId: "12345",
  customerEmail: "teste@seudominio.com",
  amount: 590,
  currency: "BRL"
}

👤 Usuário encontrado: abc123-def456-ghi789
✅ Premium ativado para usuário abc123-def456-ghi789
✅ Pagamento registrado no banco (R$ 5,90)
✅ Assinatura criada/atualizada (R$ 5,90)
🎉 PROCESSAMENTO CONCLUÍDO COM SUCESSO!
```

### **❌ Erros Comuns:**

#### **Webhook não recebido:**
```
(Nenhum log aparece)
```
**Causa:** Webhook não configurado na Kiwify
**Solução:** Configurar webhook

#### **Usuário não encontrado:**
```
❌ Usuário não encontrado no auth: teste@seudominio.com
```
**Causa:** Email diferente entre site e Kiwify
**Solução:** Usar mesmo email

#### **Pagamento não aprovado:**
```
❌ PAGAMENTO NÃO APROVADO. Status: pending
```
**Causa:** Pagamento ainda processando ou falhou
**Solução:** Aguardar ou verificar na Kiwify

## 🔧 **DIAGNÓSTICO DE PROBLEMAS**

### **Problema 1: Nenhum log aparece**
**Diagnóstico:**
- Webhook não está configurado na Kiwify
- URL do webhook incorreta
- Eventos não selecionados

**Verificar:**
1. Painel Kiwify → Webhooks
2. URL: `https://jnupyqszampirwyyvqlh.supabase.co/functions/v1/kiwify-webhook`
3. Eventos marcados
4. Produto associado

### **Problema 2: "Usuário não encontrado"**
**Diagnóstico:**
- Email usado na Kiwify ≠ Email do cadastro
- Usuário não existe no sistema
- Problema na busca por email

**Verificar:**
1. Email exato usado na Kiwify
2. Email exato da conta no site
3. Usuário existe no Supabase Auth

### **Problema 3: "Premium não ativado"**
**Diagnóstico:**
- Erro na atualização do banco
- Problema de permissões RLS
- Erro na lógica de ativação

**Verificar:**
1. Logs detalhados do erro
2. Permissões da tabela profiles
3. Status do usuário no banco

## 🛠️ **FERRAMENTAS DE DEBUG**

### **1. Verificar Usuário no Supabase**
```sql
-- Buscar usuário por email
SELECT * FROM auth.users WHERE email = 'teste@seudominio.com';

-- Verificar perfil
SELECT * FROM profiles WHERE id = 'user_id_aqui';

-- Verificar pagamentos
SELECT * FROM payments WHERE user_id = 'user_id_aqui';
```

### **2. Testar Webhook Manualmente**
Use ferramentas como Postman ou curl:

```bash
curl -X POST https://jnupyqszampirwyyvqlh.supabase.co/functions/v1/kiwify-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order.paid",
    "data": {
      "order": {
        "id": "test123",
        "status": "paid",
        "customer": {
          "email": "teste@seudominio.com",
          "name": "Teste"
        },
        "payment": {
          "amount": 590,
          "currency": "BRL",
          "status": "paid"
        }
      }
    }
  }'
```

### **3. Verificar Edge Function**
```
1. Supabase Dashboard → Edge Functions
2. Verificar se kiwify-webhook está deployada
3. Verificar logs de deploy
4. Testar function manualmente
```

## 📋 **CHECKLIST DE VERIFICAÇÃO**

### **Configuração Kiwify:**
- [ ] Webhook configurado
- [ ] URL correta
- [ ] Eventos selecionados
- [ ] Produto associado
- [ ] Produto ativo (R$ 5,90)

### **Configuração Site:**
- [ ] Conta de teste criada
- [ ] Email anotado
- [ ] Login funciona
- [ ] Botão redireciona para Kiwify

### **Teste de Pagamento:**
- [ ] Mesmo email usado
- [ ] Pagamento processado
- [ ] Logs monitorados
- [ ] Resultado documentado

### **Verificação Final:**
- [ ] Premium ativado no site
- [ ] Usuário vê "Premium Ativo"
- [ ] Recursos premium funcionam
- [ ] Pagamento registrado no banco

## 🎯 **PRÓXIMOS PASSOS**

### **Se teste passou:**
1. ✅ **Documentar configuração** que funcionou
2. ✅ **Testar com outros emails**
3. ✅ **Comunicar aos usuários**
4. ✅ **Monitorar pagamentos reais**

### **Se teste falhou:**
1. ❌ **Identificar erro específico**
2. ❌ **Seguir diagnóstico acima**
3. ❌ **Corrigir configuração**
4. ❌ **Repetir teste**

---

**⚡ IMPORTANTE:** Execute este teste ANTES de divulgar para usuários reais!

**📞 SUPORTE:** Se teste falhar, documente logs exatos e entre em contato com suporte Kiwify.