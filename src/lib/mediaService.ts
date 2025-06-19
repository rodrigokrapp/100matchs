export interface MediaMessage {
  id: string;
  type: 'video' | 'audio' | 'image';
  content: string | Blob;
  duration?: number;
  isTemporary: boolean;
  expiresAt?: Date;
}

class MediaService {
  private static mediaRecorder: MediaRecorder | null = null;
  private static stream: MediaStream | null = null;
  private static chunks: Blob[] = [];
  private static lastBlob: Blob | null = null;

  // Capturar vídeo com qualidade melhorada (sem limitação de tempo)
  static async captureVideo(): Promise<Blob | null> {
    try {
      MediaService.stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 24 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });

      return new Promise((resolve, reject) => {
        MediaService.mediaRecorder = new MediaRecorder(MediaService.stream!);
        MediaService.chunks = [];

        MediaService.mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            MediaService.chunks.push(event.data);
          }
        };

        MediaService.mediaRecorder.onstop = () => {
          const blob = new Blob(MediaService.chunks, { type: 'video/webm' });
          MediaService.lastBlob = blob;
          MediaService.cleanup();
          resolve(blob);
        };

        MediaService.mediaRecorder.onerror = (event: Event) => {
          MediaService.cleanup();
          reject(event);
        };

        MediaService.mediaRecorder.start();
        // Gravação sem limitação de tempo - deve ser parada manualmente
      });
    } catch (error) {
      console.error('Erro ao capturar vídeo:', error);
      return null;
    }
  }

  // Gravar áudio sem limitação de tempo
  static async recordAudio(): Promise<Blob | null> {
    try {
      MediaService.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      return new Promise((resolve, reject) => {
        MediaService.mediaRecorder = new MediaRecorder(MediaService.stream!);
        MediaService.chunks = [];

        MediaService.mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            MediaService.chunks.push(event.data);
          }
        };

        MediaService.mediaRecorder.onstop = () => {
          const blob = new Blob(MediaService.chunks, { type: 'audio/webm' });
          MediaService.cleanup();
          resolve(blob);
        };

        MediaService.mediaRecorder.onerror = (event: Event) => {
          MediaService.cleanup();
          reject(event);
        };

        MediaService.mediaRecorder.start();
        // Gravação sem limitação de tempo - deve ser parada manualmente
      });
    } catch (error) {
      console.error('Erro ao gravar áudio:', error);
      return null;
    }
  }

  // Selecionar imagem da galeria
  static async selectImage(): Promise<File | null> {
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
  static stopRecording() {
    if (MediaService.mediaRecorder && MediaService.mediaRecorder.state === 'recording') {
      MediaService.mediaRecorder.stop();
    }
  }

  // Limpar recursos
  private static cleanup() {
    if (MediaService.stream) {
      MediaService.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      MediaService.stream = null;
    }
    MediaService.mediaRecorder = null;
    MediaService.chunks = [];
  }

  // Converter blob para base64 para envio
  static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Criar URL temporária para visualização
  static createTempUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  // Revogar URL temporária
  static revokeTempUrl(url: string) {
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

  // Iniciar gravação de áudio (versão otimizada)
  static async startAudioRecording(): Promise<void> {
    try {
      MediaService.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      MediaService.mediaRecorder = new MediaRecorder(MediaService.stream, {
        mimeType: 'audio/webm'
      });
      MediaService.chunks = [];

      MediaService.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          MediaService.chunks.push(event.data);
        }
      };

      MediaService.mediaRecorder.start();
    } catch (error) {
      console.error('Erro ao iniciar gravação de áudio:', error);
      throw error;
    }
  }

  // Parar gravação e obter blob imediatamente
  static async stopAndGetBlob(): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      if (!MediaService.mediaRecorder) {
        resolve(null);
        return;
      }

      MediaService.mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(MediaService.chunks, { 
            type: MediaService.chunks[0]?.type || 'audio/webm' 
          });
          MediaService.lastBlob = blob;
          MediaService.cleanup();
          resolve(blob);
        } catch (error) {
          reject(error);
        }
      };

      MediaService.mediaRecorder.onerror = (event: Event) => {
        MediaService.cleanup();
        reject(event);
      };

      if (MediaService.mediaRecorder.state === 'recording') {
        MediaService.mediaRecorder.stop();
      } else {
        resolve(MediaService.lastBlob);
      }
    });
  }

  // Novo método para iniciar gravação
  static startVideoRecording(stream: MediaStream) {
    try {
      MediaService.stream = stream;
      MediaService.chunks = [];
      MediaService.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      MediaService.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          MediaService.chunks.push(event.data);
        }
      };

      MediaService.mediaRecorder.onstop = () => {
        MediaService.lastBlob = new Blob(MediaService.chunks, { type: 'video/webm' });
        console.log('🎥 Blob criado:', MediaService.lastBlob.size, 'bytes');
      };

      MediaService.mediaRecorder.start(1000); // Capturar dados a cada 1s
      console.log('🎥 Gravação iniciada');
    } catch (error) {
      console.error('❌ Erro ao iniciar gravação:', error);
    }
  }

  // Obter último blob gravado
  static async getLastRecordedBlob(): Promise<Blob | null> {
    return MediaService.lastBlob;
  }
}

export default MediaService;

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