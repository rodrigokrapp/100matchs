# 🚀 Configuração de Deploy Automático - GitHub Actions

## ✅ O que foi configurado:

- **GitHub Actions workflow** criado em `.github/workflows/deploy.yml`
- **Deploy automático** toda vez que houver push na branch `main`
- **Integração com Netlify** para publicação
- **Cache de dependências** para builds mais rápidos
- **Variáveis de ambiente** configuradas para produção

---

## 🔧 Configuração Necessária no GitHub:

### 1. **Secrets do Repositório**
Vá para: `Repositório → Settings → Secrets and variables → Actions`

Adicione os seguintes secrets:

```
NETLIFY_AUTH_TOKEN=seu_token_netlify_aqui
NETLIFY_SITE_ID=seu_site_id_netlify_aqui
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
```

### 2. **Como obter o NETLIFY_AUTH_TOKEN:**
1. Acesse: https://app.netlify.com/user/applications
2. Clique em "New access token"
3. Dê um nome (ex: "GitHub Actions Deploy")
4. Copie o token gerado

### 3. **Como obter o NETLIFY_SITE_ID:**
1. No dashboard do Netlify, selecione seu site
2. Vá em "Site settings"
3. Procure por "Site ID" (geralmente em "General")
4. Copie o ID (ex: `123abc45-678d-90ef-gh12-345ijk678lmn`)

### 4. **Credenciais do Supabase:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Settings → API
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

---

## 🎯 Fluxo de Deploy:

1. **Push para main** → Dispara o workflow automaticamente
2. **Install dependencies** → npm ci
3. **Build project** → npm run build (com variáveis de ambiente)
4. **Deploy to Netlify** → Publica no seu site
5. **Notifications** → Confirma sucesso ou falha

---

## 📋 Checklist de Verificação:

- [ ] Repositório conectado ao GitHub (`git remote -v`)
- [ ] Secrets configurados no GitHub
- [ ] Workflow em `.github/workflows/deploy.yml`
- [ ] Branch `main` como padrão
- [ ] Primeiro push realizado

---

## 🚀 Primeira Configuração:

```bash
# 1. Conectar ao repositório GitHub (se ainda não conectado)
git remote add origin https://github.com/rodrigokrapp/100matchs.git

# 2. Garantir que estamos na branch main
git branch -M main

# 3. Adicionar os arquivos de configuração
git add .

# 4. Commit das configurações
git commit -m "feat: configuração de deploy automático com GitHub Actions"

# 5. Push inicial (isso dispara o primeiro deploy)
git push -u origin main
```

---

## 🔍 Monitoramento:

- **GitHub Actions**: `Repositório → Actions` para ver os logs de deploy
- **Netlify**: Dashboard para ver o status do site
- **Logs em tempo real**: Acompanhe cada step do workflow

---

## 🆘 Troubleshooting:

### Erro: "NETLIFY_AUTH_TOKEN not found"
- Verificar se o secret foi adicionado corretamente no GitHub

### Erro: "Build failed"
- Verificar se as variáveis SUPABASE estão configuradas
- Verificar logs do workflow para identificar o erro

### Deploy não dispara automaticamente:
- Verificar se o arquivo está em `.github/workflows/deploy.yml`
- Verificar se o push foi feito na branch `main`

---

## 🎉 Resultado:

Após a configuração, **TODOS os pushes na branch main** irão:
- ✅ Fazer build automaticamente
- ✅ Executar deploy no Netlify
- ✅ Atualizar o site em produção
- ✅ Notificar sobre o status

**Não será mais necessário deploy manual!** 🚀 