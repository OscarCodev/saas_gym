import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Users, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import memberService from '../../services/member.service';
import attendanceService from '../../services/attendance.service';
import dashboardService from '../../services/dashboard.service';
import { generateMembersReport, generateAttendanceReport, generateSummaryReport } from '../../utils/pdfGenerator';

const ReportsPage = () => {
  const { user, gym } = useAuth();
  const [loading, setLoading] = useState({});
  const [dateRange, setDateRange] = useState('today');
  const [customDates, setCustomDates] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const handleGenerateMembersReport = async () => {
    setLoading(prev => ({ ...prev, members: true }));
    try {
      console.log('Fetching members for gym:', gym?.id);
      const members = await memberService.getAll(gym.id);
      console.log('Members received:', members);
      
      if (!members || members.length === 0) {
        alert('No hay socios registrados para generar el reporte');
        return;
      }
      
      generateMembersReport(members, gym.name);
    } catch (error) {
      console.error('Error generating members report:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Error desconocido';
      alert('Error al generar el reporte de socios: ' + errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, members: false }));
    }
  };

  const handleGenerateAttendanceReport = async () => {
    setLoading(prev => ({ ...prev, attendance: true }));
    try {
      console.log('Fetching attendances for gym:', gym?.id, 'Period:', dateRange);
      let attendances = [];
      
      if (dateRange === 'today') {
        attendances = await attendanceService.getTodayAttendances();
      } else if (dateRange === 'week') {
        // Get last 7 days
        attendances = await attendanceService.getAttendancesByRange(7);
      } else if (dateRange === 'month') {
        // Get last 30 days
        attendances = await attendanceService.getAttendancesByRange(30);
      } else if (dateRange === 'custom') {
        // Calculate days between custom dates
        const start = new Date(customDates.start);
        const end = new Date(customDates.end);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        attendances = await attendanceService.getAttendancesByRange(diffDays);
      }
      
      console.log('Attendances received:', attendances);
      
      if (!attendances || attendances.length === 0) {
        alert('No hay asistencias en el período seleccionado');
        return;
      }
      
      generateAttendanceReport(attendances, gym.name);
    } catch (error) {
      console.error('Error generating attendance report:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Error desconocido';
      alert('Error al generar el reporte de asistencias: ' + errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }));
    }
  };

  const handleGenerateSummaryReport = async () => {
    setLoading(prev => ({ ...prev, summary: true }));
    try {
      console.log('Generating summary report for gym:', gym?.id);
      
      // Get stats
      const stats = await dashboardService.getStats(gym.id);
      console.log('Stats received:', stats);
      
      // Get revenue data (last 6 months)
      const revenueData = await dashboardService.getRevenueData(gym.id);
      console.log('Revenue data received:', revenueData);
      
      // Get membership distribution
      const members = await memberService.getAll(gym.id);
      console.log('Members for distribution:', members);
      
      const membershipDistribution = {};
      members.forEach(member => {
        const planName = member.membership_plan?.name || member.membership_type || 'Sin Plan';
        membershipDistribution[planName] = (membershipDistribution[planName] || 0) + 1;
      });
      
      generateSummaryReport(stats, revenueData, membershipDistribution, gym.name);
    } catch (error) {
      console.error('Error generating summary report:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Error desconocido';
      alert('Error al generar el reporte resumen: ' + errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-lime-400" />
        <h1 className="text-2xl font-bold text-white">Reportes</h1>
      </div>

      <p className="text-gray-400 mb-8">
        Genera reportes en PDF con la información de tu gimnasio
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Members Report */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Lista de Socios</h3>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">
            Reporte completo con todos los socios, sus planes, estado de membresía y fechas.
          </p>
          
          <button
            onClick={handleGenerateMembersReport}
            disabled={loading.members}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {loading.members ? 'Generando...' : 'Descargar PDF'}
          </button>
        </div>

        {/* Attendance Report */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Asistencias</h3>
          </div>
          
          <p className="text-gray-400 text-sm mb-4">
            Reporte de asistencias con DNI, nombre, fecha y hora.
          </p>
          
          {/* Date Range Selector */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Período</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime-400"
            >
              <option value="today">Hoy</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          
          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Desde</label>
                <input
                  type="date"
                  value={customDates.start}
                  onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Hasta</label>
                <input
                  type="date"
                  value={customDates.end}
                  onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>
          )}
          
          <button
            onClick={handleGenerateAttendanceReport}
            disabled={loading.attendance}
            className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {loading.attendance ? 'Generando...' : 'Descargar PDF'}
          </button>
        </div>

        {/* Summary Report */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-lime-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-lime-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Resumen General</h3>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">
            Reporte con estadísticas generales, ingresos, distribución de membresías y más.
          </p>
          
          <button
            onClick={handleGenerateSummaryReport}
            disabled={loading.summary}
            className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 text-black py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Download className="w-4 h-4" />
            {loading.summary ? 'Generando...' : 'Descargar PDF'}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-400 font-semibold mb-1">Información</h4>
            <p className="text-gray-400 text-sm">
              Los reportes se generan en formato PDF y se descargan automáticamente. 
              Los datos son extraídos directamente de tu base de datos en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
