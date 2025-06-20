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

-- Comentários para documentação
COMMENT ON TABLE salas_personalizadas IS 'Salas de chat personalizadas criadas pelos usuários';
COMMENT ON COLUMN salas_personalizadas.id IS 'ID único da sala';
COMMENT ON COLUMN salas_personalizadas.nome IS 'Nome completo da sala (ex: Chat Geral - Centro, São Paulo)';
COMMENT ON COLUMN salas_personalizadas.bairro IS 'Bairro da sala';
COMMENT ON COLUMN salas_personalizadas.cidade IS 'Cidade da sala';
COMMENT ON COLUMN salas_personalizadas.criador IS 'Nome do usuário que criou a sala';
COMMENT ON COLUMN salas_personalizadas.criada_em IS 'Data e hora de criação da sala';
COMMENT ON COLUMN salas_personalizadas.usuarios_online IS 'Número de usuários online na sala'; 