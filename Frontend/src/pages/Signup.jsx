import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Star, Users, FileText, BarChart3, ShieldCheck, Zap, User } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'SALES'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (response.data.success) {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white font-sans">
      
      {/* LEFT PANEL (FORM) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h2>
          <p className="text-slate-500 mb-8">
            Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Sign in</Link>
          </p>



          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* NAME */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Rahul Kumar"
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* ROLE */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <select
                  name="role"
                  value={formData.role || 'SALES'}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white appearance-none"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="SALES">SALES</option>
                  <option value="WAREHOUSE">WAREHOUSE</option>
                  <option value="ACCOUNTS">ACCOUNTS</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </div>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm pt-2">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-full flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Creating account...' : 'Create account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
            
          </form>

          <p className="mt-8 text-xs text-slate-500 text-center leading-relaxed">
            By registering you agree to our <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>.
          </p>

        </div>
      </div>
      
      {/* RIGHT PANEL (INFO) */}
      <div className="hidden lg:flex flex-col w-1/2 bg-gradient-to-br from-[#2a1a5e] to-[#4c3198] text-white p-10 lg:p-12 relative overflow-y-auto">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        <div className="relative z-10 h-full flex flex-col justify-center">
          
          {/* Top Badges */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 backdrop-blur-sm">
              <Zap className="w-4 h-4" />
              <span className="font-semibold text-sm">FundsRoom <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded ml-1">AI</span></span>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 backdrop-blur-sm text-sm">
              ✨ AI-Native Operations CRM
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
              Start orchestrating your operations today
            </h1>
            <p className="text-indigo-200 text-base mb-8">
              Join thousands of businesses managing their inventory, customers, and challans seamlessly.
            </p>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0 border border-indigo-400/30">
                  <Users className="w-5 h-5 text-indigo-300" />
                </div>
                <span className="text-indigo-100 font-medium">Centralized customer management</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/30 flex items-center justify-center flex-shrink-0 border border-orange-400/30">
                  <FileText className="w-5 h-5 text-orange-300" />
                </div>
                <span className="text-indigo-100 font-medium">Streamlined challan generation</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/30 flex items-center justify-center flex-shrink-0 border border-emerald-400/30">
                  <BarChart3 className="w-5 h-5 text-emerald-300" />
                </div>
                <span className="text-indigo-100 font-medium">Real-time inventory & insights</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-500/30 flex items-center justify-center flex-shrink-0 border border-rose-400/30">
                  <ShieldCheck className="w-5 h-5 text-rose-300" />
                </div>
                <span className="text-indigo-100 font-medium">Role-based access control</span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2">
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-indigo-200 text-sm">Trusted by 50+ businesses</span>
            </div>
          </div>

          {/* Bottom Stat Cards */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
              <div className="text-2xl font-bold mb-1">12K+</div>
              <div className="text-xs text-indigo-200">Customers managed</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
              <div className="text-2xl font-bold mb-1">1.5L+</div>
              <div className="text-xs text-indigo-200">Challans generated</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
              <div className="text-2xl font-bold mb-1">3.4x</div>
              <div className="text-xs text-indigo-200">Faster operations</div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default Signup;
