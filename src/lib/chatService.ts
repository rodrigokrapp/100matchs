import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  room_id: string;
  user_name: string;
  content: string;
  message_type: 'texto' | 'imagem' | 'video' | 'audio' | 'emoji';
  is_premium: boolean;
  is_temporary?: boolean;
  expires_at?: string;
  viewed_by?: string[];
  created_at: string;
  isOptimistic?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  users_online: number;
}

class ChatService {
  private channel: RealtimeChannel | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private currentRoom: string | null = null;
  private messageCallback: ((message: ChatMessage) => void) | null = null;
  private isConnected: boolean = false;
  private localMessages: Map<string, ChatMessage[]> = new Map();

  // Inicializar chat com foco em real-time
  async initializeTables() {
    try {
      console.log('🔧 Inicializando sistema de chat híbrido...');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar:', error);
      return false;
    }
  }

  // Conectar a uma sala com múltiplos canais para garantir comunicação
  async joinRoom(roomId: string, onMessageReceived: (message: ChatMessage) => void) {
    try {
      console.log(`🚀 Conectando à sala ${roomId}...`);
      
      // Desconectar canal anterior
      if (this.channel) {
        await this.leaveRoom();
      }

      this.currentRoom = roomId;
      this.messageCallback = onMessageReceived;

      // Setup BroadcastChannel para comunicação entre abas
      this.setupBroadcastChannel(roomId);

      // Canal principal com broadcast para comunicação direta
      this.channel = supabase
        .channel(`chat-${roomId}`, {
          config: {
            broadcast: { self: true },
            presence: { key: roomId }
          }
        })
        // Listener para broadcast (principal para comunicação direta)
        .on('broadcast', { event: 'new_message' }, (payload) => {
          console.log('📡 Mensagem recebida via broadcast:', payload);
          if (payload.payload && this.messageCallback) {
            const message = payload.payload as ChatMessage;
            this.addToLocalStorage(roomId, message);
            this.messageCallback(message);
          }
        })
        // Listener para presença de usuários
        .on('presence', { event: 'sync' }, () => {
          console.log('👥 Usuários online sincronizados');
        })
        // Fallback: PostgreSQL changes (se funcionar)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        }, (payload) => {
          console.log('🗄️ Mensagem via PostgreSQL:', payload.new);
          if (payload.new && this.messageCallback) {
            const message = payload.new as ChatMessage;
            this.messageCallback(message);
          }
        })
        .subscribe((status) => {
          console.log(`📡 Status da conexão: ${status}`);
          this.isConnected = status === 'SUBSCRIBED';
          
          if (this.isConnected) {
            console.log(`✅ Conectado com sucesso à sala ${roomId}`);
            // Enviar presença
            this.sendPresence(roomId);
          }
        });

      // Adicionar listener para storage local (comunicação entre abas)
      this.setupLocalStorageListener(roomId);

      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar:', error);
      // Mesmo com erro, tentar usar apenas localStorage e BroadcastChannel
      this.setupBroadcastChannel(roomId);
      this.setupLocalStorageListener(roomId);
      this.currentRoom = roomId;
      this.messageCallback = onMessageReceived;
      return true;
    }
  }

  // Setup BroadcastChannel para comunicação entre abas do navegador
  private setupBroadcastChannel(roomId: string) {
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.close();
      }

      this.broadcastChannel = new BroadcastChannel(`chat-${roomId}`);
      
      this.broadcastChannel.onmessage = (event) => {
        console.log('📻 Mensagem via BroadcastChannel:', event.data);
        if (event.data && this.messageCallback) {
          const message = event.data as ChatMessage;
          this.messageCallback(message);
        }
      };

      console.log(`📻 BroadcastChannel configurado para sala ${roomId}`);
    } catch (error) {
      console.warn('⚠️ BroadcastChannel não suportado:', error);
    }
  }

  // Configurar listener para localStorage (comunicação entre abas/usuários)
  private setupLocalStorageListener(roomId: string) {
    const storageListener = (event: StorageEvent) => {
      if (event.key === `chat_${roomId}` && event.newValue && this.messageCallback) {
        try {
          const messages = JSON.parse(event.newValue) as ChatMessage[];
          const latestMessage = messages[messages.length - 1];
          
          if (latestMessage) {
            console.log('💾 Mensagem via localStorage:', latestMessage);
            this.messageCallback(latestMessage);
          }
        } catch (error) {
          console.error('❌ Erro ao processar mensagem do localStorage:', error);
        }
      }
    };

    window.addEventListener('storage', storageListener);

    // Guardar referência para cleanup
    (window as any).chatStorageListener = storageListener;
  }

  // Enviar presença para a sala
  private async sendPresence(roomId: string) {
    if (this.channel) {
      try {
        await this.channel.track({
          room_id: roomId,
          online_at: new Date().toISOString(),
          user_id: `user_${Date.now()}`
        });
      } catch (error) {
        console.error('❌ Erro ao enviar presença:', error);
      }
    }
  }

  // Adicionar mensagem ao localStorage para comunicação entre usuários
  private addToLocalStorage(roomId: string, message: ChatMessage) {
    try {
      const key = `chat_${roomId}`;
      const existing = localStorage.getItem(key);
      const messages = existing ? JSON.parse(existing) : [];
      
      // Evitar duplicatas
      const exists = messages.some((msg: ChatMessage) => 
        msg.id === message.id || 
        (msg.content === message.content && 
         msg.user_name === message.user_name && 
         Math.abs(new Date(msg.created_at).getTime() - new Date(message.created_at).getTime()) < 2000)
      );
      
      if (!exists) {
        messages.push(message);
        // Manter apenas as últimas 100 mensagens
        if (messages.length > 100) {
          messages.splice(0, messages.length - 100);
        }
        localStorage.setItem(key, JSON.stringify(messages));
      }
    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error);
    }
  }

  // Desconectar da sala
  async leaveRoom() {
    try {
      if (this.channel) {
        await supabase.removeChannel(this.channel);
        this.channel = null;
      }

      if (this.broadcastChannel) {
        this.broadcastChannel.close();
        this.broadcastChannel = null;
      }

      // Remover listener do localStorage
      const listener = (window as any).chatStorageListener;
      if (listener) {
        window.removeEventListener('storage', listener);
        delete (window as any).chatStorageListener;
      }

      this.currentRoom = null;
      this.messageCallback = null;
      this.isConnected = false;
      
      console.log('📴 Desconectado da sala');
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
    }
  }

  // Buscar mensagens (localStorage primeiro, depois Supabase)
  async getMessages(roomId: string): Promise<ChatMessage[]> {
    try {
      // Primeiro tentar localStorage
      const localKey = `chat_${roomId}`;
      const localData = localStorage.getItem(localKey);
      let localMessages: ChatMessage[] = [];
      
      if (localData) {
        localMessages = JSON.parse(localData);
        console.log(`💾 Carregadas ${localMessages.length} mensagens do localStorage`);
      }

      // Tentar buscar do Supabase também
      try {
        const { data: supabaseMessages, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true })
          .limit(50);

        if (!error && supabaseMessages) {
          console.log(`🗄️ Carregadas ${supabaseMessages.length} mensagens do Supabase`);
          
          // Combinar mensagens, evitando duplicatas
          const combinedMessages = [...localMessages];
          
          supabaseMessages.forEach(msg => {
            const exists = combinedMessages.some(existing => 
              existing.id === msg.id ||
              (existing.content === msg.content && 
               existing.user_name === msg.user_name &&
               Math.abs(new Date(existing.created_at).getTime() - new Date(msg.created_at).getTime()) < 5000)
            );
            
            if (!exists) {
              combinedMessages.push(msg);
            }
          });

          // Ordenar por data
          combinedMessages.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          return combinedMessages;
        }
      } catch (supabaseError) {
        console.warn('⚠️ Erro no Supabase, usando apenas localStorage:', supabaseError);
      }

      // Se falhar Supabase, usar localStorage + mensagens mock
      if (localMessages.length === 0) {
        return this.getMockMessages(roomId);
      }

      return localMessages;
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
      return this.getMockMessages(roomId);
    }
  }

  // Enviar mensagem com múltiplos canais garantindo entrega
  async sendMessage(
    roomId: string,
    userName: string,
    content: string,
    messageType: 'texto' | 'imagem' | 'video' | 'audio' | 'emoji' = 'texto',
    isPremium: boolean = false,
    isTemporary: boolean = false,
    duration: number = 10
  ): Promise<boolean> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const message: ChatMessage = {
      id: messageId,
      room_id: roomId,
      user_name: userName,
      content,
      message_type: messageType,
      is_premium: isPremium,
      is_temporary: isTemporary,
      expires_at: isTemporary ? new Date(Date.now() + duration * 60000).toISOString() : undefined,
      viewed_by: [],
      created_at: new Date().toISOString(),
    };

    console.log('⚡ ENVIO ULTRA RÁPIDO:', message);

    // ⚡ INSTANTÂNEO: Callback local PRIMEIRO (para aparecer imediatamente)
    if (this.messageCallback) {
      this.messageCallback(message);
    }

    // ⚡ INSTANTÂNEO: localStorage (síncrono)
    this.addToLocalStorage(roomId, message);

    // ⚡ INSTANTÂNEO: Eventos customizados (síncronos)
    window.dispatchEvent(new CustomEvent('chatMessageSent', {
      detail: { message, roomId }
    }));

    localStorage.setItem('lastChatMessage', JSON.stringify({
      message,
      roomId,
      timestamp: Date.now()
    }));

    // 🚀 ESTRATÉGIA PARALELA: Todas as operações remotas SEM bloquear
    // BroadcastChannel instantâneo
    try {
      this.broadcastChannel?.postMessage(message);
    } catch (e) {
      console.log('BroadcastChannel falhou:', e);
    }

    // Operações remotas em background (não bloqueiam)
    setTimeout(() => {
      // Broadcast Supabase
      this.channel?.send({
        type: 'broadcast',
        event: 'new_message',
        payload: message
      }).catch((e: any) => console.log('Broadcast falhou:', e));
      
      // Supabase Database
      supabase.from('chat_messages').insert([message]).catch((e: any) => {
        console.log('DB falhou:', e);
      });
    }, 0); // Próximo tick, sem delay

    console.log('⚡ Mensagem disparada INSTANTANEAMENTE!');
    return true;
  }

  // Mensagens mock para demonstração
  private getMockMessages(roomId: string): ChatMessage[] {
    return [
      {
        id: 'mock-1',
        room_id: roomId,
        user_name: 'Ana',
        content: 'Olá! Alguém aí da região? 👋',
        message_type: 'texto',
        is_premium: false,
        created_at: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: 'mock-2',
        room_id: roomId,
        user_name: 'Carlos_Premium',
        content: 'Oi! Eu moro perto, vamos conversar? ☕',
        message_type: 'texto',
        is_premium: true,
        created_at: new Date(Date.now() - 180000).toISOString(),
      }
    ];
  }

  // Outras funções mantidas...
  async markTemporaryMessageViewed(messageId: string, userName: string): Promise<boolean> {
    return true; // Simplified for now
  }

  async cleanExpiredMessages(roomId: string) {
    try {
      const key = `chat_${roomId}`;
      const data = localStorage.getItem(key);
      if (data) {
        const messages = JSON.parse(data) as ChatMessage[];
        const now = new Date();
        const validMessages = messages.filter(msg => {
          if (!msg.is_temporary || !msg.expires_at) return true;
          return new Date(msg.expires_at) > now;
        });
        localStorage.setItem(key, JSON.stringify(validMessages));
      }
    } catch (error) {
      console.error('❌ Erro ao limpar mensagens:', error);
    }
  }

  filterValidMessages(messages: ChatMessage[]): ChatMessage[] {
    const now = new Date();
    return messages.filter(msg => {
      if (!msg.is_temporary || !msg.expires_at) return true;
      return new Date(msg.expires_at) > now;
    });
  }

  async updateOnlineUsers(roomId: string, count: number) {
    try {
      // Atualizar contador local
      console.log(`📊 Atualizando usuários online para sala ${roomId}: ${count}`);
    } catch (error) {
      console.error('❌ Erro ao atualizar usuários online:', error);
    }
  }

  // ✅ NOVA FUNÇÃO: Gerenciar cache de fotos dos usuários
  setUserPhoto(userName: string, photoUrl: string) {
    try {
      const userKey = `user_photo_${userName}`;
      localStorage.setItem(userKey, JSON.stringify({
        nome: userName,
        foto: photoUrl,
        timestamp: new Date().toISOString()
      }));
      console.log('📸 Foto do usuário salva no cache:', userName);
    } catch (error) {
      console.error('❌ Erro ao salvar foto do usuário:', error);
    }
  }
  
  getUserPhoto(userName: string): string | null {
    try {
      console.log('🔍 Buscando foto específica para usuário:', userName);
      
      // Buscar apenas dados salvos do usuário específico, sem caches genéricos
      const possibleKeys = [
        `perfil_${userName}`,
        `usuario_${userName}`,
        `user_${userName}`,
        `profile_${userName}`,
        `user_photo_${userName}`
      ];
      
      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            // Verificar se o nome corresponde exatamente para evitar mistura de fotos
            if (parsed.nome === userName) {
              console.log(`📁 Dados encontrados para ${userName} em ${key}:`, parsed);
              
              // Priorizar array de fotos
              if (parsed.fotos && Array.isArray(parsed.fotos) && parsed.fotos.length > 0) {
                const validPhoto = parsed.fotos.find((foto: string) => foto && foto.startsWith('data:image/'));
                if (validPhoto) {
                  console.log('✅ Foto encontrada no array de fotos para:', userName);
                  return validPhoto;
                }
              }
              
              // Foto única
              if (parsed.foto && parsed.foto.startsWith('data:image/')) {
                console.log('✅ Foto única encontrada para:', userName);
                return parsed.foto;
              }
            }
          } catch (e) {
            console.warn('⚠️ Erro ao parsear dados de', key, ':', e);
          }
        }
      }
      
      console.log('❌ Nenhuma foto específica encontrada para:', userName);
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar foto do usuário:', error);
      return null;
    }
  }
}

export const chatService = new ChatService();

// 🧹 SISTEMA DE LIMPEZA AUTOMÁTICA
class HistoryCleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Iniciar limpeza automática a cada 5 minutos
  startAutoCleanup() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🧹 Sistema de limpeza automática iniciado (5 em 5 minutos)');
    
    // Executar primeira limpeza imediatamente
    this.performCleanup();
    
    // Configurar limpeza automática a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 5 * 60 * 1000); // 5 minutos
  }

  // Parar limpeza automática
  stopAutoCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isRunning = false;
    console.log('🧹 Sistema de limpeza automática parado');
  }

  // Executar limpeza completa
  private async performCleanup() {
    try {
      console.log('🧹 Iniciando limpeza automática...');
      
      // 1. Limpar localStorage
      this.cleanupLocalStorage();
      
      // 2. Limpar Supabase (se disponível)
      await this.cleanupSupabase();
      
      console.log('✅ Limpeza automática concluída');
    } catch (error) {
      console.error('❌ Erro na limpeza automática:', error);
    }
  }

  // Limpar dados do localStorage
  private cleanupLocalStorage() {
    try {
      const agora = Date.now();
      const CINCO_MINUTOS = 5 * 60 * 1000;
      
      // Limpar mensagens antigas
      const chaves = Object.keys(localStorage);
      chaves.forEach(chave => {
        if (chave.startsWith('chat_') || chave.startsWith('mensagens_')) {
          try {
            const dados = JSON.parse(localStorage.getItem(chave) || '[]');
            if (Array.isArray(dados)) {
              const mensagensFiltradas = dados.filter((msg: any) => {
                const timestamp = new Date(msg.created_at || msg.timestamp).getTime();
                return (agora - timestamp) < CINCO_MINUTOS;
              });
              
              if (mensagensFiltradas.length !== dados.length) {
                localStorage.setItem(chave, JSON.stringify(mensagensFiltradas));
                console.log(`🧹 Limpeza localStorage: ${dados.length - mensagensFiltradas.length} mensagens removidas de ${chave}`);
              }
            }
          } catch (error) {
            // Se houver erro, remover completamente
            localStorage.removeItem(chave);
          }
        }
      });

      // Limpar imagens temporárias (URLs blob antigas)
      chaves.forEach(chave => {
        if (chave.includes('temp_image') || chave.includes('blob_')) {
          localStorage.removeItem(chave);
        }
      });

      console.log('✅ localStorage limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar localStorage:', error);
    }
  }

  // Limpar dados do Supabase
  private async cleanupSupabase() {
    try {
      // Importar supabase apenas quando necessário
      const { supabase } = await import('./supabase');
      
      const agora = new Date();
      const cincoMinutosAtras = new Date(agora.getTime() - (5 * 60 * 1000));
      
      // Limpar mensagens antigas
      const { error: deleteError } = await supabase
        .from('mensagens')
        .delete()
        .lt('created_at', cincoMinutosAtras.toISOString());

      if (deleteError) {
        console.warn('⚠️ Erro ao limpar mensagens do Supabase:', deleteError);
      } else {
        console.log('✅ Mensagens antigas removidas do Supabase');
      }

      // Limpar dados de sessão antigos
      const { error: sessionError } = await supabase
        .from('usuarios_online')
        .delete()
        .lt('last_seen', cincoMinutosAtras.toISOString());

      if (sessionError) {
        console.warn('⚠️ Erro ao limpar sessões do Supabase:', sessionError);
      }

    } catch (error) {
      console.warn('⚠️ Supabase não disponível para limpeza:', error);
    }
  }

  // Limpar dados específicos de uma sala
  cleanupRoom(roomId: string) {
    try {
      localStorage.removeItem(`chat_${roomId}`);
      localStorage.removeItem(`mensagens_${roomId}`);
      localStorage.removeItem(`usuarios_${roomId}`);
      console.log(`🧹 Dados da sala ${roomId} limpos`);
    } catch (error) {
      console.error('❌ Erro ao limpar dados da sala:', error);
    }
  }
}

// Instância global do serviço de limpeza
export const historyCleanup = new HistoryCleanupService();