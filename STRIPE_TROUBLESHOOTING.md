# 🔧 Guia de Solução de Problemas - Stripe

## 🚨 PROBLEMAS MAIS COMUNS

### 1. ❌ "Premium Ativo" mas dinheiro não chega na conta

#### Possíveis Causas:
- **Payouts automáticos desativados** (mais comum)
- **Conta bancária não verificada**
- **Saldo insuficiente para payout mínimo**
- **Restrições na conta Stripe**

#### Soluções:
1. **Verificar Payouts:**
   - Stripe Dashboard → Settings → Payouts
   - Ativar "Automatic payouts"
   - Definir schedule como "Daily"

2. **Verificar Conta Bancária:**
   - Settings → Bank accounts and cards
   - Confirmar que está verificada
   - Completar verificação se necessário

3. **Verificar Saldo:**
   - Balance → Available balance
   - Se há dinheiro "preso", verificar configurações

### 2. ❌ Webhook retorna erro 400/500

#### Possíveis Causas:
- **URL do webhook incorreta**
- **Eventos não configurados**
- **Problemas no código da função**

#### Soluções:
1. **Verificar URL:**
   ```
   https://[SEU_PROJETO].supabase.co/functions/v1/stripe-webhook
   ```

2. **Verificar Eventos:**
   - Todos os eventos da lista devem estar marcados
   - Especialmente `checkout.session.completed`

3. **Testar Webhook:**
   - Stripe Dashboard → Webhooks → Send test webhook

### 3. ❌ Usuário não logado acessa Premium

#### Status: ✅ **JÁ CORRIGIDO**
- Agora requer login obrigatório
- Redirecionamento automático para login
- Proteção de rota implementada

### 4. ❌ Pagamento não é capturado

#### Possíveis Causas:
- **Configuração de captura manual**
- **Problemas com Payment Intent**
- **Regras de risco muito restritivas**

#### Soluções:
1. **Verificar Configuração:**
   - Checkout deve ter `capture_method: automatic`
   - ✅ Já configurado no código

2. **Verificar Radar:**
   - Settings → Radar → Rules
   - Desativar regras muito restritivas

## 🔍 COMO DIAGNOSTICAR PROBLEMAS

### 1. Verificar Logs do Webhook
**Supabase Functions → stripe-webhook → Logs**

#### Logs de Sucesso:
```
✅ Webhook recebido: checkout.session.completed
✅ Premium ativado para usuário
✅ CONFIRMADO: Dinheiro capturado e será transferido
```

#### Logs de Erro:
```
❌ Erro no webhook: [detalhes]
❌ UserId não encontrado nos metadados
❌ Pagamento não foi aprovado
```

### 2. Verificar Stripe Dashboard

#### Payments:
- Status deve ser "Succeeded"
- Amount deve estar correto
- Captured deve ser "Yes"

#### Balance:
- Dinheiro deve aparecer no "Available balance"
- Se está em "Pending", aguardar processamento

#### Payouts:
- Deve haver payouts automáticos criados
- Status deve ser "Paid" ou "In transit"

### 3. Verificar Webhooks
**Developers → Webhooks → [Seu Webhook] → Logs**

#### Sucesso:
- Status: 200 OK
- Response time: < 5s
- No errors

#### Erro:
- Status: 4xx ou 5xx
- Error message detalhado
- Retry attempts

## 🛠️ FERRAMENTAS DE DEBUG

### 1. Stripe CLI (Opcional)
```bash
# Instalar Stripe CLI
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Testar webhook
stripe trigger checkout.session.completed
```

### 2. Logs em Tempo Real
```bash
# Supabase CLI
supabase functions logs stripe-webhook --follow
```

### 3. Teste de Cartão
```
# Cartões de teste
Sucesso: 4242 4242 4242 4242
Falha: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

## 📊 CHECKLIST DE VERIFICAÇÃO

### ✅ Configuração Básica
- [ ] Webhook URL correta
- [ ] Todos os eventos configurados
- [ ] Webhook secret configurado (opcional)
- [ ] Função do webhook funcionando

### ✅ Configuração de Pagamentos
- [ ] Payouts automáticos ativados
- [ ] Conta bancária verificada
- [ ] Sem restrições na conta
- [ ] Saldo mínimo configurado

### ✅ Teste Funcional
- [ ] Checkout funciona
- [ ] Premium é ativado
- [ ] Webhook recebe eventos
- [ ] Dinheiro aparece no saldo
- [ ] Payout é criado automaticamente

## 🆘 QUANDO PEDIR AJUDA

### Contate o Suporte Stripe se:
- Conta bancária não pode ser verificada
- Payouts automáticos não funcionam mesmo configurados
- Há restrições inexplicáveis na conta
- Problemas com verificação de identidade

### Informações para Fornecer:
- ID da conta Stripe
- IDs de pagamentos específicos
- Screenshots dos logs de erro
- Configurações atuais de payout

## 📞 CONTATOS ÚTEIS

- **Stripe Support:** [https://support.stripe.com](https://support.stripe.com)
- **Stripe Status:** [https://status.stripe.com](https://status.stripe.com)
- **Documentação:** [https://stripe.com/docs](https://stripe.com/docs)

---

**⚡ LEMBRE-SE:** A maioria dos problemas é resolvida ativando payouts automáticos e verificando a conta bancária.