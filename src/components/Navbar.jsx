import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, setUser }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const isAdmin = user && user.role === 'admin';

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-primary-600 flex items-center gap-2">
                    <span className="bg-primary-600 text-white px-2.5 py-1 rounded-xl shadow-md text-xl">Pro</span>
                    <span className="tracking-tight text-gray-800 font-extrabold">Interview AI</span>
                </Link>
                
                <div className="flex items-center gap-6 text-gray-600 font-semibold text-sm">
                    <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                    {user ? (
                        <>
                            {isAdmin ? (
                                <Link to="/admin" className="text-primary-600 hover:underline transition-all font-bold">Admin Panel</Link>
                            ) : (
                                <>
                                    <Link to="/dashboard" className="hover:text-primary-600 transition-colors">Dashboard</Link>
                                    <Link to="/resume-upload" className="hover:text-primary-600 transition-colors">Upload Resume</Link>
                                    <Link to="/interview-setup" className="hover:text-primary-600 transition-colors">Practice</Link>
                                </>
                            )}
                            
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-bold text-gray-800">{user.name || user.fullName || 'User'}</span>
                                    <span className="text-[10px] text-gray-400 capitalize">{user.role}</span>
                                </div>
                                {user.avatar || user.profilePicture ? (
                                    <img 
                                        src={user.avatar || user.profilePicture} 
                                        alt="Avatar" 
                                        className="w-9 h-9 rounded-full border border-gray-200 shadow-sm"
                                        onError={(e) => {
                                            e.target.src = "https://lh3.googleusercontent.com/a/default-user";
                                        }}
                                    />
                                ) : (
                                    <div className="w-9 h-9 bg-primary-100 text-primary-700 font-bold rounded-full flex items-center justify-center text-sm shadow-sm">
                                        {(user.name || user.fullName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="bg-gray-50 text-gray-600 px-3.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer font-bold"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-primary-600 transition-colors">Login</Link>
                            <Link to="/register" className="bg-primary-600 text-white px-5 py-2 rounded-xl hover:bg-primary-700 transition-all shadow-md">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
