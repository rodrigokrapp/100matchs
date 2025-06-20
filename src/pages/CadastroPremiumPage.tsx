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
    confirmarSenha: '',
    aceitarTermos: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar senha
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Confirmar senha
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    // Validar termos
    if (!formData.aceitarTermos) {
      newErrors.aceitarTermos = 'Você deve aceitar os termos de políticas e privacidade';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCadastrar = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Verificar se email já existe
      const usuariosExistentes = JSON.parse(localStorage.getItem('usuarios-premium') || '[]');
      const emailExiste = usuariosExistentes.find((user: any) => user.email === formData.email);

      if (emailExiste) {
        alert('Este email já está cadastrado!');
        setLoading(false);
        return;
      }

      // Criar usuário premium
      const novoUsuario = {
        id: Date.now().toString(),
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        senha: formData.senha, // Em produção, usar hash
        premium: true,
        tipo: 'premium',
        criado_em: new Date().toISOString()
      };

      // Salvar no localStorage
      usuariosExistentes.push(novoUsuario);
      localStorage.setItem('usuarios-premium', JSON.stringify(usuariosExistentes));

      // Fazer login automático
      localStorage.setItem('usuarioPremium', JSON.stringify(novoUsuario));

      alert('Cadastro realizado com sucesso! Bem-vindo ao Premium!');
      navigate('/salas');
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate('/suporte6828');
  };

  return (
    <div className="cadastro-premium-page">
      <Header />
      
      <div className="cadastro-container">
        <div className="cadastro-card card">
          <div className="cadastro-header">
            <div className="premium-badge">⭐ PREMIUM</div>
            <h1>Cadastro Premium</h1>
            <p>Acesse todas as funcionalidades exclusivas</p>
            <div className="premium-highlight">
              <span className="highlight-text">✨ Transforme sua experiência!</span>
            </div>
          </div>

          <div className="benefits-section">
            <h3>🎯 Benefícios Premium</h3>
            <div className="benefits-grid">
              <div className="benefit-item premium-benefit">
                <span className="benefit-icon">🚀</span>
                <div className="benefit-content">
                  <strong>Chat Ilimitado</strong>
                  <small>Converse sem restrições</small>
                </div>
              </div>
              <div className="benefit-item premium-benefit">
                <span className="benefit-icon">🏠</span>
                <div className="benefit-content">
                  <strong>Criar Salas</strong>
                  <small>Salas personalizadas</small>
                </div>
              </div>
              <div className="benefit-item premium-benefit">
                <span className="benefit-icon">📱</span>
                <div className="benefit-content">
                  <strong>Sem Limitações</strong>
                  <small>Uso completo da plataforma</small>
                </div>
              </div>
              <div className="benefit-item premium-benefit">
                <span className="benefit-icon">⚡</span>
                <div className="benefit-content">
                  <strong>Acesso Prioritário</strong>
                  <small>Recursos exclusivos</small>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-header">
              <h4>📝 Dados para Cadastro</h4>
            </div>
            
            <div className="input-group">
              <label htmlFor="nome">
                <span className="label-icon">👤</span>
                Nome Completo
              </label>
              <input
                id="nome"
                type="text"
                placeholder="Digite seu nome completo"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className={`input premium-input ${errors.nome ? 'input-error' : ''}`}
              />
              {errors.nome && <span className="error-message">{errors.nome}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="email">
                <span className="label-icon">📧</span>
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`input premium-input ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="senha">
                <span className="label-icon">🔒</span>
                Senha
              </label>
              <input
                id="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.senha}
                onChange={(e) => handleInputChange('senha', e.target.value)}
                className={`input premium-input ${errors.senha ? 'input-error' : ''}`}
              />
              {errors.senha && <span className="error-message">{errors.senha}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="confirmarSenha">
                <span className="label-icon">🔐</span>
                Confirmar Senha
              </label>
              <input
                id="confirmarSenha"
                type="password"
                placeholder="Digite a senha novamente"
                value={formData.confirmarSenha}
                onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                className={`input premium-input ${errors.confirmarSenha ? 'input-error' : ''}`}
              />
              {errors.confirmarSenha && <span className="error-message">{errors.confirmarSenha}</span>}
            </div>

            <div className="terms-checkbox premium-terms">
              <label>
                <input
                  type="checkbox"
                  checked={formData.aceitarTermos || false}
                  onChange={(e) => handleInputChange('aceitarTermos', e.target.checked.toString())}
                />
                <span className="checkmark"></span>
                <span>Aceito os termos de políticas e privacidade de imagem, dados básicos e respeito aos usuários do chat</span>
              </label>
              {errors.aceitarTermos && <span className="error-message">{errors.aceitarTermos}</span>}
            </div>
          </div>

          <div className="actions premium-actions">
            <button onClick={handleVoltar} className="btn btn-secondary premium-btn-secondary">
              ← Voltar
            </button>
            <button 
              onClick={handleCadastrar}
              className="btn btn-premium premium-btn-main"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Cadastrando...
                </>
              ) : (
                <>
                  ⭐ Cadastrar Premium
                </>
              )}
            </button>
          </div>

          <div className="login-link premium-login-link">
            <div className="divider">
              <span>ou</span>
            </div>
            <p>Já tem conta Premium? <button onClick={() => navigate('/loginpremium')} className="link-button premium-link">Fazer login →</button></p>
          </div>

          <div className="premium-footer">
            <div className="security-info">
              <span className="security-icon">🔐</span>
              <small>Seus dados estão seguros e protegidos</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroPremiumPage;