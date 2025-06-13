import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowLeft, FiCrown } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import './CadastroPremiumPage.css';

const CadastroPremiumPage: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const navigate = useNavigate();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      // Cadastrar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            full_name: nome,
            user_type: 'premium'
          }
        }
      });

      if (authError) {
        throw authError;
      }

      // Salvar dados localmente também
      const userData = {
        nome,
        email,
        tipo: 'premium',
        id: authData.user?.id
      };
      
      localStorage.setItem('usuario', JSON.stringify(userData));
      
      setSucesso(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/salas');
      }, 2000);

    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      setErro(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate('/suporte6828');
  };

  if (sucesso) {
    return (
      <div className="cadastro-page">
        <div className="cadastro-container">
          <div className="sucesso-content">
            <div className="sucesso-icon">
              <FiCrown size={80} />
            </div>
            <h1>Bem-vindo ao Premium!</h1>
            <p>Sua conta premium foi criada com sucesso!</p>
            <div className="loading-redirect">
              <div className="spinner"></div>
              <p>Redirecionando para as salas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cadastro-page">
      <div className="cadastro-container">
        <button onClick={handleVoltar} className="btn-voltar">
          <FiArrowLeft /> Voltar
        </button>

        <div className="cadastro-content">
          <div className="premium-header">
            <FiCrown size={60} />
            <h1>Cadastro Premium</h1>
            <p>Complete seu cadastro para ter acesso total à plataforma</p>
          </div>

          <form onSubmit={handleCadastro} className="cadastro-form">
            <div className="input-group">
              <FiUser className="input-icon" />
              <input
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <FiMail className="input-icon" />
              <input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                type="password"
                placeholder="Sua senha (mínimo 6 caracteres)"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={6}
                required
                disabled={loading}
              />
            </div>

            {erro && <p className="erro-msg">{erro}</p>}

            <button type="submit" className="btn-cadastrar" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Criando conta...
                </>
              ) : (
                <>
                  <FiCrown />
                  Cadastrar Premium
                </>
              )}
            </button>
          </form>

          <div className="premium-benefits">
            <h3>Benefícios Premium:</h3>
            <ul>
              <li>✅ Acesso a todas as salas de chat</li>
              <li>✅ Envio de fotos e vídeos</li>
              <li>✅ Mensagens de áudio</li>
              <li>✅ Emoticons exclusivos</li>
              <li>✅ Suporte prioritário</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroPremiumPage;