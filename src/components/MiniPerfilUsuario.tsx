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
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      // Buscar perfil salvo do usuário logado primeiro (mais rápido)
      const usuarioAtual = localStorage.getItem('usuarioPremium');
      if (usuarioAtual) {
        const user = JSON.parse(usuarioAtual);
        if (user.nome.toLowerCase() === nomeUsuario.toLowerCase()) {
          // É o próprio usuário, buscar perfil salvo local
          const perfilSalvo = localStorage.getItem(`perfil_${user.email}`);
          if (perfilSalvo) {
            const perfil = JSON.parse(perfilSalvo);
            console.log('✅ PERFIL PRÓPRIO carregado do localStorage:', perfil);
            setUserPhotos(perfil.fotos.filter((foto: string) => foto !== ''));
            setUserBio(perfil.descricao || 'Usuário da plataforma 100matchs.');
            setMainPhotoIndex(perfil.fotoPrincipal || 0);
            setLoading(false);
            return;
          }
        }
      }
      
      // Buscar perfil de outros usuários no Supabase com múltiplas estratégias
      try {
        console.log('🔍 BUSCA AVANÇADA no Supabase para:', nomeUsuario);
        
        // Estratégia 1: Busca por nome exato
        console.log('📡 Estratégia 1: Busca exata por nome');
        let { data: exactData } = await supabase
          .from('perfis')
          .select('*')
          .eq('nome', nomeUsuario)
          .maybeSingle();
        
        if (exactData) {
          console.log('✅ ENCONTRADO por nome exato:', exactData);
          const fotosValidas = exactData.fotos ? exactData.fotos.filter((foto: string) => foto !== '') : [];
          console.log('📸 Fotos válidas encontradas:', fotosValidas.length, fotosValidas);
          setUserPhotos(fotosValidas);
          setUserBio(exactData.descricao || 'Usuário da plataforma 100matchs.');
          setMainPhotoIndex(exactData.foto_principal || 0);
          setLoading(false);
          return;
        }
        
        // Estratégia 2: Busca case-insensitive
        console.log('📡 Estratégia 2: Busca case-insensitive');
        let { data: likeData } = await supabase
          .from('perfis')
          .select('*')
          .ilike('nome', nomeUsuario);
        
        if (likeData && likeData.length > 0) {
          console.log('✅ ENCONTRADO por busca case-insensitive:', likeData[0]);
          const perfil = likeData[0];
          const fotosValidas = perfil.fotos ? perfil.fotos.filter((foto: string) => foto !== '') : [];
          console.log('📸 Fotos válidas encontradas:', fotosValidas.length, fotosValidas);
          setUserPhotos(fotosValidas);
          setUserBio(perfil.descricao || 'Usuário da plataforma 100matchs.');
          setMainPhotoIndex(perfil.foto_principal || 0);
          setLoading(false);
          return;
        }
        
        // Estratégia 3: Busca com wildcard
        console.log('📡 Estratégia 3: Busca wildcard');
        let { data: wildcardData } = await supabase
          .from('perfis')
          .select('*')
          .ilike('nome', `%${nomeUsuario}%`);
        
        if (wildcardData && wildcardData.length > 0) {
          console.log('✅ ENCONTRADO por wildcard:', wildcardData[0]);
          const perfil = wildcardData[0];
          const fotosValidas = perfil.fotos ? perfil.fotos.filter((foto: string) => foto !== '') : [];
          console.log('📸 Fotos válidas encontradas:', fotosValidas.length, fotosValidas);
          setUserPhotos(fotosValidas);
          setUserBio(perfil.descricao || 'Usuário da plataforma 100matchs.');
          setMainPhotoIndex(perfil.foto_principal || 0);
          setLoading(false);
          return;
        }
        
        // Estratégia 4: Listar todos e procurar manualmente
        console.log('📡 Estratégia 4: Busca completa na tabela');
        let { data: allData } = await supabase
          .from('perfis')
          .select('*');
        
        if (allData && allData.length > 0) {
          console.log('📊 Total de perfis na base:', allData.length);
          const encontrado = allData.find(p => 
            p.nome && p.nome.toLowerCase().includes(nomeUsuario.toLowerCase())
          );
          
          if (encontrado) {
            console.log('✅ ENCONTRADO por busca manual:', encontrado);
            const fotosValidas = encontrado.fotos ? encontrado.fotos.filter((foto: string) => foto !== '') : [];
            console.log('📸 Fotos válidas encontradas:', fotosValidas.length, fotosValidas);
            setUserPhotos(fotosValidas);
            setUserBio(encontrado.descricao || 'Usuário da plataforma 100matchs.');
            setMainPhotoIndex(encontrado.foto_principal || 0);
            setLoading(false);
            return;
          }
        }
        
        // Se chegou aqui, não encontrou nada
        console.log('❌ PERFIL NÃO ENCONTRADO em nenhuma estratégia para:', nomeUsuario);
        setUserPhotos([]);
        setUserBio('Usuário da plataforma 100matchs.');
        setMainPhotoIndex(0);
        
      } catch (error) {
        console.error('💥 ERRO na busca do Supabase:', error);
        setUserPhotos([]);
        setUserBio('Usuário da plataforma 100matchs.');
        setMainPhotoIndex(0);
      }
      
      setLoading(false);
    };

    loadUserData();
  }, [nomeUsuario, refreshTrigger]);
  
  // Listener para mudanças no localStorage (atualização em tempo real)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'forceProfileRefresh') {
        const data = JSON.parse(e.newValue || '{}');
        if (data.userName === nomeUsuario) {
          console.log('🚀 FORÇA REFRESH detectada para:', nomeUsuario);
          setRefreshTrigger(prev => prev + 1);
        }
      } else if (e.key && e.key.startsWith('perfil_')) {
        console.log('🔄 Perfil atualizado, recarregando dados...');
        setRefreshTrigger(prev => prev + 1);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Escutar eventos customizados
    const handleCustomUpdate = (e: CustomEvent) => {
      if (e.detail?.userName === nomeUsuario) {
        console.log('🔄 Atualização personalizada detectada para:', nomeUsuario);
        setRefreshTrigger(prev => prev + 1);
      }
    };
    
    const handleForceRefresh = (e: CustomEvent) => {
      if (e.detail?.userName === nomeUsuario) {
        console.log('🚀 FORÇA REFRESH DIRETO detectado para:', nomeUsuario);
        setRefreshTrigger(prev => prev + 1);
      }
    };
    
    window.addEventListener('perfilUpdated' as any, handleCustomUpdate);
    window.addEventListener('forceRefreshProfile' as any, handleForceRefresh);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('perfilUpdated' as any, handleCustomUpdate);
      window.removeEventListener('forceRefreshProfile' as any, handleForceRefresh);
    };
  }, [nomeUsuario]);
  
  // Sistema de atualização automática a cada 2 segundos para garantir tempo real MÁXIMO
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOwnProfile) { // Só atualiza perfis de outros usuários
        console.log('⚡ REFRESH ULTRA RÁPIDO:', nomeUsuario);
        setRefreshTrigger(prev => prev + 1);
      }
    }, 2000); // 2 segundos para máxima velocidade
    
    return () => clearInterval(interval);
  }, [nomeUsuario, isOwnProfile]);

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
    console.log('🖱️ CLIQUE NA MINI FOTO detectado para:', nomeUsuario);
    console.log('📸 Fotos disponíveis:', userPhotos.length);
    console.log('🔧 Modal será exibido:', true);
    setShowModal(true);
    setCurrentPhotoIndex(0);
  };

  const handleCloseModal = () => {
    console.log('❌ FECHANDO modal para:', nomeUsuario);
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