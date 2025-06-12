# 📋 Referência Completa - Eventos de Webhook Stripe

## 🎯 EVENTOS CONFIGURADOS NO SISTEMA

### 💳 Eventos de Pagamento
| Evento | Quando Acontece | Ação no Sistema |
|--------|----------------|-----------------|
| `checkout.session.completed` | Checkout finalizado com sucesso | ✅ Ativa Premium do usuário |
| `charge.succeeded` | Cobrança bem-sucedida | ✅ Confirma captura do pagamento |
| `payment_intent.succeeded` | Pagamento confirmado | ✅ Log de confirmação |

### 🔄 Eventos de Assinatura
| Evento | Quando Acontece | Ação no Sistema |
|--------|----------------|-----------------|
| `invoice.payment_succeeded` | Renovação mensal paga | ✅ Estende Premium por +1 mês |
| `invoice.payment_failed` | Falha na renovação | ⚠️ Marca assinatura como inativa |
| `customer.subscription.deleted` | Assinatura cancelada | ❌ Remove Premium do usuário |

### 💰 Eventos de Transferência (CRÍTICOS)
| Evento | Quando Acontece | Ação no Sistema |
|--------|----------------|-----------------|
| `transfer.created` | Transferência iniciada | 📝 Log de transferência |
| `payout.created` | Payout criado | 📝 Log de payout |
| `payout.paid` | Dinheiro transferido | ✅ Confirmação de recebimento |
| `payout.failed` | Falha na transferência | ❌ Log de erro |

## 🔍 EXEMPLO DE LOGS POR EVENTO

### checkout.session.completed
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_...",
      "amount_total": 990,
      "currency": "brl",
      "payment_status": "paid",
      "metadata": {
        "userId": "user_123",
        "planType": "premium"
      }
    }
  }
}
```

### charge.succeeded
```json
{
  "type": "charge.succeeded",
  "data": {
    "object": {
      "id": "ch_test_...",
      "amount": 990,
      "currency": "brl",
      "captured": true,
      "paid": true
    }
  }
}
```

### payout.paid
```json
{
  "type": "payout.paid",
  "data": {
    "object": {
      "id": "po_test_...",
      "amount": 990,
      "currency": "brl",
      "status": "paid",
      "arrival_date": 1234567890
    }
  }
}
```

## 🚨 EVENTOS DE ERRO IMPORTANTES

### invoice.payment_failed
```json
{
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "id": "in_test_...",
      "subscription": "sub_test_...",
      "attempt_count": 1,
      "amount_due": 990
    }
  }
}
```

### payout.failed
```json
{
  "type": "payout.failed",
  "data": {
    "object": {
      "id": "po_test_...",
      "amount": 990,
      "currency": "brl",
      "status": "failed",
      "failure_code": "account_closed"
    }
  }
}
```

## 📊 FLUXO COMPLETO DE PAGAMENTO

```
1. Usuário clica "Seja Premium"
   ↓
2. Checkout Session criada
   ↓
3. Usuário paga no Stripe
   ↓
4. checkout.session.completed → Ativa Premium
   ↓
5. charge.succeeded → Confirma captura
   ↓
6. transfer.created → Inicia transferência
   ↓
7. payout.created → Cria payout
   ↓
8. payout.paid → Dinheiro na sua conta! 💰
```

## 🔧 CONFIGURAÇÃO DE TESTE

### Cartões de Teste
- **Sucesso:** `4242 4242 4242 4242`
- **Falha:** `4000 0000 0000 0002`
- **Requer autenticação:** `4000 0025 0000 3155`

### Webhooks de Teste
No Stripe Dashboard:
1. Vá para **Developers → Webhooks**
2. Clique no seu webhook
3. Aba **"Test"**
4. Envie eventos de teste

## 🎯 MONITORAMENTO EM PRODUÇÃO

### Logs Importantes
```bash
# Sucesso
✅ Webhook recebido: checkout.session.completed
✅ Premium ativado para usuário
✅ CONFIRMADO: Dinheiro capturado e será transferido

# Transferência
💸 Transferência criada
🏦 Payout criado
💰 Payout pago: Dinheiro transferido para conta bancária

# Erros
❌ Falha no pagamento da fatura
❌ ATENÇÃO: Cobrança não foi capturada corretamente
```

### Alertas Críticos
- ❌ `payout.failed` - Problema na transferência
- ❌ `invoice.payment_failed` - Falha na renovação
- ❌ Webhook retorna erro 4xx/5xx

---

**📞 SUPORTE:** Se algum evento não estiver funcionando, verifique a configuração do webhook no Stripe Dashboard.