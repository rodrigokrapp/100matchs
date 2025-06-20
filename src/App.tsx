import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import InicioPage from './pages/InicioPage';
import SalasPage from './pages/SalasPage';
import ChatPage from './pages/ChatPage';
import CriarSalaPage from './pages/CriarSalaPage';
// import SalasCriadasPage from './pages/SalasCriadasPage'; // Removido - não usado mais
import CadastroPremiumPage from './pages/CadastroPremiumPage';
import LoginPremiumPage from './pages/LoginPremiumPage';
import MeuPerfilPremiumPage from './pages/MeuPerfilPremiumPage';
import SuportePage from './pages/SuportePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inicio" element={<InicioPage />} />
          <Route path="/salas" element={<SalasPage />} />
          <Route path="/chat/:salaId" element={<ChatPage />} />
          <Route path="/criarsala" element={<CriarSalaPage />} />
          {/* <Route path="/salascriadas" element={<SalasCriadasPage />} /> Removido */}
          <Route path="/cadastro-premium" element={<CadastroPremiumPage />} />
          <Route path="/login-premium" element={<LoginPremiumPage />} />
          <Route path="/meu-perfil-premium" element={<MeuPerfilPremiumPage />} />
          <Route path="/suporte" element={<SuportePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;