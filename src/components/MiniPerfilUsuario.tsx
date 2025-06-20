import React, { useState, useEffect } from 'react';
import { FiX, FiHeart, FiMapPin, FiUser, FiStar } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import './MiniPerfilUsuario.css';

interface MiniPerfilUsuarioProps {
  nomeUsuario: string;
  isUserPremium: boolean;
  isViewerPremium: boolean;
  isOwnProfile?: boolean;
  userPhotos?: string[];
  userBio?: string;
  userAge?: number;
  userLocation?: string;
  userProfession?: string;
  userInterests?: string[];
  mainPhotoIndex?: number;
}

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
      try {
        console.log('🔍 Buscando perfil para:', nomeUsuario);
        
        // ✅ CORREÇÃO: Buscar dados específicos do usuário no localStorage primeiro
        const possiveisChaves = [
          `perfil_${nomeUsuario}`,
          `usuario_${nomeUsuario}`, 
          `user_${nomeUsuario}`,
          `profile_${nomeUsuario}`
        ];
        
        // Tentar buscar no localStorage primeiro
        for (const chave of possiveisChaves) {
          try {
            const dadosSalvos = localStorage.getItem(chave);
            if (dadosSalvos) {
              const dados = JSON.parse(dadosSalvos);
              console.log(`📁 Verificando ${chave} para ${nomeUsuario}:`, dados);
              
              if (dados.nome === nomeUsuario) {
                if (dados.fotos && Array.isArray(dados.fotos) && dados.fotos.length > 0) {
                  const fotosValidas = dados.fotos.filter((foto: string) => foto && foto.startsWith('data:image/'));
                  if (fotosValidas.length > 0) {
                    console.log('✅ Fotos encontradas no localStorage para:', nomeUsuario);
                    setUserPhotos(fotosValidas);
                    setUserBio(dados.descricao || 'Usuário da plataforma 100matchs.');
                    setMainPhotoIndex(dados.foto_principal || 0);
                    setLoading(false);
                    return;
                  }
                }
                
                // Verificar se tem foto única
                if (dados.foto && dados.foto.startsWith('data:image/')) {
                  console.log('✅ Foto única encontrada no localStorage para:', nomeUsuario);
                  setUserPhotos([dados.foto]);
                  setUserBio(dados.descricao || 'Usuário da plataforma 100matchs.');
                  setMainPhotoIndex(0);
                  setLoading(false);
                  return;
                }
              }
            }
          } catch (error) {
            console.warn('⚠️ Erro ao parsear dados de', chave, ':', error);
          }
        }
        
        // Se não encontrou no localStorage, buscar no Supabase
        let { data: exactData } = await supabase
          .from('perfis')
          .select('*')
          .eq('nome', nomeUsuario)
          .maybeSingle();
        
        if (exactData) {
          console.log('✅ Perfil encontrado no Supabase:', exactData);
          const fotosValidas = exactData.fotos ? exactData.fotos.filter((foto: string) => foto !== '') : [];
          setUserPhotos(fotosValidas);
          setUserBio(exactData.descricao || 'Usuário da plataforma 100matchs.');
          setMainPhotoIndex(exactData.foto_principal || 0);
        } else {
          console.log('❌ Perfil não encontrado');
          setUserPhotos([]);
          setUserBio('Usuário da plataforma 100matchs.');
        }
      } catch (error) {
        console.error('❌ Erro na busca:', error);
        setUserPhotos([]);
        setUserBio('Usuário da plataforma 100matchs.');
      }
      setLoading(false);
    };

    loadUserData();
  }, [nomeUsuario]);

  if (loading) {
    return (
      <div className="mini-perfil-trigger">
        <div className="mini-foto-perfil loading-placeholder">
          <FiUser />
        </div>
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
    console.log('🖱️ CLIQUE DETECTADO - Abrindo modal para:', nomeUsuario);
    setShowModal(true);
    setCurrentPhotoIndex(0);
  };

  const handleCloseModal = () => {
    console.log('❌ Fechando modal');
    setShowModal(false);
  };

  const nextPhoto = () => {
    if (userPhotos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % userPhotos.length);
    }
  };

  const prevPhoto = () => {
    if (userPhotos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + userPhotos.length) % userPhotos.length);
    }
  };

  const fotoPrincipal = userPhotos[mainPhotoIndex] || userPhotos[0];

  if (userPhotos.length === 0) {
    return (
      <div 
        className="user-icon-only"
        onClick={handleOpenModal}
        title="Ver perfil"
      >
        <FiUser className="default-user-icon" />
        {isUserPremium && <FiStar className="mini-premium-icon-no-photo" />}
        
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
                    <div className="upload-photo-hint">
                      <FiUser size={60} />
                    <p>👤 Usuário sem fotos</p>
                    </div>
                </div>

                <div className="profile-info">
                  <div className="basic-info">
                    <h3>{nomeUsuario}, {userAge}</h3>
                    <div className="location">
                      <FiMapPin />
                      <span>{userLocation}</span>
                    </div>
                  </div>

                  <div className="bio-section">
                    <h4>Sobre mim</h4>
                      <p>{userBio}</p>
                  </div>
                </div>

                <div className="modal-actions">
                  {!isOwnProfile && (
                    <button className="action-button like">
                      <FiHeart />
                      <span>Curtir</span>
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
                    {currentPhotoIndex + 1} de {userPhotos.length}
                  </div>
                </div>

                {userPhotos.length > 1 && (
                  <div className="photo-thumbnails">
                    {userPhotos.map((foto, index) => (
                      <img
                        key={index}
                        src={foto}
                        alt={`Miniatura ${index + 1}`}
                        className={`thumbnail ${index === currentPhotoIndex ? 'active' : ''}`}
                        onClick={() => setCurrentPhotoIndex(index)}
                      />
                    ))}
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
                </div>

                <div className="bio-section">
                  <h4>Sobre mim</h4>
                  <p>{userBio}</p>
                </div>
              </div>

              <div className="modal-actions">
                {!isOwnProfile && (
                  <button className="action-button like">
                    <FiHeart />
                    <span>Curtir</span>
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