import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  Pencil, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Filter
} from 'lucide-react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';
import useMembers from '../../hooks/useMembers';
import { useMembershipPlans } from '../../hooks/useMembershipPlans';

const MembersPage = () => {
  const { 
    members, 
    loading, 
    fetchMembers, 
    createMember, 
    updateMember, 
    deleteMember,
    suspendMember,
    activateMember
  } = useMembers();
  
  const { plans, loading: plansLoading } = useMembershipPlans(false); // Only active plans

  const [filters, setFilters] = useState({ search: '', status: 'all' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    dni: '',
    email: '',
    phone: '',
    membership_type: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0]
  });
  const [formLoading, setFormLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchMembers(filters);
  }, [fetchMembers, filters]);

  // Helper function to format error messages
  const formatErrorMessage = (error, defaultMsg) => {
    const detail = error.response?.data?.detail;
    if (Array.isArray(detail)) {
      return detail.map(err => err.msg || JSON.stringify(err)).join(', ');
    } else if (typeof detail === 'string') {
      return detail;
    }
    return defaultMsg;
  };

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleStatusChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setSelectedMember(member);
      setFormData({
        full_name: member.full_name,
        dni: member.dni || '',
        email: member.email,
        phone: member.phone,
        membership_type: member.membership_type || '',
        plan_id: member.plan_id || '',
        start_date: member.start_date.split('T')[0]
      });
    } else {
      setSelectedMember(null);
      setFormData({
        full_name: '',
        dni: '',
        email: '',
        phone: '',
        membership_type: '',
        plan_id: plans.length > 0 ? plans[0].id : '',
        start_date: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMessage('');
    try {
      // Convert date string to ISO datetime format for backend
      const memberData = {
        full_name: formData.full_name,
        dni: formData.dni,
        email: formData.email,
        phone: formData.phone,
        plan_id: formData.plan_id ? parseInt(formData.plan_id) : null,
        membership_type: formData.plan_id ? null : (formData.membership_type || 'basic'),
        start_date: new Date(formData.start_date).toISOString()
      };
      
      if (selectedMember) {
        await updateMember(selectedMember.id, memberData);
      } else {
        await createMember(memberData);
      }
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(formatErrorMessage(error, 'Error al guardar el socio'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMember) return;
    setFormLoading(true);
    setErrorMessage('');
    try {
      await deleteMember(selectedMember.id);
      setIsDeleteOpen(false);
    } catch (error) {
      setErrorMessage(formatErrorMessage(error, 'Error al eliminar el socio'));
      setIsDeleteOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (member) => {
    setErrorMessage('');
    try {
      if (member.membership_status === 'active') {
        await suspendMember(member.id);
      } else {
        await activateMember(member.id);
      }
    } catch (error) {
      setErrorMessage(formatErrorMessage(error, 'Error al cambiar el estado del socio'));
    }
  };

  const columns = [
    { 
      header: 'Nombre', 
      accessor: 'full_name',
      render: (row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center mr-3 text-xs font-bold text-white">
            {row.full_name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-slate-200">{row.full_name}</div>
            <div className="text-xs text-slate-500">{row.phone}</div>
          </div>
        </div>
      )
    },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Membresía', 
      accessor: 'membership_plan',
      render: (row) => {
        const planName = row.membership_plan?.name || row.membership_type || 'Sin Plan';
        return <span className="uppercase font-semibold text-xs">{planName}</span>;
      }
    },
    { 
      header: 'Inicio', 
      accessor: 'start_date',
      render: (row) => new Date(row.start_date).toLocaleDateString()
    },
    {
      header: 'Estado',
      accessor: 'membership_status',
      render: (row) => {
        const variants = {
          active: 'success',
          inactive: 'default',
          suspended: 'warning'
        };
        return <Badge label={row.membership_status} variant={variants[row.membership_status]} />;
      }
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
            className={`p-1 transition-colors ${row.membership_status === 'active' ? 'text-green-400 hover:text-yellow-400' : 'text-slate-400 hover:text-green-400'}`}
            title={row.membership_status === 'active' ? 'Suspender' : 'Activar'}
          >
            {row.membership_status === 'active' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          </button>
          <button 
            onClick={() => { setSelectedMember(row); setIsDeleteOpen(true); }}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-100">Gestión de Socios</h2>
        <Button onClick={() => handleOpenModal()}>
          <UserPlus className="mr-2 h-4 w-4" /> Nuevo Socio
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={filters.search}
            onChange={handleSearch}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-lime-400 focus:ring-lime-400"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="w-full appearance-none rounded-lg border border-slate-800 bg-slate-900 py-2 pl-10 pr-8 text-sm text-slate-100 focus:border-lime-400 focus:ring-lime-400"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="suspended">Suspendidos</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-lg bg-red-400/10 border border-red-400/20 p-4">
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}

      {/* Table */}
      <Table columns={columns} data={members} loading={loading} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMember ? 'Editar Socio' : 'Nuevo Socio'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="rounded-lg bg-red-400/10 border border-red-400/20 p-3">
              <p className="text-sm text-red-400">{errorMessage}</p>
            </div>
          )}
          <FormInput
            label="Nombre Completo"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          <FormInput
            label="DNI"
            value={formData.dni}
            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
            required
            placeholder="12345678"
          />
          <FormInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <FormInput
            label="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Plan de Membresía <span className="text-lime-400">*</span>
              </label>
              {plansLoading ? (
                <div className="block w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-400 sm:text-sm">
                  Cargando planes...
                </div>
              ) : plans.length > 0 ? (
                <select
                  value={formData.plan_id}
                  onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-100 focus:border-lime-400 focus:ring-lime-400 sm:text-sm"
                  required
                >
                  <option value="">Selecciona un plan</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - S/{plan.price.toFixed(2)} ({plan.duration_days} días)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="block w-full rounded-lg border border-red-700 bg-red-900/20 p-2.5 text-red-400 sm:text-sm">
                  No hay planes disponibles. <a href="/dashboard/membership-plans" className="underline">Crear uno</a>
                </div>
              )}
            </div>
            <FormInput
              label="Fecha de Inicio"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={formLoading}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={formLoading}
        title="Eliminar Socio"
        message={`¿Estás seguro que deseas eliminar a ${selectedMember?.full_name}? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default MembersPage;