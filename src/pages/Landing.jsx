import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
    return (
        <div className="space-y-24 py-10 max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="relative text-center space-y-8 mt-10">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-sky-400 to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"></div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100 shadow-sm uppercase tracking-wider">
                    ✨ Top 1% AI SaaS Platform
                </span>

                <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight max-w-4xl mx-auto">
                    Master Technical Interviews with <span className="bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">Adaptive AI</span>
                </h1>
                
                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    Upload your resume and get clinical practice with our adaptive LLM engine.
                    Evaluates verbal responses, monitors coding rounds in real time, and compiles performance metrics.
                </p>

                <div className="flex gap-4 justify-center pt-4">
                    <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-primary-500/20 transition-all active:scale-95">
                        Get Started Free
                    </Link>
                    <a href="#features" className="bg-white hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-2xl text-lg font-bold border border-slate-200 transition-all shadow-sm">
                        Explore Features
                    </a>
                </div>

                {/* Decorative mock dashboard */}
                <div className="pt-10 max-w-4xl mx-auto">
                    <div className="bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 relative group overflow-hidden">
                        <div className="aspect-16/9 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-left relative flex flex-col justify-between overflow-hidden shadow-inner">
                            {/* Glass overlay */}
                            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[1px]"></div>
                            
                            <div className="flex justify-between items-center z-10">
                                <div className="flex gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                </div>
                                <div className="px-3 py-1 bg-white/10 rounded-lg text-xs font-mono text-white/70">http://localhost:5173/interview</div>
                            </div>
                            
                            <div className="my-auto z-10 max-w-xl space-y-4">
                                <span className="px-2.5 py-0.5 bg-primary-500/20 text-primary-300 rounded-md font-mono text-[10px] uppercase tracking-wider">Question 3 of 5</span>
                                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                                    "Explain the difference between call, apply, and bind in JavaScript, and show an example of bind."
                                </h3>
                                <div className="w-full bg-white/5 border border-white/10 h-20 rounded-xl p-3 font-mono text-xs text-white/50">
                                    const boundFunc = greet.bind(user, "hello");
                                    // binding this context...
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center z-10 text-white/40 text-xs font-mono">
                                <div>🎙️ AI listening: Speak your answer...</div>
                                <div>⏳ 01:45 remaining</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Showcase */}
            <div id="features" className="space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Features Built For Elite Preparation</h2>
                    <p className="text-slate-500 text-lg max-w-xl mx-auto">Replicate actual top-tier engineering interview stages</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "AI Resume Parsing", desc: "Upload PDFs. Our LLM extracts your unique skills and projects to calibrate interview sessions.", icon: "📄" },
                        { title: "Adaptive Interview Engine", desc: "Questions calibrate dynamic difficulty on the fly based on the depth of your answers.", icon: "🎯" },
                        { title: "Voice & Speech Analysis", desc: "Speak naturally. Integrated Browser Speech API captures verbal flow and communication confidence.", icon: "🎙️" },
                        { title: "Monaco Code Sandbox", desc: "Solve challenges directly in a live coding environment. Executes JavaScript code safely in an isolated VM.", icon: "💻" },
                        { title: "Anti-Cheat Tracking", desc: "Maintains integrity by logging blur, switches, devtools access, and rapid copy/paste triggers.", icon: "🛡️" },
                        { title: "Hiring Reports", desc: "Visual radar score breakdowns, weaknesses maps, and AI-recommended learning paths.", icon: "📊" }
                    ].map((feat, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-md hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300">
                            <div className="text-3xl mb-4 bg-slate-50 w-12 h-12 flex items-center justify-center rounded-xl">{feat.icon}</div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{feat.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-slate-950 text-white rounded-3xl p-12 text-center space-y-10 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl"></div>
                <div className="absolute left-0 bottom-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl"></div>

                <div className="max-w-xl mx-auto space-y-4">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Flexible SaaS Pricing</h2>
                    <p className="text-slate-400">Scale up your preparation to match your career goals</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-6 text-left">
                    <div className="bg-white/5 border border-white/10 p-8 rounded-2xl relative flex flex-col justify-between">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-300 uppercase tracking-widest">Free tier</h3>
                            <div className="text-4xl font-black">$0 <span className="text-sm font-normal text-slate-400">/ forever</span></div>
                            <p className="text-slate-400 text-sm">Practice standard interviews without payment.</p>
                            <ul className="space-y-2.5 text-sm text-slate-300 pt-4">
                                <li className="flex items-center gap-2">✓ 2 Resume Uploads</li>
                                <li className="flex items-center gap-2">✓ Standard Q&A sessions</li>
                                <li className="flex items-center gap-2">✓ Basic AI scoring</li>
                            </ul>
                        </div>
                        <Link to="/register" className="mt-8 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold text-center block transition-all">Sign Up</Link>
                    </div>

                    <div className="bg-primary-600 border border-primary-500 p-8 rounded-2xl relative flex flex-col justify-between shadow-2xl shadow-primary-500/20">
                        <span className="absolute top-0 right-8 transform -translate-y-1/2 bg-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Recommended</span>
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold uppercase tracking-widest text-indigo-100">Pro Premium</h3>
                            <div className="text-4xl font-black">$29 <span className="text-sm font-normal text-indigo-200">/ month</span></div>
                            <p className="text-indigo-100 text-sm">Full platform access with advanced LLM analysis.</p>
                            <ul className="space-y-2.5 text-sm text-indigo-100 pt-4">
                                <li className="flex items-center gap-2">★ Unlimited uploads & sessions</li>
                                <li className="flex items-center gap-2">★ Full Monaco Code Sandbox evaluation</li>
                                <li className="flex items-center gap-2">★ Career Advisor roadmaps & project suggestions</li>
                                <li className="flex items-center gap-2">★ Visual Radar scorecards & PDF downloads</li>
                            </ul>
                        </div>
                        <Link to="/register" className="mt-8 bg-white text-primary-700 hover:bg-slate-50 py-3 rounded-xl font-bold text-center block transition-all shadow-lg active:scale-95">Get Unlimited Access</Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-100 pt-10 text-center text-slate-400 text-xs flex justify-between items-center">
                <div>© 2026 ProInterview AI SaaS platform. All rights reserved.</div>
                <div className="flex gap-4">
                    <Link to="/login" className="hover:text-primary-600">Privacy Policy</Link>
                    <Link to="/login" className="hover:text-primary-600">Terms of Use</Link>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
