import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import { CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const BillingPage = () => {
  const { gym, setGym } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Form states
  const [selectedPlan, setSelectedPlan] = useState(gym?.plan_type || 'basic');
  const [paymentData, setPaymentData] = useState({
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: ''
  });

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const [subResponse, invoicesResponse] = await Promise.all([
          api.get('/billing/subscription'),
          api.get('/billing/invoices')
        ]);
        
        setSubscriptionData(subResponse.data);
        setInvoices(invoicesResponse.data);
      } catch (error) {
        // Error is handled by loading state and empty states in UI
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBillingData();
  }, []);

  const handleCancelSubscription = async () => {
    try {
      const response = await api.post('/billing/cancel-subscription');
      
      const result = response.data;
      alert(`Suscripción cancelada. Tendrás acceso hasta ${new Date(result.access_until).toLocaleDateString()}`);
      setShowCancelModal(false);
      // Refresh data
      window.location.reload();
    } catch (error) {
      alert('Error al cancelar la suscripción');
    }
  };

  const handleChangePlan = async () => {
    try {
      const response = await api.post('/billing/change-plan', { new_plan: selectedPlan });
      
      const result = response.data;
      alert(`Plan cambiado a ${result.new_plan} exitosamente`);
      setShowPlanModal(false);
      // Update context
      if (gym) {
          setGym({ ...gym, plan_type: result.new_plan });
      }
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al cambiar el plan');
    }
  };

  const handleUpdatePaymentMethod = async (e) => {
    e.preventDefault();
    try {
      await api.put('/billing/payment-method', paymentData);
      
      alert('Método de pago actualizado');
      setShowPaymentModal(false);
      // Reset form
      setPaymentData({
          card_number: '',
          expiry_month: '',
          expiry_year: '',
          cvv: ''
      });
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al actualizar el método de pago');
    }
  };

  if (isLoading) return <div className="text-slate-400">Cargando información de facturación...</div>;

  return (
    <div className="space-y-6 relative">
      <h2 className="text-2xl font-bold text-slate-100">Facturación y Suscripción</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Plan */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-100">Plan Actual</h3>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold text-lime-400 uppercase">
                {subscriptionData?.plan_type || gym?.plan_type}
              </p>
              <p className="mt-1 text-slate-400">
                {subscriptionData?.status === 'cancelled' 
                    ? `Acceso hasta el ${new Date(subscriptionData.end_date).toLocaleDateString()}`
                    : `Renovación automática el ${subscriptionData ? new Date(subscriptionData.end_date).toLocaleDateString() : '...'}`
                }
              </p>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-medium border ${
                subscriptionData?.status === 'active' 
                ? 'bg-green-400/10 text-green-400 border-green-400/20' 
                : 'bg-red-400/10 text-red-400 border-red-400/20'
            }`}>
              {subscriptionData?.status === 'active' ? 'ACTIVO' : 'CANCELADO'}
            </div>
          </div>
          
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => setShowPlanModal(true)}>
              Cambiar Plan
            </Button>
            {subscriptionData?.status === 'active' && (
                <Button variant="secondary" onClick={() => setShowCancelModal(true)}>
                Cancelar Suscripción
                </Button>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-100">Método de Pago</h3>
          <div className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
            <div className="rounded-lg bg-slate-800 p-2">
              <CreditCard className="h-6 w-6 text-slate-300" />
            </div>
            <div>
              <p className="font-medium text-slate-200">Tarjeta terminada en ****</p>
              <p className="text-sm text-slate-500">Actualiza para ver detalles</p>
            </div>
          </div>
          <Button variant="outline" className="mt-4 w-full" onClick={() => setShowPaymentModal(true)}>
            Actualizar Método de Pago
          </Button>
        </div>
      </div>

      {/* Billing History */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Historial de Pagos</h3>
        {invoices.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-8 text-center">
            <Calendar className="mx-auto mb-3 h-10 w-10 text-slate-600" />
            <p className="text-slate-400">No hay facturas anteriores para mostrar.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <table className="w-full">
              <thead className="bg-slate-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900">
                {invoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 uppercase">
                      {invoice.plan}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      ${invoice.amount}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="rounded-full bg-green-400/10 px-2 py-1 text-xs text-green-400">
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3 text-red-400">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="text-lg font-bold">¿Estás seguro?</h3>
            </div>
            <p className="mb-6 text-slate-400">
              Cancelarás tu suscripción actual. Mantendrás acceso hasta el final del periodo pagado.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCancelModal(false)}>Cancelar</Button>
              <button 
                onClick={handleCancelSubscription}
                className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h3 className="mb-6 text-xl font-bold text-slate-100">Cambiar Plan</h3>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                {['basic', 'pro', 'elite'].map((plan) => (
                    <div 
                        key={plan}
                        onClick={() => setSelectedPlan(plan)}
                        className={`cursor-pointer rounded-lg border p-4 transition-all ${
                            selectedPlan === plan 
                            ? 'border-lime-400 bg-lime-400/10' 
                            : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                        }`}
                    >
                        <h4 className="font-bold text-slate-100 uppercase">{plan}</h4>
                        <p className="text-sm text-slate-400 mt-2">
                            {plan === 'basic' && 'S/99/mes'}
                            {plan === 'pro' && 'S/269/mes'}
                            {plan === 'elite' && 'S/499/mes'}
                        </p>
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPlanModal(false)}>Cancelar</Button>
              <Button onClick={handleChangePlan}>Confirmar Cambio</Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h3 className="mb-6 text-xl font-bold text-slate-100">Actualizar Método de Pago</h3>
            <form onSubmit={handleUpdatePaymentMethod} className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-400">Número de Tarjeta</label>
                    <input 
                        type="text" 
                        maxLength="16"
                        value={paymentData.card_number}
                        onChange={(e) => setPaymentData({...paymentData, card_number: e.target.value})}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-lime-400 focus:outline-none"
                        placeholder="0000 0000 0000 0000"
                        required
                    />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-400">Mes</label>
                        <input 
                            type="number" 
                            min="1" max="12"
                            value={paymentData.expiry_month}
                            onChange={(e) => setPaymentData({...paymentData, expiry_month: parseInt(e.target.value)})}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-lime-400 focus:outline-none"
                            placeholder="MM"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-400">Año</label>
                        <input 
                            type="number" 
                            min="2025"
                            value={paymentData.expiry_year}
                            onChange={(e) => setPaymentData({...paymentData, expiry_year: parseInt(e.target.value)})}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-lime-400 focus:outline-none"
                            placeholder="YYYY"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-400">CVV</label>
                        <input 
                            type="text" 
                            maxLength="4"
                            value={paymentData.cvv}
                            onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 focus:border-lime-400 focus:outline-none"
                            placeholder="123"
                            required
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" type="button" onClick={() => setShowPaymentModal(false)}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;