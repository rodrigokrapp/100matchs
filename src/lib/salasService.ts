import { supabase } from './supabase';

interface SalaCompartilhada {
  id: string;
  nome: string;
  bairro: string;
  cidade: string;
  criador: string;
  criada_em: string;
  usuarios: number;
  fonte?: string;
}

// Chave para localStorage global compartilhado
const STORAGE_KEY = 'salas-compartilhadas-globais';

export const salvarSalaCompartilhada = async (sala: Omit<SalaCompartilhada, 'criada_em' | 'usuarios' | 'fonte'>) => {
  try {
    console.log('💾 Salvando sala compartilhada:', sala.nome);
    
    const novaSala = {
      ...sala,
      criada_em: new Date().toISOString(),
      usuarios: 0
    };
    
    let sucessoSupabase = false;
    
    // Tentar salvar no Supabase PRIMEIRO
    try {
      console.log('☁️ Tentando salvar no Supabase...');
      const { data: salaSupabase, error: supabaseError } = await supabase
        .from('salas_personalizadas')
        .insert([{
          id: novaSala.id,
          nome: novaSala.nome,
          bairro: novaSala.bairro,
          cidade: novaSala.cidade,
          criador: novaSala.criador,
          usuarios_online: 0
        }])
        .select()
        .single();

      if (!supabaseError && salaSupabase) {
        console.log('✅ Sala salva no Supabase:', salaSupabase);
        sucessoSupabase = true;
      } else {
        console.warn('⚠️ Erro ao salvar no Supabase:', supabaseError?.message);
      }
    } catch (error) {
      console.warn('⚠️ Falha na conexão com Supabase:', error);
    }
    
    // SEMPRE salvar no localStorage como backup e para sincronização imediata
    console.log('💾 Salvando no localStorage como backup...');
    const salasExistentes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const salaComFonte = {
      ...novaSala,
      fonte: sucessoSupabase ? 'supabase' : 'localStorage'
    };
    
    // Verificar se a sala já existe (evitar duplicatas)
    const salaExiste = salasExistentes.find((s: SalaCompartilhada) => s.id === salaComFonte.id);
    if (!salaExiste) {
      salasExistentes.push(salaComFonte);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salasExistentes));
      console.log('💾 Sala salva no localStorage global');
    } else {
      console.log('ℹ️ Sala já existe no localStorage');
    }
    
    return { success: true, fonte: sucessoSupabase ? 'supabase' : 'localStorage' };
  } catch (error) {
    console.error('❌ Erro ao salvar sala:', error);
    return { success: false, error };
  }
};

export const carregarSalasCompartilhadas = async (): Promise<SalaCompartilhada[]> => {
  try {
    console.log('📂 Carregando salas compartilhadas de todas as fontes...');
    
    const agora = new Date().getTime();
    let todasSalas: SalaCompartilhada[] = [];
    
    // 1. PRIORIDADE: Carregar do Supabase
    let salasSupabase: SalaCompartilhada[] = [];
    try {
      console.log('☁️ Carregando salas do Supabase...');
      const { data: dados, error: supabaseError } = await supabase
        .from('salas_personalizadas')
        .select('*')
        .order('criada_em', { ascending: false });

      if (!supabaseError && dados && dados.length > 0) {
        console.log('✅ Salas encontradas no Supabase:', dados.length);
        
        salasSupabase = dados.map((sala: any) => ({
          id: sala.id,
          nome: sala.nome,
          bairro: sala.bairro,
          cidade: sala.cidade,
          criador: sala.criador,
          criada_em: sala.criada_em,
          usuarios: sala.usuarios_online || 0,
          fonte: 'supabase'
        }));
        
        todasSalas = [...todasSalas, ...salasSupabase];
        console.log('📝 Salas do Supabase processadas:', salasSupabase.length);
        
        // Remover salas expiradas do Supabase apenas se encontrarmos algumas
        const salasExpiradas = dados.filter((sala: any) => {
          const criacao = new Date(sala.criada_em).getTime();
          const diferencaHoras = (agora - criacao) / (1000 * 60 * 60);
          return diferencaHoras >= 24;
        });

        if (salasExpiradas.length > 0) {
          console.log('🗑️ Removendo salas expiradas do Supabase:', salasExpiradas.length);
          const idsExpirados = salasExpiradas.map((sala: any) => sala.id);
          try {
            await supabase
              .from('salas_personalizadas')
              .delete()
              .in('id', idsExpirados);
            console.log('✅ Salas expiradas removidas do Supabase');
          } catch (deleteError) {
            console.warn('⚠️ Erro ao remover salas expiradas:', deleteError);
          }
        }
      } else {
        console.warn('⚠️ Nenhuma sala encontrada no Supabase ou erro:', supabaseError?.message);
      }
    } catch (error) {
      console.warn('⚠️ Falha na conexão com Supabase:', error);
    }
    
    // 2. Carregar do localStorage global como backup/complemento
    let salasLocais: SalaCompartilhada[] = [];
    try {
      console.log('📱 Carregando salas do localStorage...');
      salasLocais = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      console.log('📱 Salas encontradas no localStorage:', salasLocais.length);
      
      // Adicionar salas locais que não estão no Supabase
      const idsSupabase = new Set(todasSalas.map(s => s.id));
      const salasLocaisNovas = salasLocais.filter(sala => !idsSupabase.has(sala.id));
      
      if (salasLocaisNovas.length > 0) {
        console.log('📝 Adicionando salas únicas do localStorage:', salasLocaisNovas.length);
        todasSalas = [...todasSalas, ...salasLocaisNovas];
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar localStorage:', error);
    }
    
    // 3. Filtrar salas válidas (menos de 24 horas)
    const salasValidas = todasSalas.filter(sala => {
      const criacao = new Date(sala.criada_em).getTime();
      const diferencaHoras = (agora - criacao) / (1000 * 60 * 60);
      const valida = diferencaHoras < 24;
      
      if (valida) {
        console.log(`⏰ Sala válida: "${sala.nome}" (${diferencaHoras.toFixed(1)}h - ${sala.fonte})`);
      } else {
        console.log(`⏰ Sala expirada: "${sala.nome}" (${diferencaHoras.toFixed(1)}h - ${sala.fonte})`);
      }
      
      return valida;
    });
    
    // 4. Limpar localStorage de salas expiradas
    const salasLocaisValidas = salasLocais.filter(sala => {
      const criacao = new Date(sala.criada_em).getTime();
      const diferencaHoras = (agora - criacao) / (1000 * 60 * 60);
      return diferencaHoras < 24;
    });
    
    if (salasLocaisValidas.length !== salasLocais.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salasLocaisValidas));
      console.log('🧹 localStorage limpo de salas expiradas');
    }
    
    // 5. Se não há salas válidas, criar exemplos GARANTIDOS
    if (salasValidas.length === 0) {
      console.log('📭 ZERO salas encontradas! Criando salas de exemplo...');
      const agora = new Date().toISOString();
      const salasExemplo: SalaCompartilhada[] = [
        {
          id: `exemplo-sp-${Date.now()}`,
          nome: 'Chat Geral - Centro, São Paulo',
          bairro: 'Centro',
          cidade: 'São Paulo',
          criador: 'Sistema',
          criada_em: agora,
          usuarios: Math.floor(Math.random() * 5) + 1,
          fonte: 'exemplo'
        },
        {
          id: `exemplo-rj-${Date.now() + 1}`,
          nome: 'Galera da Praia - Copacabana, Rio de Janeiro',
          bairro: 'Copacabana',
          cidade: 'Rio de Janeiro',
          criador: 'Sistema',
          criada_em: agora,
          usuarios: Math.floor(Math.random() * 8) + 2,
          fonte: 'exemplo'
        },
        {
          id: `exemplo-mg-${Date.now() + 2}`,
          nome: 'Pessoal de BH - Savassi, Belo Horizonte',
          bairro: 'Savassi',
          cidade: 'Belo Horizonte',
          criador: 'Sistema',
          criada_em: agora,
          usuarios: Math.floor(Math.random() * 6) + 1,
          fonte: 'exemplo'
        }
      ];
      
      // Salvar exemplos no localStorage PRIMEIRO
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salasExemplo));
      console.log('💾 Salas de exemplo salvas no localStorage');
      
      // Tentar salvar no Supabase também (mas não bloquear se falhar)
      try {
        console.log('☁️ Tentando salvar exemplos no Supabase...');
        const { error } = await supabase
          .from('salas_personalizadas')
          .insert(salasExemplo.map(sala => ({
            id: sala.id,
            nome: sala.nome,
            bairro: sala.bairro,
            cidade: sala.cidade,
            criador: sala.criador,
            usuarios_online: sala.usuarios
          })));
          
        if (!error) {
          console.log('✅ Salas de exemplo salvas no Supabase');
        } else {
          console.warn('⚠️ Erro ao salvar exemplos no Supabase:', error.message);
        }
      } catch (error) {
        console.warn('⚠️ Não foi possível salvar exemplos no Supabase:', error);
      }
      
      console.log('🎯 Retornando salas de exemplo:', salasExemplo.length);
      return salasExemplo;
    }
    
    console.log('✅ Total de salas válidas carregadas:', salasValidas.length);
    salasValidas.forEach((sala, index) => {
      console.log(`  ${index + 1}. "${sala.nome}" (${sala.cidade}) - ${sala.fonte}`);
    });
    
    return salasValidas;
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO ao carregar salas:', error);
    
    // Fallback de emergência: retornar do localStorage apenas
    console.log('🆘 Usando fallback de emergência - apenas localStorage');
    try {
      const salasLocais = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const agora = new Date().getTime();
      const salasValidas = salasLocais.filter((sala: SalaCompartilhada) => {
        const criacao = new Date(sala.criada_em).getTime();
        const diferencaHoras = (agora - criacao) / (1000 * 60 * 60);
        return diferencaHoras < 24;
      });
      
      console.log('🆘 Salas do fallback:', salasValidas.length);
      return salasValidas;
    } catch (fallbackError) {
      console.error('❌ Falha total no fallback:', fallbackError);
      return [];
    }
  }
};

export const excluirSalaCompartilhada = async (salaId: string) => {
  try {
    console.log('🗑️ Excluindo sala:', salaId);
    
    // Excluir do Supabase
    try {
      await supabase
        .from('salas_personalizadas')
        .delete()
        .eq('id', salaId);
      console.log('✅ Sala removida do Supabase');
    } catch (error) {
      console.warn('⚠️ Erro ao remover do Supabase:', error);
    }
    
    // Excluir do localStorage
    const salasExistentes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const salasAtualizadas = salasExistentes.filter((sala: SalaCompartilhada) => sala.id !== salaId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(salasAtualizadas));
    console.log('✅ Sala removida do localStorage');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao excluir sala:', error);
    return false;
  }
};

// Função para sincronizar localStorage com Supabase
export const sincronizarSalas = async () => {
  try {
    console.log('🔄 Sincronizando salas entre localStorage e Supabase...');
    
    const salasLocais = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const salasParaSincronizar = salasLocais.filter((sala: SalaCompartilhada) => 
      sala.fonte === 'localStorage' || !sala.fonte
    );
    
    if (salasParaSincronizar.length > 0) {
      console.log(`📤 Sincronizando ${salasParaSincronizar.length} salas para o Supabase...`);
      
      for (const sala of salasParaSincronizar) {
        try {
          await supabase
            .from('salas_personalizadas')
            .insert([{
              id: sala.id,
              nome: sala.nome,
              bairro: sala.bairro,
              cidade: sala.cidade,
              criador: sala.criador,
              usuarios_online: sala.usuarios || 0
            }]);
          
          // Atualizar fonte no localStorage
          sala.fonte = 'supabase';
        } catch (error) {
          console.warn(`⚠️ Erro ao sincronizar sala ${sala.nome}:`, error);
        }
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salasLocais));
      console.log('✅ Sincronização concluída');
    }
  } catch (error) {
    console.warn('⚠️ Erro na sincronização:', error);
  }
};