import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  FileText, 
  Truck, 
  IndianRupee, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Calendar,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { NumberPlate } from '../components/NumberPlate';

export function ReportsView({ 
  vehicles = [], 
  documents = [], 
  stats, 
  user 
}) {
  const [reportType, setReportType] = useState('compliance'); // compliance, financial, fleet

  // Calculate metrics
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const totalDocs = documents.length;
  const expiredDocs = documents.filter(d => d.statusInfo?.status === 'EXPIRED');
  const tomorrowDocs = documents.filter(d => d.statusInfo?.status === 'EXPIRES_TOMORROW' || d.statusInfo?.status === 'EXPIRES_TODAY');
  const twoDaysDocs = documents.filter(d => d.statusInfo?.status === 'EXPIRES_2_DAYS');
  const validDocs = documents.filter(d => d.statusInfo?.status === 'VALID');

  const complianceRate = totalDocs > 0 
    ? Math.round((validDocs.length / totalDocs) * 100) 
    : 100;

  const totalMonthlyExpense = stats?.thisMonthExpenses || 0;

  // CSV Export
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];

    if (reportType === 'compliance') {
      headers = ['Vehicle Number', 'Document Type', 'Document Number', 'Issue Date', 'Expiry Date', 'Status'];
      rows = documents.map(d => [
        d.vehicle_number || '',
        d.document_type || '',
        d.document_number || '',
        d.issue_date || '',
        d.expiry_date || '',
        d.statusInfo?.label || d.statusInfo?.status || 'Valid'
      ]);
    } else {
      headers = ['Vehicle Number', 'Model', 'Type', 'Driver', 'Status', 'Manufacturing Year'];
      rows = vehicles.map(v => [
        v.vehicle_number || '',
        v.model || '',
        v.vehicle_type || '',
        v.driver_name || 'Unassigned',
        v.status || 'Active',
        v.manufacturing_year || ''
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fleet_${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-1">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Fleet Analytics & Compliance Reports
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Export official fleet audits, compliance summaries, and operational expenditures for review.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button 
            onClick={handlePrint} 
            className="btn-secondary h-11 px-4 text-xs font-semibold rounded-xl"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4 mr-1" /> Print / PDF
          </button>
          <button 
            onClick={handleExportCSV} 
            className="btn-primary h-11 px-5 text-sm font-bold shadow-lg shadow-blue-600/25 rounded-xl shrink-0"
            title="Export as CSV spreadsheet"
          >
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </button>
        </div>
      </div>

      {/* Top Overview KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Fleet Compliance Score</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-3xl font-extrabold ${complianceRate >= 90 ? 'text-emerald-400' : complianceRate >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
              {complianceRate}%
            </span>
            <span className="text-xs text-slate-400">compliant</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Based on {totalDocs} active documents</p>
        </div>

        <div className="glass-card p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Active Vehicles</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-blue-400">{activeVehicles}</span>
            <span className="text-xs text-slate-400">/ {totalVehicles} trucks</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{totalVehicles - activeVehicles} in maintenance/inactive</p>
        </div>

        <div className="glass-card p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Immediate Compliance Risks</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-3xl font-extrabold ${(expiredDocs.length + tomorrowDocs.length) > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {expiredDocs.length + tomorrowDocs.length}
            </span>
            <span className="text-xs text-slate-400">urgent actions</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{expiredDocs.length} expired, {tomorrowDocs.length} expiring tomorrow</p>
        </div>

        <div className="glass-card p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Month Operating Expenses</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-400">
              ₹{totalMonthlyExpense.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Diesel, tolls, repairs & upkeep</p>
        </div>
      </div>

      {/* Report Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setReportType('compliance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            reportType === 'compliance' 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-3.5 h-3.5 inline mr-1.5" />
          RTO Compliance & Expiry Audit
        </button>
        <button
          onClick={() => setReportType('fleet')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            reportType === 'fleet' 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Truck className="w-3.5 h-3.5 inline mr-1.5" />
          Fleet Inventory & Driver Roster
        </button>
      </div>

      {/* Report Content Table */}
      {reportType === 'compliance' ? (
        <div className="glass-panel overflow-hidden space-y-4 bg-[#0B1528] border-white/[0.08]">
          <div className="p-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Full Compliance Registry</h3>
              <p className="text-[11px] text-slate-400">Detailed validity schedule for all commercial vehicle permits, RC, and insurance</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">{documents.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="p-3.5">Truck Plate</th>
                  <th className="p-3.5">Document Type</th>
                  <th className="p-3.5">Document #</th>
                  <th className="p-3.5">Issue Date</th>
                  <th className="p-3.5">Expiry Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No documents currently on file.
                    </td>
                  </tr>
                ) : (
                  documents.map(doc => {
                    const status = doc.statusInfo?.status;
                    return (
                      <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 whitespace-nowrap">
                          <NumberPlate number={doc.vehicle_number} />
                        </td>
                        <td className="p-3.5 font-bold text-white">{doc.document_type}</td>
                        <td className="p-3.5 font-mono text-slate-300">{doc.document_number || '—'}</td>
                        <td className="p-3.5 text-slate-400">{doc.issue_date || '—'}</td>
                        <td className="p-3.5 font-extrabold text-white">{doc.expiry_date}</td>
                        <td className="p-3.5">
                          <span className={`badge ${
                            status === 'EXPIRED' ? 'badge-expired' :
                            status === 'EXPIRES_TOMORROW' ? 'badge-urgent' :
                            status === 'EXPIRES_2_DAYS' ? 'badge-amber' : 'badge-valid'
                          }`}>
                            {doc.statusInfo?.label || 'Valid'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right text-slate-400">
                          {doc.statusInfo?.description || 'Valid'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden space-y-4">
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Commercial Fleet Registry</h3>
              <p className="text-[11px] text-slate-400">Master inventory of all transport trucks and allocated commercial drivers</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">{vehicles.length} Trucks</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Plate Number</th>
                  <th className="p-3.5">Make & Model</th>
                  <th className="p-3.5">Vehicle Type</th>
                  <th className="p-3.5">Assigned Driver</th>
                  <th className="p-3.5">Manufacturing Year</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No commercial vehicles registered yet.
                    </td>
                  </tr>
                ) : (
                  vehicles.map(v => (
                    <tr key={v.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <NumberPlate number={v.vehicle_number} />
                      </td>
                      <td className="p-3.5 font-bold text-white">{v.model}</td>
                      <td className="p-3.5 text-slate-300">{v.vehicle_type || 'Truck'}</td>
                      <td className="p-3.5 text-slate-300">{v.driver_name || 'Unassigned'}</td>
                      <td className="p-3.5 text-slate-400">{v.manufacturing_year || '—'}</td>
                      <td className="p-3.5 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          {v.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
