# 🔧 CONFIGURAÇÃO COMPLETA DOS WEBHOOKS STRIPE

## 🎯 URL DO WEBHOOK
```
https://[SEU_PROJETO_SUPABASE].supabase.co/functions/v1/stripe-webhook
```

## ⚡ PASSO A PASSO PARA CONFIGURAR

### 1. Acesse o Stripe Dashboard
1. Vá para [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Faça login na sua conta
3. Navegue para **Developers → Webhooks**

### 2. Criar Novo Webhook
1. Clique em **"Add endpoint"**
2. **Endpoint URL:** `https://[SEU_PROJETO].supabase.co/functions/v1/stripe-webhook`
3. **Description:** `Resenha Sem Match - Premium Payments`

### 3. Selecionar Eventos (CRÍTICO)
Marque EXATAMENTE estes eventos:

#### ✅ Eventos de Pagamento (OBRIGATÓRIOS)
- `checkout.session.completed` - Quando checkout é finalizado
- `charge.succeeded` - Quando cobrança é bem-sucedida
- `payment_intent.succeeded` - Quando pagamento é confirmado

#### ✅ Eventos de Assinatura (OBRIGATÓRIOS)
- `invoice.payment_succeeded` - Renovação bem-sucedida
- `invoice.payment_failed` - Falha na renovação
- `customer.subscription.created` - Assinatura criada
- `customer.subscription.updated` - Assinatura atualizada
- `customer.subscription.deleted` - Assinatura cancelada

#### ✅ Eventos de Transferência (CRÍTICOS PARA RECEBER DINHEIRO)
- `transfer.created` - Transferência criada
- `payout.created` - Payout criado
- `payout.paid` - Payout pago (dinheiro na conta)
- `payout.failed` - Falha no payout

### 4. Configurar Webhook
1. Clique em **"Add endpoint"**
2. **Copie o Webhook Secret** que aparece (começa com `whsec_`)
3. Guarde este secret - você vai precisar dele

### 5. Configurar Payouts Automáticos (CRÍTICO)
1. Vá para **Settings → Payouts**
2. **Automatic payouts:** ✅ ATIVAR
3. **Payout schedule:** Daily (recomendado)
4. **Minimum payout amount:** R$ 1,00

### 6. Verificar Conta Bancária
1. Vá para **Settings → Bank accounts and cards**
2. Confirme que sua conta está **verificada** ✅
3. Se não estiver, complete a verificação

## 🔑 CONFIGURAR WEBHOOK SECRET (OPCIONAL MAS RECOMENDADO)

No Supabase, adicione a variável de ambiente:
1. Vá para **Project Settings → Edge Functions**
2. Adicione: `STRIPE_WEBHOOK_SECRET = whsec_seu_secret_aqui`

## 🧪 TESTAR CONFIGURAÇÃO

### 1. Teste de Webhook
1. No Stripe Dashboard, vá para **Developers → Webhooks**
2. Clique no seu webhook
3. Clique em **"Send test webhook"**
4. Escolha `checkout.session.completed`
5. Clique em **"Send test webhook"**

### 2. Verificar Logs
1. No Supabase, vá para **Edge Functions → stripe-webhook**
2. Verifique se apareceu um log com ✅ sucesso

### 3. Teste Real
1. Faça um pagamento de teste no seu site
2. Use cartão: `4242 4242 4242 4242`
3. Monitore os logs em tempo real

## 📊 LOGS QUE VOCÊ DEVE VER

### No Supabase Functions:
```
🔔 Webhook recebido: checkout.session.completed
💳 Checkout completado: {...}
✅ Pagamento atualizado como completado
✅ Premium ativado para usuário
💰 Amount Captured: 9.90 BRL
✅ CONFIRMADO: Dinheiro capturado e será transferido
```

### No Stripe Dashboard:
- **Payments:** Status "Succeeded" ✅
- **Balance:** Valor disponível ✅
- **Payouts:** Payout automático criado ✅

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### ❌ Webhook retorna erro 400
**Causa:** URL incorreta ou eventos não configurados
**Solução:** Verificar URL e eventos listados acima

### ❌ Pagamento funciona mas não recebo dinheiro
**Causa:** Payouts automáticos desativados
**Solução:** Ativar em Settings → Payouts

### ❌ Webhook não recebe eventos
**Causa:** URL do webhook incorreta
**Solução:** Verificar se a URL está correta

### ❌ Conta bancária não verificada
**Causa:** Documentos pendentes
**Solução:** Completar verificação em Settings → Account

## ✅ CHECKLIST FINAL

- [ ] Webhook criado com URL correta
- [ ] Todos os eventos configurados
- [ ] Webhook secret salvo (opcional)
- [ ] Payouts automáticos ativados
- [ ] Conta bancária verificada
- [ ] Teste de webhook realizado
- [ ] Teste de pagamento real realizado

## 🎉 APÓS CONFIGURAÇÃO

1. **Teste imediatamente** com um pagamento
2. **Monitore os logs** do webhook
3. **Verifique o saldo** no Stripe
4. **Confirme o payout automático**
5. **Aguarde 1-2 dias** para transferência bancária

---

**⚡ IMPORTANTE:** Após configurar, teste IMEDIATAMENTE para garantir que tudo está funcionando!