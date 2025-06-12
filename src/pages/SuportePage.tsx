import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SuportePage: React.FC = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleValidarCodigo = () => {
    if (codigo === '6838') {
      setSucesso(true);
      setErro('');
    } else {
      setErro('Código inválido! Tente novamente.');
      setSucesso(false);
    }
  };

  const handleCadastroPremium = () => {
    navigate('/cadastropremium6838k');
  };

  const handleVoltar = () => {
    navigate('/inicio');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 relative overflow-hidden flex items-center justify-center p-8">
      {/* Elementos decorativos de fundo ultra modernos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Partículas flutuantes */}
        <div className="absolute top-20 left-20 w-6 h-6 bg-white/30 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-32 w-4 h-4 bg-purple-300/40 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-40 w-8 h-8 bg-pink-300/30 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute top-60 right-20 w-5 h-5 bg-blue-300/40 rounded-full animate-bounce delay-1300"></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border-2 border-white/20 max-w-lg w-full overflow-hidden">
        {/* Efeito de brilho no card */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
        
        <div className="relative z-10">
          {/* Header Ultra Moderno */}
          <div className="text-center mb-12">
            <div className="text-8xl mb-8 animate-bounce">🛠️</div>
            <h1 className="text-5xl font-black text-white mb-8 drop-shadow-lg">
              <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                Suporte Premium
              </span>
            </h1>
            <p className="text-white/90 text-2xl font-bold">
              Digite o código de acesso para continuar
            </p>
          </div>

          {/* Formulário de Código Ultra Futurista */}
          <div className="space-y-10">
            <div>
              <label className="block text-white font-black mb-6 text-2xl text-center">
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Código de 4 dígitos:
                </span>
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.slice(0, 4))}
                  placeholder="0000"
                  maxLength={4}
                  className="w-full px-10 py-8 rounded-3xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border-4 border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-8 focus:ring-yellow-400/20 text-4xl text-center font-black tracking-widest transition-all duration-500 group-hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.2)',
                    textShadow: '3px 3px 6px rgba(0,0,0,0.4)'
                  }}
                />
                
                {/* Efeito de brilho no input */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-3xl pointer-events-none"></div>
              </div>
            </div>

            {/* Mensagens de erro/sucesso com animações */}
            {erro && (
              <div className="bg-red-500/20 border-4 border-red-400 text-red-100 px-8 py-6 rounded-3xl text-center font-black text-xl animate-shake shadow-2xl">
                <span className="text-3xl mr-3">❌</span>
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="bg-green-500/20 border-4 border-green-400 text-green-100 px-8 py-6 rounded-3xl text-center font-black text-xl animate-pulse shadow-2xl">
                <span className="text-3xl mr-3">✅</span>
                Código válido! Acesso liberado.
              </div>
            )}

            {/* Botões Ultra Modernos */}
            <div className="space-y-8">
              {!sucesso ? (
                <button
                  onClick={handleValidarCodigo}
                  disabled={codigo.length !== 4}
                  className={`group w-full py-6 px-10 rounded-3xl font-black text-2xl transition-all duration-500 relative overflow-hidden ${
                    codigo.length === 4
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transform hover:scale-105 shadow-2xl border-4 border-white/30'
                      : 'bg-gray-500/50 text-gray-300 cursor-not-allowed border-4 border-gray-400/30'
                  }`}
                  style={codigo.length === 4 ? {
                    boxShadow: '0 25px 80px rgba(34, 197, 94, 0.5)',
                    textShadow: '3px 3px 6px rgba(0,0,0,0.4)'
                  } : {}}
                >
                  {codigo.length === 4 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  )}
                  <span className="relative z-10 flex items-center justify-center space-x-3">
                    <span className="text-3xl">🔓</span>
                    <span>Validar Código</span>
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleCadastroPremium}
                  className="group w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-8 px-12 rounded-3xl font-black text-2xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-500 shadow-2xl animate-pulse border-4 border-white/30 relative overflow-hidden"
                  style={{
                    boxShadow: '0 30px 100px rgba(255, 193, 7, 0.6)',
                    textShadow: '3px 3px 6px rgba(0,0,0,0.4)'
                  }}
                >
                  {/* Múltiplos efeitos de brilho */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-transparent transform skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1500"></div>
                  
                  <span className="relative z-10 flex items-center justify-center space-x-4">
                    <span className="text-4xl animate-spin">⭐</span>
                    <span>Cadastro Premium</span>
                    <span className="text-4xl animate-spin delay-500">⭐</span>
                  </span>
                </button>
              )}

              <button
                onClick={handleVoltar}
                className="group w-full bg-white/20 backdrop-blur-sm text-white py-5 px-10 rounded-3xl font-bold text-xl hover:bg-white/30 transition-all duration-500 border-2 border-white/30 hover:scale-105 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                  boxShadow: '0 15px 50px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10 flex items-center justify-center space-x-3">
                  <span className="text-2xl">←</span>
                  <span>Voltar ao Início</span>
                </span>
              </button>
            </div>
          </div>

          {/* Informações adicionais ultra modernas */}
          <div className="mt-12 text-center">
            <div className="bg-white/10 rounded-3xl p-8 border-2 border-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="text-4xl mb-4">💡</div>
                <p className="text-white/90 text-lg font-bold mb-3">
                  Precisa de ajuda?
                </p>
                <p className="text-white/70 text-sm font-semibold">
                  Entre em contato conosco para obter suporte especializado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para animação shake */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SuportePage;