import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { Line, Radar, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    LineElement,
    BarElement,
    Filler,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import {
    Award,
    TrendingUp,
    Target,
    BookOpen,
    Briefcase,
    Brain,
    Compass,
    HelpCircle,
    Send,
    CheckCircle2,
    Settings,
    ShieldAlert,
    Zap,
    BarChart3,
    Check,
    User,
    Sparkles,
    Calendar,
    ChevronRight,
    MapPin,
    AlertCircle
} from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    LineElement,
    BarElement,
    Filler,
    Title,
    Tooltip,
    Legend
);

const AVAILABLE_ROLES = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "React Developer",
    "Node.js Developer",
    "Java Developer",
    "Python Developer",
    "AI Engineer",
    "Data Analyst",
    "DevOps Engineer",
    "Cloud Engineer"
];

const AVAILABLE_COMPANIES = [
    "Google",
    "Microsoft",
    "Amazon",
    "Netflix",
    "Meta",
    "Adobe",
    "Oracle",
    "Salesforce",
    "TCS",
    "Infosys",
    "Wipro",
    "Accenture"
];

// Mock company analytics database
const COMPANY_PREP_DATA = {
    "Google": { difficulty: "Hard", topics: ["Algorithms (Graphs, Trees)", "System Design (Scalability)", "Dynamic Programming"], practice: "Hard DSA & System Scaling" },
    "Microsoft": { difficulty: "Medium-Hard", topics: ["Data Structures (LinkedList, Arrays)", "System Design", "OS & Networking Foundations"], practice: "Standard DSA & Low-Level Design" },
    "Amazon": { difficulty: "Hard", topics: ["Leadership Principles Scenario", "System Architecture", "Graph Algorithms"], practice: "Behavioral Situations & High-Load Design" },
    "Netflix": { difficulty: "Hard", topics: ["Concurrency & Scalability", "System Architecture", "Soft Skills / Company Culture Match"], practice: "Cultural Alignment & Distributed Systems" },
    "Meta": { difficulty: "Hard", topics: ["Coding Execution Speed", "System Design", "Product Architecture Case Studies"], practice: "LeetCode Speed Run & Large Scale Design" },
    "Adobe": { difficulty: "Medium-Hard", topics: ["Object-Oriented Design", "Data Structures", "Front-end Architecture"], practice: "OOP Case Studies & UI Optimization" },
    "Oracle": { difficulty: "Medium-Hard", topics: ["Database Schema Tuning", "Java Architecture", "REST APIs Design"], practice: "DB Tuning & Low-Level Concurrency" },
    "Salesforce": { difficulty: "Medium", topics: ["Cloud SaaS Architecture", "API Integrations", "Design Patterns"], practice: "Design Patterns & Security Auditing" },
    "TCS": { difficulty: "Easy-Medium", topics: ["OOP Foundations", "Basic SQL Queries", "Software Development Lifecycle"], practice: "Core Java/Python & Basic Database queries" },
    "Infosys": { difficulty: "Easy-Medium", topics: ["Basic Coding Algorithms", "DBMS Foundations", "Web Basics (HTML/CSS)"], practice: "OOP Syntax & Web Foundations" },
    "Wipro": { difficulty: "Easy-Medium", topics: ["Logic & Array algorithms", "Basic DB Queries", "Web Applications Basics"], practice: "Logic Building & Basic Coding" },
    "Accenture": { difficulty: "Medium", topics: ["Agile/Scrum Methodologies", "Basic System Design", "SaaS Cloud Integrations"], practice: "Scenario-based case interviews" }
};

function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Interactive Preferences
    const [selectedRole, setSelectedRole] = useState("Full Stack Developer");
    const [selectedCompany, setSelectedCompany] = useState("Google");
    
    // AI Coach Interaction
    const [coachMessages, setCoachMessages] = useState([
        { sender: 'coach', text: "Hello! I am your AI Career Coach. Ask me how to improve your preparation, how to land target companies, or details about your skill gaps!" }
    ]);
    const [coachInput, setCoachInput] = useState("");
    const [sendingCoachMsg, setSendingCoachMsg] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const { data } = await api.get('/dashboard');
                setDashboardData(data);
                setSelectedRole(data.roleTracking.targetRole);
                setSelectedCompany(data.user.targetCompany);

                const { data: interviewData } = await api.get('/interview/history');
                setInterviews(interviewData);
            } catch (err) {
                console.error("Dashboard failed to retrieve profile metrics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // Handles target role change
    const handleRoleChange = async (newRole) => {
        setSelectedRole(newRole);
        try {
            const { data } = await api.post('/dashboard/preferences', { targetRole: newRole });
            // Re-fetch dashboard data to compute new matching %
            const { data: freshData } = await api.get('/dashboard');
            setDashboardData(freshData);
        } catch (err) {
            console.error("Failed to update target role:", err);
        }
    };

    // Handles target company change
    const handleCompanyChange = async (newCompany) => {
        setSelectedCompany(newCompany);
        try {
            await api.post('/dashboard/preferences', { targetCompany: newCompany });
            // Re-fetch dashboard data
            const { data: freshData } = await api.get('/dashboard');
            setDashboardData(freshData);
        } catch (err) {
            console.error("Failed to update target company:", err);
        }
    };

    // Handles toggling roadmap task
    const handleToggleRoadmap = async (weekNum) => {
        try {
            await api.post('/dashboard/roadmap/toggle', { weekNum });
            // Re-fetch dashboard data
            const { data: freshData } = await api.get('/dashboard');
            setDashboardData(freshData);
        } catch (err) {
            console.error("Failed to toggle roadmap week:", err);
        }
    };

    // Handles sending AI coach message
    const handleSendCoachMsg = async (e) => {
        e.preventDefault();
        if (!coachInput.trim()) return;

        const userMsg = { sender: 'user', text: coachInput };
        setCoachMessages(prev => [...prev, userMsg]);
        setCoachInput("");
        setSendingCoachMsg(true);

        try {
            const { data } = await api.post('/dashboard/coach', { message: userMsg.text });
            setCoachMessages(prev => [...prev, { sender: 'coach', text: data.reply }]);
        } catch (err) {
            setCoachMessages(prev => [...prev, { sender: 'coach', text: "Sorry, I'm currently offline. Keep practicing data structures and complete another mock interview!" }]);
        } finally {
            setSendingCoachMsg(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto py-32 text-center space-y-4">
                <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-slate-500 font-semibold">Assembling your SaaS Headquarters metrics...</p>
            </div>
        );
    }

    const { user, analytics, roleTracking, insights } = dashboardData;
    const completedInterviews = interviews.filter(i => i.status === 'completed');
    const hasResume = user.profileStrength > 35 && user.learningTracker;

    // --- CHARTS CONFIGURATION ---

    // 1. Line Performance Chart
    const lineLabels = completedInterviews.map((item, idx) => `Session ${idx + 1}`).reverse();
    const lineScores = completedInterviews.map(item => item.overallScore || 0).reverse();
    const lineChartData = {
        labels: lineLabels.length > 0 ? lineLabels : ['No Sessions'],
        datasets: [
            {
                label: 'Performance Trend',
                data: lineScores.length > 0 ? lineScores : [0],
                borderColor: 'rgba(99, 102, 241, 1)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: 'rgba(99, 102, 241, 1)'
            }
        ]
    };

    // 2. Skill Matrix Radar Chart
    // Categorized averages based on resume skills
    const frontendMatchCount = roleTracking.currentSkills.filter(s => ["React", "Next.js", "HTML", "CSS", "JavaScript", "TypeScript", "Tailwind"].includes(s)).length;
    const backendMatchCount = roleTracking.currentSkills.filter(s => ["Node.js", "Express", "MongoDB", "SQL", "Redis", "Docker"].includes(s)).length;
    const dsaScore = analytics.averageScore > 0 ? Math.round(analytics.averageScore * 0.9) : 40;
    const softSkillsScore = analytics.averageScore > 0 ? Math.round(analytics.averageScore * 1.05) : 60;

    const radarChartData = {
        labels: ['Frontend Core', 'Backend Engineering', 'Problem Solving (DSA)', 'Soft Skills (Communication)'],
        datasets: [
            {
                label: 'Skill Level %',
                data: [
                    Math.min(100, 30 + frontendMatchCount * 15),
                    Math.min(100, 30 + backendMatchCount * 15),
                    Math.min(100, dsaScore),
                    Math.min(100, softSkillsScore)
                ],
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderColor: 'rgba(139, 92, 246, 1)',
                pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 2
            }
        ]
    };

    // 3. Bar Growth Chart
    const barChartData = {
        labels: ['Technical Base', 'Coding Speed', 'System Scaling', 'HR Competency'],
        datasets: [
            {
                label: 'Hiring Benchmark',
                data: [85, 80, 75, 90],
                backgroundColor: 'rgba(226, 232, 240, 0.8)',
                borderRadius: 8
            },
            {
                label: 'Your Current Standing',
                data: [
                    analytics.averageScore || 50,
                    Math.min(100, (analytics.averageScore || 50) - 5),
                    Math.min(100, (analytics.averageScore || 50) - 10),
                    Math.min(100, (analytics.averageScore || 50) + 5)
                ],
                backgroundColor: 'rgba(99, 102, 241, 0.85)',
                borderRadius: 8
            }
        ]
    };

    // AI Career Score Badge Determine
    let badgeText = "Beginner";
    if (analytics.averageScore >= 85 && roleTracking.skillMatchPercent >= 80) badgeText = "Industry Ready";
    else if (analytics.averageScore >= 70) badgeText = "Interview Ready";
    else if (analytics.averageScore >= 55) badgeText = "Advanced";
    else if (analytics.averageScore >= 40) badgeText = "Intermediate";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
            
            {/* Header Dashboard Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 py-10 px-6 text-white border-b border-indigo-900/40">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <span className="bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                            <Sparkles className="w-3.5 h-3.5" /> AI CAREER CONSOLE
                        </span>
                        <h1 className="text-4xl font-extrabold mt-3 tracking-tight">Welcome back, {user.name}</h1>
                        <p className="text-slate-400 text-sm mt-1">Manage and track your professional interview readiness headquarters.</p>
                    </div>

                    <Link 
                        to="/interview-setup"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 active:scale-95 transition-all text-sm flex items-center gap-2 cursor-pointer border border-indigo-500/40"
                    >
                        <Zap className="w-4 h-4 fill-white" /> Start Practice Simulation
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
                
                {/* 1. Profile Summary Card & AI Career Score Ring */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* User Metadata Profile Card */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
                        <div className="flex items-center gap-4 text-left">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/25" />
                            ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-2xl uppercase rounded-full flex items-center justify-center">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg leading-tight">{user.fullName}</h3>
                                <p className="text-xs text-slate-400 truncate max-w-[170px]">{user.email}</p>
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded mt-1.5 inline-block">
                                    Mid Level
                                </span>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        <div className="space-y-4">
                            {/* Role Select Form */}
                            <div className="text-left space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Role</label>
                                <select 
                                    value={selectedRole} 
                                    onChange={(e) => handleRoleChange(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
                                >
                                    {AVAILABLE_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                            </div>

                            {/* Company Select Form */}
                            <div className="text-left space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Company</label>
                                <select 
                                    value={selectedCompany} 
                                    onChange={(e) => handleCompanyChange(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
                                >
                                    {AVAILABLE_COMPANIES.map(co => <option key={co} value={co}>{co}</option>)}
                                </select>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Resume progress bar */}
                        <div className="space-y-1.5 text-left">
                            <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-slate-500">Resume Strength Score</span>
                                <span className="text-indigo-600">{user.profileStrength}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${user.profileStrength}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* AI Career Score Animated Ring */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                        <div className="text-left w-full">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Career Readiness Metric</span>
                        </div>
                        
                        <div className="relative w-36 h-36 flex items-center justify-center mt-2">
                            {/* Circular progress SVG */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="72" cy="72" r="60" className="stroke-slate-100 fill-none" strokeWidth="12" />
                                <circle 
                                    cx="72" 
                                    cy="72" 
                                    r="60" 
                                    className="stroke-indigo-600 fill-none transition-all duration-700" 
                                    strokeWidth="12" 
                                    strokeDasharray={2 * Math.PI * 60} 
                                    strokeDashoffset={2 * Math.PI * 60 * (1 - (roleTracking.jobReadiness || 0) / 100)} 
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-slate-800">{roleTracking.jobReadiness}%</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Hiring Score</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full border border-indigo-100">
                                {badgeText}
                            </span>
                            <p className="text-slate-400 text-[10px] pt-1">Computed dynamically from skills, scores, & frequencies.</p>
                        </div>
                    </div>

                    {/* Target Role Skill Match Metrics */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Role Match Analytics</span>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-slate-400 font-bold">Target Position</div>
                                <div className="text-lg font-extrabold text-slate-800 mt-0.5">{roleTracking.targetRole}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Skills</div>
                                    <div className="text-xl font-extrabold text-slate-800 mt-1">{roleTracking.requiredSkills.length}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skill Match %</div>
                                    <div className="text-xl font-extrabold text-indigo-600 mt-1">{roleTracking.skillMatchPercent}%</div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-slate-400 mb-1.5">Missing Core Skills</div>
                                <div className="flex flex-wrap gap-1">
                                    {roleTracking.missingSkills.length === 0 ? (
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">All skills acquired! 🎉</span>
                                    ) : (
                                        roleTracking.missingSkills.map(skill => (
                                            <span key={skill} className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                                {skill}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Interactive Charts & Skill Matrix (Radar) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Radar Skill Matrix */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 lg:col-span-1">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                            <h3 className="text-base font-bold text-slate-800 text-left">AI Skill Matrix</h3>
                            <Brain className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="h-60 relative flex justify-center items-center">
                            <Radar data={radarChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </div>

                    {/* line scoring trends */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 lg:col-span-2">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                            <h3 className="text-base font-bold text-slate-800 text-left">Interview Performance Analytics</h3>
                            <BarChart3 className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="h-60 relative">
                            <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </div>
                </div>

                {/* 3. Strengths, Weaknesses, and Skill Gap Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* AI Strengths */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
                        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-green-500" /> AI Strength Analysis
                        </h4>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-slate-700 flex justify-between">
                                    <span>Core UI Architecture</span>
                                    <span className="text-green-600 font-extrabold">92%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full rounded-full" style={{ width: '92%' }}></div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-slate-700 flex justify-between">
                                    <span>Client-Server Integration</span>
                                    <span className="text-green-600 font-extrabold">85%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-slate-700 flex justify-between">
                                    <span>Communication & Tone</span>
                                    <span className="text-green-600 font-extrabold">88%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full rounded-full" style={{ width: '88%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Weaknesses */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
                        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-rose-500" /> AI Weakness Detection
                        </h4>
                        <div className="space-y-3 text-xs leading-normal">
                            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl">
                                <div className="font-bold text-rose-800">Dynamic Programming (DSA)</div>
                                <div className="text-[10px] text-rose-500 font-semibold mt-0.5">Impact: High Severity</div>
                                <div className="text-[10px] text-slate-500 mt-1">Struggles with recursion-memoization cache bounds.</div>
                            </div>
                            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl">
                                <div className="font-bold text-rose-800">Database Schema Optimizations</div>
                                <div className="text-[10px] text-rose-500 font-semibold mt-0.5">Impact: Medium Severity</div>
                                <div className="text-[10px] text-slate-500 mt-1">Occasional query-tuning indexing omission gaps.</div>
                            </div>
                        </div>
                    </div>

                    {/* Learning Streaks & Gamification */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
                        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-indigo-500" /> Study Streaks & Gamification
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-center">
                                <div className="text-2xl">🔥</div>
                                <div className="text-lg font-black text-indigo-800 mt-1">{user.learningTracker.dailyStreak} Days</div>
                                <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Current Streak</div>
                            </div>
                            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100/50 text-center">
                                <div className="text-2xl">⚡</div>
                                <div className="text-lg font-black text-purple-800 mt-1">{user.learningTracker.totalStudyHours} Hours</div>
                                <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Total Study Time</div>
                            </div>
                        </div>
                        <div className="text-[10px] leading-normal text-slate-500 border-t border-slate-50 pt-2 text-center">
                            Completed **{user.learningTracker.coursesCompleted} courses** and solved **{user.learningTracker.codingChallengesSolved} coding problems**.
                        </div>
                    </div>
                </div>

                {/* 4. AI Interactive 6-Week Roadmap & Company Tracker */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Weekly Roadmap Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 lg:col-span-2 text-left">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <Compass className="w-4 h-4 text-indigo-500" /> AI Personalized Preparation Roadmap
                            </h3>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {Math.round((user.roadmap.filter(w => w.completed).length / 6) * 100)}% Complete
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {user.roadmap.map((week) => (
                                <div 
                                    key={week.week}
                                    onClick={() => handleToggleRoadmap(week.week)}
                                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 items-start select-none ${
                                        week.completed 
                                            ? 'bg-emerald-50/50 border-emerald-200' 
                                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200/60'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                        week.completed 
                                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                                            : 'border-slate-300 bg-white text-transparent'
                                    }`}>
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className={`text-xs font-bold ${week.completed ? 'text-emerald-800' : 'text-slate-800'}`}>
                                            Week {week.week}: {week.title}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-semibold truncate max-w-[240px]">
                                            {week.topics.join(' | ')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Target Company Preparation Prep Details */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                                <Target className="w-4 h-4 text-indigo-500" /> Target Company Analysis
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-slate-400 font-bold">Selected Target Company</div>
                                <div className="text-lg font-black text-slate-800">{user.targetCompany}</div>
                            </div>

                            <div className="space-y-3">
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                                    <div className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Expected Difficulty</div>
                                    <div className="font-bold text-slate-700">{COMPANY_PREP_DATA[user.targetCompany]?.difficulty || 'Hard'}</div>
                                </div>

                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1.5">
                                    <div className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Frequently Asked Topics</div>
                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                        {(COMPANY_PREP_DATA[user.targetCompany]?.topics || ["Data Structures", "Algorithms"]).map(t => (
                                            <span key={t} className="text-[9px] font-extrabold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                                    <div className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Recommended Practice Area</div>
                                    <div className="font-semibold text-slate-600">{COMPANY_PREP_DATA[user.targetCompany]?.practice || 'General Algorithms'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Achievements Badge Gallery */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 text-left">
                    <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-500" /> Profile Achievements Gallery
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {[
                            { name: "First Step", desc: "Started first mock session", emoji: "🌱" },
                            { name: "Consistent Learner", desc: "5+ sessions taken", emoji: "🔥" },
                            { name: "Interview Veteran", desc: "10+ sessions taken", emoji: "🏆" },
                            { name: "Score Master", desc: "Achieved 90+ overall score", emoji: "💎" },
                            { name: "Coding Ninja", desc: "Passed all coding assert tests", emoji: "⚔️" }
                        ].map((badge) => {
                            const unlocked = user.achievements.includes(badge.name);
                            return (
                                <div 
                                    key={badge.name} 
                                    className={`p-4 rounded-2xl border text-center space-y-2 flex flex-col items-center transition-all ${
                                        unlocked 
                                            ? 'bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border-indigo-100 shadow-sm hover:scale-105' 
                                            : 'bg-slate-50 border-slate-200/50 opacity-40 filter grayscale select-none'
                                    }`}
                                >
                                    <div className="text-3xl">{badge.emoji}</div>
                                    <div className="font-extrabold text-xs text-slate-700 leading-tight">{badge.name}</div>
                                    <div className="text-[9px] text-slate-400 font-medium leading-normal">{badge.desc}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 6. AI Career Coach Interactive Chat & Interview Logs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Interactive Career Coach Chat */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 lg:col-span-2 flex flex-col justify-between h-[450px]">
                        <div className="border-b border-slate-50 pb-2 flex justify-between items-center">
                            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                                <User className="w-4 h-4 text-purple-500" /> AI Career Mentor Coach
                            </h3>
                            <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">Claude Powered</span>
                        </div>

                        {/* Messages logs */}
                        <div className="flex-1 overflow-y-auto space-y-3 my-4 pr-1 text-xs text-left">
                            {coachMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                                        msg.sender === 'user'
                                            ? 'bg-indigo-600 text-white font-semibold rounded-tr-none'
                                            : 'bg-slate-100 text-slate-800 font-medium rounded-tl-none border border-slate-200/40'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {sendingCoachMsg && (
                                <div className="flex justify-start">
                                    <div className="p-3 rounded-2xl rounded-tl-none bg-slate-100 text-slate-400 italic flex items-center gap-2">
                                        <svg className="animate-spin h-3.5 w-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Mentor is formulating response...
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input form */}
                        <form onSubmit={handleSendCoachMsg} className="flex gap-2">
                            <input 
                                type="text" 
                                value={coachInput}
                                onChange={(e) => setCoachInput(e.target.value)}
                                placeholder="Ask mentor: What should I learn next? How do I improve React?"
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-indigo-500 font-semibold"
                            />
                            <button 
                                type="submit"
                                disabled={sendingCoachMsg || !coachInput.trim()}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 flex items-center justify-center active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <Send className="w-4 h-4 fill-white" />
                            </button>
                        </form>
                    </div>

                    {/* Interview History Logs */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between h-[450px]">
                        <div className="border-b border-slate-50 pb-2 text-left">
                            <h3 className="text-base font-bold text-slate-800">Recent Sessions</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 my-2 pr-1">
                            {completedInterviews.length === 0 ? (
                                <div className="text-slate-400 text-center py-24 italic text-xs">
                                    No completed sessions yet. Start your first session!
                                </div>
                            ) : (
                                completedInterviews.map((item) => (
                                    <div key={item._id} className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100/80 transition-all text-[11px]">
                                        <div className="text-left space-y-0.5">
                                            <div className="font-bold text-slate-800">{item.role}</div>
                                            <div className="text-[9px] text-slate-400 font-semibold">{item.experienceLevel} level | {item.mode}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <span className="font-bold text-slate-800">{item.overallScore || 0}% Score</span>
                                                <div className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">{new Date(item.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            <Link 
                                                to={`/report/${item._id}`}
                                                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1 rounded-lg font-bold transition-all shrink-0"
                                            >
                                                Report
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
