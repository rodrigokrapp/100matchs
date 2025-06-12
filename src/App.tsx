import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SalasPage from './pages/SalasPage';
import CriarSalaPage from './pages/CriarSalaPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/salas" element={<SalasPage />} />
        <Route path="/criar-sala" element={<CriarSalaPage />} />
        <Route path="/chat/:salaId" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App; 