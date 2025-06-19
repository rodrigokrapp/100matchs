import React, { useState } from 'react';
import { FiX, FiHeart, FiMapPin, FiUser, FiStar, FiLock } from 'react-icons/fi';
import './MiniPerfilUsuario.css';

interface MiniPerfilUsuarioProps {
  nomeUsuario: string;
  isUserPremium: boolean;
  isViewerPremium: boolean;
}

// Dados simulados dos perfis dos usuários
const perfisDosUsuarios: { [key: string]: any } = {
  'rodrigo': {
    nome: 'Rodrigo',
    idade: 28,
    localizacao: 'São Paulo, SP',
    profissao: 'Desenvolvedor',
    bio: 'Apaixonado por tecnologia e aventuras. Gosto de viajar, conhecer pessoas novas e criar conexões autênticas. Procuro alguém especial para compartilhar momentos únicos.',
    fotos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face'
    ],
    interesses: ['Tecnologia', 'Viagens', 'Música', 'Esportes'],
    premium: true
  },
  'joana': {
    nome: 'Joana',
    idade: 25,
    localizacao: 'Rio de Janeiro, RJ',
    profissao: 'Designer',
    bio: 'Criativa e sonhadora, amo arte e design. Sempre em busca de inspiração e novas experiências. Procuro alguém que compartilhe da minha paixão pela vida.',
    fotos: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
    ],
    interesses: ['Arte', 'Design', 'Fotografia', 'Café'],
    premium: true
  },
  'carlos': {
    nome: 'Carlos',
    idade: 30,
    localizacao: 'Belo Horizonte, MG',
    profissao: 'Engenheiro',
    bio: 'Engenheiro apaixonado por inovação e sustentabilidade. Gosto de natureza, trilhas e boa conversa. Busco uma conexão verdadeira.',
    fotos: [
      'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1558222218-b7b54eede3f3?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1553967570-112d1533f012?w=400&h=400&fit=crop&crop=face'
    ],
    interesses: ['Engenharia', 'Natureza', 'Trilhas', 'Tecnologia'],
    premium: false
  }
};

const MiniPerfilUsuario: React.FC<MiniPerfilUsuarioProps> = ({ 
  nomeUsuario, 
  isUserPremium, 
  isViewerPremium 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Buscar dados do usuário (ou usar dados padrão se não encontrar)
  const dadosUsuario = perfisDosUsuarios[nomeUsuario.toLowerCase()] || {
    nome: nomeUsuario,
    idade: 25,
    localizacao: 'Brasil',
    profissao: 'Usuário',
    bio: 'Olá! Sou novo na plataforma e estou conhecendo pessoas interessantes. Gosto de conversar e fazer novas amizades.',
    fotos: [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop&crop=face'
    ],
    interesses: ['Conversas', 'Amizades', 'Música'],
    premium: isUserPremium
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setCurrentPhotoIndex(0);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const nextPhoto = () => {
    const maxPhotos = isViewerPremium ? dadosUsuario.fotos.length : 1;
    setCurrentPhotoIndex((prev) => (prev + 1) % maxPhotos);
  };

  const prevPhoto = () => {
    const maxPhotos = isViewerPremium ? dadosUsuario.fotos.length : 1;
    setCurrentPhotoIndex((prev) => (prev - 1 + maxPhotos) % maxPhotos);
  };

  // Determinar quantas fotos e quanto da bio mostrar
  const fotosParaMostrar = isViewerPremium ? dadosUsuario.fotos : [dadosUsuario.fotos[0]];
  const bioParaMostrar = isViewerPremium 
    ? dadosUsuario.bio 
    : dadosUsuario.bio.substring(0, Math.floor(dadosUsuario.bio.length / 2)) + '...';

  return (
    <>
      {/* Mini foto do perfil */}
      <div className="mini-perfil-trigger" onClick={handleOpenModal}>
        <img 
          src={dadosUsuario.fotos[0]} 
          alt={`Foto de ${dadosUsuario.nome}`}
          className="mini-foto-perfil"
        />
        {isUserPremium && <FiStar className="mini-premium-icon" />}
      </div>

      {/* Modal do perfil */}
      {showModal && (
        <div className="mini-perfil-overlay" onClick={handleCloseModal}>
          <div className="mini-perfil-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FiUser />
                <span>Perfil de {dadosUsuario.nome}</span>
                {isUserPremium && <FiStar className="premium-badge" />}
              </div>
              <button className="close-button" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-content">
              {/* Seção de fotos */}
              <div className="photos-section">
                <div className="photo-container">
                  <img 
                    src={fotosParaMostrar[currentPhotoIndex]} 
                    alt={`Foto ${currentPhotoIndex + 1} de ${dadosUsuario.nome}`}
                    className="main-photo"
                  />
                  
                  {fotosParaMostrar.length > 1 && (
                    <>
                      <button className="photo-nav prev" onClick={prevPhoto}>‹</button>
                      <button className="photo-nav next" onClick={nextPhoto}>›</button>
                    </>
                  )}
                  
                  <div className="photo-counter">
                    {currentPhotoIndex + 1} / {fotosParaMostrar.length}
                    {!isViewerPremium && (
                      <span className="limited-access">
                        <FiLock /> Limitado
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnails das fotos (só para premium) */}
                {isViewerPremium && fotosParaMostrar.length > 1 && (
                  <div className="photo-thumbnails">
                    {fotosParaMostrar.map((foto, index) => (
                      <img
                        key={index}
                        src={foto}
                        alt={`Thumbnail ${index + 1}`}
                        className={`thumbnail ${index === currentPhotoIndex ? 'active' : ''}`}
                        onClick={() => setCurrentPhotoIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Informações do perfil */}
              <div className="profile-info">
                <div className="basic-info">
                  <h3>{dadosUsuario.nome}, {dadosUsuario.idade}</h3>
                  <div className="location">
                    <FiMapPin />
                    <span>{dadosUsuario.localizacao}</span>
                  </div>
                  <div className="profession">
                    <FiUser />
                    <span>{dadosUsuario.profissao}</span>
                  </div>
                </div>

                <div className="bio-section">
                  <h4>Sobre mim</h4>
                  <p>{bioParaMostrar}</p>
                  {!isViewerPremium && (
                    <div className="premium-upgrade-hint">
                      <FiLock />
                      <span>Faça upgrade para ver o perfil completo</span>
                    </div>
                  )}
                </div>

                {isViewerPremium && (
                  <div className="interests-section">
                    <h4>Interesses</h4>
                    <div className="interests-tags">
                      {dadosUsuario.interesses.map((interesse: string, index: number) => (
                        <span key={index} className="interest-tag">
                          {interesse}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="modal-actions">
                <button className="action-button like">
                  <FiHeart />
                  <span>Curtir</span>
                </button>
                {!isViewerPremium && (
                  <button className="action-button upgrade">
                    <FiStar />
                    <span>Upgrade Premium</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MiniPerfilUsuario; 