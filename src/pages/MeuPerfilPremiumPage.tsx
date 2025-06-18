import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiEdit3, FiSave, FiStar } from 'react-icons/fi';
import Header from '../components/Header';
import './MeuPerfilPremiumPage.css';

interface PerfilPremium {
  id: string;
  nome: string;
  email: string;
  descricao: string;
  fotos: string[];
  fotoPrincipal: number; // índice da foto principal (0-4)
}

const MeuPerfilPremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);
  const [perfil, setPerfil] = useState<PerfilPremium>({
    id: '',
    nome: '',
    email: '',
    descricao: '',
    fotos: ['', '', '', '', ''],
    fotoPrincipal: 0
  });
  const [editandoDescricao, setEditandoDescricao] = useState(false);
  const [novaDescricao, setNovaDescricao] = useState('');

  useEffect(() => {
    // Verificar se usuário premium está logado
    const usuarioPremium = localStorage.getItem('usuarioPremium');
    if (!usuarioPremium) {
      navigate('/inicio');
      return;
    }

    const user = JSON.parse(usuarioPremium);
    setUsuario(user);

    // Carregar perfil existente ou criar novo
    const perfilSalvo = localStorage.getItem(`perfil_${user.email}`);
    if (perfilSalvo) {
      setPerfil(JSON.parse(perfilSalvo));
      setNovaDescricao(JSON.parse(perfilSalvo).descricao);
    } else {
      const novoPerfil = {
        id: user.email,
        nome: user.nome,
        email: user.email,
        descricao: '',
        fotos: ['', '', '', '', ''],
        fotoPrincipal: 0
      };
      setPerfil(novoPerfil);
    }
  }, [navigate]);

  const handleFotoUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const novasFotos = [...perfil.fotos];
        novasFotos[index] = e.target?.result as string;
        const novoPerfilAtualizado = { ...perfil, fotos: novasFotos };
        setPerfil(novoPerfilAtualizado);
        salvarPerfil(novoPerfilAtualizado);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDefinirFotoPrincipal = (index: number) => {
    if (perfil.fotos[index]) {
      const novoPerfilAtualizado = { ...perfil, fotoPrincipal: index };
      setPerfil(novoPerfilAtualizado);
      salvarPerfil(novoPerfilAtualizado);
    }
  };

  const handleSalvarDescricao = () => {
    const novoPerfilAtualizado = { ...perfil, descricao: novaDescricao };
    setPerfil(novoPerfilAtualizado);
    salvarPerfil(novoPerfilAtualizado);
    setEditandoDescricao(false);
  };

  const salvarPerfil = (perfilAtualizado: PerfilPremium) => {
    localStorage.setItem(`perfil_${perfilAtualizado.email}`, JSON.stringify(perfilAtualizado));
  };

  const removerFoto = (index: number) => {
    const novasFotos = [...perfil.fotos];
    novasFotos[index] = '';
    
    // Se a foto removida era a principal, definir a primeira foto disponível como principal
    let novaFotoPrincipal = perfil.fotoPrincipal;
    if (index === perfil.fotoPrincipal) {
      novaFotoPrincipal = novasFotos.findIndex(foto => foto !== '');
      if (novaFotoPrincipal === -1) novaFotoPrincipal = 0;
    }
    
    const novoPerfilAtualizado = { ...perfil, fotos: novasFotos, fotoPrincipal: novaFotoPrincipal };
    setPerfil(novoPerfilAtualizado);
    salvarPerfil(novoPerfilAtualizado);
  };

  if (!usuario) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="meu-perfil-page">
      <Header />
      
      <div className="perfil-container">
        <div className="perfil-header">
          <div className="premium-badge">
            <FiStar />
            <span>Perfil Premium</span>
          </div>
          <h1>Meu Perfil</h1>
          <p>Personalize seu perfil com fotos e descrição</p>
        </div>

        <div className="perfil-content">
          {/* Seção de Fotos */}
          <div className="fotos-section">
            <h2>Suas Fotos (máximo 5)</h2>
            <div className="fotos-grid">
              {perfil.fotos.map((foto, index) => (
                <div key={index} className={`foto-slot ${index === perfil.fotoPrincipal ? 'principal' : ''}`}>
                  {foto ? (
                    <div className="foto-container">
                      <img src={foto} alt={`Foto ${index + 1}`} />
                      <div className="foto-overlay">
                        <button 
                          onClick={() => handleDefinirFotoPrincipal(index)}
                          className="btn-principal"
                          disabled={index === perfil.fotoPrincipal}
                        >
                          {index === perfil.fotoPrincipal ? '⭐ Principal' : 'Definir Principal'}
                        </button>
                        <button 
                          onClick={() => removerFoto(index)}
                          className="btn-remover"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="foto-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFotoUpload(index, e)}
                        style={{ display: 'none' }}
                      />
                      <FiCamera />
                      <span>Adicionar Foto</span>
                    </label>
                  )}
                  {index === perfil.fotoPrincipal && foto && (
                    <div className="principal-badge">
                      <FiStar />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Seção de Descrição */}
          <div className="descricao-section">
            <h2>Sua Descrição</h2>
            {editandoDescricao ? (
              <div className="descricao-edit">
                <textarea
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  maxLength={500}
                  rows={5}
                />
                <div className="descricao-actions">
                  <button onClick={handleSalvarDescricao} className="btn btn-primary">
                    <FiSave />
                    Salvar
                  </button>
                  <button 
                    onClick={() => {
                      setEditandoDescricao(false);
                      setNovaDescricao(perfil.descricao);
                    }} 
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
                <small>{novaDescricao.length}/500 caracteres</small>
              </div>
            ) : (
              <div className="descricao-view">
                <p>{perfil.descricao || 'Clique em editar para adicionar uma descrição sobre você.'}</p>
                <button 
                  onClick={() => {
                    setEditandoDescricao(true);
                    setNovaDescricao(perfil.descricao);
                  }} 
                  className="btn btn-secondary"
                >
                  <FiEdit3 />
                  Editar Descrição
                </button>
              </div>
            )}
          </div>

          {/* Preview do Perfil */}
          <div className="preview-section">
            <h2>Preview do seu perfil</h2>
            <div className="perfil-preview card">
              <div className="preview-header">
                {perfil.fotos[perfil.fotoPrincipal] && (
                  <img 
                    src={perfil.fotos[perfil.fotoPrincipal]} 
                    alt="Foto principal" 
                    className="foto-principal-preview"
                  />
                )}
                <div className="preview-info">
                  <h3>{perfil.nome} <FiStar className="premium-icon" /></h3>
                  <p className="preview-descricao">
                    {perfil.descricao || 'Sem descrição'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeuPerfilPremiumPage; 