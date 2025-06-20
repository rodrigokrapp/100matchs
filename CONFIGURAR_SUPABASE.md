# 🔧 Configuração da Tabela no Supabase

Para que o sistema de salas compartilhadas funcione corretamente, é necessário criar a tabela `salas_personalizadas` no Supabase.

## 📋 Passo a Passo

### 1. Acesse o Supabase
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Selecione o projeto: **100matchs**

### 2. Abra o SQL Editor
- No painel lateral, clique em **SQL Editor**
- Clique em **New Query**

### 3. Cole o SQL abaixo

```sql
-- Criar tabela para salas personalizadas compartilhadas
CREATE TABLE IF NOT EXISTS salas_personalizadas (
  id VARCHAR(255) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  criador VARCHAR(100) NOT NULL,
  criada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuarios_online INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_salas_criada_em ON salas_personalizadas(criada_em);
CREATE INDEX IF NOT EXISTS idx_salas_cidade ON salas_personalizadas(cidade);
CREATE INDEX IF NOT EXISTS idx_salas_criador ON salas_personalizadas(criador);

-- Habilitar RLS (Row Level Security)
ALTER TABLE salas_personalizadas ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos vejam todas as salas
CREATE POLICY "Todos podem ver salas" ON salas_personalizadas
  FOR SELECT USING (true);

-- Política para permitir que todos criem salas
CREATE POLICY "Todos podem criar salas" ON salas_personalizadas
  FOR INSERT WITH CHECK (true);

-- Política para permitir que todos atualizem salas
CREATE POLICY "Todos podem atualizar salas" ON salas_personalizadas
  FOR UPDATE USING (true);

-- Política para permitir que todos deletem salas expiradas
CREATE POLICY "Todos podem deletar salas" ON salas_personalizadas
  FOR DELETE USING (true);

-- Função para limpar salas expiradas automaticamente
CREATE OR REPLACE FUNCTION limpar_salas_expiradas()
RETURNS void AS $$
BEGIN
  DELETE FROM salas_personalizadas 
  WHERE criada_em < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Inserir algumas salas de exemplo para teste
INSERT INTO salas_personalizadas (id, nome, bairro, cidade, criador, usuarios_online) VALUES
('exemplo-sp-inicial', 'Chat Geral - Centro, São Paulo', 'Centro', 'São Paulo', 'Sistema', 3),
('exemplo-rj-inicial', 'Galera da Praia - Copacabana, Rio de Janeiro', 'Copacabana', 'Rio de Janeiro', 'Sistema', 5),
('exemplo-mg-inicial', 'Pessoal de BH - Savassi, Belo Horizonte', 'Savassi', 'Belo Horizonte', 'Sistema', 2)
ON CONFLICT (id) DO NOTHING;
```

### 4. Execute o SQL
- Clique no botão **Run** ou pressione `Ctrl + Enter`
- Aguarde a execução terminar
- Você deve ver uma mensagem de sucesso

### 5. Verificar se funcionou
- Vá para **Table Editor** no painel lateral
- Procure pela tabela `salas_personalizadas`
- Deve haver 3 salas de exemplo criadas

## ✅ Resultado Esperado

Após executar o SQL, o sistema deve:

1. **Criar a tabela** com todos os campos necessários
2. **Configurar políticas** para acesso público
3. **Inserir salas de exemplo** para teste
4. **Permitir que todas as salas** criadas apareçam para todos os usuários
5. **Manter salas ativas** por exatamente 24 horas

## 🔍 Como Testar

1. Acesse o site: **https://100matchs-chat.netlify.app**
2. Faça login ou entre como visitante
3. Vá para **Salas** → **Salas Criadas**
4. Você deve ver as 3 salas de exemplo
5. Crie uma nova sala e verifique se aparece para outros usuários

## 🚨 Importante

- **Execute o SQL apenas uma vez**
- Se der erro de "already exists", está tudo certo
- As salas são **compartilhadas entre todos os usuários**
- Cada sala fica ativa por **exatamente 24 horas**
- O sistema tem **fallback para localStorage** se o Supabase estiver indisponível

## 📞 Suporte

Se tiver problemas:
1. Verifique se o SQL foi executado sem erros
2. Confirme que as políticas RLS foram criadas
3. Teste criando uma sala no site
4. Verifique o console do navegador para logs detalhados