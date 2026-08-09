import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { FileText, Plus, Search, Filter, Download, MoreVertical, Eye, Printer, Edit2, Trash2 } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import Modal from '../components/Modal';

const SalesChallans = () => {
  const { user } = useOutletContext();
  const canManage = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentChallan, setCurrentChallan] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchChallans();
  }, []);

  const fetchChallans = async () => {
    try {
      const response = await API.get('/api/challans?limit=100');
      if (response.data.success) {
        setChallans(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch challans');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (challan) => {
    if (!canManage) return;
    setCurrentChallan(challan);
    setNewStatus(challan.status);
    setIsModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) return;
    try {
      await API.patch(`/api/challans/${currentChallan.id}/status`, { status: newStatus });
      setIsModalOpen(false);
      fetchChallans();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!canManage) return;
    if (window.confirm("Are you sure you want to delete this challan?")) {
      try {
        await API.delete(`/api/challans/${id}`);
        fetchChallans();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete challan');
      }
    }
  };

  const totalChallans = challans.length;
  const pendingChallans = challans.filter(c => c.status === 'DRAFT').length;
  const deliveredChallans = challans.filter(c => c.status === 'CONFIRMED').length;

  if (loading) return <div className="p-8 text-slate-500">Loading challans...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="animate-in fade-in duration-500 pb-12 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Sales Challans</h2>
          <p className="text-sm text-slate-500">Manage all sales challans and deliveries</p>
        </div>
        {canManage && (
          <Link to="/challans/create" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Create Challan
          </Link>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Total Challans</div>
          <div className="text-4xl font-bold text-slate-900">{totalChallans}</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Pending</div>
          <div className="text-4xl font-bold text-amber-600">{pendingChallans}</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Delivered</div>
          <div className="text-4xl font-bold text-emerald-600">{deliveredChallans}</div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search challan..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>
            <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none">
              <option value="">Status ▼</option>
              <option value="DRAFT">Pending</option>
              <option value="CONFIRMED">Delivered</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[12px] font-bold text-slate-500 bg-slate-50 border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Challan No.</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {challans.map((challan) => {
                const dateStr = new Date(challan.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                
                return (
                  <tr key={challan.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-indigo-600">
                      <Link to={`/challans/${challan.id}`} className="hover:underline">{challan.challanNumber}</Link>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{challan.customer.businessName || challan.customer.name}</td>
                    <td className="px-6 py-4 text-slate-500">{dateStr}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{challan.amount?.toLocaleString('en-IN') || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${challan.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : challan.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        {challan.status === 'CONFIRMED' ? 'Delivered' : challan.status === 'CANCELLED' ? 'Cancelled' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/challans/${challan.id}`} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {canManage && (
                          <button onClick={() => handleOpenStatusModal(challan)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50" title="Update Status">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => window.print()} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50" title="Print">
                          <Printer className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <button onClick={() => handleDelete(challan.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {challans.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No challans found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Update Challan Status"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select required value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
              <option value="DRAFT">Pending</option>
              <option value="CONFIRMED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
              Update Status
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default SalesChallans;
