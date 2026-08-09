import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Download, Calendar } from 'lucide-react';

const Reports = () => {
  
  // Mock Data for the report
  const salesThisMonth = 1250000;
  const outstandingAmount = 240000;
  
  const topCustomers = [
    { id: 1, name: 'ABC Traders', sales: 450000, percentage: 36 },
    { id: 2, name: 'XYZ Ltd', sales: 320000, percentage: 25 },
    { id: 3, name: 'Global Tech', sales: 210000, percentage: 17 },
    { id: 4, name: 'Kumar Sons', sales: 150000, percentage: 12 },
    { id: 5, name: 'Others', sales: 120000, percentage: 10 },
  ];

  return (
    <div className="animate-in fade-in duration-500 pb-12 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Reports</h2>
          <p className="text-sm text-slate-500">Business analytics and performance overview</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Calendar className="w-4 h-4" /> This Month
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Sales This Month</div>
            <div className="text-4xl font-bold text-slate-900">₹{salesThisMonth.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-8 h-8 text-rose-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Outstanding Amount</div>
            <div className="text-4xl font-bold text-slate-900">₹{outstandingAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Overview Chart (Mocked UI) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Sales Overview</h3>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="p-8 flex-1 flex flex-col justify-end min-h-[300px]">
            {/* CSS-only Bar Chart Mock */}
            <div className="flex items-end justify-between gap-2 h-48 mt-auto border-b border-slate-200 pb-2">
              <div className="w-full bg-indigo-100 rounded-t-md h-12 relative group hover:bg-indigo-200 transition-colors"><div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold text-indigo-700">₹2.1L</div></div>
              <div className="w-full bg-indigo-100 rounded-t-md h-24 relative group hover:bg-indigo-200 transition-colors"><div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold text-indigo-700">₹3.5L</div></div>
              <div className="w-full bg-indigo-500 rounded-t-md h-32 relative group shadow-lg"><div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-700">₹5.2L</div></div>
              <div className="w-full bg-indigo-100 rounded-t-md h-16 relative group hover:bg-indigo-200 transition-colors"><div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold text-indigo-700">₹2.8L</div></div>
              <div className="w-full bg-indigo-100 rounded-t-md h-40 relative group hover:bg-indigo-200 transition-colors"><div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold text-indigo-700">₹6.1L</div></div>
              <div className="w-full bg-indigo-100 rounded-t-md h-20 relative group hover:bg-indigo-200 transition-colors"><div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold text-indigo-700">₹3.0L</div></div>
            </div>
            <div className="flex justify-between mt-4 text-xs font-bold text-slate-400">
              <span>Week 1</span>
              <span>Week 2</span>
              <span className="text-indigo-600">Week 3</span>
              <span>Week 4</span>
              <span>Week 5</span>
              <span>Week 6</span>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Top Customers</h3>
          </div>
          
          <div className="p-6 flex-1">
            <div className="space-y-6">
              {topCustomers.map(customer => (
                <div key={customer.id}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-slate-900">{customer.name}</span>
                    <span className="font-bold text-indigo-600">₹{customer.sales.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${customer.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Reports;
