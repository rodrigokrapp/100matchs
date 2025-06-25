-- =====================================================
-- CONFIGURAÇÃO RLS PARA SALAS PERSONALIZADAS
-- =====================================================

-- Criar tabela para salas personalizadas compartilhadas se não existir
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

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "salas_select_all" ON salas_personalizadas;
DROP POLICY IF EXISTS "salas_insert_all" ON salas_personalizadas;
DROP POLICY IF EXISTS "salas_update_all" ON salas_personalizadas;
DROP POLICY IF EXISTS "salas_delete_all" ON salas_personalizadas;
DROP POLICY IF EXISTS "Todos podem ver salas" ON salas_personalizadas;
DROP POLICY IF EXISTS "Todos podem criar salas" ON salas_personalizadas;
DROP POLICY IF EXISTS "Todos podem atualizar salas" ON salas_personalizadas;
DROP POLICY IF EXISTS "Todos podem deletar salas" ON salas_personalizadas;

-- POLÍTICA 1: Permitir que TODOS vejam TODAS as salas (acesso público)
CREATE POLICY "salas_select_all" ON salas_personalizadas
  FOR SELECT 
  USING (true);

-- POLÍTICA 2: Permitir que TODOS criem salas (acesso público)
CREATE POLICY "salas_insert_all" ON salas_personalizadas
  FOR INSERT 
  WITH CHECK (true);

-- POLÍTICA 3: Permitir que TODOS atualizem salas (para contador de usuários)
CREATE POLICY "salas_update_all" ON salas_personalizadas
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- POLÍTICA 4: Permitir que TODOS deletem salas (para limpeza automática)
CREATE POLICY "salas_delete_all" ON salas_personalizadas
  FOR DELETE 
  USING (true);

-- Função para limpar salas expiradas automaticamente
CREATE OR REPLACE FUNCTION limpar_salas_expiradas()
RETURNS void AS $$
BEGIN
  DELETE FROM salas_personalizadas 
  WHERE criada_em < NOW() - INTERVAL '24 hours';
  
  -- Log da limpeza
  RAISE NOTICE 'Salas expiradas removidas em %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_salas_updated_at ON salas_personalizadas;
CREATE TRIGGER update_salas_updated_at
  BEFORE UPDATE ON salas_personalizadas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Inserir algumas salas de exemplo para teste (apenas se não existirem)
INSERT INTO salas_personalizadas (id, nome, bairro, cidade, criador, usuarios_online) VALUES
('exemplo-sp-inicial', 'Chat Geral - Centro, São Paulo', 'Centro', 'São Paulo', 'Sistema', 3),
('exemplo-rj-inicial', 'Galera da Praia - Copacabana, Rio de Janeiro', 'Copacabana', 'Rio de Janeiro', 'Sistema', 5),
('exemplo-mg-inicial', 'Pessoal de BH - Savassi, Belo Horizonte', 'Savassi', 'Belo Horizonte', 'Sistema', 2)
ON CONFLICT (id) DO NOTHING;

-- Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'salas_personalizadas'
ORDER BY policyname;

-- Confirmar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'salas_personalizadas'; 