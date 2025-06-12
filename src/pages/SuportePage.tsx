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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            🛠️ Suporte Premium
          </h1>
          <p className="text-white/80 text-lg">
            Digite o código de acesso para continuar
          </p>
        </div>

        {/* Formulário de Código */}
        <div className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-2">
              Código de 4 dígitos:
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.slice(0, 4))}
              placeholder="0000"
              maxLength={4}
              className="w-full px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 text-2xl text-center font-bold tracking-widest"
            />
          </div>

          {/* Mensagens de erro/sucesso */}
          {erro && (
            <div className="bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded-2xl text-center">
              ❌ {erro}
            </div>
          )}

          {sucesso && (
            <div className="bg-green-500/20 border border-green-400 text-green-100 px-4 py-3 rounded-2xl text-center">
              ✅ Código válido! Acesso liberado.
            </div>
          )}

          {/* Botões */}
          <div className="space-y-4">
            {!sucesso ? (
              <button
                onClick={handleValidarCodigo}
                disabled={codigo.length !== 4}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  codigo.length === 4
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transform hover:scale-105 shadow-xl'
                    : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                }`}
              >
                🔓 Validar Código
              </button>
            ) : (
              <button
                onClick={handleCadastroPremium}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-xl animate-pulse"
              >
                ⭐ Cadastro Premium ⭐
              </button>
            )}

            <button
              onClick={handleVoltar}
              className="w-full bg-white/20 backdrop-blur-sm text-white py-3 px-6 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300"
            >
              ← Voltar ao Início
            </button>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            💡 Precisa de ajuda? Entre em contato conosco
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuportePage; 