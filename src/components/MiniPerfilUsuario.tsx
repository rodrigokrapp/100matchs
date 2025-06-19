import React, { useState } from 'react';
import { FiX, FiHeart, FiMapPin, FiUser, FiStar, FiLock } from 'react-icons/fi';
import './MiniPerfilUsuario.css';

interface MiniPerfilUsuarioProps {
  nomeUsuario: string;
  isUserPremium: boolean;
  isViewerPremium: boolean;
  isOwnProfile?: boolean; // Se é o próprio perfil do usuário logado
  userPhotos?: string[]; // Fotos do usuário (opcional)
  userBio?: string; // Bio do usuário (opcional)
  userAge?: number; // Idade (opcional)
  userLocation?: string; // Localização (opcional)
  userProfession?: string; // Profissão (opcional)
  userInterests?: string[]; // Interesses (opcional)
  mainPhotoIndex?: number; // Índice da foto principal (padrão 0)
}

const MiniPerfilUsuario: React.FC<MiniPerfilUsuarioProps> = ({ 
  nomeUsuario, 
  isUserPremium, 
  isViewerPremium,
  isOwnProfile = false,
  userPhotos = [],
  userBio = "Usuário da plataforma 100matchs.",
  userAge = 25,
  userLocation = "Brasil",
  userProfession = "Usuário",
  userInterests = ["Conversas", "Amizades"],
  mainPhotoIndex = 0
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleOpenModal = () => {
    setShowModal(true);
    setCurrentPhotoIndex(0);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Determinar quantas fotos e quanto da bio mostrar
  // Próprio usuário premium ou viewer premium podem ver tudo
  // Usuário gratuito vendo premium pode ver limitado
  const canViewFull = isViewerPremium || isOwnProfile;
  const fotosParaMostrar = canViewFull ? userPhotos : [userPhotos[0]];
  const bioParaMostrar = canViewFull 
    ? userBio 
    : userBio.substring(0, Math.floor(userBio.length / 2)) + '...';

  const nextPhoto = () => {
    // Se pode ver tudo (próprio perfil ou viewer premium), pode navegar por todas as fotos
    const maxPhotos = canViewFull ? userPhotos.length : 1;
    setCurrentPhotoIndex((prev) => (prev + 1) % maxPhotos);
  };

  const prevPhoto = () => {
    // Se pode ver tudo (próprio perfil ou viewer premium), pode navegar por todas as fotos
    const maxPhotos = canViewFull ? userPhotos.length : 1;
    setCurrentPhotoIndex((prev) => (prev - 1 + maxPhotos) % maxPhotos);
  };

  // Foto principal para mostrar na mini foto
  const fotoPrincipal = userPhotos[mainPhotoIndex] || userPhotos[0];

  // Se não tem foto, mostrar ícone padrão
  if (userPhotos.length === 0) {
    return (
      <div className="user-icon-only" onClick={handleOpenModal}>
        <FiUser className="default-user-icon" />
        {isUserPremium && <FiStar className="mini-premium-icon-no-photo" />}
        
        {/* Modal para usuários sem foto */}
        {showModal && (
          <div className="mini-perfil-overlay" onClick={handleCloseModal}>
            <div className="mini-perfil-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">
                  <FiUser />
                  <span>Perfil de {nomeUsuario}</span>
                  {isUserPremium && <FiStar className="premium-badge" />}
                </div>
                <button className="close-button" onClick={handleCloseModal}>
                  <FiX />
                </button>
              </div>

              <div className="modal-content">
                <div className="no-photo-section">
                  {isOwnProfile ? (
                    <div className="upload-photo-hint">
                      <FiUser size={60} />
                      <p>Adicione fotos ao seu perfil para aparecer aqui!</p>
                    </div>
                  ) : (
                    <div className="blocked-photo-section">
                      <FiLock size={60} />
                      <p>🔒 Fotos bloqueadas</p>
                      <p>Faça upgrade para Premium para ver fotos</p>
                    </div>
                  )}
                </div>

                <div className="profile-info">
                  <div className="basic-info">
                    <h3>{nomeUsuario}, {userAge}</h3>
                    <div className="location">
                      <FiMapPin />
                      <span>{userLocation}</span>
                    </div>
                    <div className="profession">
                      <FiUser />
                      <span>{userProfession}</span>
                    </div>
                  </div>

                  <div className="bio-section">
                    <h4>Sobre mim</h4>
                    {canViewFull ? (
                      <p>{userBio}</p>
                    ) : (
                      <>
                        <div className="blocked-bio">
                          <FiLock />
                          <p>🔒 Descrição bloqueada</p>
                          <p>Faça upgrade para Premium para ver descrição completa</p>
                        </div>
                      </>
                    )}
                  </div>

                  {canViewFull && (
                    <div className="interests-section">
                      <h4>Interesses</h4>
                      <div className="interests-tags">
                        {userInterests.map((interesse: string, index: number) => (
                          <span key={index} className="interest-tag">
                            {interesse}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  {!isOwnProfile && (
                    <button className="action-button like">
                      <FiHeart />
                      <span>Curtir</span>
                    </button>
                  )}
                  {!canViewFull && (
                    <button className="action-button upgrade">
                      <FiStar />
                      <span>Upgrade Premium</span>
                    </button>
                  )}
                  {canViewFull && !isOwnProfile && (
                    <button className="action-button chat">
                      <FiUser />
                      <span>Conversar</span>
                    </button>
                  )}
                  {isOwnProfile && (
                    <button className="action-button edit">
                      <FiUser />
                      <span>Editar Perfil</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Mini foto do perfil - para todos que têm foto */}
      <div 
        className="mini-perfil-trigger"
        onClick={handleOpenModal}
        title="Ver perfil"
      >
        <img 
          src={fotoPrincipal} 
          alt={`Foto de ${nomeUsuario}`}
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
                <span>{isOwnProfile ? 'Meu Perfil' : `Perfil de ${nomeUsuario}`}</span>
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
                    alt={`Foto ${currentPhotoIndex + 1} de ${nomeUsuario}`}
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
                    {currentPhotoIndex === mainPhotoIndex && (
                      <span className="main-photo-indicator">
                        ⭐ Principal
                      </span>
                    )}
                    {!canViewFull && (
                      <span className="limited-access">
                        <FiLock /> Limitado
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnails das fotos - só para quem pode ver tudo */}
                {canViewFull && fotosParaMostrar.length > 1 && (
                  <div className="photo-thumbnails">
                    {fotosParaMostrar.map((foto: string, index: number) => (
                      <img
                        key={index}
                        src={foto}
                        alt={`Thumbnail ${index + 1}`}
                        className={`thumbnail ${index === currentPhotoIndex ? 'active' : ''} ${index === mainPhotoIndex ? 'main-thumbnail' : ''}`}
                        onClick={() => setCurrentPhotoIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Informações do perfil */}
              <div className="profile-info">
                <div className="basic-info">
                  <h3>{nomeUsuario}, {userAge}</h3>
                  <div className="location">
                    <FiMapPin />
                    <span>{userLocation}</span>
                  </div>
                  <div className="profession">
                    <FiUser />
                    <span>{userProfession}</span>
                  </div>
                </div>

                <div className="bio-section">
                  <h4>Sobre mim</h4>
                  <p>{bioParaMostrar}</p>
                  {!canViewFull && (
                    <div className="premium-upgrade-hint">
                      <FiLock />
                      <span>Faça upgrade para ver o perfil completo</span>
                    </div>
                  )}
                </div>

                {canViewFull && (
                  <div className="interests-section">
                    <h4>Interesses</h4>
                    <div className="interests-tags">
                      {userInterests.map((interesse: string, index: number) => (
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
                {!isOwnProfile && (
                  <button className="action-button like">
                    <FiHeart />
                    <span>Curtir</span>
                  </button>
                )}
                {!canViewFull && (
                  <button className="action-button upgrade">
                    <FiStar />
                    <span>Upgrade Premium</span>
                  </button>
                )}
                {canViewFull && !isOwnProfile && (
                  <button className="action-button chat">
                    <FiUser />
                    <span>Conversar</span>
                  </button>
                )}
                {isOwnProfile && (
                  <button className="action-button edit">
                    <FiUser />
                    <span>Editar Perfil</span>
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