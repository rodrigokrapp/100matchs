import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { testSupabaseConnection } from './lib/supabase';

// Páginas
import InicioPage from './pages/InicioPage';
import SalasPage from './pages/SalasPage';
import ChatPage from './pages/ChatPage';
import MeuPerfilPage from './pages/MeuPerfilPage';
import { SuportePage } from './pages/SuportePage';
import { CadastroPremiumPage } from './pages/CadastroPremiumPage';
import CriarSalaPage from './pages/CriarSalaPage';
import LoginPremiumPage from './pages/LoginPremiumPage';

// Estilos globais
import './App.css';

function App() {
  useEffect(() => {
    console.log('🚀 Iniciando Resenha sem Matchs...');
    testSupabaseConnection();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<InicioPage />} />
          <Route path="/inicio" element={<InicioPage />} />
          <Route path="/salas" element={<SalasPage />} />
          <Route path="/chat/:roomId" element={<ChatPage />} />
          <Route path="/meu-perfil" element={<MeuPerfilPage />} />
          <Route path="/suporte6828" element={<SuportePage />} />
          <Route path="/cadastropremium6838k" element={<CadastroPremiumPage />} />
          <Route path="/criarsala" element={<CriarSalaPage />} />
          <Route path="/login-premium" element={<LoginPremiumPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 