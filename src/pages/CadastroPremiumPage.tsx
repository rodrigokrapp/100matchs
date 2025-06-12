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
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 relative overflow-hidden flex items-center justify-center p-8">
        {/* Elementos decorativos de fundo celebração */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          
          {/* Confetes animados */}
          <div className="absolute top-20 left-20 w-8 h-8 bg-yellow-300/60 rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-40 right-32 w-6 h-6 bg-pink-300/60 rounded-full animate-bounce delay-700"></div>
          <div className="absolute bottom-32 left-40 w-10 h-10 bg-blue-300/60 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute top-60 right-20 w-7 h-7 bg-green-300/60 rounded-full animate-bounce delay-1300"></div>
          <div className="absolute bottom-60 right-60 w-5 h-5 bg-purple-300/60 rounded-full animate-bounce delay-1600"></div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-16 shadow-2xl border-2 border-white/20 max-w-2xl w-full text-center overflow-hidden">
          {/* Efeito de brilho celebração */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="text-9xl mb-10 animate-bounce">🎉</div>
            <h1 className="text-5xl font-black text-white mb-8 drop-shadow-lg">
              <span className="bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Cadastro Realizado!
              </span>
            </h1>
            <p className="text-white/95 text-2xl mb-10 font-bold">
              Bem-vindo ao Premium! Você agora tem acesso ilimitado.
            </p>
            
            {/* Lista de benefícios com animações */}
            <div className="bg-white/10 rounded-3xl p-8 mb-10 border-2 border-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
              
              <div className="relative z-10">
                <h3 className="text-white font-black text-2xl mb-6">
                  <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    🌟 Seus benefícios ativados:
                  </span>
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-4 bg-green-500/20 rounded-2xl p-4 border border-green-400/30">
                    <span className="text-green-400 text-2xl animate-pulse">✅</span>
                    <span className="text-white font-bold text-lg">Tempo ilimitado de chat</span>
                  </div>
                  <div className="flex items-center space-x-4 bg-blue-500/20 rounded-2xl p-4 border border-blue-400/30">
                    <span className="text-blue-400 text-2xl animate-pulse delay-200">✅</span>
                    <span className="text-white font-bold text-lg">Envio de fotos e vídeos</span>
                  </div>
                  <div className="flex items-center space-x-4 bg-purple-500/20 rounded-2xl p-4 border border-purple-400/30">
                    <span className="text-purple-400 text-2xl animate-pulse delay-400">✅</span>
                    <span className="text-white font-bold text-lg">Mensagens de áudio</span>
                  </div>
                  <div className="flex items-center space-x-4 bg-pink-500/20 rounded-2xl p-4 border border-pink-400/30">
                    <span className="text-pink-400 text-2xl animate-pulse delay-600">✅</span>
                    <span className="text-white font-bold text-lg">Ver perfis completos</span>
                  </div>
                  <div className="flex items-center space-x-4 bg-yellow-500/20 rounded-2xl p-4 border border-yellow-400/30">
                    <span className="text-yellow-400 text-2xl animate-pulse delay-800">✅</span>
                    <span className="text-white font-bold text-lg">Suporte prioritário</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-spin w-16 h-16 border-8 border-white/30 border-t-white rounded-full mx-auto mb-6"></div>
            <p className="text-white/80 text-xl font-bold">Redirecionando para as salas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 relative overflow-hidden flex items-center justify-center p-8">
      {/* Elementos decorativos de fundo ultra modernos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Partículas flutuantes */}
        <div className="absolute top-20 left-20 w-6 h-6 bg-white/30 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-32 w-4 h-4 bg-yellow-300/40 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-40 w-8 h-8 bg-orange-300/30 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute top-60 right-20 w-5 h-5 bg-red-300/40 rounded-full animate-bounce delay-1300"></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border-2 border-white/20 max-w-2xl w-full overflow-hidden">
        {/* Efeito de brilho no card */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
        
        <div className="relative z-10">
          {/* Header Ultra Moderno */}
          <div className="text-center mb-12">
            <div className="text-8xl mb-8 animate-bounce">⭐</div>
            <h1 className="text-5xl font-black text-white mb-8 drop-shadow-lg">
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                Cadastro Premium
              </span>
            </h1>
            <p className="text-white/95 text-2xl font-bold">
              Preencha seus dados para ter acesso ilimitado
            </p>
          </div>

          {/* Formulário Ultra Futurista */}
          <div className="space-y-8">
            <div className="group">
              <label className="block text-white font-black mb-4 text-xl">
                <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                  Nome completo:
                </span>
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Digite seu nome"
                className="w-full px-8 py-6 rounded-3xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border-4 border-white/30 focus:border-pink-400 focus:outline-none focus:ring-8 focus:ring-pink-400/20 text-xl font-bold transition-all duration-500 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                  boxShadow: '0 15px 50px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.2)'
                }}
              />
            </div>

            <div className="group">
              <label className="block text-white font-black mb-4 text-xl">
                <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Email:
                </span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className="w-full px-8 py-6 rounded-3xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border-4 border-white/30 focus:border-blue-400 focus:outline-none focus:ring-8 focus:ring-blue-400/20 text-xl font-bold transition-all duration-500 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                  boxShadow: '0 15px 50px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.2)'
                }}
              />
            </div>

            <div className="group">
              <label className="block text-white font-black mb-4 text-xl">
                <span className="bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
                  Senha:
                </span>
              </label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleInputChange}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-8 py-6 rounded-3xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border-4 border-white/30 focus:border-green-400 focus:outline-none focus:ring-8 focus:ring-green-400/20 text-xl font-bold transition-all duration-500 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                  boxShadow: '0 15px 50px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.2)'
                }}
              />
            </div>

            <div className="group">
              <label className="block text-white font-black mb-4 text-xl">
                <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Confirmar senha:
                </span>
              </label>
              <input
                type="password"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleInputChange}
                placeholder="Digite a senha novamente"
                className="w-full px-8 py-6 rounded-3xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border-4 border-white/30 focus:border-purple-400 focus:outline-none focus:ring-8 focus:ring-purple-400/20 text-xl font-bold transition-all duration-500 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                  boxShadow: '0 15px 50px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.2)'
                }}
              />
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <div className="bg-red-500/20 border-4 border-red-400 text-red-100 px-8 py-6 rounded-3xl text-center font-black text-xl animate-shake shadow-2xl">
                <span className="text-3xl mr-3">❌</span>
                {erro}
              </div>
            )}

            {/* Benefícios Premium Ultra Modernos */}
            <div className="bg-white/10 rounded-3xl p-8 border-2 border-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
              
              <div className="relative z-10">
                <h3 className="text-white font-black text-2xl mb-6 text-center">
                  <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    🌟 Benefícios Premium:
                  </span>
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-4 bg-green-500/20 rounded-2xl p-4 border border-green-400/30">
                    <span className="text-green-400 text-2xl animate-pulse">✅</span>
                    <span className="text-white/95 font-bold">Tempo ilimitado de chat</span>
                  </div>
                  <div className="flex items-center space-x-4 bg-blue-500/20 rounded-2xl p-4 border border-blue-400/30">
                    <span className="text-blue-400 text-2xl animate-pulse delay-200">✅</span>
                    <span className="text-white/95 font-bold">Envio de fotos e vídeos</span>
                  </div>
                  <div className="flex items-center space-x-4 bg-purple-500/20 rounded-2xl p-4 border border-purple-400/30">
                    <span className="text-purple-400 text-2xl animate-pulse delay-400">✅</span>
                    <span className="text-white/95 font-bold">Mensagens de áudio</span>
                  </div>
                  <div className="flex items-center space-x-4 bg-pink-500/20 rounded-2xl p-4 border border-pink-400/30">
                    <span className="text-pink-400 text-2xl animate-pulse delay-600">✅</span>
                    <span className="text-white/95 font-bold">Ver perfis completos</span>
                  </div>
                  <div className="flex items-center space-x-4 bg-yellow-500/20 rounded-2xl p-4 border border-yellow-400/30">
                    <span className="text-yellow-400 text-2xl animate-pulse delay-800">✅</span>
                    <span className="text-white/95 font-bold">Suporte prioritário</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões Ultra Modernos */}
            <div className="space-y-8">
              <button
                onClick={handleCadastrar}
                disabled={loading}
                className={`group w-full py-6 px-12 rounded-3xl font-black text-2xl transition-all duration-500 relative overflow-hidden ${
                  loading
                    ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed border-4 border-gray-400/30'
                    : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transform hover:scale-105 shadow-2xl border-4 border-white/30'
                }`}
                style={!loading ? {
                  boxShadow: '0 30px 100px rgba(34, 197, 94, 0.5)',
                  textShadow: '3px 3px 6px rgba(0,0,0,0.4)'
                } : {}}
              >
                {!loading && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-transparent transform skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1500"></div>
                  </>
                )}
                <span className="relative z-10">
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-white/30 border-t-white rounded-full mr-4"></div>
                      Cadastrando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-4">
                      <span className="text-3xl">🚀</span>
                      <span>Cadastrar Premium</span>
                      <span className="text-3xl">⭐</span>
                    </div>
                  )}
                </span>
              </button>

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
                  <span>Voltar</span>
                </span>
              </button>
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

export default CadastroPremiumPage;