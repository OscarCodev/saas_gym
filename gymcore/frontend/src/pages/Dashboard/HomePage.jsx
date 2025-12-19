import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  UserX, 
  DollarSign, 
  ArrowRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import StatCard from '../../components/StatCard';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import useDashboardStats from '../../hooks/useDashboardStats';
import { Loader2 } from 'lucide-react';

const HomePage = () => {
  const { stats, recentActivity, revenueData, loading } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
      </div>
    );
  }

  const membershipData = stats?.membership_distribution 
    ? Object.entries(stats.membership_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const COLORS = ['#84cc16', '#3b82f6', '#a855f7']; // lime-500, blue-500, purple-500

  const recentColumns = [
    { header: 'Nombre', accessor: 'full_name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Fecha', 
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleDateString()
    },
    {
      header: 'Estado',
      accessor: 'membership_status',
      render: (row) => (
        <Badge 
          label={row.membership_status} 
          variant={row.membership_status === 'active' ? 'success' : 'default'} 
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Socios" 
          value={stats?.total_members || 0} 
          icon={Users} 
          color="blue"
        />
        <StatCard 
          title="Socios Activos" 
          value={stats?.active_members || 0} 
          icon={UserCheck} 
          color="green"
        />
        <StatCard 
          title="Socios Inactivos" 
          value={stats?.inactive_members || 0} 
          icon={UserX} 
          color="red"
        />
        <StatCard 
          title="Ingresos Mes" 
          value={`S/${stats?.revenue_this_month || 0}`} 
          icon={DollarSign} 
          color="lime"
          trend={12}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-6 text-lg font-semibold text-slate-100">Ingresos Semestrales</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                  itemStyle={{ color: '#a3e635' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#a3e635" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Membership Distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-6 text-lg font-semibold text-slate-100">Distribución de Membresías</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={membershipData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {membershipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {membershipData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-300 capitalize">{entry.name}</span>
                </div>
                <span className="font-medium text-slate-100">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100">Actividad Reciente</h3>
          <Link to="/dashboard/members" className="flex items-center text-sm text-lime-400 hover:text-lime-300">
            Ver todos <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <Table columns={recentColumns} data={recentActivity} />
      </div>
    </div>
  );
};

export default HomePage;