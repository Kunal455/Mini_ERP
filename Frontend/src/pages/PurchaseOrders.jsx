import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, Download, Eye, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [currentPO, setCurrentPO] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    supplierName: '',
    totalAmount: '',
    expectedDeliveryDate: ''
  });
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/purchase-orders', { withCredentials: true });
      if (response.data.success) {
        setPurchaseOrders(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({ supplierName: '', totalAmount: '', expectedDeliveryDate: '' });
    setIsCreateModalOpen(true);
  };

  const handleOpenStatusModal = (po) => {
    setCurrentPO(po);
    setNewStatus(po.status);
    setIsStatusModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/purchase-orders', {
        ...formData,
        totalAmount: Number(formData.totalAmount)
      }, { withCredentials: true });
      setIsCreateModalOpen(false);
      fetchPurchaseOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create PO');
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/purchase-orders/${currentPO.id}/status`, { status: newStatus }, { withCredentials: true });
      setIsStatusModalOpen(false);
      fetchPurchaseOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this purchase order?")) {
      try {
        await axios.delete(`http://localhost:5000/api/purchase-orders/${id}`, { withCredentials: true });
        fetchPurchaseOrders();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete PO');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="bg-amber-50 text-amber-600 px-2.5 py-1 text-xs font-bold rounded-full">Pending</span>;
      case 'APPROVED': return <span className="bg-blue-50 text-blue-600 px-2.5 py-1 text-xs font-bold rounded-full">Approved</span>;
      case 'RECEIVED': return <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 text-xs font-bold rounded-full">Received</span>;
      case 'CANCELLED': return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 text-xs font-bold rounded-full">Cancelled</span>;
      default: return null;
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading purchase orders...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="animate-in fade-in duration-500 pb-12 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Purchase Orders</h2>
          <p className="text-sm text-slate-500">Manage supplier purchase orders</p>
        </div>
        <button onClick={handleOpenCreateModal} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Create Purchase Order
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
              placeholder="Search POs..." 
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
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Expected Delivery</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseOrders.map((po) => {
                const dateStr = new Date(po.orderDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                const deliveryStr = po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : 'N/A';
                return (
                  <tr key={po.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-indigo-600">PO-{po.id.toString().padStart(4, '0')}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{po.supplierName}</td>
                    <td className="px-6 py-4 text-slate-500">{dateStr}</td>
                    <td className="px-6 py-4 text-slate-500">{deliveryStr}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{po.totalAmount?.toLocaleString('en-IN') || 0}</td>
                    <td className="px-6 py-4">{getStatusBadge(po.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                        <button onClick={() => handleOpenStatusModal(po)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50" title="Update Status">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(po.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {purchaseOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No purchase orders found.</td>
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
        title="Create Purchase Order"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name</label>
            <input required type="text" name="supplierName" value={formData.supplierName} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="e.g. ABC Supplier" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount (₹)</label>
              <input required type="number" name="totalAmount" value={formData.totalAmount} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expected Delivery</label>
              <input type="date" name="expectedDeliveryDate" value={formData.expectedDeliveryDate} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
              Create PO
            </button>
          </div>
        </form>
      </Modal>

      {/* Status Update Modal */}
      <Modal 
        isOpen={isStatusModalOpen} 
        onClose={() => setIsStatusModalOpen(false)} 
        title="Update PO Status"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select required value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="RECEIVED">Received</option>
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

export default PurchaseOrders;
