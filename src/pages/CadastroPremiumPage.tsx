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
      localStorage.setItem('usuario', JSON.stringify(novoUsuario));

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
          </div>

          <div className="benefits-section">
            <h3>🎯 Benefícios Premium</h3>
            <div className="benefits-grid">
              <div className="benefit-item">
                <span className="benefit-icon">🚀</span>
                <span>Chat ilimitado</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🏠</span>
                <span>Criar salas personalizadas</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📱</span>
                <span>Sem limitações de uso</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">⚡</span>
                <span>Acesso prioritário</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="input-group">
              <label htmlFor="nome">Nome Completo</label>
              <input
                id="nome"
                type="text"
                placeholder="Digite seu nome completo"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className={`input ${errors.nome ? 'input-error' : ''}`}
              />
              {errors.nome && <span className="error-message">{errors.nome}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`input ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.senha}
                onChange={(e) => handleInputChange('senha', e.target.value)}
                className={`input ${errors.senha ? 'input-error' : ''}`}
              />
              {errors.senha && <span className="error-message">{errors.senha}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="confirmarSenha">Confirmar Senha</label>
              <input
                id="confirmarSenha"
                type="password"
                placeholder="Digite a senha novamente"
                value={formData.confirmarSenha}
                onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                className={`input ${errors.confirmarSenha ? 'input-error' : ''}`}
              />
              {errors.confirmarSenha && <span className="error-message">{errors.confirmarSenha}</span>}
            </div>
          </div>

          <div className="actions">
            <button onClick={handleVoltar} className="btn btn-secondary">
              Voltar
            </button>
            <button 
              onClick={handleCadastrar}
              className="btn btn-premium"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Premium'}
            </button>
          </div>

          <div className="login-link">
            <p>Já tem conta Premium? <button onClick={() => navigate('/loginpremium')} className="link-button">Fazer login</button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroPremiumPage;