export interface MediaMessage {
  id: string;
  type: 'video' | 'audio' | 'image';
  content: string | Blob;
  duration?: number;
  isTemporary: boolean;
  expiresAt?: Date;
}

class MediaService {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];

  // Capturar vídeo de 0-10 segundos
  async captureVideo(duration: number = 10): Promise<Blob | null> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      return new Promise((resolve, reject) => {
        this.mediaRecorder = new MediaRecorder(this.stream!);
        this.chunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.chunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.chunks, { type: 'video/webm' });
          this.cleanup();
          resolve(blob);
        };

        this.mediaRecorder.onerror = (event) => {
          this.cleanup();
          reject(event);
        };

        this.mediaRecorder.start();

        // Parar gravação automaticamente após a duração especificada
        setTimeout(() => {
          if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
          }
        }, duration * 1000);
      });
    } catch (error) {
      console.error('Erro ao capturar vídeo:', error);
      return null;
    }
  }

  // Gravar áudio de 0-10 segundos
  async recordAudio(duration: number = 10): Promise<Blob | null> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      return new Promise((resolve, reject) => {
        this.mediaRecorder = new MediaRecorder(this.stream!);
        this.chunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.chunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.chunks, { type: 'audio/webm' });
          this.cleanup();
          resolve(blob);
        };

        this.mediaRecorder.onerror = (event) => {
          this.cleanup();
          reject(event);
        };

        this.mediaRecorder.start();

        // Parar gravação automaticamente após a duração especificada
        setTimeout(() => {
          if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
          }
        }, duration * 1000);
      });
    } catch (error) {
      console.error('Erro ao gravar áudio:', error);
      return null;
    }
  }

  // Selecionar imagem da galeria
  async selectImage(): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = false;

      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        resolve(file || null);
      };

      input.oncancel = () => {
        resolve(null);
      };

      // Adicionar ao DOM temporariamente para funcionar em todos os browsers
      input.style.display = 'none';
      document.body.appendChild(input);
      input.click();
      
      // Remover do DOM após uso
      setTimeout(() => {
        document.body.removeChild(input);
      }, 1000);
    });
  }

  // Parar gravação manualmente
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  // Limpar recursos
  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.chunks = [];
  }

  // Converter blob para base64 para envio
  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Criar URL temporária para visualização
  createTempUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  // Revogar URL temporária
  revokeTempUrl(url: string) {
    URL.revokeObjectURL(url);
  }

  // Verificar se o dispositivo suporta mídia
  static isMediaSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // Verificar permissões de câmera
  static async checkCameraPermission(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return result.state === 'granted';
    } catch {
      return false;
    }
  }

  // Verificar permissões de microfone
  static async checkMicrophonePermission(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state === 'granted';
    } catch {
      return false;
    }
  }
}

export const mediaService = new MediaService();

// Emojis expandidos para seleção
export const EMOJI_CATEGORIES = {
  smileys: [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩'
  ],
  hearts: [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌'
  ],
  gestures: [
    '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋'
  ],
  activities: [
    '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🎯', '🎪', '🎭',
    '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🎹', '🥁', '🎸'
  ],
  nature: [
    '🌈', '☀️', '🌤️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️', '❄️', '☃️',
    '🌟', '⭐', '🌠', '☄️', '🌍', '🌎', '🌏', '🌙', '🌕', '🌖'
  ]
};

// Função para criar mensagem temporária
export const createTemporaryMessage = (
  type: 'video' | 'audio' | 'image',
  content: string | Blob,
  duration: number = 10
): MediaMessage => {
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + duration);

  return {
    id: Date.now().toString(),
    type,
    content,
    duration,
    isTemporary: true,
    expiresAt
  };
}; 