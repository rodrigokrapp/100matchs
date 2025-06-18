import React, { useState, useEffect } from 'react';
import { FiX, FiStar } from 'react-icons/fi';
import './MiniPerfilUsuario.css';

interface MiniPerfilProps {
  nomeUsuario: string;
  emailUsuario?: string;
  isPremium: boolean;
}

interface PerfilData {
  nome: string;
  email: string;
  descricao: string;
  fotos: string[];
  fotoPrincipal: number;
}

const MiniPerfilUsuario: React.FC<MiniPerfilProps> = ({ 
  nomeUsuario, 
  emailUsuario, 
  isPremium 
}) => {
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [mostrarJanela, setMostrarJanela] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState<any>(null);

  useEffect(() => {
    // Verificar tipo do usuário atual
    const usuarioPremium = localStorage.getItem('usuarioPremium');
    const usuarioChat = localStorage.getItem('usuarioChat');
    
    if (usuarioPremium) {
      setUsuarioAtual({ ...JSON.parse(usuarioPremium), tipo: 'premium' });
    } else if (usuarioChat) {
      setUsuarioAtual({ ...JSON.parse(usuarioChat), tipo: 'chat' });
    }

    // Carregar perfil do usuário se for premium e tiver email
    if (isPremium && emailUsuario) {
      const perfilSalvo = localStorage.getItem(`perfil_${emailUsuario}`);
      if (perfilSalvo) {
        setPerfil(JSON.parse(perfilSalvo));
      }
    }
  }, [isPremium, emailUsuario]);

  const handleClickFoto = () => {
    if (perfil && (perfil.fotos[perfil.fotoPrincipal] || perfil.descricao)) {
      setMostrarJanela(true);
    }
  };

  const getDescricaoVisivel = () => {
    if (!perfil?.descricao) return '';
    
    // Se usuário atual é chat gratuito, mostrar apenas metade
    if (usuarioAtual?.tipo === 'chat') {
      const metade = Math.floor(perfil.descricao.length / 2);
      return perfil.descricao.substring(0, metade) + '...';
    }
    
    // Se usuário atual é premium, mostrar tudo
    return perfil.descricao;
  };

  const getFotosVisiveis = () => {
    if (!perfil?.fotos) return [];
    
    // Se usuário atual é chat gratuito, mostrar apenas a foto principal
    if (usuarioAtual?.tipo === 'chat') {
      return perfil.fotos[perfil.fotoPrincipal] ? [perfil.fotos[perfil.fotoPrincipal]] : [];
    }
    
    // Se usuário atual é premium, mostrar todas as fotos
    return perfil.fotos.filter(foto => foto !== '');
  };

  // Se não for premium, mostrar apenas o nome
  if (!isPremium) {
    return (
      <div className="mini-perfil-container">
        <span className="nome-usuario">{nomeUsuario}</span>
      </div>
    );
  }

  // Se for premium mas não tem perfil configurado
  if (!perfil) {
    return (
      <div className="mini-perfil-container">
        <div className="mini-foto-placeholder">
          <FiStar />
        </div>
        <span className="nome-usuario premium">
          {nomeUsuario} <FiStar className="star-icon" />
        </span>
      </div>
    );
  }

  return (
    <div className="mini-perfil-container">
      {perfil.fotos[perfil.fotoPrincipal] && (
        <div className="mini-foto" onClick={handleClickFoto}>
          <img 
            src={perfil.fotos[perfil.fotoPrincipal]} 
            alt={`Foto de ${nomeUsuario}`}
          />
          <div className="premium-badge-mini">
            <FiStar />
          </div>
        </div>
      )}
      
      <span className="nome-usuario premium">
        {nomeUsuario} <FiStar className="star-icon" />
      </span>

      {/* Mini Janela de Perfil */}
      {mostrarJanela && (
        <div className="mini-janela-overlay" onClick={() => setMostrarJanela(false)}>
          <div className="mini-janela-perfil" onClick={(e) => e.stopPropagation()}>
            <div className="mini-janela-header">
              <h3>{perfil.nome} <FiStar className="star-icon" /></h3>
              <button 
                className="btn-fechar"
                onClick={() => setMostrarJanela(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="mini-janela-content">
              {/* Fotos */}
              {getFotosVisiveis().length > 0 && (
                <div className="fotos-mini-grid">
                  {getFotosVisiveis().map((foto, index) => (
                    <div key={index} className="foto-mini">
                      <img src={foto} alt={`Foto ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}

              {/* Descrição */}
              {getDescricaoVisivel() && (
                <div className="descricao-mini">
                  <h4>Sobre</h4>
                  <p>{getDescricaoVisivel()}</p>
                  {usuarioAtual?.tipo === 'chat' && perfil.descricao.length > getDescricaoVisivel().length && (
                    <small className="premium-notice">
                      💎 Seja Premium para ver a descrição completa
                    </small>
                  )}
                </div>
              )}

              {/* Aviso para usuários chat */}
              {usuarioAtual?.tipo === 'chat' && (
                <div className="limite-chat-notice">
                  <p>🔒 Visualização limitada</p>
                  <small>Usuários Premium veem todas as fotos e descrição completa</small>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniPerfilUsuario; 