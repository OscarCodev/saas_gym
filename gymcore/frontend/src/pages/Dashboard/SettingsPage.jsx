import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ProfileTab = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/users/me', formData);
      const updatedUser = response.data;
      setUser(updatedUser);
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Error al actualizar el perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-400">
          Nombre Completo
        </label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-lime-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-400">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-lime-400 focus:outline-none"
        />
      </div>
      
      {message.text && (
        <div className={`rounded-lg p-3 text-sm ${
          message.type === 'success' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg bg-lime-400 px-4 py-2 font-medium text-slate-900 hover:bg-lime-500 disabled:opacity-50"
      >
        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  );
};

const GymTab = () => {
  const { gym, setGym } = useAuth();
  const [gymData, setGymData] = useState({
    name: gym?.name || '',
    email: gym?.email || '',
    phone: gym?.phone || '',
    address: gym?.address || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/gyms/me', gymData);
      const updatedGym = response.data;
      setGym(updatedGym);
      setMessage({ type: 'success', text: 'Gimnasio actualizado correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Error al actualizar el gimnasio' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-400">
          Nombre del Gimnasio
        </label>
        <input
          type="text"
          value={gymData.name}
          onChange={(e) => setGymData({ ...gymData, name: e.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-lime-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-400">
          Email del Gimnasio
        </label>
        <input
          type="email"
          value={gymData.email}
          onChange={(e) => setGymData({ ...gymData, email: e.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-lime-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-400">
          Teléfono
        </label>
        <input
          type="text"
          value={gymData.phone}
          onChange={(e) => setGymData({ ...gymData, phone: e.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-lime-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-400">
          Dirección
        </label>
        <textarea
          value={gymData.address}
          onChange={(e) => setGymData({ ...gymData, address: e.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-lime-400 focus:outline-none"
          rows="3"
        />
      </div>

      {message.text && (
        <div className={`rounded-lg p-3 text-sm ${
          message.type === 'success' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg bg-lime-400 px-4 py-2 font-medium text-slate-900 hover:bg-lime-500 disabled:opacity-50"
      >
        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  );
};

const SecurityTab = () => {
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Error al cambiar la contraseña' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShow = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-400">
          Contraseña Actual
        </label>
        <div className="relative">
          <input
            type={showPassword.current ? "text" : "password"}
            value={passwordData.current_password}
            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-lime-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => toggleShow('current')}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-300"
          >
            {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-400">
          Nueva Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword.new ? "text" : "password"}
            value={passwordData.new_password}
            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-lime-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => toggleShow('new')}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-300"
          >
            {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-400">
          Confirmar Nueva Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword.confirm ? "text" : "password"}
            value={passwordData.confirm_password}
            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-lime-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => toggleShow('confirm')}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-300"
          >
            {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`rounded-lg p-3 text-sm ${
          message.type === 'success' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg bg-lime-400 px-4 py-2 font-medium text-slate-900 hover:bg-lime-500 disabled:opacity-50"
      >
        {isLoading ? 'Cambiar Contraseña' : 'Cambiar Contraseña'}
      </button>
    </form>
  );
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">Configuración</h2>

      <div className="rounded-xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800">
          <nav className="flex gap-4 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'border-lime-400 text-lime-400'
                  : 'border-transparent text-slate-400 hover:border-slate-300 hover:text-slate-300'
              }`}
            >
              Perfil
            </button>
            <button
              onClick={() => setActiveTab('gym')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'gym'
                  ? 'border-lime-400 text-lime-400'
                  : 'border-transparent text-slate-400 hover:border-slate-300 hover:text-slate-300'
              }`}
            >
              Gimnasio
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'security'
                  ? 'border-lime-400 text-lime-400'
                  : 'border-transparent text-slate-400 hover:border-slate-300 hover:text-slate-300'
              }`}
            >
              Seguridad
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'gym' && <GymTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;