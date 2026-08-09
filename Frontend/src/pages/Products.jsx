import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Plus, Search, Filter, Download, Edit2, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentProduct, setCurrentProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    minimumStock: '',
    warehouseLocation: ''
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
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, product = null) => {
    setModalMode(mode);
    if (mode === 'edit' && product) {
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        unitPrice: product.unitPrice,
        minimumStock: product.minimumStock,
        warehouseLocation: product.warehouseLocation || ''
      });
    } else {
      setCurrentProduct(null);
      setFormData({
        name: '', sku: '', category: '', unitPrice: '', minimumStock: '', warehouseLocation: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        unitPrice: Number(formData.unitPrice),
        minimumStock: Number(formData.minimumStock)
      };
      
      if (modalMode === 'create') {
        await axios.post('http://localhost:5000/api/products', payload, { withCredentials: true });
      } else {
        await axios.put(`http://localhost:5000/api/products/${currentProduct.id}`, payload, { withCredentials: true });
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`, { withCredentials: true });
        fetchProducts();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minimumStock).length;
  const outOfStockProducts = products.filter(p => p.currentStock === 0).length;

  if (loading) return <div className="p-8 text-slate-500">Loading products...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="animate-in fade-in duration-500 pb-12 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Products</h2>
          <p className="text-sm text-slate-500">Manage products, pricing and stock levels</p>
        </div>
        <button onClick={() => handleOpenModal('create')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Total Products</div>
          <div className="text-4xl font-bold text-slate-900">{totalProducts}</div>
        </div>
        <div className={`p-6 rounded-2xl shadow-sm flex flex-col border ${lowStockProducts > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <div className={`text-sm font-semibold mb-4 uppercase tracking-wider ${lowStockProducts > 0 ? 'text-amber-600' : 'text-slate-500'}`}>Low Stock</div>
          <div className={`text-4xl font-bold flex items-center gap-2 ${lowStockProducts > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {lowStockProducts}
            {lowStockProducts > 0 && <span className="text-2xl">🔴</span>}
          </div>
        </div>
        <div className={`p-6 rounded-2xl shadow-sm flex flex-col border ${outOfStockProducts > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className={`text-sm font-semibold mb-4 uppercase tracking-wider ${outOfStockProducts > 0 ? 'text-red-600' : 'text-slate-500'}`}>Out of Stock</div>
          <div className={`text-4xl font-bold flex items-center gap-2 ${outOfStockProducts > 0 ? 'text-red-700' : 'text-slate-900'}`}>
            {outOfStockProducts}
            {outOfStockProducts > 0 && <span className="text-2xl">🔴</span>}
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
              placeholder="Search products..." 
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
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Min Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
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
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{product.sku}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">₹{product.unitPrice?.toLocaleString('en-IN') || 0}</td>
                    <td className={`px-6 py-4 font-bold ${product.currentStock <= product.minimumStock ? 'text-red-600' : 'text-slate-900'}`}>
                      {product.currentStock}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{product.minimumStock}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusColor}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal('edit', product)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={modalMode === 'create' ? "Add New Product" : "Edit Product"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="e.g. Executive Office Chair" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
              <input required type="text" name="sku" value={formData.sku} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="e.g. CHR-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <input required type="text" name="category" value={formData.category} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="e.g. Furniture" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price (₹)</label>
              <input required type="number" name="unitPrice" value={formData.unitPrice} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Stock</label>
              <input required type="number" name="minimumStock" value={formData.minimumStock} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse Location</label>
            <input type="text" name="warehouseLocation" value={formData.warehouseLocation} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="e.g. Aisle 4, Shelf B" />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
              {modalMode === 'create' ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Products;
