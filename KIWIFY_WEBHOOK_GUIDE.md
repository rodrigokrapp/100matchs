# 📋 GUIA COMPLETO - Configuração do Webhook Kiwify

## 🎯 **URL DO WEBHOOK**
```
https://[SEU_PROJETO_SUPABASE].supabase.co/functions/v1/kiwify-webhook
```

## 🔧 **PASSO A PASSO NA KIWIFY**

### **1. Acesse o Painel da Kiwify**
1. Faça login em [https://kiwify.app](https://kiwify.app)
2. Vá para o painel administrativo

### **2. Navegue até Webhooks**
1. Procure por **"Ferramentas"** ou **"Integrações"** no menu
2. Clique em **"Webhooks"** ou **"Notificações"**
3. Clique em **"Adicionar Webhook"** ou **"Novo Webhook"**

### **3. Configure o Webhook**

**Campos obrigatórios:**
- **URL:** `https://[SEU_PROJETO].supabase.co/functions/v1/kiwify-webhook`
- **Método:** POST
- **Produto:** Selecione seu "Plano Premium" (R$ 9,90)

**Eventos para marcar:**
- ✅ **Compra Aprovada** (ou similar)
- ✅ **Pagamento Aprovado** (ou similar)
- ✅ **Pedido Pago** (ou similar)
- ✅ **Reembolso** (opcional, para desativar Premium)
- ✅ **Cancelamento** (opcional, para desativar Premium)

### **4. Configurações Avançadas (se disponível)**
- **Content-Type:** `application/json`
- **Timeout:** 30 segundos
- **Retry:** Ativado (3 tentativas)

## 📊 **ESTRUTURA DO WEBHOOK**

### **Payload Esperado:**
```json
{
  "event": "order.paid",
  "data": {
    "order": {
      "id": "12345",
      "status": "paid",
      "customer": {
        "email": "cliente@email.com",
        "name": "Nome do Cliente"
      },
      "product": {
        "id": "produto_123",
        "name": "Plano Premium"
      },
      "payment": {
        "amount": 990,
        "currency": "BRL",
        "status": "paid"
      },
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:05:00Z"
    }
  }
}
```

### **Eventos Processados:**
- `order.paid` → Ativa Premium
- `order.approved` → Ativa Premium
- `payment.approved` → Ativa Premium
- `order.refunded` → Desativa Premium
- `order.cancelled` → Desativa Premium

## 🧪 **TESTE DO WEBHOOK**

### **1. Teste Manual (se disponível)**
1. Na configuração do webhook, procure por **"Testar"**
2. Envie um evento de teste
3. Verifique os logs no Supabase

### **2. Teste Real**
1. Faça uma compra de teste (valor baixo)
2. Use dados reais ou ambiente de teste
3. Monitore logs em tempo real

### **3. Verificar Logs**
**Supabase → Edge Functions → kiwify-webhook → Logs**

**Logs de sucesso:**
```
🔔 Webhook Kiwify recebido
💳 PAGAMENTO APROVADO NA KIWIFY
✅ Premium ativado para usuário
🎉 PROCESSAMENTO CONCLUÍDO COM SUCESSO
```

## 🚨 **SOLUÇÃO DE PROBLEMAS**

### **❌ Webhook não recebe eventos**
**Possíveis causas:**
- URL incorreta
- Eventos não selecionados
- Produto não associado

**Soluções:**
1. Verificar URL do webhook
2. Confirmar eventos marcados
3. Associar ao produto correto

### **❌ Usuário não encontrado**
**Causa:** Email do cliente não existe no sistema
**Solução:** Cliente deve criar conta primeiro

### **❌ Premium não ativado**
**Possíveis causas:**
- Status de pagamento incorreto
- Erro no processamento
- Problema no banco de dados

**Verificar:**
1. Logs do webhook
2. Status do pagamento na Kiwify
3. Dados do usuário no Supabase

## 🔐 **SEGURANÇA (OPCIONAL)**

### **Webhook Secret**
Se a Kiwify fornecer um secret para validação:

1. **Copie o secret** da configuração do webhook
2. **Adicione no Supabase:**
   - Project Settings → Edge Functions
   - Variável: `KIWIFY_WEBHOOK_SECRET`
   - Valor: `seu_secret_aqui`

### **Validação de IP (se disponível)**
Adicione os IPs da Kiwify na whitelist se necessário.

## 📋 **CHECKLIST DE CONFIGURAÇÃO**

- [ ] **Webhook criado** na Kiwify
- [ ] **URL correta** configurada
- [ ] **Eventos selecionados** (compra aprovada)
- [ ] **Produto associado** (Plano Premium)
- [ ] **Teste realizado** com sucesso
- [ ] **Logs verificados** no Supabase
- [ ] **Premium ativado** automaticamente

## 📞 **SUPORTE**

### **Documentação Kiwify**
- Consulte a documentação oficial da Kiwify
- Procure por "Webhooks" ou "Integrações"

### **Suporte Kiwify**
- Entre em contato com o suporte da Kiwify
- Forneça a URL do webhook se necessário

### **Informações para Suporte**
- **URL do Webhook:** `https://[SEU_PROJETO].supabase.co/functions/v1/kiwify-webhook`
- **Eventos necessários:** Compra/Pagamento aprovado
- **Produto:** Plano Premium (R$ 9,90)

## 🎯 **RESULTADO ESPERADO**

### **Fluxo completo funcionando:**
```
1. Cliente paga na Kiwify ✅
2. Kiwify envia webhook ✅
3. Sistema recebe e processa ✅
4. Premium ativado automaticamente ✅
5. Cliente tem acesso imediato ✅
```

---

**⚡ PRÓXIMO PASSO:** Configure o webhook na Kiwify AGORA para começar a receber pagamentos automaticamente!