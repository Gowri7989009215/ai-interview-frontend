import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import InterviewSetup from './pages/InterviewSetup';
import Interview from './pages/Interview';
import Report from './pages/Report';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const isAdmin = user && user.role === 'admin';

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar user={user} setUser={setUser} />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* User Access Protected Routes */}
            <Route path="/dashboard" element={user ? (isAdmin ? <Navigate to="/admin" /> : <Dashboard />) : <Navigate to="/login" />} />
            <Route path="/resume-upload" element={user ? <ResumeUpload /> : <Navigate to="/login" />} />
            <Route path="/interview-setup" element={user ? <InterviewSetup /> : <Navigate to="/login" />} />
            <Route path="/interview/:id" element={user ? <Interview /> : <Navigate to="/login" />} />
            <Route path="/report/:id" element={user ? <Report /> : <Navigate to="/login" />} />
            
            {/* Admin Access Protected Routes */}
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
