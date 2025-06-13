import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SalasPage from './pages/SalasPage';
import CriarSalaPage from './pages/CriarSalaPage';
import ChatPage from './pages/ChatPage';
import SuportePage from './pages/SuportePage';
import CadastroPremiumPage from './pages/CadastroPremiumPage';
import { testSupabaseConnection } from './lib/supabase';
import './App.css';

function App() {
  useEffect(() => {
    // Testar conexão com Supabase na inicialização
    const checkSupabaseConnection = async () => {
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        console.warn('⚠️ Aplicação funcionando sem Supabase');
      }
    };
    
    checkSupabaseConnection();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<HomePage />} />
          <Route path="/salas" element={<SalasPage />} />
          <Route path="/criar-sala" element={<CriarSalaPage />} />
          <Route path="/chat/:salaId" element={<ChatPage />} />
          <Route path="/suporte6828" element={<SuportePage />} />
          <Route path="/cadastropremium6838k" element={<CadastroPremiumPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 