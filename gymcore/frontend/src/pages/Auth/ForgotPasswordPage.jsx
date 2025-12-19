import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
    } catch (error) {
      setError('Hubo un error. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400">
            <Dumbbell className="h-8 w-8 text-slate-900" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-100">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {isSubmitted ? (
          <div className="rounded-lg bg-green-400/10 p-4 text-center text-green-400">
            <p>Si el email existe, recibirás un enlace de recuperación.</p>
            <Link to="/login" className="mt-4 inline-block text-sm font-medium hover:underline">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
              {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>

            <div className="text-center">
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-lime-400">
                <ArrowLeft size={16} /> Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
