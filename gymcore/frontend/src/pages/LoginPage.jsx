import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { Mail, Lock, LogIn } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { user, gym } = await login(formData.email, formData.password);
      
      // Redirigir según el rol del usuario
      if (user.role === 'superadmin') {
        navigate('/admin');
      } else if (!gym.is_active) {
        navigate('/checkout');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-100">Bienvenido de nuevo</h2>
          <p className="mt-2 text-sm text-slate-400">
            Ingresa a tu panel de control
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
          {message && (
            <div className="mb-6 rounded-lg bg-lime-400/10 p-4 text-sm text-lime-400 border border-lime-400/20">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              placeholder="tu@email.com"
              required
            />
            
            <div className="space-y-1">
              <FormInput
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                placeholder="••••••••"
                required
              />
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-lime-400 hover:text-lime-300">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-lime-400 focus:ring-lime-400"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                Recordarme
              </label>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Iniciar Sesión <LogIn className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-medium text-lime-400 hover:text-lime-300">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;