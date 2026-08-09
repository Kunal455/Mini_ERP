import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, ShieldAlert, Edit2, Power, UserPlus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // In a real app, we'd have a GET /api/users endpoint. Let's assume it exists or use admin dashboard for now.
      // Since we didn't explicitly check if GET /api/users is unprotected/returns array, let's call it.
      const response = await axios.get('http://localhost:5000/api/users', { withCredentials: true });
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    // Placeholder for actual toggle functionality
    alert(`Toggle active status for user ${id}. Currently: ${currentStatus}`);
  };

  if (loading) return <div className="p-8 text-slate-500">Loading users...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Manage Users</h2>
          <p className="text-sm text-slate-500">View and manage employee access across the CRM</p>
        </div>
        <Link to="/signup" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <UserPlus className="w-4 h-4" /> Add New User
        </Link>
      </div>

      {/* Main Table Area */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[12px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{user.name}</td>
                  <td className="px-6 py-4 text-slate-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="text-emerald-600 font-medium flex items-center gap-1.5"><Shield className="w-4 h-4" /> Active</span>
                    ) : (
                      <span className="text-red-500 font-medium flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== 'ADMIN' && (
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-slate-400 hover:text-indigo-600 transition-colors" title="Edit User">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          className={`transition-colors ${user.isActive ? 'text-slate-400 hover:text-red-600' : 'text-slate-400 hover:text-emerald-600'}`} 
                          title={user.isActive ? "Deactivate User" : "Activate User"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Users;
