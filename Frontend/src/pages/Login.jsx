import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      }, {
        withCredentials: true // Crucial for receiving the httpOnly JWT cookie
      });

      if (response.data.success) {
        // Redirect to dashboard on success
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-brand-dark p-12 text-white">
        
        <div>
          {/* Logo / Badge */}
          <div className="inline-flex items-center justify-center border border-slate-600 px-3 py-1 mb-16 rounded-sm">
            <span className="text-xs font-mono tracking-widest text-slate-300 mr-3 border-r border-slate-600 pr-3">FR</span>
            <span className="text-xs font-mono tracking-widest text-slate-300">OPERATIONS PORTAL</span>
          </div>

          <h1 className="text-6xl font-serif mb-6 text-white tracking-tight">FundsRoom</h1>
          
          <p className="text-xl text-slate-300 font-sans font-light leading-relaxed max-w-lg mb-16">
            One ledger for sales, warehouse, and accounts — every entry attributed, every role in its lane.
          </p>

          {/* Activity Feed */}
          <div className="space-y-6 text-sm font-mono tracking-wide">
            
            <div className="grid grid-cols-4 gap-4 items-center border-b border-slate-800/50 pb-4 opacity-40">
              <span className="col-span-1 text-slate-400">SALES</span>
              <span className="col-span-3 text-slate-300">New lead logged</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 items-center border-b border-slate-800/50 pb-4 opacity-50">
              <span className="col-span-1 text-slate-400">WAREHOUSE</span>
              <span className="col-span-3 text-slate-300">Stock received — Bay 4</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 items-center border-b border-slate-800/50 pb-4 opacity-60">
              <span className="col-span-1 text-slate-400">ACCOUNTS</span>
              <span className="col-span-3 text-slate-300">Invoice #2291 settled</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 items-center border-b border-slate-800/50 pb-4 opacity-70">
              <span className="col-span-1 text-slate-400">ADMIN</span>
              <span className="col-span-3 text-slate-300">Access review completed</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 items-center border-b border-slate-800/50 pb-4 opacity-80">
              <span className="col-span-1 text-slate-400">SALES</span>
              <span className="col-span-3 text-slate-300">Quote sent to client</span>
            </div>
            
            {/* Highlighted Feed Item */}
            <div className="grid grid-cols-4 gap-4 items-center border-b border-slate-700 pb-4 opacity-100">
              <span className="col-span-1 text-white font-medium">WAREHOUSE</span>
              <span className="col-span-3 text-white font-medium">Dispatch note generated</span>
            </div>

          </div>
        </div>

        <div className="mt-12 text-xs font-mono tracking-widest text-slate-500">
          MINI ERP · CRM · OPS
        </div>

      </div>

      {/* RIGHT PANEL (FORM) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md">
          
          <h3 className="text-xs font-mono tracking-widest text-brand-light mb-4 uppercase">Welcome Back</h3>
          <h2 className="text-4xl sm:text-5xl font-serif text-brand-dark mb-6 tracking-tight">Sign in</h2>
          <p className="text-slate-500 mb-16 text-base leading-relaxed">
            Enter your credentials to access your workspace.
          </p>

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* EMAIL */}
            <div className="relative group">
              <label className="absolute -top-6 left-0 text-xs font-mono tracking-widest text-brand-light uppercase flex items-center gap-2">
                <span className="text-[10px]">01</span> EMAIL
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@fundsroom.com"
                required
                className="w-full bg-transparent border-b border-slate-200 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-dark transition-colors"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative group mt-12">
              <label className="absolute -top-6 left-0 text-xs font-mono tracking-widest text-brand-light uppercase flex items-center gap-2">
                <span className="text-[10px]">02</span> PASSWORD
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full bg-transparent border-b border-slate-200 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-dark transition-colors"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm mt-4">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-dark hover:bg-slate-800 text-white font-mono text-sm tracking-[0.2em] py-4 mt-12 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
            </button>
            
          </form>

          <p className="mt-8 text-slate-500 text-sm">
            Don't have an account? <a href="/signup" className="text-brand-light hover:text-brand-dark underline decoration-1 underline-offset-4 transition-colors">Create one</a>
          </p>

        </div>
      </div>
      
    </div>
  );
};

export default Login;
