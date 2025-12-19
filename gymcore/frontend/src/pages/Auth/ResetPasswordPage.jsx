import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwords.new_password !== passwords.confirm_password) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (passwords.new_password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await api.post('/auth/reset-password', { token, new_password: passwords.new_password });
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setError(error.response?.data?.detail || 'El enlace de recuperación es inválido o expiró.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShow = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400">
            <Dumbbell className="h-8 w-8 text-slate-900" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-100">
            Establecer Nueva Contraseña
          </h2>
        </div>

        {success ? (
          <div className="rounded-lg bg-green-400/10 p-4 text-center text-green-400">
            <p>Contraseña actualizada exitosamente.</p>
            <p className="mt-2 text-sm">Redirigiendo al login...</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="new-password" class="sr-only">Nueva Contraseña</label>
                <input
                  id="new-password"
                  type={showPassword.new ? "text" : "password"}
                  required
                  className="relative block w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 sm:text-sm"
                  placeholder="Nueva Contraseña"
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => toggleShow('new')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                >
                  {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <label htmlFor="confirm-password" class="sr-only">Confirmar Contraseña</label>
                <input
                  id="confirm-password"
                  type={showPassword.confirm ? "text" : "password"}
                  required
                  className="relative block w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 sm:text-sm"
                  placeholder="Confirmar Contraseña"
                  value={passwords.confirm_password}
                  onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => toggleShow('confirm')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                >
                  {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-400/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-lg bg-lime-400 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
