# 🔧 Instruções para Configuração do Stripe - Transferência de Pagamentos

## ⚠️ PROBLEMA IDENTIFICADO
O checkout está funcionando e o status premium está sendo ativado, mas os pagamentos não estão sendo transferidos para sua conta bancária. Isso indica um problema na configuração do Stripe.

## 🎯 AÇÕES NECESSÁRIAS NO PAINEL DO STRIPE

### 1. Verificar Configuração de Webhooks
**URL do Webhook:** `https://[SEU_PROJETO].supabase.co/functions/v1/stripe-webhook`

**Eventos que DEVEM estar configurados:**
- ✅ `checkout.session.completed`
- ✅ `invoice.payment_succeeded`
- ✅ `charge.succeeded` (CRÍTICO para confirmar captura)
- ✅ `transfer.created` (para monitorar transferências)
- ✅ `payout.created` (para monitorar payouts)
- ✅ `payout.paid` (para confirmar transferência bancária)
- ✅ `invoice.payment_failed`
- ✅ `customer.subscription.deleted`

### 2. Verificar Configurações de Transferência Automática
No painel do Stripe, vá para:
**Settings → Payouts → Payout schedule**

**Configure:**
- ✅ **Automatic payouts:** ATIVADO
- ✅ **Payout schedule:** Daily (recomendado) ou Weekly
- ✅ **Minimum payout amount:** R$ 1,00 (ou o mínimo desejado)

### 3. Verificar Conta Bancária
**Settings → Bank accounts and cards**
- ✅ Confirme que sua conta bancária está verificada
- ✅ Confirme que não há problemas de verificação pendentes

### 4. Verificar Configurações de Produto
**Products → [Seu Produto Premium]**
- ✅ Confirme que o produto está ativo
- ✅ Confirme que o preço está configurado como recorrente (R$ 9,90/mês)

### 5. Verificar Logs de Webhook
**Developers → Webhooks → [Seu Webhook] → Logs**
- ✅ Verifique se os eventos estão sendo enviados com sucesso (200 OK)
- ✅ Se houver erros 4xx ou 5xx, isso indica problema na configuração

## 🔍 VERIFICAÇÕES ADICIONAIS

### Verificar Saldo do Stripe
**Balance → Available balance**
- Se há dinheiro "preso" no saldo, pode indicar problema nas configurações de payout

### Verificar Configurações de Risco
**Settings → Radar → Rules**
- Confirme que não há regras bloqueando os pagamentos

### Verificar Configurações de Conta
**Settings → Account details**
- ✅ Conta deve estar totalmente verificada
- ✅ Não deve haver restrições ativas

## 🚨 POSSÍVEIS CAUSAS DO PROBLEMA

1. **Webhooks não configurados:** Eventos não estão sendo processados
2. **Payouts automáticos desativados:** Dinheiro fica no saldo do Stripe
3. **Conta bancária não verificada:** Stripe não pode transferir
4. **Configuração de captura manual:** Pagamentos não são capturados automaticamente
5. **Regras de risco muito restritivas:** Pagamentos são bloqueados

## 🛠️ MELHORIAS IMPLEMENTADAS NO CÓDIGO

### Webhook Melhorado
- ✅ Logs detalhados para debug
- ✅ Verificação de status de pagamento
- ✅ Confirmação de captura de pagamento
- ✅ Monitoramento de transferências e payouts

### Checkout Session Melhorado
- ✅ Metadados completos para rastreamento
- ✅ Configuração de captura automática
- ✅ Logs detalhados para debug

## 📞 PRÓXIMOS PASSOS

1. **Verificar configurações no painel Stripe** (listadas acima)
2. **Testar um pagamento** e monitorar os logs do webhook
3. **Verificar se o dinheiro aparece no saldo** do Stripe
4. **Confirmar se os payouts automáticos** estão funcionando

## 🔗 LINKS ÚTEIS

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Webhook Configuration](https://dashboard.stripe.com/webhooks)
- [Payout Settings](https://dashboard.stripe.com/settings/payouts)
- [Account Settings](https://dashboard.stripe.com/settings/account)

---

**⚡ IMPORTANTE:** Após fazer essas configurações, teste um pagamento pequeno (R$ 9,90) e monitore os logs para confirmar que tudo está funcionando corretamente.