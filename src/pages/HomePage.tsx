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
      {/* Elementos decorativos de fundo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Partículas flutuantes */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-white/30 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-pink-300/40 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-40 w-5 h-5 bg-blue-300/30 rounded-full animate-bounce delay-1000"></div>
      </div>

      {/* Header com botões */}
      <div className="relative z-10 flex justify-between items-center p-8">
        <button 
          onClick={handleSuporteClick}
          className="group bg-white/20 backdrop-blur-xl text-white px-10 py-5 rounded-full font-black text-xl hover:bg-white/30 transition-all duration-500 shadow-2xl border-2 border-white/30 hover:scale-110 hover:rotate-3"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          <span className="flex items-center space-x-3">
            <span className="text-2xl group-hover:animate-spin">🛠️</span>
            <span>Suporte</span>
          </span>
        </button>
        
        <button 
          onClick={handlePremiumClick}
          className="group bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-16 py-6 rounded-full font-black text-2xl animate-pulse shadow-2xl hover:scale-110 transition-all duration-500 border-4 border-white relative overflow-hidden"
          style={{
            boxShadow: '0 25px 80px rgba(255, 193, 7, 0.6), 0 0 0 1px rgba(255,255,255,0.2)',
            textShadow: '3px 3px 6px rgba(0,0,0,0.4)'
          }}
        >
          {/* Efeito de brilho animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="relative z-10 flex items-center space-x-3">
            <span className="text-3xl animate-bounce">⭐</span>
            <span>SEJA PREMIUM</span>
            <span className="text-3xl animate-bounce delay-200">⭐</span>
          </span>
        </button>
      </div>

      <div className="relative z-10 container mx-auto px-8 py-12">
        {/* Título Principal Ultra Moderno */}
        <div className="text-center mb-20">
          <h1 className="text-7xl md:text-9xl font-black text-white mb-10 drop-shadow-2xl leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-pink-300 via-white to-blue-300 bg-clip-text text-transparent">
              💬 Resenha sem matchs
            </span>
          </h1>
          
          <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/20 shadow-2xl relative overflow-hidden">
            {/* Efeito de brilho no card */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
            
            <p className="relative z-10 text-3xl md:text-4xl text-white font-black leading-relaxed">
              <span className="text-pink-300">desliza desliza desliza</span> e{' '}
              <span className="text-blue-300">nade de conversar ne?</span> aqui o{' '}
              <span className="text-yellow-300 bg-black/20 px-4 py-2 rounded-full">USUARIO FREE</span>{' '}
              conhece alguem do seu bairro e cidade{' '}
              <span className="text-green-300">todo dia</span>
            </p>
          </div>
        </div>

        {/* Seção de Fotos de Jovens - Design Ultra Futurista */}
        <div className="mb-20">
          <h2 className="text-5xl md:text-6xl font-black text-white text-center mb-16 drop-shadow-lg">
            <span className="bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
              🔥 Pessoas Incríveis Te Esperando! 🔥
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-8xl mx-auto">
            {/* Foto 1 - Lucas */}
            <div className="group relative transform hover:scale-105 transition-all duration-700">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                {/* Borda gradiente animada */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-3xl p-1 animate-pulse">
                  <div className="aspect-[3/4] bg-black rounded-3xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=700&fit=crop&crop=face" 
                      alt="Lucas, 24 anos"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter group-hover:brightness-110"
                    />
                    
                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                </div>
                
                {/* Card de informações */}
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-white/20 transform group-hover:scale-105 transition-all duration-500">
                    <h3 className="text-white font-black text-2xl mb-2">Lucas, 24</h3>
                    <p className="text-pink-300 font-bold text-lg">São Paulo, SP</p>
                    <div className="flex items-center mt-3 space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-sm font-semibold">Online agora</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Foto 2 - Ana */}
            <div className="group relative transform hover:scale-105 transition-all duration-700">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-1 animate-pulse delay-300">
                  <div className="aspect-[3/4] bg-black rounded-3xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=500&h=700&fit=crop&crop=face" 
                      alt="Ana, 22 anos"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                </div>
                
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-white/20 transform group-hover:scale-105 transition-all duration-500">
                    <h3 className="text-white font-black text-2xl mb-2">Ana, 22</h3>
                    <p className="text-blue-300 font-bold text-lg">Rio de Janeiro, RJ</p>
                    <div className="flex items-center mt-3 space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-sm font-semibold">Online agora</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Foto 3 - Pedro */}
            <div className="group relative transform hover:scale-105 transition-all duration-700">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl p-1 animate-pulse delay-600">
                  <div className="aspect-[3/4] bg-black rounded-3xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=700&fit=crop&crop=face" 
                      alt="Pedro, 26 anos"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                </div>
                
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-white/20 transform group-hover:scale-105 transition-all duration-500">
                    <h3 className="text-white font-black text-2xl mb-2">Pedro, 26</h3>
                    <p className="text-purple-300 font-bold text-lg">Belo Horizonte, MG</p>
                    <div className="flex items-center mt-3 space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-sm font-semibold">Online agora</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Foto 4 - Maria */}
            <div className="group relative transform hover:scale-105 transition-all duration-700">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 rounded-3xl p-1 animate-pulse delay-900">
                  <div className="aspect-[3/4] bg-black rounded-3xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=700&fit=crop&crop=face" 
                      alt="Maria, 23 anos"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                </div>
                
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-white/20 transform group-hover:scale-105 transition-all duration-500">
                    <h3 className="text-white font-black text-2xl mb-2">Maria, 23</h3>
                    <p className="text-pink-300 font-bold text-lg">Salvador, BA</p>
                    <div className="flex items-center mt-3 space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-sm font-semibold">Online agora</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Entrada - Design Futurista */}
        <div className="max-w-2xl mx-auto mb-20">
          <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border-2 border-white/20 overflow-hidden">
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
            
            <div className="relative z-10">
              <h3 className="text-4xl font-black text-white text-center mb-10">
                <span className="bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
                  🚀 Entre no Chat Agora!
                </span>
              </h3>
              
              <div className="space-y-8">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="📝 Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-8 py-6 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border-2 border-white/30 focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-400/20 text-xl font-bold transition-all duration-500 group-hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}
                  />
                </div>
                
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="📧 Seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-8 py-6 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border-2 border-white/30 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/20 text-xl font-bold transition-all duration-500 group-hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}
                  />
                </div>
                
                <button
                  onClick={handleEntrarChat}
                  className="group w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-6 px-10 rounded-2xl font-black text-2xl hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-500 shadow-2xl border-2 border-white/30 relative overflow-hidden"
                  style={{
                    boxShadow: '0 25px 80px rgba(168, 85, 247, 0.5)',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10 flex items-center justify-center space-x-3">
                    <span className="text-3xl">💬</span>
                    <span>Entrar no Chat</span>
                    <span className="text-3xl">🚀</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Premium Gigante Final */}
        <div className="text-center">
          <button 
            onClick={handlePremiumClick}
            className="group bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 text-white px-24 py-10 rounded-full font-black text-4xl md:text-5xl animate-bounce shadow-2xl hover:scale-110 transition-all duration-500 border-4 border-white relative overflow-hidden"
            style={{
              boxShadow: '0 30px 100px rgba(255, 193, 7, 0.6), 0 0 0 1px rgba(255,255,255,0.3)',
              textShadow: '4px 4px 8px rgba(0,0,0,0.5)'
            }}
          >
            {/* Múltiplos efeitos de brilho */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-transparent transform skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1500"></div>
            
            <span className="relative z-10 flex items-center justify-center space-x-4">
              <span className="text-5xl animate-spin">🌟</span>
              <span>SEJA PREMIUM E CONVERSE SEM LIMITES!</span>
              <span className="text-5xl animate-spin delay-500">🌟</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;