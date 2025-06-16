import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - PRODUÇÃO
const supabaseUrl = 'https://rhajnkrvdytbbihwfqgxu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYWpua3J2ZHl0YmJpaHdmcWd4dSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3NTAxMDA0MDQsImV4cCI6MjA2NTY3NjQwNH0.W97Mu6K_3vScej6u1z3ozFYegSP4cb6Ao5syFO47dHQ';

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