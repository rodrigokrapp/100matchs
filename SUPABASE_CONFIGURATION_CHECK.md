# 🔍 VERIFICAÇÃO COMPLETA - Configuração Supabase

## ✅ **STATUS ATUAL DA CONFIGURAÇÃO**

### 🔧 **1. VARIÁVEIS DE AMBIENTE**
Verifique se o arquivo `.env` na raiz do projeto contém:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

**⚠️ IMPORTANTE:**
- As variáveis devem começar com `VITE_` para funcionar no frontend
- A URL deve ser HTTPS e terminar com `.supabase.co`
- A chave anônima é longa (geralmente 100+ caracteres)

### 🏗️ **2. ESTRUTURA DO BANCO DE DADOS**

**✅ Tabelas necessárias já existem:**
- `users` - Usuários do sistema
- `profiles` - Perfis dos usuários (conectada ao auth.users)
- `chat_rooms` - Salas de chat
- `messages` - Mensagens das salas
- `payments` - Registros de pagamento
- `subscriptions` - Assinaturas premium
- `blocked_users` - Usuários bloqueados
- `user_rooms` - Relacionamento usuário-sala

### 🔐 **3. CONFIGURAÇÕES DE AUTENTICAÇÃO**

**No Supabase Dashboard → Authentication → Settings:**

**✅ Configurações recomendadas:**
- **Enable email confirmations:** ❌ DESABILITADO (para facilitar testes)
- **Enable phone confirmations:** ❌ DESABILITADO
- **Enable email change confirmations:** ❌ DESABILITADO
- **Enable secure email change:** ✅ HABILITADO
- **Double confirm email changes:** ❌ DESABILITADO

**Site URL:**
```
http://localhost:5173
```

**Redirect URLs (adicionar todas):**
```
http://localhost:5173
http://localhost:5173/**
https://seu-dominio.com
https://seu-dominio.com/**
```

### 🛡️ **4. ROW LEVEL SECURITY (RLS)**

**✅ Todas as tabelas têm RLS habilitado com políticas corretas:**

**Tabela `profiles`:**
- ✅ Usuários podem ver perfis públicos
- ✅ Usuários podem criar/editar apenas seu próprio perfil
- ✅ Usuários autenticados podem inserir perfil

**Tabela `messages`:**
- ✅ Usuários podem ver mensagens das salas que participam
- ✅ Usuários podem enviar mensagens nas salas que participam
- ✅ Visitantes podem ver mensagens públicas

### 🔑 **5. CHAVES DE API**

**No Supabase Dashboard → Settings → API:**

**✅ Chaves necessárias:**
- **anon/public key:** Para frontend (já configurada)
- **service_role key:** Para edge functions (configurada automaticamente)

### 🚀 **6. EDGE FUNCTIONS**

**✅ Functions implementadas:**
- `kiwify-webhook` - Processa pagamentos da Kiwify
- `stripe-webhook` - Processa pagamentos do Stripe (backup)
- `create-checkout-session` - Cria sessões de checkout
- `cancel-subscription` - Cancela assinaturas

## 🧪 **TESTE DE CONFIGURAÇÃO**

### **1. Teste de Conexão**
Abra o console do navegador (F12) e verifique:

**✅ Logs esperados:**
```
✅ Configuração Supabase validada: {url: "...", hasAnonKey: true}
✅ Conexão Supabase estabelecida: {hasSession: false, user: "Não logado"}
```

**❌ Erros possíveis:**
```
❌ ERRO: VITE_SUPABASE_URL não configurada ou inválida
❌ ERRO: VITE_SUPABASE_ANON_KEY não configurada ou inválida
❌ Erro na conexão Supabase: [detalhes]
```

### **2. Teste de Cadastro**
1. Tente criar uma conta nova
2. Verifique se o perfil é criado automaticamente
3. Confirme que o login funciona

### **3. Teste de Premium**
1. Faça login com uma conta
2. Clique em "Seja Premium"
3. Verifique se redireciona para Kiwify

## 🔧 **SOLUÇÕES PARA PROBLEMAS COMUNS**

### **❌ "Invalid API key" ou "Project not found"**
**Causa:** Chaves incorretas ou projeto inexistente
**Solução:**
1. Verificar URL do projeto no Supabase Dashboard
2. Regenerar chaves se necessário
3. Atualizar arquivo `.env`

### **❌ "Email not confirmed"**
**Causa:** Confirmação de email habilitada
**Solução:**
1. Supabase Dashboard → Authentication → Settings
2. Desabilitar "Enable email confirmations"
3. Ou confirmar email manualmente no dashboard

### **❌ "Row Level Security policy violation"**
**Causa:** Políticas RLS muito restritivas
**Solução:**
1. Verificar políticas na tabela específica
2. Ajustar políticas se necessário
3. Verificar se usuário tem permissões corretas

### **❌ "Failed to create profile"**
**Causa:** Trigger não configurado ou erro na criação
**Solução:**
1. Verificar se trigger `handle_new_user` existe
2. Criar perfil manualmente se necessário
3. Verificar logs de erro no Supabase

## 📋 **CHECKLIST DE VERIFICAÇÃO**

### **Configuração Básica:**
- [ ] Arquivo `.env` existe e está configurado
- [ ] `VITE_SUPABASE_URL` está correto
- [ ] `VITE_SUPABASE_ANON_KEY` está correto
- [ ] Conexão Supabase funciona (verificar console)

### **Autenticação:**
- [ ] Confirmação de email está desabilitada
- [ ] Site URL está configurado
- [ ] Redirect URLs estão configurados
- [ ] Cadastro funciona sem erros
- [ ] Login funciona sem erros

### **Banco de Dados:**
- [ ] Todas as tabelas existem
- [ ] RLS está habilitado em todas as tabelas
- [ ] Políticas estão configuradas corretamente
- [ ] Triggers estão funcionando

### **Edge Functions:**
- [ ] `kiwify-webhook` está deployada
- [ ] Webhook da Kiwify está configurado
- [ ] Logs das functions são visíveis

## 🎯 **PRÓXIMOS PASSOS**

1. **Verificar arquivo `.env`** - Confirmar se as variáveis estão corretas
2. **Testar cadastro/login** - Criar conta e fazer login
3. **Configurar webhook Kiwify** - Seguir instruções do KIWIFY_SETUP_INSTRUCTIONS.md
4. **Testar pagamento** - Fazer teste completo do fluxo premium

## 📞 **SUPORTE**

### **Se problemas persistirem:**
1. **Verificar logs do console** do navegador
2. **Verificar logs do Supabase** Dashboard → Logs
3. **Verificar configurações** seguindo este checklist
4. **Regenerar chaves** se necessário

---

**⚡ AÇÃO IMEDIATA:** Verificar se o arquivo `.env` está configurado corretamente!