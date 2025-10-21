import { useState } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import NuevoReclamo from '@/pages/NuevoReclamo';
import Administracion from '@/pages/Administracion';
import DetalleReclamo from '@/pages/DetalleReclamo';
import Estadisticas from '@/pages/Estadisticas';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/nuevo-reclamo" element={<NuevoReclamo />} />
          <Route path="/administracion" element={<Administracion />} />
          <Route path="/reclamo/:id" element={<DetalleReclamo />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;