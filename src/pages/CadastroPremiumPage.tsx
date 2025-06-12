import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CadastroPremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      setErro('Nome é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      setErro('Email é obrigatório');
      return false;
    }
    if (!formData.email.includes('@')) {
      setErro('Email inválido');
      return false;
    }
    if (formData.senha.length < 6) {
      setErro('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.senha !== formData.confirmarSenha) {
      setErro('Senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleCadastrar = async () => {
    setErro('');
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    // Simular cadastro
    setTimeout(() => {
      // Salvar usuário premium no localStorage
      const usuarioPremium = {
        id: `premium_${Date.now()}`,
        nome: formData.nome,
        email: formData.email,
        isPremium: true,
        dataCadastro: new Date().toISOString(),
        loginTime: Date.now()
      };

      localStorage.setItem('currentUser', JSON.stringify(usuarioPremium));
      localStorage.setItem('premiumUsers', JSON.stringify([usuarioPremium]));
      
      setLoading(false);
      setSucesso(true);
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        navigate('/salas');
      }, 3000);
    }, 2000);
  };

  const handleVoltar = () => {
    navigate('/suporte6828');
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 relative overflow-hidden flex items-center justify-center p-6">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 max-w-lg w-full text-center">
          <div className="text-8xl mb-8 animate-bounce">🎉</div>
          <h1 className="text-4xl font-black text-white mb-6 drop-shadow-lg">
            Cadastro Realizado!
          </h1>
          <p className="text-white/90 text-xl mb-8 font-semibold">
            Bem-vindo ao Premium! Você agora tem acesso ilimitado.
          </p>
          
          {/* Lista de benefícios */}
          <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/20">
            <h3 className="text-white font-bold text-lg mb-4">🌟 Seus benefícios ativados:</h3>
            <ul className="text-white/80 text-sm space-y-2 text-left">
              <li>✅ Tempo ilimitado de chat</li>
              <li>✅ Envio de fotos e vídeos</li>
              <li>✅ Mensagens de áudio</li>
              <li>✅ Ver perfis completos</li>
              <li>✅ Suporte prioritário</li>
            </ul>
          </div>

          <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-white/70 text-lg font-semibold">Redirecionando para as salas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 relative overflow-hidden flex items-center justify-center p-6">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-6">⭐</div>
          <h1 className="text-4xl font-black text-white mb-6 drop-shadow-lg">
            Cadastro Premium
          </h1>
          <p className="text-white/90 text-xl font-semibold">
            Preencha seus dados para ter acesso ilimitado
          </p>
        </div>

        {/* Formulário */}
        <div className="space-y-6">
          <div>
            <label className="block text-white font-bold mb-3 text-lg">
              Nome completo:
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Digite seu nome"
              className="w-full px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border-2 border-white/30 focus:border-white focus:outline-none focus:ring-4 focus:ring-white/20 text-lg font-semibold transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-3 text-lg">
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu@email.com"
              className="w-full px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border-2 border-white/30 focus:border-white focus:outline-none focus:ring-4 focus:ring-white/20 text-lg font-semibold transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-3 text-lg">
              Senha:
            </label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleInputChange}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border-2 border-white/30 focus:border-white focus:outline-none focus:ring-4 focus:ring-white/20 text-lg font-semibold transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-3 text-lg">
              Confirmar senha:
            </label>
            <input
              type="password"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleInputChange}
              placeholder="Digite a senha novamente"
              className="w-full px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border-2 border-white/30 focus:border-white focus:outline-none focus:ring-4 focus:ring-white/20 text-lg font-semibold transition-all duration-300"
            />
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div className="bg-red-500/20 border-2 border-red-400 text-red-100 px-6 py-4 rounded-2xl text-center font-bold text-lg animate-shake">
              ❌ {erro}
            </div>
          )}

          {/* Benefícios Premium */}
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-white font-black text-lg mb-4 text-center">🌟 Benefícios Premium:</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span className="text-white/90 font-semibold">Tempo ilimitado de chat</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span className="text-white/90 font-semibold">Envio de fotos e vídeos</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span className="text-white/90 font-semibold">Mensagens de áudio</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span className="text-white/90 font-semibold">Ver perfis completos</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span className="text-white/90 font-semibold">Suporte prioritário</span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-6">
            <button
              onClick={handleCadastrar}
              disabled={loading}
              className={`w-full py-5 px-8 rounded-2xl font-black text-xl transition-all duration-300 relative overflow-hidden group ${
                loading
                  ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed border-2 border-gray-400/30'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transform hover:scale-105 shadow-2xl border-2 border-white/30'
              }`}
              style={!loading ? {
                boxShadow: '0 20px 60px rgba(34, 197, 94, 0.4)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              } : {}}
            >
              {!loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              )}
              <span className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full mr-3"></div>
                    Cadastrando...
                  </div>
                ) : (
                  '🚀 Cadastrar Premium'
                )}
              </span>
            </button>

            <button
              onClick={handleVoltar}
              className="w-full bg-white/20 backdrop-blur-sm text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-white/30 transition-all duration-300 border border-white/30 hover:scale-105"
            >
              ← Voltar
            </button>
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

export default CadastroPremiumPage;