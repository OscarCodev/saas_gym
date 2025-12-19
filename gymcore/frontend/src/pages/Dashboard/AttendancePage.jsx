import { useState, useEffect } from 'react';
import { UserCheck, Clock, Calendar, Users, CheckCircle } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import Table from '../../components/Table';
import useAttendance from '../../hooks/useAttendance';
import SuccessModal from '../../components/SuccessModal';

const AttendancePage = () => {
  const { todayAttendances, stats, loading, error, checkIn, fetchTodayAttendances, fetchStats } = useAttendance();
  const [dni, setDni] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchTodayAttendances();
    fetchStats();
  }, [fetchTodayAttendances, fetchStats]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!dni.trim()) {
      setErrorMessage('Por favor ingrese un DNI');
      return;
    }

    setCheckInLoading(true);
    setErrorMessage('');
    try {
      const attendance = await checkIn(dni);
      console.log('Check-in successful:', attendance);
      setSuccessData({
        member_name: attendance.member_name,
        check_in_time: new Date(attendance.check_in_time).toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit'
        })
      });
      setShowSuccess(true);
      setDni('');
      await fetchStats(); // Refresh stats
      await fetchTodayAttendances(); // Force refresh attendances
    } catch (err) {
      console.error('Check-in error:', err);
      setErrorMessage(err.message);
    } finally {
      setCheckInLoading(false);
    }
  };

  const columns = [
    {
      header: 'Socio',
      accessor: 'member_name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-lime-400/10 flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-lime-400" />
          </div>
          <div>
            <p className="font-medium text-slate-100">{row.member_name}</p>
            <p className="text-xs text-slate-400">DNI: {row.member_dni}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Hora de Entrada',
      accessor: 'check_in_time',
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="h-4 w-4" />
          {new Date(row.check_in_time).toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )
    },
    {
      header: 'Fecha',
      accessor: 'check_in_time',
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="h-4 w-4" />
          {new Date(row.check_in_time).toLocaleDateString('es-PE')}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Control de Asistencias</h1>
        <p className="mt-1 text-slate-400">Registra y monitorea la asistencia de tus socios</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard 
            title="Asistencias Hoy" 
            value={stats.today_count} 
            icon={UserCheck} 
            color="lime"
          />
          <StatCard 
            title="Esta Semana" 
            value={stats.week_count} 
            icon={Users} 
            color="blue"
          />
          <StatCard 
            title="Este Mes" 
            value={stats.month_count} 
            icon={Calendar} 
            color="purple"
          />
        </div>
      )}

      {/* Check-in Form */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold text-slate-100 flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-lime-400" />
          Registrar Asistencia
        </h2>
        <form onSubmit={handleCheckIn} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <FormInput
              label="DNI del Socio"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ingrese el DNI"
              required
              autoFocus
            />
          </div>
          <div className="sm:mt-6">
            <Button
              type="submit"
              loading={checkInLoading}
              className="w-full sm:w-auto"
            >
              <UserCheck className="h-5 w-5" />
              Registrar
            </Button>
          </div>
        </form>
        {errorMessage && (
          <div className="mt-4 rounded-lg bg-red-400/10 border border-red-400/20 p-3">
            <p className="text-sm text-red-400">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Today's Attendances */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100">Asistencias de Hoy</h2>
          <span className="rounded-full bg-lime-400/10 px-3 py-1 text-sm font-medium text-lime-400">
            {todayAttendances.length} registros
          </span>
        </div>
        {error && (
          <div className="mb-4 rounded-lg bg-red-400/10 border border-red-400/20 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        <Table columns={columns} data={todayAttendances} loading={loading} />
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="¡Asistencia Registrada!"
        message={
          successData ? (
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-100 mb-2">
                {successData.member_name}
              </p>
              <p className="text-slate-400">
                Hora de entrada: <span className="text-lime-400 font-medium">{successData.check_in_time}</span>
              </p>
            </div>
          ) : null
        }
      />
    </div>
  );
};

export default AttendancePage;
