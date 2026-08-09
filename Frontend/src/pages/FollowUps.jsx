import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CalendarClock, Plus, Search, Filter, CheckCircle2, Clock, Check, MoreVertical, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

const FollowUps = () => {
  const [followUps, setFollowUps] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    customerId: '',
    note: '',
    followUpDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [followRes, custRes] = await Promise.all([
        axios.get('http://localhost:5000/api/follow-ups', { withCredentials: true }),
        axios.get('http://localhost:5000/api/customers', { withCredentials: true })
      ]);
      if (followRes.data.success) setFollowUps(followRes.data.data);
      if (custRes.data.success) setCustomers(custRes.data.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({ customerId: customers.length > 0 ? customers[0].id : '', note: '', followUpDate: '' });
    setIsCreateModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/customers/${formData.customerId}/followups`, {
        ...formData,
        customerId: Number(formData.customerId)
      }, { withCredentials: true });
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create follow-up');
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm("Mark this follow-up as done? It will be removed.")) {
      try {
        await axios.delete(`http://localhost:5000/api/follow-ups/${id}`, { withCredentials: true });
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to complete follow-up');
      }
    }
  };

  const getPriorityBadge = (note) => {
    const text = note?.toLowerCase() || '';
    if (text.includes('urgent') || text.includes('high')) return <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">High</span>;
    if (text.includes('low')) return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">Low</span>;
    return <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">Medium</span>;
  };

  if (loading) return <div className="p-8 text-slate-500">Loading follow-ups...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="animate-in fade-in duration-500 pb-12 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Customer Follow-ups</h2>
          <p className="text-sm text-slate-500">Track and manage upcoming customer touchpoints</p>
        </div>
        <button onClick={handleOpenCreateModal} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Schedule Follow-up
        </button>
      </div>

      {/* Main Table Area */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search follow-ups..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
              <button onClick={() => setFilterDate('ALL')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${filterDate === 'ALL' ? 'bg-white shadow-sm border border-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>All</button>
              <button onClick={() => setFilterDate('TODAY')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${filterDate === 'TODAY' ? 'bg-white shadow-sm border border-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>Today</button>
              <button onClick={() => setFilterDate('UPCOMING')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${filterDate === 'UPCOMING' ? 'bg-white shadow-sm border border-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>Upcoming</button>
            </div>
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[12px] font-bold text-slate-500 bg-slate-50 border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Follow-up Note</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {followUps.filter(f => {
                const dateObj = new Date(f.followUpDate);
                const isToday = dateObj.toDateString() === new Date().toDateString();
                const isPast = dateObj < new Date() && !isToday;

                const text = (f.note || '').toLowerCase();
                let priority = 'MEDIUM';
                if (text.includes('urgent') || text.includes('high')) priority = 'HIGH';
                else if (text.includes('low')) priority = 'LOW';

                const searchMatch = (f.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    (f.customer?.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    text.includes(searchTerm.toLowerCase());
                
                let dateMatch = true;
                if (filterDate === 'TODAY') dateMatch = isToday;
                if (filterDate === 'UPCOMING') dateMatch = !isToday && !isPast;

                const priorityMatch = filterPriority === 'ALL' || priority === filterPriority;

                return searchMatch && dateMatch && priorityMatch;
              }).map((f) => {
                const dateObj = new Date(f.followUpDate);
                const isToday = dateObj.toDateString() === new Date().toDateString();
                const isPast = dateObj < new Date() && !isToday;
                const dateStr = isToday ? 'Today, ' + dateObj.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}) : dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

                return (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">{f.customer?.businessName || f.customer?.name}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{f.note}</td>
                    <td className={`px-6 py-4 ${isToday ? 'text-indigo-600 font-bold' : isPast ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
                      {dateStr}
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(f.note)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                        <Clock className="w-4 h-4" /> Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleComplete(f.id)} className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md text-xs font-bold transition-colors">
                          <Check className="w-3 h-3" /> Done
                        </button>
                        <button onClick={() => handleComplete(f.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {followUps.filter(f => {
                const dateObj = new Date(f.followUpDate);
                const isToday = dateObj.toDateString() === new Date().toDateString();
                const isPast = dateObj < new Date() && !isToday;

                const text = (f.note || '').toLowerCase();
                let priority = 'MEDIUM';
                if (text.includes('urgent') || text.includes('high')) priority = 'HIGH';
                else if (text.includes('low')) priority = 'LOW';

                const searchMatch = (f.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    (f.customer?.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    text.includes(searchTerm.toLowerCase());
                
                let dateMatch = true;
                if (filterDate === 'TODAY') dateMatch = isToday;
                if (filterDate === 'UPCOMING') dateMatch = !isToday && !isPast;

                const priorityMatch = filterPriority === 'ALL' || priority === filterPriority;

                return searchMatch && dateMatch && priorityMatch;
              }).length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">No follow-ups found.</td>
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
        title="Schedule Follow-up"
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
            <input required type="datetime-local" name="followUpDate" value={formData.followUpDate} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Note (Include 'urgent' or 'high' for High priority)</label>
            <textarea required name="note" value={formData.note} onChange={handleFormChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm" rows="3" placeholder="Follow-up note..."></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
              Schedule
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default FollowUps;
