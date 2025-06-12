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
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/salas');
      }, 2000);
    }, 2000);
  };

  const handleVoltar = () => {
    navigate('/suporte6828');
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Cadastro Realizado!
          </h1>
          <p className="text-white/80 text-lg mb-6">
            Bem-vindo ao Premium! Você agora tem acesso ilimitado.
          </p>
          <div className="animate-spin w-8 h-8 border-4 border-white/30 border-t-white rounded-full mx-auto"></div>
          <p className="text-white/60 mt-4">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            ⭐ Cadastro Premium ⭐
          </h1>
          <p className="text-white/80 text-lg">
            Preencha seus dados para ter acesso ilimitado
          </p>
        </div>

        {/* Formulário */}
        <div className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-2">
              Nome completo:
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Digite seu nome"
              className="w-full px-4 py-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu@email.com"
              className="w-full px-4 py-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Senha:
            </label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleInputChange}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Confirmar senha:
            </label>
            <input
              type="password"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleInputChange}
              placeholder="Digite a senha novamente"
              className="w-full px-4 py-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
            />
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div className="bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded-2xl text-center">
              ❌ {erro}
            </div>
          )}

          {/* Benefícios Premium */}
          <div className="bg-white/10 p-4 rounded-2xl">
            <h3 className="text-white font-bold mb-2">🌟 Benefícios Premium:</h3>
            <ul className="text-white/80 text-sm space-y-1">
              <li>✅ Tempo ilimitado de chat</li>
              <li>✅ Envio de fotos e vídeos</li>
              <li>✅ Mensagens de áudio</li>
              <li>✅ Ver perfis completos</li>
              <li>✅ Suporte prioritário</li>
            </ul>
          </div>

          {/* Botões */}
          <div className="space-y-4">
            <button
              onClick={handleCadastrar}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
                loading
                  ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transform hover:scale-105 shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
                  Cadastrando...
                </div>
              ) : (
                '🚀 Cadastrar Premium'
              )}
            </button>

            <button
              onClick={handleVoltar}
              className="w-full bg-white/20 backdrop-blur-sm text-white py-3 px-6 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroPremiumPage;