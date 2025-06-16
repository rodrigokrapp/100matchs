import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - PRODUÇÃO
const supabaseUrl = 'https://twygtrvzltsptytkgooor.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3eWd0cnZ6bHRzcHl0a2dvb29yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg0NTM0MSwiZXhwIjoyMDY1NDIxMzQxfQ.TAFfn9Iy1eWT-CxuBHeEDY6aHCqS4Dt2VImJCETd7Yc';

console.log('🔧 Supabase configurado para produção:', { url: supabaseUrl, hasKey: !!supabaseKey });

export const supabase = createClient(supabaseUrl, supabaseKey);

// Função para testar conexão
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Erro na conexão Supabase:', error.message);
      return false;
    }
    console.log('✅ Conexão Supabase estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão Supabase:', error);
    return false;
  }
}; 