import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';

function Login({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Handle standard form login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // Callback for Google Sign In
    const handleGoogleCallback = async (response) => {
        setGoogleLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/google', { credential: response.credential });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Google authentication failed.');
        } finally {
            setGoogleLoading(false);
        }
    };

    // Initialize Google Identity Services
    useEffect(() => {
        const initGoogle = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
                    callback: handleGoogleCallback,
                });
                window.google.accounts.id.renderButton(
                    document.getElementById('googleSignInDiv'),
                    { 
                        theme: 'outline', 
                        size: 'large', 
                        width: 380, 
                        text: 'continue_with',
                        shape: 'pill'
                    }
                );
            } else {
                setTimeout(initGoogle, 500);
            }
        };
        initGoogle();
    }, []);

    return (
        <div className="max-w-md mx-auto mt-12 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl">
                <h2 className="text-3xl font-extrabold text-center mb-2 text-gray-800 tracking-tight">Welcome Back</h2>
                <p className="text-gray-500 text-center mb-8 text-sm">Prepare for your next career step with AI</p>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm flex items-start gap-2 shadow-sm">
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Google Sign In Button */}
                <div className="mb-6 relative">
                    {googleLoading && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full z-10">
                            <svg className="animate-spin h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                    )}
                    <div id="googleSignInDiv" className="w-full flex justify-center min-h-[44px]"></div>
                </div>

                <div className="flex items-center my-6">
                    <div className="border-t border-gray-200 grow"></div>
                    <span className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">or sign in with email</span>
                    <div className="border-t border-gray-200 grow"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 tracking-wider">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading || googleLoading}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Password</label>
                            <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading || googleLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || googleLoading}
                        className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Signing In...
                            </>
                        ) : 'Sign In'}
                    </button>
                </form>

                <p className="text-center mt-8 text-gray-500 text-sm">
                    Don't have an account? <Link to="/register" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
