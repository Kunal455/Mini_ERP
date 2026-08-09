import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

const CreateChallan = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    customerId: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0 }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/customers', { withCredentials: true }),
        axios.get('http://localhost:5000/api/products?limit=100', { withCredentials: true })
      ]);
      if (customersRes.data.success) setCustomers(customersRes.data.data);
      if (productsRes.data.success) setProducts(productsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (e) => {
    setFormData({ ...formData, customerId: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    if (field === 'productId') {
      const product = products.find(p => p.id === Number(value));
      newItems[index] = { ...newItems[index], productId: value, unitPrice: product ? product.unitPrice : 0 };
    } else {
      newItems[index] = { ...newItems[index], [field]: Number(value) };
    }
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { productId: '', quantity: 1, unitPrice: 0 }] });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * 0.18; // 18% GST example
  const grandTotal = subtotal + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId || formData.items.some(i => !i.productId)) {
      alert("Please select a customer and all products.");
      return;
    }
    try {
      const payload = {
        customerId: Number(formData.customerId),
        items: formData.items.map(i => ({
          productId: Number(i.productId),
          quantity: i.quantity,
          unitPrice: i.unitPrice
        }))
      };
      const response = await axios.post('http://localhost:5000/api/challans', payload, { withCredentials: true });
      if (response.data.success) {
        navigate('/challans');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create challan');
    }
  };

  if (loading) return <div className="p-8">Loading form...</div>;

  return (
    <div className="animate-in fade-in duration-500 pb-12 font-sans max-w-4xl mx-auto">
      
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Challans
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Create Sales Challan</h2>
          <p className="text-sm text-slate-500">Generate a new challan for a customer</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Customer</label>
              <select 
                value={formData.customerId}
                onChange={handleCustomerChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              >
                <option value="">[ Select Customer ▼ ]</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.businessName || c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Challan Date</label>
              <input 
                type="text" 
                value={new Date().toLocaleDateString('en-GB')} 
                readOnly 
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Products</h3>
            
            {/* Products Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
              <div className="col-span-5">Product</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-1"></div>
            </div>

            {/* Product Rows */}
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="col-span-5">
                    <select 
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number" 
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-2 font-bold text-slate-900">
                    ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button type="button" onClick={() => removeItem(index)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={addItem} className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="w-full md:w-1/2 ml-auto space-y-3">
              <div className="flex justify-between text-sm font-medium text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-slate-600">
                <span>Tax (18% GST)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-end gap-4">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 rounded-lg text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
              Create Challan
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default CreateChallan;
