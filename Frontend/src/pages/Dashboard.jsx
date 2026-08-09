import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { Users, FileText, Package, ArrowUpRight, PackageOpen, CalendarClock, AlertCircle } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await API.get('/api/admin/dashboard', {
          withCredentials: true
        });
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="text-slate-500 p-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">Error: {error}</div>;
  }

  if (!data) return null;

  const hasLowStock = data.statistics.products.lowStock > 0;
  const { user } = useOutletContext();
  
  const showUsersCard = user?.role === 'ADMIN';
  const showStockCard = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE' || user?.role === 'SALES';

  return (
    <div className="animate-in fade-in duration-500 font-sans pb-12">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">{user?.role === 'ADMIN' ? 'Admin Dashboard' : `${user?.role} Dashboard`}</h2>
        <p className="text-sm text-slate-500">Overview of the business</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Active Users */}
        {showUsersCard && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
            <div className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Active Users</div>
            <div className="text-4xl font-bold text-slate-900">{data.statistics.users.active}</div>
          </div>
        )}

        {/* Active Customers */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Active Customers</div>
          <div className="text-4xl font-bold text-slate-900">{data.statistics.customers.active}</div>
        </div>

        {/* Low Stock Warning */}
        {showStockCard && (
          <div className={`p-6 rounded-2xl shadow-sm flex flex-col border ${hasLowStock ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
            <div className={`text-sm font-semibold mb-4 uppercase tracking-wider ${hasLowStock ? 'text-red-600' : 'text-slate-500'}`}>Low Stock Products</div>
            <div className={`text-4xl font-bold ${hasLowStock ? 'text-red-700' : 'text-slate-900'} flex items-center gap-2`}>
              {data.statistics.products.lowStock}
              {hasLowStock && <span className="text-2xl">🔴</span>}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Challans (2 columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Challans</h3>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-[12px] font-bold text-slate-500 bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Challan No.</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentChallans.map((challan) => {
                  const dateObj = new Date(challan.createdAt);
                  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                  return (
                    <tr key={challan.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{challan.challanNumber}</td>
                      <td className="px-6 py-4 text-slate-700">{challan.customer.businessName || challan.customer.name}</td>
                      <td className="px-6 py-4 text-slate-500">{dateStr}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">₹{challan.amount?.toLocaleString('en-IN') || 0}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={challan.status} />
                      </td>
                    </tr>
                  );
                })}
                {data.recentChallans.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No recent challans found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Link to="/challans" className="text-indigo-600 font-medium text-sm hover:text-indigo-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Upcoming Follow-ups (1 column) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900">Upcoming Follow-ups</h3>
            <CalendarClock className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[400px]">
            {data.upcomingFollowUps.map((followUp) => {
              const dateObj = new Date(followUp.followUpDate);
              const isToday = dateObj.toDateString() === new Date().toDateString();
              
              let headerText = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              if (isToday) headerText = "Today";
              else if (dateObj.toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString()) {
                headerText = "Tomorrow";
              }

              const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={followUp.id} className="p-5">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 border-b border-indigo-100 pb-1">
                    {headerText}
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-semibold text-slate-900 mb-0.5">{followUp.customer.name}</div>
                      <div className="text-sm text-slate-500">{followUp.note || 'Follow-up reminder'}</div>
                    </div>
                    <div className="text-sm font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded">
                      {timeStr}
                    </div>
                  </div>
                </div>
              );
            })}
            {data.upcomingFollowUps.length === 0 && (
              <div className="p-8 text-center text-slate-500">No upcoming follow-ups.</div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Link to="/follow-ups" className="text-indigo-600 font-medium text-sm hover:text-indigo-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    DRAFT: 'text-amber-600',
    CONFIRMED: 'text-emerald-600',
    CANCELLED: 'text-red-600'
  };
  
  const className = styles[status] || 'text-slate-600';
  const label = status === 'DRAFT' ? 'Pending' : status === 'CONFIRMED' ? 'Delivered' : 'Cancelled';
  
  return (
    <span className={`font-semibold ${className}`}>
      {label}
    </span>
  );
};

export default Dashboard;
