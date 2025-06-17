import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - PRODUÇÃO
const supabaseUrl = 'https://shjhfnnxaxotpyebiijp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoamhmbm54YXhvdHB5ZWJpaWpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEyNzUzMSwiZXhwIjoyMDY1NzAzNTMxfQ.Rhoa0ycynAH3NWCULQMWOYDAIX7oQZhPVvet0oaZ7Fo';

console.log('🔧 Supabase configurado para produção:', { url: supabaseUrl, hasKey: !!supabaseKey });

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

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