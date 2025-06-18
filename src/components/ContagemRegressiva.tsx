import React, { useState, useEffect } from 'react';
import { FiClock, FiAlertCircle } from 'react-icons/fi';
import './ContagemRegressiva.css';

const ContagemRegressiva: React.FC = () => {
  const [tempoRestante, setTempoRestante] = useState<number>(0);
  const [usuario, setUsuario] = useState<any>(null);
  const [mostrarAviso, setMostrarAviso] = useState(false);

  useEffect(() => {
    // Verificar se é usuário de chat gratuito
    const usuarioChat = localStorage.getItem('usuarioChat');
    if (!usuarioChat) return;

    const user = JSON.parse(usuarioChat);
    setUsuario(user);

    // Atualizar contagem a cada segundo
    const interval = setInterval(() => {
      const agora = new Date().getTime();
      const tempoDecorrido = agora - user.inicioSessao;
      const tempoRestanteMs = user.limiteTempo - tempoDecorrido;

      if (tempoRestanteMs <= 0) {
        setTempoRestante(0);
        clearInterval(interval);
        // O logout será feito pela verificação na SalasPage
        return;
      }

      setTempoRestante(tempoRestanteMs);

      // Mostrar aviso quando restam 2 minutos
      if (tempoRestanteMs <= 2 * 60 * 1000 && !mostrarAviso) {
        setMostrarAviso(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [mostrarAviso]);

  // Não mostrar se não for usuário de chat
  if (!usuario || usuario.tipo !== 'chat') {
    return null;
  }

  const minutos = Math.floor(tempoRestante / (1000 * 60));
  const segundos = Math.floor((tempoRestante % (1000 * 60)) / 1000);

  const formatarTempo = () => {
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  };

  const getCorTempo = () => {
    if (minutos <= 1) return '#dc2626'; // Vermelho
    if (minutos <= 3) return '#f59e0b'; // Amarelo
    return '#059669'; // Verde
  };

  return (
    <div className={`contagem-regressiva ${minutos <= 2 ? 'alerta' : ''}`}>
      <div className="contagem-content">
        <FiClock className="clock-icon" />
        <div className="tempo-info">
          <span className="tempo-restante" style={{ color: getCorTempo() }}>
            {formatarTempo()}
          </span>
          <span className="tempo-label">restantes</span>
        </div>
        {minutos <= 2 && (
          <FiAlertCircle className="alert-icon" />
        )}
      </div>
      
      {mostrarAviso && minutos <= 2 && (
        <div className="aviso-expiracao">
          <p>⚠️ Seu acesso expira em breve!</p>
          <small>Seja Premium para acesso ilimitado</small>
        </div>
      )}
    </div>
  );
};

export default ContagemRegressiva; 