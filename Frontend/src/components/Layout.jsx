import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Box, Layers, FileText, Settings, Search, Moon, Bell, ShoppingCart, Receipt, CalendarClock, BarChart2, User, LogOut } from 'lucide-react';
import axios from 'axios';
import Modal from './Modal';

const permissions = {
  '/dashboard': ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  '/users': ['ADMIN'],
  '/customers': ['ADMIN', 'SALES', 'ACCOUNTS'],
  '/products': ['ADMIN', 'SALES', 'WAREHOUSE'],
  '/inventory': ['ADMIN', 'WAREHOUSE'],
  '/purchase-orders': ['ADMIN', 'WAREHOUSE'],
  '/challans': ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  '/invoices': ['ADMIN', 'SALES', 'ACCOUNTS'],
  '/follow-ups': ['ADMIN', 'SALES'],
  '/reports': ['ADMIN', 'ACCOUNTS'],
};

const hasPermission = (role, path) => {
  if (role === 'ADMIN') return true;
  // Handle dynamic routes like /customers/:id
  const basePath = Object.keys(permissions).find(p => path.startsWith(p));
  if (basePath) {
    return permissions[basePath].includes(role);
  }
  return false;
};

const Layout = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [editName, setEditName] = useState('');
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me', { withCredentials: true });
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      navigate('/login');
    }
  };

  useEffect(() => {
    if (user && user.role) {
      if (!hasPermission(user.role, location.pathname)) {
        navigate('/dashboard');
      }
    }
  }, [user, location.pathname, navigate]);

  // Close profile menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Fallback
      navigate('/login');
    }
  };

  const handleOpenEditProfile = () => {
    setEditName(user?.name || '');
    setIsProfileMenuOpen(false);
    setIsEditProfileModalOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:5000/api/auth/me', { name: editName }, { withCredentials: true });
      if (response.data.success) {
        setUser(response.data.data);
        setIsEditProfileModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const getInitials = (name) => {
    if (!name) return '👤';
    return name.charAt(0).toUpperCase();
  };

  const canSee = (path) => user && hasPermission(user.role, path);

  if (!user) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading...</div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col flex-shrink-0 border-r border-slate-200">
        
        {/* Branding */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">FundsRoom</h1>
            <p className="text-[11px] text-indigo-600 font-medium">Operations CRM</p>
          </div>
        </div>

        <div className="px-6 py-2">
          <p className="text-[11px] font-semibold text-slate-400 tracking-wider mb-3">ADMIN MENU</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {canSee('/dashboard') && <NavItem to="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />}
          {canSee('/users') && <NavItem to="/users" icon={<Users className="w-5 h-5" />} label="Users" />}
          {canSee('/customers') && <NavItem to="/customers" icon={<Users className="w-5 h-5" />} label="Customers" />}
          {canSee('/products') && <NavItem to="/products" icon={<Box className="w-5 h-5" />} label="Products" />}
          {canSee('/inventory') && <NavItem to="/inventory" icon={<Layers className="w-5 h-5" />} label="Inventory" />}
          {canSee('/purchase-orders') && <NavItem to="/purchase-orders" icon={<ShoppingCart className="w-5 h-5" />} label="Purchase Orders" />}
          {canSee('/challans') && <NavItem to="/challans" icon={<FileText className="w-5 h-5" />} label="Sales Challans" />}
          {canSee('/invoices') && <NavItem to="/invoices" icon={<Receipt className="w-5 h-5" />} label="Invoices" />}
          {canSee('/follow-ups') && <NavItem to="/follow-ups" icon={<CalendarClock className="w-5 h-5" />} label="Follow-ups" />}
          {canSee('/reports') && <NavItem to="/reports" icon={<BarChart2 className="w-5 h-5" />} label="Reports" />}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <div className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-400 font-medium font-mono">⌘K</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5">
            
            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <div 
                className="flex items-center gap-2 ml-2 cursor-pointer select-none"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <span className="text-sm font-medium text-slate-700">{user?.name || 'Loading...'}</span>
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium shadow-sm overflow-hidden">
                  {getInitials(user?.name)}
                </div>
              </div>
              
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || 'email@example.com'}</p>
                  </div>
                  <button onClick={handleOpenEditProfile} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                    <User className="w-4 h-4 text-slate-400" />
                    Edit Profile
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input 
              required 
              type="text" 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)} 
              className="w-full p-2 border border-slate-200 rounded-lg text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email (Read Only)</label>
            <input 
              readOnly 
              type="email" 
              value={user?.email || ''} 
              className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed" 
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button type="button" onClick={() => setIsEditProfileModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

const NavItem = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between px-4 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
          isActive 
            ? 'bg-indigo-50/80 text-indigo-700' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <div className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
              {icon}
            </div>
            <span>{label}</span>
          </div>
          {isActive && (
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          )}
        </>
      )}
    </NavLink>
  );
};

export default Layout;
