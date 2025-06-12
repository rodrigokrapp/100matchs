# ✅ CHECKLIST COMPLETO - Configuração Stripe para Receber Pagamentos

## 🎯 CONFIGURAÇÕES OBRIGATÓRIAS

### 1. 🏦 **PAYOUTS AUTOMÁTICOS** (CRÍTICO)
**URL:** [https://dashboard.stripe.com/settings/payouts](https://dashboard.stripe.com/settings/payouts)

- [ ] **Automatic payouts:** ✅ ATIVADO
- [ ] **Payout schedule:** Daily (recomendado)
- [ ] **Minimum payout amount:** R$ 1,00
- [ ] **Bank account:** Verificada e ativa

### 2. 🏛️ **CONTA BANCÁRIA**
**URL:** [https://dashboard.stripe.com/settings/bank-accounts](https://dashboard.stripe.com/settings/bank-accounts)

- [ ] **Conta adicionada:** ✅ Sim
- [ ] **Status:** Verified ✅
- [ ] **Tipo:** Conta corrente
- [ ] **Sem alertas:** Nenhuma verificação pendente

### 3. 📋 **DETALHES DA CONTA**
**URL:** [https://dashboard.stripe.com/settings/account](https://dashboard.stripe.com/settings/account)

- [ ] **Informações pessoais:** Completas
- [ ] **Documentos:** Enviados e aprovados
- [ ] **Verificação:** Concluída
- [ ] **Restrições:** Nenhuma ativa

### 4. 🔗 **WEBHOOKS**
**URL:** [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)

**Endpoint URL:** `https://[SEU_PROJETO].supabase.co/functions/v1/stripe-webhook`

**Eventos obrigatórios:**
- [ ] `checkout.session.completed`
- [ ] `charge.succeeded`
- [ ] `payment_intent.succeeded`
- [ ] `invoice.payment_succeeded`
- [ ] `invoice.payment_failed`
- [ ] `customer.subscription.deleted`
- [ ] `transfer.created` ⭐
- [ ] `payout.created` ⭐ **CRÍTICO**
- [ ] `payout.paid` ⭐ **CRÍTICO**
- [ ] `payout.failed` ⭐

## 🧪 TESTE COMPLETO

### ✅ **Passo 1: Configurar**
1. Ativar payouts automáticos
2. Verificar conta bancária
3. Configurar webhooks

### ✅ **Passo 2: Testar**
1. Fazer pagamento com cartão `4242 4242 4242 4242`
2. Verificar logs do webhook
3. Confirmar ativação do Premium

### ✅ **Passo 3: Monitorar**
1. **Balance:** Verificar saldo disponível
2. **Payouts:** Confirmar criação automática
3. **Logs:** Monitorar eventos em tempo real

## 📊 VERIFICAÇÕES NO STRIPE DASHBOARD

### 💰 **Balance**
**URL:** [https://dashboard.stripe.com/balance](https://dashboard.stripe.com/balance)

- [ ] **Available balance:** Mostra valor do pagamento
- [ ] **Pending balance:** Vazio ou com valores esperados
- [ ] **Connect reserved:** Vazio (se não usar Connect)

### 🏦 **Payouts**
**URL:** [https://dashboard.stripe.com/payouts](https://dashboard.stripe.com/payouts)

- [ ] **Automatic payouts:** Criados automaticamente
- [ ] **Status:** Paid ou In transit
- [ ] **Arrival date:** Data prevista de chegada

### 💳 **Payments**
**URL:** [https://dashboard.stripe.com/payments](https://dashboard.stripe.com/payments)

- [ ] **Status:** Succeeded ✅
- [ ] **Amount:** R$ 9,90
- [ ] **Captured:** Yes ✅
- [ ] **Refunded:** No

## 🚨 SINAIS DE PROBLEMA

### ❌ **Payouts não criados**
- **Causa:** Payouts automáticos desativados
- **Solução:** Ativar em Settings → Payouts

### ❌ **Saldo "preso" no Available**
- **Causa:** Conta bancária não verificada
- **Solução:** Completar verificação

### ❌ **Webhook retorna erro**
- **Causa:** URL incorreta ou eventos não configurados
- **Solução:** Verificar configuração

### ❌ **Pagamento não capturado**
- **Causa:** Configuração de captura manual
- **Solução:** Verificar Payment Intent settings

## 📞 CONTATOS DE SUPORTE

### **Stripe Support**
- **URL:** [https://support.stripe.com](https://support.stripe.com)
- **Chat:** Disponível no dashboard
- **Email:** Através do dashboard

### **Informações para fornecer:**
- Account ID: `acct_...`
- Payment Intent ID: `pi_...`
- Webhook endpoint URL
- Logs de erro específicos

## 🎯 RESULTADO FINAL

### ✅ **Fluxo completo funcionando:**
```
1. Usuário paga R$ 9,90 ✅
2. Premium ativado ✅
3. Dinheiro capturado ✅
4. Payout criado automaticamente ✅
5. Dinheiro na sua conta em 1-2 dias ✅
```

---

**⚡ PRÓXIMO PASSO:** Verificar AGORA as configurações de payout no Stripe Dashboard!