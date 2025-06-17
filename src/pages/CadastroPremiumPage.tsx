import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastroPremiumPage.css';

export const CadastroPremiumPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErro('');
  };
  
  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      setErro('Nome é obrigatório');
      return false;
    }
    
    if (!formData.email.trim()) {
      setErro('Email é obrigatório');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErro('Email inválido');
      return false;
    }
    
    if (formData.senha.length < 6) {
      setErro('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    if (formData.senha !== formData.confirmarSenha) {
      setErro('Senhas não conferem');
      return false;
    }
    
    return true;
  };
  
  const handleCadastrar = async () => {
    if (!validarFormulario()) return;
    
    setCarregando(true);
    
    try {
      // Simular processo de cadastro
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Salvar dados do usuário premium no localStorage
      const usuarioPremium = {
        nome: formData.nome,
        email: formData.email,
        isPremium: true,
        dataAtivacao: new Date().toISOString(),
        id: Date.now().toString()
      };
      
      localStorage.setItem('usuarioPremium', JSON.stringify(usuarioPremium));
      localStorage.setItem('isPremium', 'true');
      
      setSucesso(true);
      
      // Redirecionar para salas após 3 segundos
      setTimeout(() => {
        navigate('/salas');
      }, 3000);
      
    } catch (error) {
      setErro('Erro ao processar cadastro. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };
  
  if (sucesso) {
    return (
      <div className="cadastro-premium-page">
        <div className="sucesso-container">
          <div className="sucesso-icon">🎉</div>
          <h1>Cadastro Premium Realizado!</h1>
          <p>Parabéns! Sua conta premium foi ativada com sucesso.</p>
          <div className="redirect-info">
            <span>Redirecionando para as salas...</span>
            <div className="loading-bar"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="cadastro-premium-page">
      <div className="cadastro-container">
        <div className="cadastro-header">
          <button className="btn-voltar" onClick={() => navigate('/suporte6828')}>
            ← Voltar
          </button>
          <h1>👑 Cadastro Premium</h1>
        </div>
        
        <div className="cadastro-content">
          <div className="premium-features">
            <h3>🚀 Recursos Premium Inclusos</h3>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">✨</span>
                <span>Perfil destacado nos resultados</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💬</span>
                <span>Chat ilimitado e prioritário</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span>Super likes e boosts diários</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👻</span>
                <span>Modo invisível disponível</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔥</span>
                <span>Boost de visibilidade automático</span>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Dados para Ativação</h2>
            <p>Preencha seus dados para ativar sua conta premium:</p>
            
            <div className="form-group">
              <label>Nome Completo</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Digite seu nome completo"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Digite seu email"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleInputChange}
                placeholder="Digite sua senha (mín. 6 caracteres)"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Confirmar Senha</label>
              <input
                type="password"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleInputChange}
                placeholder="Confirme sua senha"
                className="form-input"
              />
            </div>
            
            {erro && <div className="erro-message">{erro}</div>}
            
            <button 
              className="btn-cadastrar"
              onClick={handleCadastrar}
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <div className="spinner"></div>
                  Processando...
                </>
              ) : (
                '🚀 Cadastrar Premium'
              )}
            </button>
            
            <div className="garantia-info">
              <p>✅ Ativação imediata após cadastro</p>
              <p>🔒 Seus dados estão seguros conosco</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};