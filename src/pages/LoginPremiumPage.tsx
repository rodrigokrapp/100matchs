import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './LoginPremiumPage.css';

const LoginPremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    aceitarTermos: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [dadosSalvos, setDadosSalvos] = useState(false);

  // 🔄 AUTO-LOGIN: Carregar dados salvos automaticamente
  useEffect(() => {
    const carregarDadosSalvos = () => {
      try {
        const loginSalvo = localStorage.getItem('login-premium-salvo');
        if (loginSalvo) {
          const dados = JSON.parse(loginSalvo);
          setFormData(prev => ({
            ...prev,
            email: dados.email || '',
            senha: dados.senha || '',
            aceitarTermos: dados.aceitarTermos || false
          }));
          setDadosSalvos(true);
          console.log('✅ Dados de login carregados automaticamente');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados salvos:', error);
      }
    };

    carregarDadosSalvos();
  }, []);

  // 💾 Salvar dados automaticamente quando alterados
  const salvarDados = (novoFormData: any) => {
    try {
      const dadosParaSalvar = {
        email: novoFormData.email,
        senha: novoFormData.senha,
        aceitarTermos: novoFormData.aceitarTermos,
        dataUltimoLogin: new Date().toISOString()
      };
      localStorage.setItem('login-premium-salvo', JSON.stringify(dadosParaSalvar));
      console.log('💾 Dados salvos para próximo login');
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    }

    // Validar termos
    if (!formData.aceitarTermos) {
      newErrors.aceitarTermos = 'Você deve aceitar os termos de políticas e privacidade';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    const novoFormData = { ...formData, [field]: value };
    setFormData(novoFormData);
    
    // 💾 Salvar automaticamente quando dados mudarem
    salvarDados(novoFormData);
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Buscar usuários premium
      const usuariosPremium = JSON.parse(localStorage.getItem('usuarios-premium') || '[]');
      const usuario = usuariosPremium.find((user: any) => 
        user.email === formData.email && user.senha === formData.senha
      );

      if (usuario) {
        // Fazer login
        localStorage.setItem('usuarioPremium', JSON.stringify(usuario));
        alert('Login realizado com sucesso!');
        navigate('/salas');
      } else {
        alert('Email ou senha incorretos!');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      alert('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate('/inicio');
  };

  const handleCadastrar = () => {
    navigate('/suporte6828');
  };

  return (
    <div className="login-premium-page">
      <Header />
      
      <div className="login-container">
        <div className="login-card card">
          <div className="login-header">
            <div className="premium-badge">⭐ PREMIUM</div>
            <h1>Login Premium</h1>
            <p>Acesse sua conta premium</p>
            {dadosSalvos && (
              <div className="dados-salvos-info">
                <span className="icone-salvo">💾</span>
                <span>Dados salvos! Você pode entrar rapidamente</span>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`input ${errors.email ? 'input-error' : ''}`}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={formData.senha}
                onChange={(e) => handleInputChange('senha', e.target.value)}
                className={`input ${errors.senha ? 'input-error' : ''}`}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              {errors.senha && <span className="error-message">{errors.senha}</span>}
            </div>

            <div className="terms-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.aceitarTermos}
                  onChange={(e) => handleInputChange('aceitarTermos', e.target.checked.toString())}
                />
                <span>Aceito os termos de políticas e privacidade de imagem, dados básicos e respeito aos usuários do chat</span>
              </label>
              {errors.aceitarTermos && <span className="error-message">{errors.aceitarTermos}</span>}
            </div>
          </div>

          <div className="actions">
            <button onClick={handleVoltar} className="btn btn-secondary">
              Voltar
            </button>
            <button 
              onClick={handleLogin}
              className="btn btn-premium"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="cadastro-link">
            <p>Não tem conta Premium? <button onClick={handleCadastrar} className="link-button">Cadastre-se</button></p>
          </div>

          <div className="benefits-reminder">
            <h3>🎯 Lembre-se dos benefícios Premium</h3>
            <div className="benefits-list">
              <div className="benefit-item">
                <span className="benefit-icon">🚀</span>
                <span>Chat ilimitado sem restrições</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🏠</span>
                <span>Criar salas personalizadas</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">⚡</span>
                <span>Acesso prioritário a recursos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPremiumPage; 