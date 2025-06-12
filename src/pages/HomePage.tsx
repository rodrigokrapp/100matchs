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
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-blue-600 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header com botões */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <button 
          onClick={handleSuporteClick}
          className="bg-white/20 backdrop-blur-lg text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/30 transition-all duration-300 shadow-xl border border-white/30 hover:scale-105"
        >
          🛠️ Suporte
        </button>
        
        <button 
          onClick={handlePremiumClick}
          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-12 py-5 rounded-full font-black text-xl animate-pulse shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-white"
          style={{
            boxShadow: '0 20px 60px rgba(255, 193, 7, 0.4), 0 0 0 1px rgba(255,255,255,0.1)',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          ⭐ SEJA PREMIUM ⭐
        </button>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Título Principal */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 drop-shadow-2xl leading-tight">
            💬 Resenha sem matchs
          </h1>
          <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <p className="text-2xl md:text-3xl text-white font-bold leading-relaxed">
              desliza desliza desliza e nada de conversar ne? aqui o usuario FREE conhece alguem do seu bairro e cidade todo dia
            </p>
          </div>
        </div>

        {/* Seção de Fotos de Jovens - Design Ultra Moderno */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12 drop-shadow-lg">
            🔥 Pessoas Incríveis Te Esperando! 🔥
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Foto 1 - Lucas */}
            <div className="group relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                <div className="aspect-[3/4] bg-gradient-to-br from-pink-400 to-purple-600 p-1">
                  <div className="w-full h-full rounded-3xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face" 
                      alt="Lucas, 24 anos"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <h3 className="text-white font-bold text-xl">Lucas, 24</h3>
                    <p className="text-white/80 text-sm">São Paulo, SP</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Foto 2 - Ana */}
            <div className="group relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                <div className="aspect-[3/4] bg-gradient-to-br from-blue-400 to-purple-600 p-1">
                  <div className="w-full h-full rounded-3xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face" 
                      alt="Ana, 22 anos"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <h3 className="text-white font-bold text-xl">Ana, 22</h3>
                    <p className="text-white/80 text-sm">Rio de Janeiro, RJ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Foto 3 - Pedro */}
            <div className="group relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                <div className="aspect-[3/4] bg-gradient-to-br from-purple-400 to-pink-600 p-1">
                  <div className="w-full h-full rounded-3xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face" 
                      alt="Pedro, 26 anos"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <h3 className="text-white font-bold text-xl">Pedro, 26</h3>
                    <p className="text-white/80 text-sm">Belo Horizonte, MG</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Foto 4 - Maria */}
            <div className="group relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                <div className="aspect-[3/4] bg-gradient-to-br from-pink-400 to-blue-600 p-1">
                  <div className="w-full h-full rounded-3xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face" 
                      alt="Maria, 23 anos"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <h3 className="text-white font-bold text-xl">Maria, 23</h3>
                    <p className="text-white/80 text-sm">Salvador, BA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Entrada - Design Ultra Moderno */}
        <div className="max-w-lg mx-auto mb-16">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 relative overflow-hidden">
            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-white text-center mb-8">
                🚀 Entre no Chat Agora!
              </h3>
              
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="📝 Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-6 py-5 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border-2 border-white/30 focus:border-white focus:outline-none focus:ring-4 focus:ring-white/20 text-lg font-semibold transition-all duration-300"
                  />
                </div>
                
                <div className="relative">
                  <input
                    type="email"
                    placeholder="📧 Seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-5 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border-2 border-white/30 focus:border-white focus:outline-none focus:ring-4 focus:ring-white/20 text-lg font-semibold transition-all duration-300"
                  />
                </div>
                
                <button
                  onClick={handleEntrarChat}
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-5 px-8 rounded-2xl font-black text-xl hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-2xl border-2 border-white/30"
                  style={{
                    boxShadow: '0 20px 60px rgba(168, 85, 247, 0.4)',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  💬 Entrar no Chat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Premium Gigante Final */}
        <div className="text-center">
          <button 
            onClick={handlePremiumClick}
            className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 text-white px-20 py-8 rounded-full font-black text-3xl md:text-4xl animate-bounce shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-white relative overflow-hidden group"
            style={{
              boxShadow: '0 25px 80px rgba(255, 193, 7, 0.5), 0 0 0 1px rgba(255,255,255,0.2)',
              textShadow: '3px 3px 6px rgba(0,0,0,0.4)'
            }}
          >
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative z-10">
              🌟 SEJA PREMIUM E CONVERSE SEM LIMITES! 🌟
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;