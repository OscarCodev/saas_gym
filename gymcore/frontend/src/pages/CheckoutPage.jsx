import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import billingService from '../services/billing.service';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import SuccessModal from '../components/SuccessModal';
import { CreditCard, Check, ShieldCheck, Calendar, User } from 'lucide-react';

const CheckoutPage = () => {
  const { gym, updateGymStatus } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (gym && gym.is_active) {
      navigate('/dashboard');
    }
  }, [gym, navigate]);

  const getPlanPrice = (plan) => {
    const prices = { basic: 29, pro: 79, elite: 149 };
    return prices[plan] || 29;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await billingService.processPayment(gym.plan_type, 'visa_mock');
      updateGymStatus(true);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Error al procesar el pago. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!gym) return null;

  const price = getPlanPrice(gym.plan_type);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      {showSuccess && <SuccessModal message="¡Pago procesado! Redirigiendo al dashboard..." />}
      
      <div className="container mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-100 text-center">Finaliza tu Suscripción</h1>
        
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Plan Summary */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 h-fit">
            <h2 className="mb-6 text-xl font-semibold text-slate-100">Resumen del Plan</h2>
            
            <div className="mb-6 flex items-baseline justify-between border-b border-slate-800 pb-6">
              <div>
                <h3 className="text-2xl font-bold text-lime-400 uppercase">{gym.plan_type}</h3>
                <p className="text-slate-400">{gym.name}</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-slate-100">S/{price}</span>
                <span className="text-slate-400">/mes</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-slate-300">
                <Check className="mr-3 h-5 w-5 text-lime-400" /> Acceso completo al sistema
              </li>
              <li className="flex items-center text-slate-300">
                <Check className="mr-3 h-5 w-5 text-lime-400" /> Soporte técnico incluido
              </li>
              <li className="flex items-center text-slate-300">
                <Check className="mr-3 h-5 w-5 text-lime-400" /> Cancelación en cualquier momento
              </li>
              <li className="flex items-center text-slate-300">
                <Check className="mr-3 h-5 w-5 text-lime-400" /> Garantía de 30 días
              </li>
            </ul>

            <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-lime-400" />
              <p className="text-xs text-slate-400">
                Tus datos están protegidos con encriptación SSL de 256-bits.
              </p>
            </div>
          </div>

          {/* Payment Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h2 className="mb-6 text-xl font-semibold text-slate-100">Información de Pago</h2>
            
            <div className="mb-6 rounded-lg bg-yellow-500/10 p-4 text-sm text-yellow-500 border border-yellow-500/20">
              <strong>MODO SIMULACIÓN:</strong> No se realizará ningún cargo real. Puedes usar cualquier dato ficticio.
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                {error}
              </div>
            )}

            <form onSubmit={handlePayment} className="space-y-6">
              <FormInput
                label="Nombre en la Tarjeta"
                placeholder="Como aparece en la tarjeta"
                icon={User}
                required
              />
              
              <FormInput
                label="Número de Tarjeta"
                placeholder="0000 0000 0000 0000"
                icon={CreditCard}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Expiración"
                  placeholder="MM/YY"
                  icon={Calendar}
                  required
                />
                <FormInput
                  label="CVV"
                  placeholder="123"
                  type="password"
                  required
                />
              </div>

              <div className="pt-4">
                <Button type="submit" loading={loading} className="w-full py-3 text-lg">
                  Confirmar Pago - ${price}
                </Button>
                <p className="mt-4 text-center text-xs text-slate-500">
                  Al confirmar, aceptas nuestros términos y condiciones de servicio.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;