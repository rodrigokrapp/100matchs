import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const LoginPremiumPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !senha.trim()) {
      setMensagemErro('Preencha email e senha!');
      return;
    }

    setLoading(true);
    setMensagemErro('');

    try {
      // Verificar se é usuário premium no Supabase
      const { data, error } = await supabase
        .from('usuarios_premium')
        .select('*')
        .eq('email', email.trim())
        .eq('senha', senha.trim())
        .single();

      if (error || !data) {
        setMensagemErro('Você não é premium! Entre abaixo como visitante.');
        return;
      }

      // Login bem-sucedido
      const userData = {
        ...data,
        tipo: 'premium',
        dataLogin: new Date().toISOString()
      };

      localStorage.setItem('usuario', JSON.stringify(userData));
      navigate('/salas');

    } catch (error) {
      console.error('Erro no login premium:', error);
      setMensagemErro('Erro no sistema. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff69b4 0%, #1e3a8a 100%)',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '40px',
      maxWidth: '400px',
      width: '100%',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
      textAlign: 'center' as const,
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '20px',
      background: 'linear-gradient(135deg, #ff69b4, #1e3a8a)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '30px',
    },
    input: {
      width: '100%',
      padding: '15px',
      border: '2px solid #ddd',
      borderRadius: '12px',
      fontSize: '16px',
      marginBottom: '20px',
      boxSizing: 'border-box' as const,
    },
    button: {
      width: '100%',
      padding: '15px',
      background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginBottom: '15px',
      opacity: loading ? 0.7 : 1,
    },
    backButton: {
      width: '100%',
      padding: '15px',
      background: '#666',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      cursor: 'pointer',
    },
    errorMessage: {
      background: '#fee2e2',
      color: '#dc2626',
      padding: '10px',
      borderRadius: '8px',
      marginBottom: '15px',
      fontSize: '14px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>⭐ Login Premium</h1>
        <p style={styles.subtitle}>
          Acesse sua conta premium
        </p>

        {mensagemErro && (
          <div style={styles.errorMessage}>
            {mensagemErro}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Premium"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? '⏳ Entrando...' : '🔑 Entrar Premium'}
          </button>
        </form>

        <button 
          style={styles.backButton}
          onClick={() => navigate('/inicio')}
        >
          ← Voltar ao Início
        </button>
      </div>
    </div>
  );
};

export default LoginPremiumPage; 