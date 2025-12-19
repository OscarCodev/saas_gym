import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const Dashboard = () => {
  const { user, gym, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button variant="outline" onClick={logout}>Cerrar Sesión</Button>
        </div>
        
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Bienvenido, {user?.full_name}</h2>
          <p className="text-slate-400 mb-2">Gimnasio: <span className="text-lime-400">{gym?.name}</span></p>
          <p className="text-slate-400">Estado: <span className="text-lime-400 uppercase">{gym?.is_active ? 'Activo' : 'Inactivo'}</span></p>
          <p className="text-slate-400">Plan: <span className="text-lime-400 uppercase">{gym?.plan_type}</span></p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;