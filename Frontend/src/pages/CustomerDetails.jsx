import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, Edit2, ShieldAlert, Phone, Mail, MapPin, Building, Package, CalendarClock } from 'lucide-react';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      const response = await API.get(`/api/customers/${id}`);
      if (response.data.success) {
        setCustomer(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading customer details...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!customer) return <div className="p-8 text-slate-500">Customer not found</div>;

  // Calculate order summary
  const totalChallans = customer.challans?.length || 0;
  const pendingOrdersAmount = customer.challans?.filter(c => c.status === 'DRAFT').reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
  const totalOrdersAmount = customer.challans?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

  return (
    <div className="animate-in fade-in duration-500 pb-12 font-sans">
      
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>

      {/* Header */}
      <div className="flex justify-between items-start mb-8 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{customer.businessName || customer.name}</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500">Customer ID: <span className="font-semibold text-slate-700">CUST-{customer.id}</span></span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 flex items-center gap-2">
              Status: 
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${customer.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                {customer.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </span>
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors shadow-sm">
            <ShieldAlert className="w-4 h-4" /> Deactivate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Contact Information */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-5 border-b border-slate-100 pb-2">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 font-medium">Phone</div>
                <div className="font-medium text-slate-900">{customer.mobile}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 font-medium">Email</div>
                <div className="font-medium text-slate-900">{customer.email || 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 font-medium">Address</div>
                <div className="font-medium text-slate-900">{customer.address || customer.city || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-5 border-b border-slate-100 pb-2">Business Information</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 font-medium">GSTIN</div>
                <div className="font-medium text-slate-900">{customer.gstNumber || 'Not provided'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 font-medium">Customer Type</div>
                <div className="font-medium text-slate-900">{customer.customerType}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm bg-gradient-to-br from-indigo-50 to-white">
          <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-5 border-b border-indigo-100 pb-2">Order Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Orders</div>
              <div className="font-bold text-slate-900 text-lg">₹{totalOrdersAmount.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Pending Orders</div>
              <div className="font-bold text-amber-600 text-lg">₹{pendingOrdersAmount.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Challans</div>
              <div className="font-bold text-slate-900 text-lg">{totalChallans}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Outstanding</div>
              <div className="font-bold text-red-600 text-lg">₹0</div>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[12px] font-bold text-slate-500 bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Challan No.</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.challans?.slice(0,5).map((challan) => {
                  const dateStr = new Date(challan.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                  return (
                    <tr key={challan.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{challan.challanNumber}</td>
                      <td className="px-6 py-4 text-slate-500">{dateStr}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">₹{challan.amount?.toLocaleString('en-IN') || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${challan.status === 'CONFIRMED' ? 'text-emerald-600' : challan.status === 'DRAFT' ? 'text-amber-600' : 'text-slate-600'}`}>
                          {challan.status === 'CONFIRMED' ? 'Delivered' : challan.status === 'DRAFT' ? 'Pending' : 'Cancelled'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {(!customer.challans || customer.challans.length === 0) && (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No transactions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Follow-ups */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900">Follow-ups</h3>
            <CalendarClock className="w-5 h-5 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[400px]">
            {customer.followUps?.map(f => {
              const dateStr = new Date(f.followUpDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
              return (
                <div key={f.id} className="p-5 flex gap-4">
                  <div className="font-bold text-indigo-600 text-sm w-16 flex-shrink-0">{dateStr}</div>
                  <div className="text-sm text-slate-700">{f.note}</div>
                </div>
              );
            })}
             {(!customer.followUps || customer.followUps.length === 0) && (
                <div className="p-8 text-center text-slate-500">No follow-ups scheduled.</div>
             )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default CustomerDetails;
