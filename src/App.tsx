import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import InicioPage from './pages/InicioPage';
import SalasPage from './pages/SalasPage';
import ChatPage from './pages/ChatPage';
import CriarSalaPage from './pages/CriarSalaPage';
import SalasCriadasPage from './pages/SalasCriadasPage';
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
          <Route path="/salascriadas" element={<SalasCriadasPage />} />
          <Route path="/cadastro-premium" element={<CadastroPremiumPage />} />
          <Route path="/login-premium" element={<LoginPremiumPage />} />
          <Route path="/meu-perfil-premium" element={<MeuPerfilPremiumPage />} />
          <Route path="/suporte" element={<SuportePage />} />
          <Route path="/suporte6828" element={<SuportePage />} />
          <Route path="/cadastropremium6838k" element={<CadastroPremiumPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;