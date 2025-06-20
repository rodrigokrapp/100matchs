import { supabase } from './supabase';

export const initializeSalasTable = async () => {
  try {
    console.log('🔧 Inicializando tabela de salas no Supabase...');
    
    // Verificar se a tabela já existe
    const { data: existingTable, error: checkError } = await supabase
      .from('salas_personalizadas')
      .select('count')
      .limit(1);
    
    if (!checkError) {
      console.log('✅ Tabela salas_personalizadas já existe');
      return true;
    }
    
    console.log('⚠️ Tabela não existe, será necessário criar manualmente no Supabase');
    console.log('📋 Execute este SQL no editor do Supabase:');
    console.log(`
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
    `);
    
    return false;
  } catch (error) {
    console.error('❌ Erro ao verificar tabela de salas:', error);
    return false;
  }
};

// Função para testar se a tabela está funcionando
export const testSalasTable = async () => {
  try {
    console.log('🧪 Testando tabela de salas...');
    
    // Tentar inserir uma sala de teste
    const salaTest = {
      id: `test-${Date.now()}`,
      nome: 'Sala de Teste - Centro, São Paulo',
      bairro: 'Centro',
      cidade: 'São Paulo',
      criador: 'Sistema',
      usuarios_online: 0
    };
    
    const { data, error } = await supabase
      .from('salas_personalizadas')
      .insert([salaTest])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao inserir sala de teste:', error);
      return false;
    }
    
    console.log('✅ Sala de teste inserida:', data);
    
    // Remover sala de teste
    await supabase
      .from('salas_personalizadas')
      .delete()
      .eq('id', salaTest.id);
    
    console.log('🗑️ Sala de teste removida');
    return true;
  } catch (error) {
    console.error('❌ Erro no teste da tabela:', error);
    return false;
  }
};