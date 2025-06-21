import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './CadastroPremiumPage.css';

const CadastroPremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [erro, setErro] = useState('');
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
    if (!formData.email.includes('@')) {
      setErro('Email inválido');
      return false;
    }
    if (formData.senha.length < 6) {
      setErro('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.senha !== formData.confirmarSenha) {
      setErro('Senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleCadastrar = async () => {
    if (!validarFormulario()) return;

    setCarregando(true);
    
    try {
      // Simular delay de cadastro
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Salvar usuário premium no localStorage
      const usuariosPremium = JSON.parse(localStorage.getItem('usuarios-premium') || '[]');
      
      // Verificar se email já existe
      const emailExiste = usuariosPremium.find((u: any) => u.email === formData.email);
      if (emailExiste) {
        setErro('Email já cadastrado');
        setCarregando(false);
        return;
      }
      
      const novoUsuario = {
        id: Date.now().toString(),
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        premium: true,
        tipo: 'premium',
        dataCadastro: new Date().toISOString(),
        foto: null
      };
      
      usuariosPremium.push(novoUsuario);
      localStorage.setItem('usuarios-premium', JSON.stringify(usuariosPremium));
      
      // Fazer login automático
      localStorage.setItem('usuarioPremium', JSON.stringify(novoUsuario));
      
      // Redirecionar para salas
      navigate('/salas');
      
    } catch (error) {
      setErro('Erro ao cadastrar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="cadastro-premium-page">
      <Header />
      
      <div className="cadastro-container">
        <div className="cadastro-content">
          <div className="cadastro-header">
            <h1>🌟 Cadastro Premium</h1>
            <p>Crie sua conta premium e tenha acesso a todas as funcionalidades!</p>
          </div>
          
          <div className="cadastro-form">
            <div className="input-group">
              <label htmlFor="nome">Nome Completo</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Digite seu nome completo"
                className="form-input"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Digite seu email"
                className="form-input"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="senha">Senha</label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleInputChange}
                placeholder="Digite sua senha (mín. 6 caracteres)"
                className="form-input"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="confirmarSenha">Confirmar Senha</label>
              <input
                type="password"
                id="confirmarSenha"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleInputChange}
                placeholder="Confirme sua senha"
                className="form-input"
              />
            </div>
            
            {erro && <div className="erro-message">{erro}</div>}
            
            <button 
              onClick={handleCadastrar}
              disabled={carregando}
              className="cadastrar-btn"
            >
              {carregando ? 'Cadastrando...' : '✨ Cadastrar Premium'}
            </button>
          </div>
          
          <div className="beneficios-section">
            <h3>🎯 Benefícios Premium</h3>
            <div className="beneficios-list">
              <div className="beneficio-item">
                <span className="beneficio-icon">🎤</span>
                <span>Mensagens de áudio ilimitadas</span>
              </div>
              <div className="beneficio-item">
                <span className="beneficio-icon">📷</span>
                <span>Envio de imagens e vídeos</span>
              </div>
              <div className="beneficio-item">
                <span className="beneficio-icon">😀</span>
                <span>Emoticons exclusivos</span>
              </div>
              <div className="beneficio-item">
                <span className="beneficio-icon">🏠</span>
                <span>Criar salas personalizadas</span>
              </div>
              <div className="beneficio-item">
                <span className="beneficio-icon">⏰</span>
                <span>Acesso ilimitado 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroPremiumPage;