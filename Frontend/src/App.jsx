import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import SalesChallans from './pages/SalesChallans';
import CreateChallan from './pages/CreateChallan';
import ChallanDetails from './pages/ChallanDetails';
import PurchaseOrders from './pages/PurchaseOrders';
import Invoices from './pages/Invoices';
import FollowUps from './pages/FollowUps';
import Reports from './pages/Reports';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes wrapped in Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/challans" element={<SalesChallans />} />
          <Route path="/challans/create" element={<CreateChallan />} />
          <Route path="/challans/:id" element={<ChallanDetails />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/follow-ups" element={<FollowUps />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
        
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
