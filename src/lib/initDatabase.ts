import { supabase } from './supabase';

export const createSalasTable = async () => {
  try {
    console.log('🔧 Criando tabela salas_personalizadas no Supabase...');
    
    // Tentar criar a tabela usando SQL direto
    const { error } = await supabase.rpc('create_salas_table_if_not_exists');
    
    if (error && !error.message.includes('already exists')) {
      console.warn('⚠️ Erro ao criar tabela via RPC, tentando método alternativo:', error);
      
      // Método alternativo: tentar inserir dados de teste para forçar criação
      const testInsert = await supabase
        .from('salas_personalizadas')
        .insert([{
          id: 'test-table-creation',
          nome: 'Teste',
          bairro: 'Teste',
          cidade: 'Teste',
          criador: 'Sistema'
        }]);
        
      if (testInsert.error) {
        console.error('❌ Tabela não existe e não pode ser criada automaticamente');
        console.log('📋 IMPORTANTE: Execute este SQL manualmente no Supabase:');
        console.log(`
-- Cole este código no SQL Editor do Supabase:
CREATE TABLE IF NOT EXISTS salas_personalizadas (
  id VARCHAR(255) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  criador VARCHAR(100) NOT NULL,
  criada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuarios_online INTEGER DEFAULT 0
);

ALTER TABLE salas_personalizadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir tudo para salas" ON salas_personalizadas
  FOR ALL USING (true) WITH CHECK (true);
        `);
        return false;
      } else {
        // Remover dados de teste
        await supabase
          .from('salas_personalizadas')
          .delete()
          .eq('id', 'test-table-creation');
      }
    }
    
    console.log('✅ Tabela salas_personalizadas configurada');
    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar tabela:', error);
    return false;
  }
};

export const testSalasTable = async () => {
  try {
    console.log('🧪 Testando tabela de salas...');
    
    // Tentar fazer uma consulta simples
    const { data, error } = await supabase
      .from('salas_personalizadas')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro no teste da tabela:', error);
      return false;
    }
    
    console.log('✅ Tabela funcionando corretamente');
    return true;
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
};

// Sistema de salas com fallback robusto
export const salvarSalaCompartilhada = async (sala: any) => {
  try {
    console.log('💾 Salvando sala compartilhada:', sala.nome);
    
    // Tentar salvar no Supabase primeiro
    const { data: salaSupabase, error: supabaseError } = await supabase
      .from('salas_personalizadas')
      .insert([{
        id: sala.id,
        nome: sala.nome,
        bairro: sala.bairro,
        cidade: sala.cidade,
        criador: sala.criador,
        usuarios_online: 0
      }])
      .select()
      .single();

    if (supabaseError) {
      console.warn('⚠️ Erro ao salvar no Supabase:', supabaseError.message);
      
      // Fallback: salvar no localStorage global
      const salasGlobais = JSON.parse(localStorage.getItem('salas-globais-compartilhadas') || '[]');
      salasGlobais.push({
        ...sala,
        criada_em: new Date().toISOString(),
        fonte: 'localStorage'
      });
      localStorage.setItem('salas-globais-compartilhadas', JSON.stringify(salasGlobais));
      console.log('💾 Sala salva no localStorage global como fallback');
      return { success: true, fonte: 'localStorage' };
    } else {
      console.log('✅ Sala salva no Supabase:', salaSupabase);
      
      // Também salvar no localStorage para sincronização
      const salasGlobais = JSON.parse(localStorage.getItem('salas-globais-compartilhadas') || '[]');
      salasGlobais.push({
        ...sala,
        criada_em: salaSupabase.criada_em,
        fonte: 'supabase'
      });
      localStorage.setItem('salas-globais-compartilhadas', JSON.stringify(salasGlobais));
      
      return { success: true, fonte: 'supabase', data: salaSupabase };
    }
  } catch (error) {
    console.error('❌ Erro ao salvar sala:', error);
    return { success: false, error };
  }
};

export const carregarSalasCompartilhadas = async () => {
  try {
    console.log('📂 Carregando salas compartilhadas...');
    
    let salasValidas: any[] = [];
    const agora = new Date().getTime();
    
    // Tentar carregar do Supabase primeiro
    const { data: salasSupabase, error: supabaseError } = await supabase
      .from('salas_personalizadas')
      .select('*')
      .order('criada_em', { ascending: false });

    if (!supabaseError && salasSupabase) {
      console.log('✅ Salas carregadas do Supabase:', salasSupabase.length);
      
      // Filtrar salas válidas (24 horas)
      salasValidas = salasSupabase.filter((sala: any) => {
        const criacao = new Date(sala.criada_em).getTime();
        const diferencaHoras = (agora - criacao) / (1000 * 60 * 60);
        console.log(`⏰ Sala "${sala.nome}" criada há ${diferencaHoras.toFixed(1)} horas`);
        return diferencaHoras < 24;
      }).map((sala: any) => ({
        id: sala.id,
        nome: sala.nome,
        bairro: sala.bairro,
        cidade: sala.cidade,
        criada_em: sala.criada_em,
        usuarios: sala.usuarios_online || 0,
        fonte: 'supabase'
      }));

      // Remover salas expiradas do Supabase
      const salasExpiradas = salasSupabase.filter((sala: any) => {
        const criacao = new Date(sala.criada_em).getTime();
        const diferencaHoras = (agora - criacao) / (1000 * 60 * 60);
        return diferencaHoras >= 24;
      });

      if (salasExpiradas.length > 0) {
        console.log('🗑️ Removendo salas expiradas do Supabase:', salasExpiradas.length);
        const idsExpirados = salasExpiradas.map((sala: any) => sala.id);
        await supabase
          .from('salas_personalizadas')
          .delete()
          .in('id', idsExpirados);
      }
    } else {
      console.warn('⚠️ Erro ao carregar do Supabase, usando localStorage:', supabaseError?.message);
    }
    
    // Carregar também do localStorage global (fallback + sincronização)
    const salasLocais = JSON.parse(localStorage.getItem('salas-globais-compartilhadas') || '[]');
    const salasLocaisValidas = salasLocais.filter((sala: any) => {
      const criacao = new Date(sala.criada_em).getTime();
      const diferencaHoras = (agora - criacao) / (1000 * 60 * 60);
      return diferencaHoras < 24;
    });
    
    // Combinar salas do Supabase e localStorage, removendo duplicatas
    const salasIds = new Set(salasValidas.map(s => s.id));
    salasLocaisValidas.forEach((sala: any) => {
      if (!salasIds.has(sala.id)) {
        salasValidas.push(sala);
      }
    });
    
    // Atualizar localStorage removendo salas expiradas
    const salasAtualizadas = salasLocais.filter((sala: any) => {
      const criacao = new Date(sala.criada_em).getTime();
      const diferencaHoras = (agora - criacao) / (1000 * 60 * 60);
      return diferencaHoras < 24;
    });
    localStorage.setItem('salas-globais-compartilhadas', JSON.stringify(salasAtualizadas));
    
    // Se não há salas, criar algumas de exemplo
    if (salasValidas.length === 0) {
      console.log('📭 Criando salas de exemplo...');
      const salasExemplo = [
        {
          id: `exemplo-sp-${Date.now()}`,
          nome: 'Chat Geral - Centro, São Paulo',
          bairro: 'Centro',
          cidade: 'São Paulo',
          criador: 'Sistema',
          criada_em: new Date().toISOString(),
          usuarios: Math.floor(Math.random() * 5) + 1,
          fonte: 'exemplo'
        },
        {
          id: `exemplo-rj-${Date.now() + 1}`,
          nome: 'Galera da Praia - Copacabana, Rio de Janeiro',
          bairro: 'Copacabana',
          cidade: 'Rio de Janeiro',
          criador: 'Sistema',
          criada_em: new Date().toISOString(),
          usuarios: Math.floor(Math.random() * 8) + 2,
          fonte: 'exemplo'
        }
      ];
      
      // Tentar salvar exemplos no Supabase
      if (!supabaseError) {
        try {
          await supabase
            .from('salas_personalizadas')
            .insert(salasExemplo.map(sala => ({
              id: sala.id,
              nome: sala.nome,
              bairro: sala.bairro,
              cidade: sala.cidade,
              criador: sala.criador,
              usuarios_online: sala.usuarios
            })));
          console.log('✅ Salas de exemplo criadas no Supabase');
        } catch (error) {
          console.warn('⚠️ Erro ao criar exemplos no Supabase');
        }
      }
      
      // Salvar no localStorage
      localStorage.setItem('salas-globais-compartilhadas', JSON.stringify(salasExemplo));
      salasValidas = salasExemplo;
    }
    
    console.log('✅ Total de salas compartilhadas carregadas:', salasValidas.length);
    return salasValidas;
    
  } catch (error) {
    console.error('❌ Erro ao carregar salas compartilhadas:', error);
    return [];
  }
};