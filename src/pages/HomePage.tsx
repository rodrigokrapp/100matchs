import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';

interface User {
  id: string;
  email: string;
  nome: string;
  isPremium: boolean;
  loginTime: number;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nome: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar se já existe um usuário logado
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email) return;

    setLoading(true);
    setTimeout(() => {
      const user: User = {
        id: `user_${Date.now()}`,
        email: formData.email,
        nome: formData.nome,
        isPremium: false,
        loginTime: Date.now()
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/salas');
    }, 1000);
  };

  const handlePremiumClick = () => {
    // Redirecionar para página de pagamento (implementar depois)
    alert('Funcionalidade de pagamento será implementada em breve!');
  };

  const handleLoggedUserAccess = () => {
    if (currentUser) {
      navigate('/salas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full fade-in">
        {/* Botão Premium no Topo */}
        <div className="text-center mb-6">
          <button 
            onClick={handlePremiumClick}
            className="btn-premium text-2xl px-16 py-8 animate-bounce shadow-2xl transform hover:scale-110 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #ff1744, #ff6b9d, #ff8fab)',
              boxShadow: '0 12px 40px rgba(255, 23, 68, 0.6)',
              fontSize: '2rem',
              fontWeight: 'bold',
              border: '3px solid #fff',
              borderRadius: '50px'
            }}
          >
            🚀 SEJA PREMIUM AGORA! 🚀
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
            💬 Resenha sem matchs
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6">
            desliza desliza e desliza e nada de conversar neh, aqui o USUARIO FREE conversa com pessoas do seu bairro e cidade.
          </p>
          
          {/* Botão Premium Destacado */}
          <button 
            onClick={handlePremiumClick}
            className="btn-premium text-xl px-12 py-6 mb-8 animate-pulse shadow-2xl transform hover:scale-105 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #ff6b9d, #ff8fab, #ff6b9d)',
              boxShadow: '0 8px 32px rgba(255, 107, 157, 0.5)',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            ⭐ SEJA PREMIUM ⭐
          </button>
        </div>

        {/* Explicação do Site */}
        <div className="bg-gradient-to-r from-pink-50 to-blue-50 p-6 rounded-xl mb-8">
          <h3 className="text-xl font-semibold mb-4 text-center">
            <FaUsers className="inline mr-2" />
            Como funciona?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <FaMapMarkerAlt className="text-2xl text-pink-500 mx-auto mb-2" />
              <p className="text-sm">Encontre pessoas do seu bairro e cidade</p>
            </div>
            <div>
              <FaHeart className="text-2xl text-blue-500 mx-auto mb-2" />
              <p className="text-sm">Converse em tempo real</p>
            </div>
            <div>
              <span className="text-2xl mx-auto mb-2 block">⭐</span>
              <p className="text-sm">Premium: fotos, vídeos e áudios</p>
            </div>
          </div>
        </div>

        {/* Opções de Entrada */}
        <div className="space-y-6">
          {/* Usuário já logado */}
          {currentUser && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">
                Bem-vindo de volta, {currentUser.nome}! 👋
              </h3>
              <p className="text-green-600 text-sm mb-3">
                {currentUser.isPremium ? '⭐ Usuário Premium' : '🆓 Visitante Gratuito'}
              </p>
              <button 
                onClick={handleLoggedUserAccess}
                className="btn-secondary w-full"
              >
                Acessar Salas de Bate-papo
              </button>
            </div>
          )}

          {/* Formulário para Visitante Gratuito */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-center">
              🆓 Entrar como Visitante Gratuito
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="📝 Seu nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                  className="input-field"
                />
              </div>
              
              <div>
                <input
                  type="email"
                  placeholder="📧 Seu email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="input-field"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-secondary w-full"
              >
                {loading ? '⏳ Entrando...' : '🚀 Entrar no Chat'}
              </button>
            </form>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              ⏰ Visitantes gratuitos têm 30 minutos de acesso
            </p>

            {/* Botão Premium adicional no final do formulário */}
            <div className="mt-6 text-center">
              <button 
                onClick={handlePremiumClick}
                className="btn-premium w-full text-lg py-4 animate-bounce"
                style={{
                  background: 'linear-gradient(135deg, #ff6b9d, #ff8fab)',
                  boxShadow: '0 6px 20px rgba(255, 107, 157, 0.4)'
                }}
              >
                ⭐ UPGRADE PARA PREMIUM - SEM LIMITES! ⭐
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Conecte-se com pessoas reais da sua região! 🌟
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;