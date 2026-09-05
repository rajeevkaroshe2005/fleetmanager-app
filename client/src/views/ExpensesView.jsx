import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Plus, 
  Trash2, 
  X, 
  AlertCircle, 
  TrendingUp, 
  Eye, 
  Fuel, 
  Receipt,
  Truck,
  Calendar,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { NumberPlate } from '../components/NumberPlate';

const EXPENSE_CATEGORIES = [
  'Diesel',
  'Toll',
  'Repairs',
  'Service',
  'Insurance',
  'Permit',
  'Tax',
  'Tyres',
  'Battery',
  'Driver Allowance / Bata',
  'Other Expenses'
];

export function ExpensesView({ vehicles = [], onSelectVehicle }) {
  const [expenses, setExpenses] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('');

  // Add Expense form state
  const [vehicleId, setVehicleId] = useState('');
  const [category, setCategory] = useState('Diesel');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategoryFilter) params.category = selectedCategoryFilter;
      if (selectedVehicleFilter) params.vehicleId = selectedVehicleFilter;
      const res = await api.getExpenses(params);
      setExpenses(res.expenses || []);
      setCategoryTotals(res.categoryTotals || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategoryFilter, selectedVehicleFilter]);

  const handleOpenAdd = (vId = '') => {
    setVehicleId(vId || (vehicles[0]?.id ? String(vehicles[0].id) : ''));
    setCategory('Diesel');
    setAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setReceiptFile(null);
    setError('');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!vehicleId || !category || !amount || !expenseDate) {
      setError('Please fill in vehicle, category, amount, and date');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('vehicle_id', vehicleId);
      formData.append('category', category);
      formData.append('amount', amount);
      formData.append('expense_date', expenseDate);
      if (description) formData.append('description', description.trim());
      if (receiptFile) formData.append('receipt', receiptFile);

      await api.addExpense(formData);
      confetti({ particleCount: 40, spread: 50 });
      setIsAddModalOpen(false);
      fetchExpenses();
    } catch (err) {
      setError(err.message || 'Failed to record expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense entry?')) {
      try {
        await api.deleteExpense(id);
        fetchExpenses();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const totalExpenseSum = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Fleet Expenses & Fuel Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor diesel expenses, toll slips, taxes, tyre upkeep, and driver allowances.
          </p>
        </div>

        <button 
          onClick={() => handleOpenAdd()} 
          className="btn-primary text-xs sm:text-sm self-start sm:self-auto shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 bg-gradient-to-tr from-blue-600/20 to-indigo-600/10 border-blue-500/30 col-span-2 sm:col-span-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Filtered</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1 block">
            ₹{totalExpenseSum.toLocaleString('en-IN')}
          </span>
        </div>

        {categoryTotals.slice(0, 3).map((cat) => (
          <div key={cat.category} className="glass-card p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block truncate">{cat.category}</span>
            <span className="text-2xl font-extrabold text-blue-400 mt-1 block">
              ₹{cat.total.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <select 
            value={selectedVehicleFilter}
            onChange={(e) => setSelectedVehicleFilter(e.target.value)}
            className="form-select h-10 text-xs sm:text-sm"
          >
            <option value="">All Fleet Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vehicle_number} — {v.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select 
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="form-select h-10 text-xs sm:text-sm"
          >
            <option value="">All Expense Categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table/Cards */}
      {expenses.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 space-y-3">
          <IndianRupee className="w-12 h-12 mx-auto text-slate-500 opacity-60" />
          <h3 className="text-base font-bold text-white">No expenses recorded</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Log fuel receipts, toll payments, and repairs to calculate cost per vehicle.
          </p>
          <button onClick={() => handleOpenAdd()} className="btn-primary text-xs mt-2">
            + Record First Expense
          </button>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Description / Notes</th>
                  <th className="p-4">Receipt</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold text-white whitespace-nowrap">
                      <NumberPlate number={exp.vehicle_number} />
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white block">{exp.category}</span>
                    </td>
                    <td className="p-4 text-slate-300 whitespace-nowrap">
                      {exp.expense_date}
                    </td>
                    <td className="p-4 text-slate-300 max-w-xs truncate">
                      {exp.description || '—'}
                    </td>
                    <td className="p-4">
                      {exp.receipt_path ? (
                        <a 
                          href={exp.receipt_path} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-secondary text-[11px] py-1 px-2 text-blue-400"
                        >
                          <Receipt className="w-3 h-3" /> View Slip
                        </a>
                      ) : (
                        <span className="text-slate-500 italic">No receipt</span>
                      )}
                    </td>
                    <td className="p-4 font-extrabold text-white text-sm whitespace-nowrap">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="glass-modal-backdrop">
          <div className="glass-modal-box max-w-lg w-full p-0 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Record Fleet Expense</h3>
                  <p className="text-xs text-slate-400">Log fuel, tolls, permits, or repair bills</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-130px)]">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Select Commercial Vehicle <span className="text-rose-400">*</span>
                  </label>
                  <select 
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="form-select h-10 text-xs sm:text-sm"
                    required
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vehicle_number} — {v.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Expense Category <span className="text-rose-400">*</span>
                    </label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="form-select h-10 text-xs sm:text-sm"
                    >
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Amount (₹) <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 4500"
                      className="form-input h-10 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Expense Date <span className="text-rose-400">*</span>
                  </label>
                  <input 
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="form-input h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Bill / Receipt Photo (Optional)
                  </label>
                  <input 
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setReceiptFile(e.target.files[0])}
                    className="form-input text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Description & Trip Notes
                  </label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Diesel pump slip at NH48 toll plaza, 55 litres..."
                    className="form-textarea text-xs sm:text-sm resize-none"
                    rows={2}
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="p-4 sm:p-5 border-t border-white/10 bg-white/5 flex items-center justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="btn-secondary text-xs sm:text-sm px-4"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="btn-primary text-xs sm:text-sm px-5 font-bold"
                >
                  {saving ? 'Saving...' : '+ Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
