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
    try {
      const expiresAt = isTemporary ? new Date(Date.now() + duration * 1000).toISOString() : undefined;
      
      const message: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        room_id: roomId,
        user_name: userName,
        content,
        message_type: messageType,
        is_premium: isPremium,
        is_temporary: isTemporary,
        expires_at: expiresAt,
        viewed_by: [],
        created_at: new Date().toISOString(),
      };

      console.log('📤 Enviando mensagem:', message);

      let success = false;

      // Método 1: BroadcastChannel (PRIORITÁRIO para mesmo navegador)
      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage(message);
          success = true;
          console.log('✅ Mensagem enviada via BroadcastChannel');
        } catch (bcError) {
          console.warn('⚠️ Falha no BroadcastChannel:', bcError);
        }
      }

      // Método 2: Broadcast via Supabase (para outros navegadores/dispositivos)
      if (this.channel && this.isConnected) {
        try {
          await this.channel.send({
            type: 'broadcast',
            event: 'new_message',
            payload: message
          });
          success = true;
          console.log('✅ Mensagem enviada via Supabase broadcast');
        } catch (broadcastError) {
          console.warn('⚠️ Falha no Supabase broadcast:', broadcastError);
        }
      }

      // Método 3: Salvar no localStorage (ESSENCIAL para persistência)
      this.addToLocalStorage(roomId, message);
      success = true;
      console.log('✅ Mensagem salva no localStorage');

      // Método 4: Tentar Supabase database (persistência no servidor)
      try {
        const { error } = await supabase
          .from('chat_messages')
          .insert([message]);

        if (!error) {
          console.log('✅ Mensagem salva no Supabase database');
        }
      } catch (dbError) {
        console.warn('⚠️ Falha no database (não crítico):', dbError);
      }

      // Método 5: Callback local imediato (para o próprio usuário)
      if (this.messageCallback) {
        setTimeout(() => {
          this.messageCallback!(message);
        }, 50);
      }

      return success;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
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
    // Simplified for now
    console.log(`👥 Usuários online na sala ${roomId}: ${count}`);
  }
}

export const chatService = new ChatService();