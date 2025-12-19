import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateMembersReport = (members, gymName) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(163, 230, 53); // lime-400
  doc.text('Reporte de Socios', 14, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(gymName, 14, 28);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, 14, 34);
  
  // Stats
  const active = members.filter(m => m.membership_status === 'active').length;
  const inactive = members.filter(m => m.membership_status !== 'active').length;
  
  doc.setFontSize(10);
  doc.text(`Total: ${members.length} | Activos: ${active} | Inactivos: ${inactive}`, 14, 42);
  
  // Table
  const tableData = members.map(member => [
    member.dni,
    member.full_name,
    member.membership_plan?.name || member.membership_type || 'Sin Plan',
    member.membership_status === 'active' ? 'Activo' : 'Inactivo',
    new Date(member.start_date).toLocaleDateString('es-PE'),
    new Date(member.end_date).toLocaleDateString('es-PE')
  ]);
  
  autoTable(doc, {
    startY: 48,
    head: [['DNI', 'Nombre', 'Plan', 'Estado', 'Inicio', 'Fin']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [163, 230, 53], textColor: [0, 0, 0] },
    styles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`socios_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateAttendanceReport = (attendances, gymName) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(163, 230, 53);
  doc.text('Reporte de Asistencias', 14, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(gymName, 14, 28);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, 14, 34);
  doc.text(`Total asistencias: ${attendances.length}`, 14, 40);
  
  // Table
  const tableData = attendances.map(att => [
    att.member_dni,
    att.member_name,
    new Date(att.check_in_time).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    new Date(att.check_in_time).toLocaleDateString('es-PE')
  ]);
  
  autoTable(doc, {
    startY: 48,
    head: [['DNI', 'Nombre', 'Hora', 'Fecha']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [163, 230, 53], textColor: [0, 0, 0] },
    styles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`asistencias_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateSummaryReport = (stats, revenueData, membershipDistribution, gymName) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(163, 230, 53);
  doc.text('Resumen del Gimnasio', 14, 20);
  
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(gymName, 14, 30);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, 14, 38);
  
  // Stats section
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Estadísticas Generales', 14, 50);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Total Socios: ${stats.total_members}`, 20, 60);
  doc.text(`Activos: ${stats.active_members}`, 20, 68);
  doc.text(`Inactivos: ${stats.inactive_members}`, 20, 76);
  doc.text(`Ingresos del Mes: S/${stats.revenue_this_month}`, 20, 84);
  doc.text(`Nuevos Socios: ${stats.new_members_this_month}`, 20, 92);
  
  // Membership Distribution
  if (membershipDistribution && Object.keys(membershipDistribution).length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Distribución de Membresías', 14, 106);
    
    const distData = Object.entries(membershipDistribution).map(([name, count]) => [
      name,
      count.toString()
    ]);
    
    autoTable(doc, {
      startY: 112,
      head: [['Plan', 'Cantidad']],
      body: distData,
      theme: 'grid',
      headStyles: { fillColor: [163, 230, 53], textColor: [0, 0, 0] },
      styles: { fontSize: 10 },
      margin: { left: 20 }
    });
  }
  
  // Revenue Chart Data
  if (revenueData && revenueData.length > 0) {
    const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 130;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Ingresos Últimos 6 Meses', 14, startY);
    
    const revenueTable = revenueData.map(item => [
      item.month,
      `S/${item.revenue.toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: startY + 6,
      head: [['Mes', 'Ingresos']],
      body: revenueTable,
      theme: 'grid',
      headStyles: { fillColor: [163, 230, 53], textColor: [0, 0, 0] },
      styles: { fontSize: 10 },
      margin: { left: 20 }
    });
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`resumen_${new Date().toISOString().split('T')[0]}.pdf`);
};
