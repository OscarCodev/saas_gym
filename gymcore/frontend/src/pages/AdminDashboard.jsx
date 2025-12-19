import React, { useState, useEffect } from 'react';
import { Users, Building2, TrendingUp, Activity, Search, ToggleLeft, ToggleRight, Eye } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGym, setSelectedGym] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, [statusFilter]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, gymsData] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/gyms', { 
          params: { 
            status_filter: statusFilter !== 'all' ? statusFilter : null,
            limit: 100 
          } 
        })
      ]);
      setStats(statsData.data);
      setGyms(gymsData.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      alert('Error al cargar datos de administrador');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (gymId) => {
    try {
      await api.patch(`/admin/gyms/${gymId}/toggle-status`);
      fetchAdminData();
    } catch (error) {
      console.error('Error toggling gym status:', error);
      alert('Error al cambiar estado del gimnasio');
    }
  };

  const handleViewDetails = async (gymId) => {
    try {
      const response = await api.get(`/admin/gyms/${gymId}`);
      setSelectedGym(response.data);
    } catch (error) {
      console.error('Error fetching gym details:', error);
      alert('Error al cargar detalles del gimnasio');
    }
  };

  const filteredGyms = gyms.filter(gym =>
    gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gym.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-lime-400 text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Panel de Administrador</h1>
          <p className="text-gray-400">Gestión global del SaaS GymCore</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats?.total_gyms || 0}</span>
            </div>
            <p className="text-gray-400 text-sm">Total Gimnasios</p>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="text-green-400">Activos: {stats?.active_gyms || 0}</span>
              <span className="text-gray-500">Inactivos: {stats?.inactive_gyms || 0}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-lime-500/10 rounded-lg">
                <Users className="w-6 h-6 text-lime-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats?.total_members || 0}</span>
            </div>
            <p className="text-gray-400 text-sm">Total Socios</p>
            <div className="mt-2 text-xs text-green-400">
              Activos: {stats?.active_members || 0}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats?.new_gyms_this_month || 0}</span>
            </div>
            <p className="text-gray-400 text-sm">Nuevos Este Mes</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-white">S/{stats?.total_revenue?.toFixed(2) || '0.00'}</span>
            </div>
            <p className="text-gray-400 text-sm">Ingresos Totales</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-lime-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  statusFilter === 'all'
                    ? 'bg-lime-500 text-black font-medium'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg transition ${
                  statusFilter === 'active'
                    ? 'bg-green-500 text-white font-medium'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                Activos
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-4 py-2 rounded-lg transition ${
                  statusFilter === 'inactive'
                    ? 'bg-red-500 text-white font-medium'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                Inactivos
              </button>
            </div>
          </div>
        </div>

        {/* Gyms Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Gimnasio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Socios</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fecha Registro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredGyms.map((gym) => (
                  <tr key={gym.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{gym.name}</div>
                        <div className="text-gray-400 text-sm">{gym.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400">
                        {gym.plan_type || 'Básico'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{gym.member_count || 0}</div>
                      <div className="text-gray-400 text-xs">Activos: {gym.active_member_count || 0}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          gym.is_active
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {gym.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(gym.created_at).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(gym.id)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(gym.id)}
                          className={`p-2 rounded-lg transition ${
                            gym.is_active
                              ? 'text-red-400 hover:bg-red-500/10'
                              : 'text-green-400 hover:bg-green-500/10'
                          }`}
                          title={gym.is_active ? 'Desactivar' : 'Activar'}
                        >
                          {gym.is_active ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gym Details Modal */}
        {selectedGym && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedGym.name}</h2>
                    <p className="text-gray-400">{selectedGym.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedGym(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Total Socios</div>
                      <div className="text-2xl font-bold text-white">{selectedGym.stats?.total_members || 0}</div>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Activos</div>
                      <div className="text-2xl font-bold text-green-400">{selectedGym.stats?.active_members || 0}</div>
                    </div>
                  </div>

                  {selectedGym.subscription && (
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <h3 className="text-white font-semibold mb-2">Suscripción</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Plan:</span>
                          <span className="text-white">{selectedGym.subscription.plan}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Monto:</span>
                          <span className="text-white">S/{selectedGym.subscription.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Estado:</span>
                          <span className={`${selectedGym.subscription.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                            {selectedGym.subscription.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedGym.users && selectedGym.users.length > 0 && (
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <h3 className="text-white font-semibold mb-2">Usuarios</h3>
                      <div className="space-y-2">
                        {selectedGym.users.map(user => (
                          <div key={user.id} className="flex justify-between items-center text-sm">
                            <div>
                              <div className="text-white">{user.full_name}</div>
                              <div className="text-gray-400 text-xs">{user.email}</div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${user.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              {user.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
