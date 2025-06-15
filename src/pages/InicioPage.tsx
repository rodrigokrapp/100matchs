import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const InicioPage: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [showPoliticas, setShowPoliticas] = useState(false);
  const [aceitoTermos, setAceitoTermos] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [emailPremium, setEmailPremium] = useState('');
  const [senhaPremium, setSenhaPremium] = useState('');
  const [showLoginPremium, setShowLoginPremium] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const navigate = useNavigate();

  // Função para entrar como visitante gratuito
  const handleVisitanteGratuito = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim() || !email.trim()) {
      alert('Por favor, preencha nome e email!');
      return;
    }

    if (!aceitoTermos) {
      alert('Você deve aceitar os termos e políticas de privacidade!');
      return;
    }

    try {
      // Salvar dados do visitante
      const userData = {
        nome: nome.trim(),
        email: email.trim(),
        tipo: 'visitante',
        dataLogin: new Date().toISOString()
      };

      // Salvar no localStorage
      localStorage.setItem('usuario', JSON.stringify(userData));
      
      // Salvar no Supabase
      const { error } = await supabase
        .from('usuarios_visitantes')
        .insert([userData]);

      if (error) {
        console.error('Erro ao salvar visitante:', error);
      }

      console.log('✅ Visitante logado:', userData);
      navigate('/salas');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      alert('Erro ao fazer login. Tente novamente.');
    }
  };

  // Função para login premium
  const handleLoginPremium = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailPremium.trim() || !senhaPremium.trim()) {
      setMensagemErro('Preencha email e senha!');
      return;
    }

    try {
      // Verificar se é usuário premium no Supabase
      const { data, error } = await supabase
        .from('usuarios_premium')
        .select('*')
        .eq('email', emailPremium.trim())
        .eq('senha', senhaPremium.trim())
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
    }
  };

  // Função para abrir link de pagamento
  const handleSejaPremium = () => {
    window.open('https://pay.kiwify.com.br/E2Y9N6m', '_blank');
  };

  // Função para logout
  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setShowMenu(false);
    navigate('/inicio');
  };

  // Verificar se usuário está logado
  const usuarioLogado = localStorage.getItem('usuario');

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff69b4 0%, #1e3a8a 100%)',
      fontFamily: 'Inter, sans-serif',
      position: 'relative' as const,
    },
    header: {
      padding: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      cursor: 'pointer',
      color: 'white',
    },
    logoText: {
      fontSize: '28px',
      fontWeight: 'bold',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    },
    menuButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      padding: '10px',
      borderRadius: '8px',
      cursor: 'pointer',
      position: 'relative' as const,
    },
    menuDropdown: {
      position: 'absolute' as const,
      top: '60px',
      right: '20px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      minWidth: '200px',
      zIndex: 1000,
    },
    menuItem: {
      padding: '15px 20px',
      cursor: 'pointer',
      borderBottom: '1px solid #eee',
      transition: 'background 0.3s ease',
    },
    heroSection: {
      padding: '40px 20px',
      textAlign: 'center' as const,
      color: 'white',
    },
    heroImage: {
      width: '100%',
      maxWidth: '800px',
      height: '400px',
      objectFit: 'cover' as const,
      borderRadius: '20px',
      marginBottom: '40px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    },
    formContainer: {
      maxWidth: '500px',
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '40px',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
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
      fontSize: '18px',
      color: '#666',
      marginBottom: '30px',
    },
    inputGroup: {
      marginBottom: '20px',
    },
    input: {
      width: '100%',
      padding: '15px',
      border: '2px solid #ddd',
      borderRadius: '12px',
      fontSize: '16px',
      transition: 'border-color 0.3s ease',
      boxSizing: 'border-box' as const,
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '20px',
      fontSize: '14px',
      color: '#666',
    },
    button: {
      width: '100%',
      padding: '15px',
      background: 'linear-gradient(135deg, #ff69b4, #ff1493)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
      marginBottom: '15px',
    },
    buttonPremium: {
      width: '100%',
      padding: '15px',
      background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
      marginBottom: '15px',
    },
    suporteButton: {
      position: 'fixed' as const,
      bottom: '30px',
      right: '30px',
      background: '#25d366',
      color: 'white',
      border: 'none',
      borderRadius: '50px',
      padding: '15px 25px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 5px 15px rgba(37, 211, 102, 0.4)',
    },
    modal: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    },
    modalContent: {
      background: 'white',
      padding: '40px',
      borderRadius: '20px',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto',
    },
    errorMessage: {
      background: '#fee2e2',
      color: '#dc2626',
      padding: '10px',
      borderRadius: '8px',
      marginBottom: '15px',
      textAlign: 'center' as const,
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo} onClick={() => navigate('/inicio')}>
          <div style={styles.logoText}>🌹 Resenha sem Matchs</div>
        </div>
        
        <button 
          style={styles.menuButton}
          onClick={() => setShowMenu(!showMenu)}
        >
          ☰
        </button>

        {/* Menu Dropdown */}
        {showMenu && (
          <div style={styles.menuDropdown}>
            {usuarioLogado ? (
              <>
                <div 
                  style={styles.menuItem}
                  onClick={() => { navigate('/meu-perfil'); setShowMenu(false); }}
                >
                  👤 Meu Perfil
                </div>
                <div 
                  style={styles.menuItem}
                  onClick={handleLogout}
                >
                  🚪 Sair
                </div>
              </>
            ) : (
              <>
                <div 
                  style={styles.menuItem}
                  onClick={() => { setShowLoginPremium(true); setShowMenu(false); }}
                >
                  ⭐ Entrar Premium
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        {/* Placeholder para imagem dos jovens */}
        <div style={{
          ...styles.heroImage,
          background: 'linear-gradient(45deg, #ff69b4, #1e3a8a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
        }}>
          💕 JOVENS FELIZES 💕
        </div>

        {/* Formulário de Entrada */}
        <div style={styles.formContainer}>
          <h1 style={styles.title}>Conheça pessoas da sua cidade!</h1>
          <p style={styles.subtitle}>Entre gratuitamente e comece a conversar agora!</p>

          <form onSubmit={handleVisitanteGratuito}>
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="termos"
                checked={aceitoTermos}
                onChange={(e) => setAceitoTermos(e.target.checked)}
                required
              />
              <label htmlFor="termos">
                Aceito as{' '}
                <span 
                  style={{ color: '#ff69b4', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => setShowPoliticas(true)}
                >
                  políticas de privacidade
                </span>
              </label>
            </div>

            <button type="submit" style={styles.button}>
              🚀 Entrar como Visitante Gratuito
            </button>
          </form>

          <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '16px', color: '#666' }}>
            - ou -
          </div>

          <button style={styles.buttonPremium} onClick={handleSejaPremium}>
            ⭐ SEJA PREMIUM
          </button>
        </div>
      </section>

      {/* Botão de Suporte */}
      <button 
        style={styles.suporteButton}
        onClick={() => navigate('/suporte6828')}
      >
        💬 Suporte
      </button>

      {/* Modal de Políticas de Privacidade */}
      {showPoliticas && (
        <div style={styles.modal} onClick={() => setShowPoliticas(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Políticas de Privacidade</h2>
            <p>
              <strong>Resumo das Políticas:</strong><br/><br/>
              • Seus dados são seguros e protegidos<br/>
              • Não compartilhamos informações pessoais<br/>
              • Você pode excluir sua conta a qualquer momento<br/>
              • Usamos cookies para melhorar sua experiência<br/>
              • Conteúdo impróprio será moderado<br/>
              • Idade mínima: 18 anos
            </p>
            <button 
              style={styles.button}
              onClick={() => setShowPoliticas(false)}
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* Modal de Login Premium */}
      {showLoginPremium && (
        <div style={styles.modal} onClick={() => setShowLoginPremium(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Login Premium</h2>
            
            {mensagemErro && (
              <div style={styles.errorMessage}>
                {mensagemErro}
              </div>
            )}

            <form onSubmit={handleLoginPremium}>
              <div style={styles.inputGroup}>
                <input
                  type="email"
                  placeholder="Email Premium"
                  value={emailPremium}
                  onChange={(e) => setEmailPremium(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="Senha"
                  value={senhaPremium}
                  onChange={(e) => setSenhaPremium(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <button type="submit" style={styles.buttonPremium}>
                🔑 Entrar Premium
              </button>
            </form>

            <button 
              style={{...styles.button, background: '#666'}}
              onClick={() => {setShowLoginPremium(false); setMensagemErro('');}}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InicioPage; 