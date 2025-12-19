import React, { useState } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, DollarSign, Calendar, Package } from 'lucide-react';
import { useMembershipPlans } from '../../hooks/useMembershipPlans';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';

const MembershipPlansPage = () => {
  const { plans, loading, createPlan, updatePlan, deletePlan, toggleStatus } = useMembershipPlans(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_days: '30',
    benefits: ''
  });

  const formatErrorMessage = (error, defaultMessage) => {
    return error?.response?.data?.detail || error?.message || defaultMessage;
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setSelectedPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || '',
        price: plan.price.toString(),
        duration_days: plan.duration_days.toString(),
        benefits: plan.benefits || ''
      });
    } else {
      setSelectedPlan(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        duration_days: '30',
        benefits: ''
      });
    }
    setIsModalOpen(true);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMessage('');

    try {
      const planData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days),
        benefits: formData.benefits || null
      };

      if (selectedPlan) {
        await updatePlan(selectedPlan.id, planData);
      } else {
        await createPlan(planData);
      }
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(formatErrorMessage(error, 'Error al guardar el plan'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlan) return;
    setFormLoading(true);
    setErrorMessage('');
    
    try {
      await deletePlan(selectedPlan.id);
      setIsDeleteOpen(false);
    } catch (error) {
      setErrorMessage(formatErrorMessage(error, 'Error al eliminar el plan'));
      setIsDeleteOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (plan) => {
    setErrorMessage('');
    try {
      await toggleStatus(plan.id);
    } catch (error) {
      setErrorMessage(formatErrorMessage(error, 'Error al cambiar el estado del plan'));
    }
  };

  const columns = [
    { 
      header: 'Plan', 
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center mr-3">
            <Package className="h-5 w-5 text-slate-900" />
          </div>
          <div>
            <div className="font-semibold text-slate-200">{row.name}</div>
            {row.description && (
              <div className="text-xs text-slate-500 truncate max-w-xs">{row.description}</div>
            )}
          </div>
        </div>
      )
    },
    { 
      header: 'Precio', 
      accessor: 'price',
      render: (row) => (
        <div className="flex items-center text-lime-400 font-semibold">
          <DollarSign className="h-4 w-4 mr-1" />
          {row.price.toFixed(2)}
        </div>
      )
    },
    { 
      header: 'Duración', 
      accessor: 'duration_days',
      render: (row) => (
        <div className="flex items-center text-slate-300">
          <Calendar className="h-4 w-4 mr-1 text-slate-400" />
          {row.duration_days} días
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: 'is_active',
      render: (row) => (
        <Badge 
          label={row.is_active ? 'Activo' : 'Inactivo'} 
          variant={row.is_active ? 'success' : 'default'} 
        />
      )
    },
    {
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleOpenModal(row)}
            className="p-1 text-slate-400 hover:text-lime-400 transition-colors"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleToggleStatus(row)}
            className={`p-1 transition-colors ${row.is_active ? 'text-green-400 hover:text-yellow-400' : 'text-slate-400 hover:text-green-400'}`}
            title={row.is_active ? 'Desactivar' : 'Activar'}
          >
            {row.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          </button>
          <button 
            onClick={() => { setSelectedPlan(row); setIsDeleteOpen(true); }}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-400">Cargando planes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Planes de Membresía</h1>
          <p className="mt-1 text-sm text-slate-400">
            Crea y gestiona planes personalizados para tus socios
          </p>
        </div>
        <Button 
          onClick={() => handleOpenModal()} 
          icon={Plus}
        >
          Nuevo Plan
        </Button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-sm text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="text-sm text-slate-400">Total Planes</div>
          <div className="mt-1 text-2xl font-bold text-slate-100">{plans.length}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="text-sm text-slate-400">Planes Activos</div>
          <div className="mt-1 text-2xl font-bold text-lime-400">
            {plans.filter(p => p.is_active).length}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="text-sm text-slate-400">Precio Promedio</div>
          <div className="mt-1 text-2xl font-bold text-blue-400">
            S/{plans.length > 0 ? (plans.reduce((sum, p) => sum + p.price, 0) / plans.length).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {/* Table */}
      {plans.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-300">
            No hay planes creados
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Comienza creando tu primer plan de membresía personalizado
          </p>
          <Button 
            onClick={() => handleOpenModal()} 
            icon={Plus}
            className="mt-6"
          >
            Crear Primer Plan
          </Button>
        </div>
      ) : (
        <Table columns={columns} data={plans} />
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPlan ? 'Editar Plan' : 'Nuevo Plan de Membresía'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          <FormInput
            label="Nombre del Plan"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Ej: Plan Premium"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-100 placeholder-slate-500 focus:border-lime-400 focus:ring-lime-400 sm:text-sm"
              rows="2"
              placeholder="Descripción breve del plan"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Precio"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              placeholder="29.99"
            />
            <FormInput
              label="Duración (días)"
              type="number"
              value={formData.duration_days}
              onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
              required
              placeholder="30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Beneficios
            </label>
            <textarea
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              className="block w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-100 placeholder-slate-500 focus:border-lime-400 focus:ring-lime-400 sm:text-sm"
              rows="3"
              placeholder="Lista de beneficios (uno por línea)"
            />
            <p className="mt-1 text-xs text-slate-500">
              Escribe cada beneficio en una línea nueva
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={formLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
              className="flex-1"
            >
              {formLoading ? 'Guardando...' : (selectedPlan ? 'Actualizar' : 'Crear Plan')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Plan"
        message={`¿Estás seguro de que deseas eliminar el plan "${selectedPlan?.name}"? Los socios actuales con este plan no se verán afectados.`}
        confirmText="Eliminar"
        isDestructive
        loading={formLoading}
      />
    </div>
  );
};

export default MembershipPlansPage;
