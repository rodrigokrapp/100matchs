import React, { useState, useEffect } from 'react';
import { FiX, FiHeart, FiMapPin, FiUser, FiStar, FiLock } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
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

// Componente wrapper que busca dados do Supabase
export const MiniPerfilUsuarioWrapper: React.FC<{
  nomeUsuario: string;
  isUserPremium: boolean;
  isViewerPremium: boolean;
  isOwnProfile?: boolean;
  userAge?: number;
  userLocation?: string;
  userProfession?: string;
  userInterests?: string[];
}> = ({ nomeUsuario, isUserPremium, isViewerPremium, isOwnProfile = false, userAge = 25, userLocation = "Brasil", userProfession = "Usuário", userInterests = ["Conversas", "Amizades"] }) => {
  const [userPhotos, setUserPhotos] = useState<string[]>([]);
  const [userBio, setUserBio] = useState<string>("Usuário da plataforma 100matchs.");
  const [mainPhotoIndex, setMainPhotoIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      // Buscar perfil salvo do usuário
      const usuarioAtual = localStorage.getItem('usuarioPremium');
      if (usuarioAtual) {
        const user = JSON.parse(usuarioAtual);
        if (user.nome.toLowerCase() === nomeUsuario.toLowerCase()) {
          // É o próprio usuário, buscar perfil salvo
          const perfilSalvo = localStorage.getItem(`perfil_${user.email}`);
          if (perfilSalvo) {
            const perfil = JSON.parse(perfilSalvo);
            setUserPhotos(perfil.fotos.filter((foto: string) => foto !== ''));
            setUserBio(perfil.descricao || 'Usuário da plataforma 100matchs.');
            setMainPhotoIndex(perfil.fotoPrincipal || 0);
            setLoading(false);
            return;
          }
        }
      }
      
      // Buscar perfil de outros usuários no Supabase
      try {
        const { data, error } = await supabase
          .from('perfis')
          .select('fotos, descricao, foto_principal')
          .ilike('nome', nomeUsuario.toLowerCase())
          .single();
        
        if (data) {
          setUserPhotos(data.fotos ? data.fotos.filter((foto: string) => foto !== '') : []);
          setUserBio(data.descricao || 'Usuário da plataforma 100matchs.');
          setMainPhotoIndex(data.foto_principal || 0);
        } else {
          // Dados de demonstração para outros usuários (fallback)
          const userPhotosData: { [key: string]: string[] } = {
            'rodrigo': [
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
            ]
          };
          
          const userBiosData: { [key: string]: string } = {
            'rodrigo': 'Desenvolvedor apaixonado por tecnologia e inovação. Gosto de criar soluções que impactam positivamente a vida das pessoas.',
            'joana': 'Designer criativa com foco em UX/UI. Amo transformar ideias em experiências digitais incríveis.',
            'carlos': 'Engenheiro sustentável, amante da natureza e trilhas. Busco equilibrio entre tecnologia e meio ambiente.'
          };
          
          setUserPhotos(userPhotosData[nomeUsuario.toLowerCase()] || []);
          setUserBio(userBiosData[nomeUsuario.toLowerCase()] || 'Usuário da plataforma 100matchs.');
          setMainPhotoIndex(0);
        }
      } catch (error) {
        console.log('Erro ao buscar perfil:', error);
      }
      
      setLoading(false);
    };

    loadUserData();
  }, [nomeUsuario]);

  if (loading) {
    return (
      <div className="mini-perfil-loading">
        <FiUser className="default-user-icon" />
      </div>
    );
  }

  return (
    <MiniPerfilUsuario
      nomeUsuario={nomeUsuario}
      isUserPremium={isUserPremium}
      isViewerPremium={isViewerPremium}
      isOwnProfile={isOwnProfile}
      userPhotos={userPhotos}
      userBio={userBio}
      userAge={userAge}
      userLocation={userLocation}
      userProfession={userProfession}
      userInterests={userInterests}
      mainPhotoIndex={mainPhotoIndex}
    />
  );
};

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
  // Usuários premium podem ver tudo
  // Usuários gratuitos veem apenas 1 foto e descrição limitada
  const canViewFull = isViewerPremium || isOwnProfile;
  const fotosParaMostrar = canViewFull ? userPhotos : userPhotos.slice(0, 1);
  const bioParaMostrar = canViewFull 
    ? userBio 
    : userBio.length > 50 
      ? userBio.substring(0, 50) + '... 🔒' 
      : userBio;

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