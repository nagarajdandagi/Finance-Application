import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { LoanProduct } from '../../types';
import {
  Settings,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Percent,
  Layers,
  ShieldAlert,
  Save,
  Check
} from 'lucide-react';

export const AdminLoansPage: React.FC = () => {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/loans');
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load products for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setSaving(true);
      const res = await api.put(`/admin/loans/${editingProduct.id}`, {
        name: editingProduct.name,
        description: editingProduct.description,
        minAmount: editingProduct.min_amount,
        maxAmount: editingProduct.max_amount,
        interestRateMin: editingProduct.interest_rate_min,
        interestRateMax: editingProduct.interest_rate_max,
        defaultInterestRate: editingProduct.default_interest_rate,
        minTenureMonths: editingProduct.min_tenure_months,
        maxTenureMonths: editingProduct.max_tenure_months,
        processingFeePercent: editingProduct.processing_fee_percent,
        guarantorRequired: editingProduct.guarantor_required,
        coApplicantAllowed: editingProduct.co_applicant_allowed,
        adminApprovalThreshold: editingProduct.admin_approval_threshold,
        isActive: editingProduct.is_active,
        badge: editingProduct.badge
      });

      if (res.data.success) {
        alert('Loan product configuration updated successfully in database!');
        setEditingProduct(null);
        fetchProducts();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update loan product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Loan Product Configuration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Centrally manage lending limits, reducing interest ranges, tenure bounds, and guarantor policies.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{p.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">{p.id}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    p.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {p.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>

                <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lending Range</span>
                    <span className="font-bold text-slate-900">
                      ₹{p.min_amount.toLocaleString('en-IN')} - ₹{p.max_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Interest Rate Range</span>
                    <span className="font-bold text-amber-600">
                      {p.interest_rate_min}% - {p.interest_rate_max}% (Def: {p.default_interest_rate}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tenure (Months)</span>
                    <span className="font-bold text-slate-900">{p.min_tenure_months} to {p.max_tenure_months} Mos</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Admin Review Threshold</span>
                    <span className="font-bold text-blue-700">≥ ₹{p.admin_approval_threshold.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[10px]">
                  <span className={`px-2 py-0.5 rounded-full font-bold ${
                    p.guarantor_required ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.guarantor_required ? 'Guarantor Required' : 'No Guarantor Required'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700">
                    {p.co_applicant_allowed ? 'Co-Applicant Allowed' : 'No Co-Applicant'}
                  </span>
                  {p.badge && (
                    <span className="px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700">
                      {p.badge}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => setEditingProduct(p)}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Product Configuration
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Edit {editingProduct.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{editingProduct.id}</p>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Display Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.min_amount}
                    onChange={(e) => setEditingProduct({ ...editingProduct, min_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.max_amount}
                    onChange={(e) => setEditingProduct({ ...editingProduct, max_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Rate (%)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={editingProduct.interest_rate_min}
                    onChange={(e) => setEditingProduct({ ...editingProduct, interest_rate_min: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Rate (%)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={editingProduct.interest_rate_max}
                    onChange={(e) => setEditingProduct({ ...editingProduct, interest_rate_max: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default Rate (%)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={editingProduct.default_interest_rate}
                    onChange={(e) => setEditingProduct({ ...editingProduct, default_interest_rate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Tenure (Months)</label>
                  <input
                    type="number"
                    value={editingProduct.min_tenure_months}
                    onChange={(e) => setEditingProduct({ ...editingProduct, min_tenure_months: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Tenure (Months)</label>
                  <input
                    type="number"
                    value={editingProduct.max_tenure_months}
                    onChange={(e) => setEditingProduct({ ...editingProduct, max_tenure_months: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.guarantor_required}
                    onChange={(e) => setEditingProduct({ ...editingProduct, guarantor_required: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Guarantor Mandatory</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_active}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Product Active for Applications</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Updating...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
