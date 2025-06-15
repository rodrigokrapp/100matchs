import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com nova chave secreta
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://twygtrvzltsptytkgooor.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3eWd0cnZ6bHRzcHl0a2dvb29yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg0NTM0MSwiZXhwIjoyMDY1NDIxMzQxfQ.TAFfn9Iy1eWT-CxuBHeEDY6aHCqS4Dt2VImJCETd7Yc';

console.log('🔧 Supabase configurado:', { url: supabaseUrl, hasKey: !!supabaseKey });

export const supabase = createClient(supabaseUrl, supabaseKey);

// Função para testar conexão
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
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