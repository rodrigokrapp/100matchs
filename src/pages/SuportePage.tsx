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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 relative overflow-hidden flex items-center justify-center p-6">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-6">🛠️</div>
          <h1 className="text-4xl font-black text-white mb-6 drop-shadow-lg">
            Suporte Premium
          </h1>
          <p className="text-white/80 text-xl font-semibold">
            Digite o código de acesso para continuar
          </p>
        </div>

        {/* Formulário de Código */}
        <div className="space-y-8">
          <div>
            <label className="block text-white font-bold mb-4 text-lg">
              Código de 4 dígitos:
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.slice(0, 4))}
              placeholder="0000"
              maxLength={4}
              className="w-full px-8 py-6 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border-2 border-white/30 focus:border-white focus:outline-none focus:ring-4 focus:ring-white/20 text-3xl text-center font-black tracking-widest transition-all duration-300"
              style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            />
          </div>

          {/* Mensagens de erro/sucesso */}
          {erro && (
            <div className="bg-red-500/20 border-2 border-red-400 text-red-100 px-6 py-4 rounded-2xl text-center font-bold text-lg animate-shake">
              ❌ {erro}
            </div>
          )}

          {sucesso && (
            <div className="bg-green-500/20 border-2 border-green-400 text-green-100 px-6 py-4 rounded-2xl text-center font-bold text-lg animate-pulse">
              ✅ Código válido! Acesso liberado.
            </div>
          )}

          {/* Botões */}
          <div className="space-y-6">
            {!sucesso ? (
              <button
                onClick={handleValidarCodigo}
                disabled={codigo.length !== 4}
                className={`w-full py-5 px-8 rounded-2xl font-black text-xl transition-all duration-300 ${
                  codigo.length === 4
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transform hover:scale-105 shadow-2xl border-2 border-white/30'
                    : 'bg-gray-500/50 text-gray-300 cursor-not-allowed border-2 border-gray-400/30'
                }`}
                style={codigo.length === 4 ? {
                  boxShadow: '0 20px 60px rgba(34, 197, 94, 0.4)',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                } : {}}
              >
                🔓 Validar Código
              </button>
            ) : (
              <button
                onClick={handleCadastroPremium}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-6 px-8 rounded-2xl font-black text-xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-2xl animate-pulse border-2 border-white/30 relative overflow-hidden group"
                style={{
                  boxShadow: '0 20px 60px rgba(255, 193, 7, 0.5)',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10">
                  ⭐ Cadastro Premium ⭐
                </span>
              </button>
            )}

            <button
              onClick={handleVoltar}
              className="w-full bg-white/20 backdrop-blur-sm text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-white/30 transition-all duration-300 border border-white/30 hover:scale-105"
            >
              ← Voltar ao Início
            </button>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="mt-10 text-center">
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <p className="text-white/80 text-sm font-semibold mb-2">
              💡 Precisa de ajuda?
            </p>
            <p className="text-white/60 text-xs">
              Entre em contato conosco para obter suporte
            </p>
          </div>
        </div>
      </div>

      {/* Estilos para animação shake */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SuportePage; 