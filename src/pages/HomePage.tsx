import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const handlePremiumClick = () => {
    alert('🌟 Seja Premium e tenha acesso ilimitado! 🌟');
  };

  const handleSuporteClick = () => {
    navigate('/suporte6828');
  };

  const handleEntrarChat = () => {
    if (!nome.trim() || !email.trim()) {
      alert('Por favor, preencha seu nome e email!');
      return;
    }
    navigate('/salas');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500">
      {/* Header com botões */}
      <div className="flex justify-between items-center p-4">
        <button 
          onClick={handleSuporteClick}
          className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all duration-300 shadow-lg"
        >
          📞 Suporte
        </button>
        
        <button 
          onClick={handlePremiumClick}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg animate-pulse shadow-2xl hover:scale-105 transition-all duration-300"
        >
          ⭐ SEJA PREMIUM ⭐
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Título Principal */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            💬 Resenha sem matchs
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-medium max-w-4xl mx-auto leading-relaxed">
            desliza desliza desliza e nada de conversar ne? aqui o usuario FREE conhece alguem do seu bairro e cidade todo dia
          </p>
        </div>

        {/* Seção de Fotos de Jovens */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            🔥 Pessoas incríveis te esperando! 🔥
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Foto 1 */}
            <div className="relative group">
              <div className="w-full h-64 bg-gradient-to-br from-pink-300 to-purple-400 rounded-2xl shadow-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face" 
                  alt="Jovem estiloso"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute bottom-4 left-4 text-white font-semibold text-lg drop-shadow-lg">
                Lucas, 24
              </div>
            </div>

            {/* Foto 2 */}
            <div className="relative group">
              <div className="w-full h-64 bg-gradient-to-br from-blue-300 to-purple-400 rounded-2xl shadow-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=400&fit=crop&crop=face" 
                  alt="Jovem estilosa"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute bottom-4 left-4 text-white font-semibold text-lg drop-shadow-lg">
                Ana, 22
              </div>
            </div>

            {/* Foto 3 */}
            <div className="relative group">
              <div className="w-full h-64 bg-gradient-to-br from-purple-300 to-pink-400 rounded-2xl shadow-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&crop=face" 
                  alt="Jovem estiloso"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute bottom-4 left-4 text-white font-semibold text-lg drop-shadow-lg">
                Pedro, 26
              </div>
            </div>

            {/* Foto 4 */}
            <div className="relative group">
              <div className="w-full h-64 bg-gradient-to-br from-pink-300 to-blue-400 rounded-2xl shadow-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face" 
                  alt="Jovem estilosa"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute bottom-4 left-4 text-white font-semibold text-lg drop-shadow-lg">
                Maria, 23
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Entrada */}
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            <h3 className="text-2xl font-bold text-white text-center mb-6">
              🚀 Entre no Chat Agora!
            </h3>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="📝 Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                />
              </div>
              
              <div>
                <input
                  type="email"
                  placeholder="📧 Seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                />
              </div>
              
              <button
                onClick={handleEntrarChat}
                className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-xl"
              >
                💬 Entrar no Chat
              </button>
            </div>
          </div>
        </div>

        {/* Botão Premium Grande */}
        <div className="text-center mt-12">
          <button 
            onClick={handlePremiumClick}
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-16 py-6 rounded-full font-bold text-2xl animate-bounce shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-white"
          >
            🌟 SEJA PREMIUM E CONVERSE SEM LIMITES! 🌟
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;