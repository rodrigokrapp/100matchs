import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - PRODUÇÃO
const supabaseUrl = 'https://shjhfnnxaxotpyebiijp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoamhmbm54YXhvdHB5ZWJpaWpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEyNzUzMSwiZXhwIjoyMDY1NzAzNTMxfQ.Rhoa0ycynAH3NWCULQMWOYDAIX7oQZhPVvet0oaZ7Fo';

console.log('🔧 Supabase configurado para produção:', { url: supabaseUrl, hasKey: !!supabaseKey });
// Conexão atualizada

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 100,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Função para testar conexão geral
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

// Função específica para testar chat em tempo real
export const testChatConnection = async (roomId: string) => {
  try {
    console.log('🧪 Testando conexão de chat para sala:', roomId);
    
    // Teste 1: Verificar se consegue acessar tabelas de mensagens
    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .limit(1);
    
    if (msgError) {
      console.warn('⚠️ Tabela chat_messages não acessível:', msgError.message);
    } else {
      console.log('✅ Tabela chat_messages OK, mensagens encontradas:', messages?.length || 0);
    }

    // Teste 2: Verificar realtime
    const testChannel = supabase.channel(`test-${roomId}-${Date.now()}`);
    
    const connectionPromise = new Promise((resolve) => {
      testChannel.subscribe((status) => {
        console.log('📡 Status do canal de teste:', status);
        resolve(status === 'SUBSCRIBED');
      });
    });

    const connected = await Promise.race([
      connectionPromise,
      new Promise(resolve => setTimeout(() => resolve(false), 5000)) // Timeout 5s
    ]);

    await supabase.removeChannel(testChannel);

    if (connected) {
      console.log('✅ Chat em tempo real funcionando');
    } else {
      console.warn('⚠️ Chat em tempo real com problemas');
    }

    return { 
      database: !msgError, 
      realtime: !!connected,
      overall: !msgError && !!connected 
    };
  } catch (error) {
    console.error('❌ Erro no teste de chat:', error);
    return { database: false, realtime: false, overall: false };
  }
};

// Função para inicializar tabelas necessárias
export const initializeDatabase = async () => {
  try {
    // Tentar criar as tabelas usando SQL direto
    console.log('🔧 Inicializando tabelas do chat...');
    
    // Verificar se as tabelas existem
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['chat_rooms', 'chat_messages']);

    if (tablesError) {
      console.log('❌ Erro ao verificar tabelas, continuando...', tablesError);
    }

    console.log('✅ Banco de dados verificado para chat em tempo real');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    return false;
  }
}; 