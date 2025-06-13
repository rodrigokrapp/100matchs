import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente do Supabase não configuradas');
  console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

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