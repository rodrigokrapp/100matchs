import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaHome, FaCity } from 'react-icons/fa';

interface User {
  id: string;
  email: string;
  nome: string;
  isPremium: boolean;
  loginTime: number;
}

const CriarSalaPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cidade: '',
    bairro: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cidades brasileiras populares
  const cidadesPopulares = [
    'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza',
    'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre',
    'Belém', 'Goiânia', 'Guarulhos', 'Campinas', 'São Luís',
    'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Natal', 'Teresina'
  ];

  useEffect(() => {
    // Verificar usuário logado
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
      navigate('/inicio');
      return;
    }
    
    const userData = JSON.parse(savedUser);
    setUser(userData);

    // Verificar se visitante gratuito ainda tem tempo
    if (!userData.isPremium) {
      const timeElapsed = Date.now() - userData.loginTime;
      const thirtyMinutes = 30 * 60 * 1000;
      if (timeElapsed >= thirtyMinutes) {
        localStorage.setItem(`blocked_${userData.email}`, Date.now().toString());
        localStorage.removeItem('currentUser');
        alert('Seu tempo expirou! Você foi bloqueado por 24 horas.');
        navigate('/inicio');
        return;
      }
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da sala é obrigatório';
    } else if (formData.nome.length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    } else if (formData.nome.length > 50) {
      newErrors.nome = 'Nome deve ter no máximo 50 caracteres';
    }

    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    } else if (formData.cidade.length < 2) {
      newErrors.cidade = 'Cidade deve ter pelo menos 2 caracteres';
    }

    if (!formData.bairro.trim()) {
      newErrors.bairro = 'Bairro é obrigatório';
    } else if (formData.bairro.length < 2) {
      newErrors.bairro = 'Bairro deve ter pelo menos 2 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simular criação da sala (depois conectar com backend)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const novaSala = {
        id: `sala_${Date.now()}`,
        nome: formData.nome.trim(),
        cidade: formData.cidade.trim(),
        bairro: formData.bairro.trim(),
        criadorId: user?.id,
        usuariosOnline: 1,
        criadaEm: Date.now()
      };

      // Salvar sala localmente (depois enviar para backend)
      const salasExistentes = JSON.parse(localStorage.getItem('salas') || '[]');
      salasExistentes.push(novaSala);
      localStorage.setItem('salas', JSON.stringify(salasExistentes));

      // Redirecionar para a sala criada
      navigate(`/chat/${novaSala.id}`, { state: { sala: novaSala } });
    } catch (error) {
      alert('Erro ao criar sala. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!user) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/salas')}
              className="text-gray-500 hover:text-pink-500 transition-colors"
            >
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                ➕ Criar Nova Sala
              </h1>
              <p className="text-gray-600">Crie um espaço para conversar com pessoas da sua região</p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome da Sala */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaHome className="inline mr-2" />
                Nome da Sala *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: Galera de Copacabana, Pessoal da Vila Madalena..."
                className={`input-field ${errors.nome ? 'border-red-500' : ''}`}
                maxLength={50}
              />
              {errors.nome && (
                <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {formData.nome.length}/50 caracteres
              </p>
            </div>

            {/* Cidade */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaCity className="inline mr-2" />
                Cidade *
              </label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => handleInputChange('cidade', e.target.value)}
                placeholder="Digite sua cidade..."
                className={`input-field ${errors.cidade ? 'border-red-500' : ''}`}
                list="cidades-populares"
              />
              <datalist id="cidades-populares">
                {cidadesPopulares.map(cidade => (
                  <option key={cidade} value={cidade} />
                ))}
              </datalist>
              {errors.cidade && (
                <p className="text-red-500 text-sm mt-1">{errors.cidade}</p>
              )}
            </div>

            {/* Bairro */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaMapMarkerAlt className="inline mr-2" />
                Bairro *
              </label>
              <input
                type="text"
                value={formData.bairro}
                onChange={(e) => handleInputChange('bairro', e.target.value)}
                placeholder="Digite seu bairro..."
                className={`input-field ${errors.bairro ? 'border-red-500' : ''}`}
              />
              {errors.bairro && (
                <p className="text-red-500 text-sm mt-1">{errors.bairro}</p>
              )}
            </div>

            {/* Preview da Sala */}
            {formData.nome && formData.cidade && formData.bairro && (
              <div className="bg-gradient-to-r from-pink-50 to-blue-50 p-4 rounded-xl border border-pink-200">
                <h3 className="font-semibold text-gray-800 mb-2">📋 Preview da Sala:</h3>
                <div className="bg-white p-3 rounded-lg border">
                  <h4 className="font-semibold text-lg">{formData.nome}</h4>
                  <p className="text-gray-600 text-sm">
                    📍 {formData.bairro}, {formData.cidade}
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    👤 1 online (você)
                  </p>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex flex-col md:flex-row gap-4">
              <button
                type="button"
                onClick={() => navigate('/salas')}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-premium flex-1"
                disabled={loading || !formData.nome || !formData.cidade || !formData.bairro}
              >
                {loading ? '⏳ Criando...' : '🚀 Criar Sala'}
              </button>
            </div>
          </form>
        </div>

        {/* Dicas */}
        <div className="card mt-6 bg-gradient-to-r from-blue-50 to-pink-50">
          <h3 className="font-semibold text-gray-800 mb-3">💡 Dicas para uma boa sala:</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Use um nome atrativo e que represente sua região</li>
            <li>• Seja específico com o bairro para encontrar pessoas próximas</li>
            <li>• Mantenha um ambiente respeitoso e amigável</li>
            <li>• {user.isPremium ? 'Como Premium, você pode enviar fotos e vídeos!' : 'Upgrade para Premium para enviar fotos e vídeos!'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CriarSalaPage; 