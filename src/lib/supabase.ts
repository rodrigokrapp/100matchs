import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com credenciais reais
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://jnupyqszampirwyyvqlh.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudXB5cXN6YW1waXJ3eXl2cWxoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI0MTc5NywiZXhwIjoyMDY0ODE3Nzk3fQ.YqcgqVm5L-wckqfSdxuDPhKFYu9f82-8qxNSn7JD6nM';

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