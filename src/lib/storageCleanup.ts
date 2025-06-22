// 🧹 Utilitário para limpeza do localStorage e resolução de quota exceeded
export const limparLocalStorageQuotaExceeded = (): boolean => {
  try {
    console.log('🧹 Iniciando limpeza para resolver quota exceeded...');
    
    // 1. Salvar dados críticos
    const dadosCriticos = {
      usuario: localStorage.getItem('usuario'),
      user_token: localStorage.getItem('user_token'),
      auth_session: localStorage.getItem('auth_session')
    };
    
    // 2. Obter todas as chaves
    const todasChaves: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (chave) todasChaves.push(chave);
    }
    
    // 3. Identificar chaves problemáticas (dados pesados)
    const chavesProblematicas = todasChaves.filter(chave => 
      chave.includes('lastChatMessage') ||
      chave.includes('audioRecording') ||
      chave.includes('blob_') ||
      chave.includes('data:image') ||
      chave.startsWith('chat_') ||
      chave.startsWith('perfil_') ||
      chave.includes('temp') ||
      chave.includes('upload') ||
      chave.includes('force') ||
      chave.includes('last') ||
      chave.includes('refresh')
    );
    
    // 4. Remover chaves problemáticas
    let removidas = 0;
    chavesProblematicas.forEach(chave => {
      try {
        localStorage.removeItem(chave);
        removidas++;
      } catch (e) {
        console.warn(`Erro ao remover ${chave}:`, e);
      }
    });
    
    console.log(`🗑️ Removidas ${removidas} chaves problemáticas`);
    
    // 5. Testar se ainda há problema de quota
    try {
      localStorage.setItem('teste_quota', 'teste');
      localStorage.removeItem('teste_quota');
      console.log('✅ Quota resolvida com limpeza seletiva');
      return true;
    } catch (quotaError) {
      // 6. Se ainda há problema, limpeza total
      console.log('🧹 Quota ainda excedida, fazendo limpeza total...');
      localStorage.clear();
      
      // 7. Restaurar apenas dados críticos
      Object.entries(dadosCriticos).forEach(([key, value]) => {
        if (value) {
          try {
            localStorage.setItem(key, value);
          } catch (e) {
            console.warn(`Erro ao restaurar ${key}:`, e);
          }
        }
      });
      
      console.log('✅ Limpeza total realizada');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Erro crítico na limpeza:', error);
    
    // Último recurso: limpar absolutamente tudo
    try {
      localStorage.clear();
      console.log('🧹 Limpeza de emergência realizada');
      return false;
    } catch (clearError) {
      console.error('❌ Erro ao limpar localStorage:', clearError);
      return false;
    }
  }
};

// 🔄 Função para salvamento seguro no localStorage
export const salvarSeguroLocalStorage = (chave: string, valor: any): boolean => {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (quotaError) {
    console.warn(`❌ Quota exceeded ao salvar ${chave}, iniciando limpeza...`);
    
    // Tentar limpar e salvar novamente
    const limpezaSucesso = limparLocalStorageQuotaExceeded();
    
    if (limpezaSucesso) {
      try {
        localStorage.setItem(chave, JSON.stringify(valor));
        console.log(`✅ ${chave} salvo após limpeza`);
        return true;
      } catch (segundoErro) {
        console.error(`❌ Erro persistente ao salvar ${chave}:`, segundoErro);
        return false;
      }
    }
    
    return false;
  }
};

// 📊 Função para monitorar uso do localStorage
export const verificarEspacoLocalStorage = (): { usado: number; disponivel: number; percentual: number } => {
  try {
    let usado = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (chave) {
        const valor = localStorage.getItem(chave);
        if (valor) {
          usado += chave.length + valor.length;
        }
      }
    }
    
    // Limite típico do localStorage: ~5-10MB
    const limiteEstimado = 5 * 1024 * 1024; // 5MB
    const disponivel = limiteEstimado - usado;
    const percentual = (usado / limiteEstimado) * 100;
    
    return { usado, disponivel, percentual };
    
  } catch (error) {
    console.error('Erro ao verificar espaço:', error);
    return { usado: 0, disponivel: 0, percentual: 100 };
  }
}; 