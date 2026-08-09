import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Layers, Search, Filter, Plus, Edit2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import Modal from '../components/Modal';

const Inventory = () => {
  const { user } = useOutletContext();
  const canManage = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    movementType: 'IN',
    quantity: '',
    reason: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products?limit=100', { withCredentials: true });
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (!canManage) return;
    setCurrentProduct(product);
    setFormData({
      productId: product ? product.id : (products.length > 0 ? products[0].id : ''),
      movementType: 'IN',
      quantity: '',
      reason: ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) return;
    try {
      const endpoint = formData.movementType === 'IN' ? '/api/stock/in' : '/api/stock/out';
      await axios.post(`http://localhost:5000${endpoint}`, {
        productId: Number(formData.productId),
        quantity: Number(formData.quantity),
        reason: formData.reason
      }, { withCredentials: true });
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adjust stock');
    }
  };

  const totalItems = products.length;
  const lowStockItems = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minimumStock).length;
  const outOfStockItems = products.filter(p => p.currentStock === 0).length;

  if (loading) return <div className="p-8 text-slate-500">Loading inventory...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="animate-in fade-in duration-500 pb-12 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Inventory</h2>
          <p className="text-sm text-slate-500">Monitor and adjust your physical stock levels</p>
        </div>
        {canManage && (
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Stock Adjustment
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Total Items</div>
          <div className="text-4xl font-bold text-slate-900">{totalItems}</div>
        </div>
        <div className={`p-6 rounded-2xl shadow-sm flex flex-col border ${lowStockItems > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <div className={`text-sm font-semibold mb-4 uppercase tracking-wider ${lowStockItems > 0 ? 'text-amber-600' : 'text-slate-500'}`}>Low Stock</div>
          <div className={`text-4xl font-bold flex items-center gap-2 ${lowStockItems > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {lowStockItems}
          </div>
        </div>
        <div className={`p-6 rounded-2xl shadow-sm flex flex-col border ${outOfStockItems > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className={`text-sm font-semibold mb-4 uppercase tracking-wider ${outOfStockItems > 0 ? 'text-red-600' : 'text-slate-500'}`}>Out of Stock</div>
          <div className={`text-4xl font-bold flex items-center gap-2 ${outOfStockItems > 0 ? 'text-red-700' : 'text-slate-900'}`}>
            {outOfStockItems}
          </div>
        </div>
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
              placeholder="Search product..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[12px] font-bold text-slate-500 bg-slate-50 border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4 text-center">Current Stock</th>
                <th className="px-6 py-4 text-center">Min Stock</th>
                <th className="px-6 py-4">Status</th>
                {canManage && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => {
                let status = "Good";
                let statusColor = "bg-emerald-50 text-emerald-600";
                
                if (product.currentStock === 0) {
                  status = "Out 🔴";
                  statusColor = "bg-red-50 text-red-600";
                } else if (product.currentStock <= product.minimumStock) {
                  status = "Low 🔴";
                  statusColor = "bg-amber-50 text-amber-600";
                }

                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">{product.name}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{product.sku}</td>
                    <td className={`px-6 py-4 text-center font-bold text-lg ${product.currentStock <= product.minimumStock ? 'text-red-600' : 'text-slate-900'}`}>
                      {product.currentStock}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500">{product.minimumStock}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusColor}`}>
                        {status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(product)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-md border border-indigo-100 transition-colors">
                            <Edit2 className="w-3 h-3" /> Adjust
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="px-6 py-8 text-center text-slate-500">No inventory found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title="Stock Adjustment"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
            <select required name="productId" value={formData.productId} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" disabled={!!currentProduct}>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select required name="movementType" value={formData.movementType} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                <option value="IN">Stock In (Add)</option>
                <option value="OUT">Stock Out (Deduct)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input required type="number" name="quantity" value={formData.quantity} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="e.g. 5" min="1" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <input required type="text" name="reason" value={formData.reason} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="e.g. Received new shipment" />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Inventory;
