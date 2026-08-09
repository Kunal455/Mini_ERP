import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Filter, Download, Plus, Search, Eye, Edit2, ShieldAlert, Trash2 } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import Modal from '../components/Modal';

const Customers = () => {
  const { user } = useOutletContext();
  const canManage = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentCustomer, setCurrentCustomer] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    customerType: 'RETAIL',
    status: 'LEAD',
    city: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers', { withCredentials: true });
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, customer = null) => {
    if (!canManage) return;
    setModalMode(mode);
    if (mode === 'edit' && customer) {
      setCurrentCustomer(customer);
      setFormData({
        name: customer.name || '',
        mobile: customer.mobile || '',
        email: customer.email || '',
        businessName: customer.businessName || '',
        customerType: customer.customerType || 'RETAIL',
        status: customer.status || 'ACTIVE',
        city: customer.city || ''
      });
    } else {
      setCurrentCustomer(null);
      setFormData({
        name: '', mobile: '', email: '', businessName: '', customerType: 'RETAIL', status: 'ACTIVE', city: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) return;
    try {
      if (modalMode === 'create') {
        await axios.post('http://localhost:5000/api/customers', formData, { withCredentials: true });
      } else {
        await axios.put(`http://localhost:5000/api/customers/${currentCustomer.id}`, formData, { withCredentials: true });
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDelete = async (id) => {
    if (!canManage) return;
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await axios.delete(`http://localhost:5000/api/customers/${id}`, { withCredentials: true });
        fetchCustomers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete customer');
      }
    }
  };

  const handleStatusToggle = async (customer) => {
    if (!canManage) return;
    try {
      const newStatus = customer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await axios.put(`http://localhost:5000/api/customers/${customer.id}`, { status: newStatus }, { withCredentials: true });
      fetchCustomers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
  const inactiveCustomers = customers.filter(c => c.status === 'INACTIVE').length;

  if (loading) return <div className="p-8 text-slate-500">Loading customers...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="animate-in fade-in duration-500 pb-12 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Customers</h2>
          <p className="text-sm text-slate-500">Manage your customers and their information</p>
        </div>
        {canManage && (
          <button onClick={() => handleOpenModal('create')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Total Customers</div>
          <div className="text-4xl font-bold text-slate-900">{totalCustomers}</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Active</div>
          <div className="text-4xl font-bold text-emerald-600">{activeCustomers}</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Inactive</div>
          <div className="text-4xl font-bold text-slate-600">{inactiveCustomers}</div>
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
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[12px] font-bold text-slate-500 bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.filter(c => {
                const searchMatch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    (c.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (c.mobile || '').includes(searchTerm);
                const filterMatch = filterStatus === 'ALL' || 
                                    (filterStatus === 'ACTIVE' ? c.status === 'ACTIVE' : c.status !== 'ACTIVE');
                return searchMatch && filterMatch;
              }).map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{customer.businessName || customer.name}</div>
                    <div className="text-xs text-slate-500">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{customer.mobile}</td>
                  <td className="px-6 py-4 text-slate-700">{customer.city || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      customer.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {customer.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/customers/${customer.id}`} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50" title="View">
                        <Eye className="w-4 h-4" />
                      </Link>
                      {canManage && (
                        <>
                          <button onClick={() => handleOpenModal('edit', customer)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusToggle(customer)} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-md hover:bg-amber-50" title="Toggle Status">
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                          {user?.role === 'ADMIN' && (
                            <button onClick={() => handleDelete(customer.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {customers.filter(c => {
                const searchMatch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    (c.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (c.mobile || '').includes(searchTerm);
                const filterMatch = filterStatus === 'ALL' || 
                                    (filterStatus === 'ACTIVE' ? c.status === 'ACTIVE' : c.status !== 'ACTIVE');
                return searchMatch && filterMatch;
              }).length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={modalMode === 'create' ? "Add New Customer" : "Edit Customer"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
            <input required type="text" name="businessName" value={formData.businessName} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Business Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Contact Person Name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
              <input required type="text" name="mobile" value={formData.mobile} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Mobile Number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Email Address" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select name="customerType" value={formData.customerType} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="City" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
              {modalMode === 'create' ? 'Create Customer' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Customers;
