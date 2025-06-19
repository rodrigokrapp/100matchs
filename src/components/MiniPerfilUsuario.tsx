import React, { useState } from 'react';
import { FiX, FiHeart, FiMapPin, FiUser, FiStar, FiLock } from 'react-icons/fi';
import './MiniPerfilUsuario.css';

interface MiniPerfilUsuarioProps {
  nomeUsuario: string;
  isUserPremium: boolean;
  isViewerPremium: boolean;
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

  // Se o usuário não é premium, mostrar apenas ícone
  if (!isUserPremium) {
    return (
      <div className="user-icon-only">
        <FiUser className="default-user-icon" />
      </div>
    );
  }

  // Se não tem fotos, mostrar ícone mesmo sendo premium
  if (userPhotos.length === 0) {
    return (
      <div className="user-icon-only">
        <FiUser className="default-user-icon" />
      </div>
    );
  }

  const handleOpenModal = () => {
    // Só abrir modal se o usuário visualizador for premium
    if (!isViewerPremium) {
      return;
    }
    setShowModal(true);
    setCurrentPhotoIndex(0);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % userPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + userPhotos.length) % userPhotos.length);
  };

  // Foto principal para mostrar na mini foto
  const fotoPrincipal = userPhotos[mainPhotoIndex] || userPhotos[0];

  return (
    <>
      {/* Mini foto do perfil - só para usuários premium com fotos */}
      <div 
        className={`mini-perfil-trigger ${!isViewerPremium ? 'no-click' : ''}`}
        onClick={handleOpenModal}
        title={isViewerPremium ? "Ver perfil" : "Upgrade para Premium para ver perfis"}
      >
        <img 
          src={fotoPrincipal} 
          alt={`Foto de ${nomeUsuario}`}
          className="mini-foto-perfil"
        />
        <FiStar className="mini-premium-icon" />
        {!isViewerPremium && (
          <div className="premium-overlay">
            <FiLock />
          </div>
        )}
      </div>

      {/* Modal do perfil - só abre para viewers premium */}
      {showModal && isViewerPremium && (
        <div className="mini-perfil-overlay" onClick={handleCloseModal}>
          <div className="mini-perfil-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FiUser />
                <span>Perfil de {nomeUsuario}</span>
                <FiStar className="premium-badge" />
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
                    src={userPhotos[currentPhotoIndex]} 
                    alt={`Foto ${currentPhotoIndex + 1} de ${nomeUsuario}`}
                    className="main-photo"
                  />
                  
                  {userPhotos.length > 1 && (
                    <>
                      <button className="photo-nav prev" onClick={prevPhoto}>‹</button>
                      <button className="photo-nav next" onClick={nextPhoto}>›</button>
                    </>
                  )}
                  
                  <div className="photo-counter">
                    {currentPhotoIndex + 1} / {userPhotos.length}
                    {currentPhotoIndex === mainPhotoIndex && (
                      <span className="main-photo-indicator">
                        ⭐ Principal
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnails das fotos */}
                {userPhotos.length > 1 && (
                  <div className="photo-thumbnails">
                    {userPhotos.map((foto: string, index: number) => (
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
                  <p>{userBio}</p>
                </div>

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
              </div>

              {/* Ações */}
              <div className="modal-actions">
                <button className="action-button like">
                  <FiHeart />
                  <span>Curtir</span>
                </button>
                <button className="action-button chat">
                  <FiUser />
                  <span>Conversar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MiniPerfilUsuario; 