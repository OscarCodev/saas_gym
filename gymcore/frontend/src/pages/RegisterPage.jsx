import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { User, Mail, Phone, MapPin, Lock, Building2, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    admin_full_name: '',
    admin_email: '',
    admin_password: '',
    confirm_password: '',
    plan_type: searchParams.get('plan') || 'basic'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      setError('Por favor completa todos los campos del gimnasio');
      return false;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email del gimnasio inválido');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.admin_full_name || !formData.admin_email || !formData.admin_password || !formData.confirm_password) {
      setError('Por favor completa todos los campos del administrador');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.admin_email)) {
      setError('Email del administrador inválido');
      return false;
    }
    if (formData.admin_password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (formData.admin_password !== formData.confirm_password) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        admin_email: formData.admin_email,
        admin_password: formData.admin_password,
        admin_full_name: formData.admin_full_name,
        plan_type: formData.plan_type
      });
      navigate('/login', { state: { message: 'Cuenta creada exitosamente. Por favor inicia sesión.' } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-100">Crea tu cuenta GymCore</h2>
          <p className="mt-2 text-sm text-slate-400">
            Paso {step} de 3: {step === 1 ? 'Datos del Gimnasio' : step === 2 ? 'Datos del Administrador' : 'Confirmación'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-slate-800">
          <div 
            className="h-2 rounded-full bg-lime-400 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <FormInput
                  label="Nombre del Gimnasio"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={Building2}
                  placeholder="Ej. Iron Gym"
                  required
                />
                <FormInput
                  label="Email de Contacto"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={Mail}
                  placeholder="contacto@irongym.com"
                  required
                />
                <FormInput
                  label="Teléfono"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  icon={Phone}
                  placeholder="+54 11 1234-5678"
                  required
                />
                <FormInput
                  label="Dirección"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  icon={MapPin}
                  placeholder="Av. Siempre Viva 123"
                  required
                />
                <Button onClick={handleNext} className="w-full mt-4">
                  Continuar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <FormInput
                  label="Nombre Completo"
                  name="admin_full_name"
                  value={formData.admin_full_name}
                  onChange={handleChange}
                  icon={User}
                  placeholder="Juan Pérez"
                  required
                />
                <FormInput
                  label="Email Personal"
                  name="admin_email"
                  type="email"
                  value={formData.admin_email}
                  onChange={handleChange}
                  icon={Mail}
                  placeholder="juan@irongym.com"
                  required
                />
                <FormInput
                  label="Contraseña"
                  name="admin_password"
                  type="password"
                  value={formData.admin_password}
                  onChange={handleChange}
                  icon={Lock}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                <FormInput
                  label="Confirmar Contraseña"
                  name="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  icon={Lock}
                  placeholder="Repite tu contraseña"
                  required
                />
                <div className="flex gap-3 mt-4">
                  <Button variant="secondary" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    Continuar <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
                  <h3 className="font-semibold text-lime-400 mb-2">Resumen</h3>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p><span className="text-slate-500">Gimnasio:</span> {formData.name}</p>
                    <p><span className="text-slate-500">Admin:</span> {formData.admin_full_name}</p>
                    <p><span className="text-slate-500">Plan:</span> <span className="uppercase font-bold text-white">{formData.plan_type}</span></p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                  </Button>
                  <Button type="submit" loading={loading} className="flex-1">
                    Crear Cuenta <Check className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
        
        <p className="text-center text-sm text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-lime-400 hover:text-lime-300">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;