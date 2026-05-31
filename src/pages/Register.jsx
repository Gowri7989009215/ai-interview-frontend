import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';

function Register({ setUser }) {
    // Form fields
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // OTP verification fields
    const [otp, setOtp] = useState('');
    const [otpStep, setOtpStep] = useState(false);
    
    // UI states
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Cooldown timer for OTP Resend
    const [cooldown, setCooldown] = useState(0);

    const navigate = useNavigate();

    // Timer effect for Resend Cooldown
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    // Handle form submit (send OTP)
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match.');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters long.');
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/register/send-otp', {
                fullName,
                email,
                password
            });
            setSuccess(data.message || 'OTP verification code sent to your email.');
            setOtpStep(true);
            setCooldown(60); // Start 60s cooldown
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check details and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP verification
    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (otp.length !== 6 || isNaN(otp)) {
            return setError('Verification code must be a 6-digit number.');
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/register/verify-otp', {
                email,
                otp
            });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please ensure the code is correct.');
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP Resend
    const handleResendOTP = async () => {
        if (cooldown > 0) return;
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register/send-otp', {
                fullName,
                email,
                password
            });
            setSuccess('A new verification code has been sent to your email.');
            setCooldown(60); // Reset 60s cooldown
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    // Callback for Google Sign In
    const handleGoogleCallback = async (response) => {
        setGoogleLoading(true);
        setError('');
        setSuccess('');
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
                    document.getElementById('googleSignUpDiv'),
                    { 
                        theme: 'outline', 
                        size: 'large', 
                        width: 380, 
                        text: 'signup_with',
                        shape: 'pill'
                    }
                );
            } else {
                setTimeout(initGoogle, 500);
            }
        };
        // Only render google login button if we are on step 1
        if (!otpStep) {
            initGoogle();
        }
    }, [otpStep]);

    return (
        <div className="max-w-md mx-auto mt-12 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl">
                <h2 className="text-3xl font-extrabold text-center mb-2 text-gray-800 tracking-tight">
                    {otpStep ? 'Verify Account' : 'Create Account'}
                </h2>
                <p className="text-gray-500 text-center mb-8 text-sm">
                    {otpStep ? `We sent a code to ${email}` : 'Join ProInterview AI and land your dream job'}
                </p>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm flex items-start gap-2 shadow-sm animate-pulse">
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 text-sm flex items-start gap-2 shadow-sm">
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{success}</span>
                    </div>
                )}

                {!otpStep ? (
                    <>
                        {/* Google Sign Up Button */}
                        <div className="mb-6 relative">
                            {googleLoading && (
                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full z-10">
                                    <svg className="animate-spin h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                </div>
                            )}
                            <div id="googleSignUpDiv" className="w-full flex justify-center min-h-[44px]"></div>
                        </div>

                        <div className="flex items-center my-6">
                            <div className="border-t border-gray-200 grow"></div>
                            <span className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">or register with email</span>
                            <div className="border-t border-gray-200 grow"></div>
                        </div>

                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 tracking-wider">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    disabled={loading || googleLoading}
                                />
                            </div>
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
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 tracking-wider">Password</label>
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
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 tracking-wider">Confirm Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading || googleLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || googleLoading}
                                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending Code...
                                    </>
                                ) : 'Register & Verify'}
                            </button>
                        </form>
                    </>
                ) : (
                    <form onSubmit={handleVerifySubmit} className="space-y-6">
                        <div className="text-center text-sm text-gray-600">
                            Please check your inbox. We have sent a 6-digit OTP verification code to complete your registration.
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase mb-2 tracking-wider text-center">Verification Code (6 Digits)</label>
                            <input
                                type="text"
                                maxLength="6"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-center text-2xl font-bold tracking-[8px] text-gray-800 placeholder-gray-300"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Verifying...
                                </>
                            ) : 'Verify & Sign In'}
                        </button>

                        <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                            <div>Didn't receive code?</div>
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={cooldown > 0 || loading}
                                className="text-primary-600 font-bold hover:text-primary-700 disabled:text-gray-400 disabled:pointer-events-none transition-colors"
                            >
                                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Verification Code'}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setOtpStep(false);
                                setOtp('');
                                setError('');
                                setSuccess('');
                            }}
                            className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl font-semibold text-gray-600 transition-all text-sm"
                        >
                            Back to Signup
                        </button>
                    </form>
                )}

                <p className="text-center mt-8 text-gray-500 text-sm">
                    Already have an account? <Link to="/login" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">Sign In</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
