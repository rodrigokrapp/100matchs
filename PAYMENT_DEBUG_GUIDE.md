# 🔍 Guia de Debug - Pagamentos Stripe

## ✅ MELHORIAS IMPLEMENTADAS

### 1. Fluxo de Autenticação Corrigido
- ✅ Acesso ao Premium **RESTRITO** a usuários logados
- ✅ Header com opções completas de login/cadastro/visitante
- ✅ Mensagens de erro claras para problemas de autenticação
- ✅ Redirecionamentos automáticos após login

### 2. Sistema de Webhooks Melhorado
- ✅ Logs detalhados para debug de pagamentos
- ✅ Verificação de captura de pagamento (`charge.succeeded`)
- ✅ Monitoramento de transferências (`transfer.created`, `payout.created`)
- ✅ Confirmação de Payment Intent para garantir captura

### 3. Checkout Session Otimizado
- ✅ Metadados completos para rastreamento
- ✅ Configuração de captura automática
- ✅ Logs detalhados para monitoramento

## 🚨 AÇÕES URGENTES NO STRIPE

### 1. Configurar Webhooks (CRÍTICO)
**URL:** `https://[SEU_PROJETO].supabase.co/functions/v1/stripe-webhook`

**Eventos obrigatórios:**
```
✅ checkout.session.completed
✅ charge.succeeded (CRÍTICO)
✅ payout.created (CRÍTICO)
✅ payout.paid (CRÍTICO)
✅ invoice.payment_succeeded
✅ transfer.created
```

### 2. Ativar Payouts Automáticos (CRÍTICO)
**Settings → Payouts → Payout schedule**
- ✅ Automatic payouts: **ATIVADO**
- ✅ Schedule: **Daily**
- ✅ Minimum amount: **R$ 1,00**

### 3. Verificar Conta Bancária
**Settings → Bank accounts**
- ✅ Conta verificada
- ✅ Sem restrições

## 🔍 COMO TESTAR

### 1. Teste de Fluxo Completo
1. Acesse o site **SEM estar logado**
2. Clique em "Seja Premium" → deve mostrar opções de login
3. Faça cadastro com email/senha
4. Após login, clique em "Seja Premium" novamente
5. Complete o pagamento no Stripe
6. Verifique se o status "Premium Ativo" aparece

### 2. Monitorar Logs do Webhook
No Supabase Functions, monitore os logs:
```bash
# Logs que você deve ver:
✅ Webhook recebido: checkout.session.completed
✅ Checkout completado: [detalhes]
✅ Pagamento atualizado como completado
✅ Premium ativado para usuário
✅ Cobrança bem-sucedida: [detalhes]
✅ CONFIRMADO: Dinheiro capturado e será transferido
```

### 3. Verificar no Stripe Dashboard
1. **Payments** → Confirme que o pagamento aparece como "Succeeded"
2. **Balance** → Verifique se o valor está no saldo disponível
3. **Payouts** → Confirme se o payout foi criado automaticamente

## 🐛 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### Problema: "Premium Ativo" mas sem dinheiro na conta
**Causa:** Payouts automáticos desativados
**Solução:** Ativar em Settings → Payouts

### Problema: Webhook retorna erro 400/500
**Causa:** Configuração incorreta do webhook
**Solução:** Verificar URL e eventos configurados

### Problema: Pagamento não é capturado
**Causa:** Configuração de captura manual
**Solução:** Verificar se `capture_method: automatic` está configurado

### Problema: Usuário não logado acessa premium
**Causa:** Falta de proteção de rota
**Solução:** ✅ **JÁ CORRIGIDO** - Agora requer login

## 📊 LOGS DE DEBUG

### Webhook Logs (Supabase)
```
🔔 Webhook recebido: checkout.session.completed
📊 Event ID: evt_xxx
💳 Checkout completado: {...}
✅ Pagamento atualizado como completado
✅ Premium ativado para usuário
💰 Payment Intent Status: succeeded
💰 Amount Captured: 9.90 BRL
✅ CONFIRMADO: Pagamento confirmado como capturado no Stripe
```

### Checkout Logs (Supabase)
```
🚀 Criando checkout session: {...}
✅ Produto criado: prod_xxx
✅ Preço criado: price_xxx
✅ Sessão de checkout criada: cs_xxx
✅ Sessão salva no banco
🔗 Webhook URL configurado: https://...
💰 Valor da sessão: 9.90 BRL
```

## 🎯 PRÓXIMOS PASSOS

1. **Configurar webhooks** no Stripe Dashboard
2. **Ativar payouts automáticos**
3. **Testar pagamento completo**
4. **Monitorar logs** para confirmar funcionamento
5. **Verificar transferência bancária** em 1-2 dias úteis

---

**⚡ IMPORTANTE:** O problema mais comum é payouts automáticos desativados. Verifique isso PRIMEIRO no Stripe Dashboard.