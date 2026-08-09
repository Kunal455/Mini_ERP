import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, Download, Eye, MoreVertical, Edit2, Trash2, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    customerId: '',
    amount: ''
  });
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invRes, custRes] = await Promise.all([
        axios.get('http://localhost:5000/api/invoices', { withCredentials: true }),
        axios.get('http://localhost:5000/api/customers', { withCredentials: true })
      ]);
      if (invRes.data.success) setInvoices(invRes.data.data);
      if (custRes.data.success) setCustomers(custRes.data.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({ customerId: customers.length > 0 ? customers[0].id : '', amount: '' });
    setIsCreateModalOpen(true);
  };

  const handleOpenStatusModal = (invoice) => {
    setCurrentInvoice(invoice);
    setNewStatus(invoice.status);
    setIsStatusModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/invoices', {
        customerId: Number(formData.customerId),
        amount: Number(formData.amount)
      }, { withCredentials: true });
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create Invoice');
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/invoices/${currentInvoice.id}/status`, { status: newStatus }, { withCredentials: true });
      setIsStatusModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await axios.delete(`http://localhost:5000/api/invoices/${id}`, { withCredentials: true });
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete Invoice');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID': return <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 text-xs font-bold rounded-full">Paid</span>;
      case 'PENDING': return <span className="bg-amber-50 text-amber-600 px-2.5 py-1 text-xs font-bold rounded-full">Pending</span>;
      case 'OVERDUE': return <span className="bg-red-50 text-red-600 px-2.5 py-1 text-xs font-bold rounded-full">Overdue</span>;
      case 'CANCELLED': return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 text-xs font-bold rounded-full">Cancelled</span>;
      default: return null;
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading invoices...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="animate-in fade-in duration-500 pb-12 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Invoices</h2>
          <p className="text-sm text-slate-500">Manage billing and payments</p>
        </div>
        <button onClick={handleOpenCreateModal} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Main Table Area */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[12px] font-bold text-slate-500 bg-slate-50 border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Invoice No.</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => {
                const dateStr = new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-indigo-600">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{inv.customer?.businessName || inv.customer?.name}</td>
                    <td className="px-6 py-4 text-slate-500">{dateStr}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{inv.amount?.toLocaleString('en-IN') || 0}</td>
                    <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                        <button onClick={() => handleOpenStatusModal(inv)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50" title="Update Status">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => window.print()} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50" title="Print">
                          <Printer className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No invoices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        title="Create Invoice"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
            <select required name="customerId" value={formData.customerId} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.businessName || c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount (₹)</label>
            <input required type="number" name="amount" value={formData.amount} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="0.00" />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
              Create Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Status Update Modal */}
      <Modal 
        isOpen={isStatusModalOpen} 
        onClose={() => setIsStatusModalOpen(false)} 
        title="Update Invoice Status"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select required value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button type="button" onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
              Update Status
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Invoices;
