import { Routes, Route, Navigate } from 'react-router-dom';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<div>Dashboard</div>} />
      <Route path="/products" element={<div>Products</div>} />
      <Route path="/orders" element={<div>Orders</div>} />
      <Route path="/users" element={<div>Users</div>} />
      <Route path="/categories" element={<div>Categories</div>} />
      <Route path="/analytics" element={<div>Analytics</div>} />
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}
