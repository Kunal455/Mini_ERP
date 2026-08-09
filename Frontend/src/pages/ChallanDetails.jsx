import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit2, Printer, Download } from 'lucide-react';
import Modal from '../components/Modal';

const ChallanDetails = () => {
  const { user } = useOutletContext();
  const canManage = user?.role === 'ADMIN' || user?.role === 'SALES';
  const { id } = useParams();
  const navigate = useNavigate();
  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    fetchChallanDetails();
  }, [id]);

  const fetchChallanDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/challans/${id}`, { withCredentials: true });
      if (response.data.success) {
        setChallan(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch challan details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading challan details...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!challan) return <div className="p-8 text-slate-500">Challan not found</div>;

  const dateStr = new Date(challan.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const subtotal = challan.amount || 0;
  const tax = subtotal * 0.18; // 18% GST example
  const grandTotal = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert("To download as a PDF, please select 'Save as PDF' in the destination dropdown of the print dialog.");
    window.print();
  };

  const handleStatusUpdate = async (action) => {
    if (!canManage) return;
    try {
      const endpoint = action === 'CONFIRMED' ? 'confirm' : 'cancel';
      await axios.patch(`http://localhost:5000/api/challans/${id}/${endpoint}`, {}, { withCredentials: true });
      setIsModalOpen(false);
      fetchChallanDetails();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${endpoint} challan`);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12 font-sans max-w-4xl mx-auto">
      
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Challans
      </button>

      {/* Printable Area */}
      <div ref={printRef} className="bg-white p-2">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Sales Challan <span className="text-indigo-600">{challan.challanNumber}</span></h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-500">Created: <span className="font-semibold text-slate-700">{dateStr}</span></span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 flex items-center gap-2">
                Status: 
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${challan.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : challan.status === 'DRAFT' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                  {challan.status === 'CONFIRMED' ? 'Delivered' : challan.status === 'DRAFT' ? 'Pending' : 'Cancelled'}
                </span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Amount</div>
            <div className="text-3xl font-bold text-slate-900">₹{grandTotal.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
        
        {/* Customer Info */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Bill To</h3>
          <div className="text-lg font-bold text-slate-900 mb-1">{challan.customer?.businessName || challan.customer?.name}</div>
          <div className="text-slate-600 mb-1">{challan.customer?.address || 'Address not provided'}</div>
          <div className="text-slate-600">{challan.customer?.mobile}</div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[12px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider bg-white">
              <tr>
                <th className="px-8 py-4">Product ID</th>
                <th className="px-8 py-4 text-center">Quantity</th>
                <th className="px-8 py-4 text-right">Unit Price</th>
                <th className="px-8 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {challan.items?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-medium text-slate-900">Product #{item.productId}</td>
                  <td className="px-8 py-5 text-center font-bold text-slate-700">{item.quantity}</td>
                  <td className="px-8 py-5 text-right text-slate-600">₹{item.unitPrice?.toLocaleString('en-IN') || 0}</td>
                  <td className="px-8 py-5 text-right font-bold text-slate-900">₹{(item.quantity * (item.unitPrice || 0)).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {(!challan.items || challan.items.length === 0) && (
                <tr>
                  <td colSpan="4" className="px-8 py-8 text-center text-slate-500">No items found in this challan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="p-8 bg-slate-50 flex justify-end">
          <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
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
      </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 hide-on-print">
        {canManage && challan.status === 'DRAFT' && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Edit2 className="w-4 h-4" /> Edit Status
          </button>
        )}
        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
          <Printer className="w-4 h-4" /> Print
        </button>
        <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 border border-indigo-600 rounded-lg text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update Challan Status">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            Select the new status for this challan. Once confirmed, inventory will be permanently reduced.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => handleStatusUpdate('CANCELLED')} className="px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
              Cancel Challan
            </button>
            <button onClick={() => handleStatusUpdate('CONFIRMED')} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm">
              Confirm Delivery
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default ChallanDetails;
