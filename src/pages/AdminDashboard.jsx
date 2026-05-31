import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, violations, logs
    
    // Platform metrics
    const [analytics, setAnalytics] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    
    // User search states
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userInterviews, setUserInterviews] = useState([]);
    
    // Violations & Logs lists
    const [violations, setViolations] = useState([]);
    const [adminLogs, setAdminLogs] = useState([]);

    const [loading, setLoading] = useState(true);

    // Fetch Overview metrics
    useEffect(() => {
        const fetchOverviewData = async () => {
            try {
                const { data: analyticData } = await api.get('/admin/analytics');
                setAnalytics(analyticData);
                
                const { data: leaderboardData } = await api.get('/admin/leaderboard');
                setLeaderboard(leaderboardData);
            } catch (err) {
                console.error("Failed to load analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOverviewData();
    }, []);

    // Load tab contents on click
    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        setLoading(true);
        try {
            if (tab === 'users') {
                await fetchUsers();
            } else if (tab === 'violations') {
                const { data } = await api.get('/admin/violations');
                setViolations(data);
            } else if (tab === 'logs') {
                const { data } = await api.get('/admin/logs');
                setAdminLogs(data);
            }
        } catch (err) {
            console.error(`Failed to load tab data for ${tab}:`, err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        const { data } = await api.get(`/admin/users?query=${searchQuery}`);
        setUsers(data);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    const inspectUser = async (user) => {
        try {
            const { data } = await api.get(`/admin/users/${user._id}/interviews`);
            setSelectedUser(data.user);
            setUserInterviews(data.interviews);
        } catch (err) {
            alert('Failed to inspect user interviews.');
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto py-6 px-4">
            {/* Page Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Console</h2>
                    <p className="text-slate-500 text-sm">Monitor platform metrics, suspicious behavior, and audit logs</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-xl gap-2 font-bold text-xs">
                    {['overview', 'users', 'violations', 'logs'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-4.5 py-2.5 rounded-lg capitalize transition-all cursor-pointer ${
                                activeTab === tab 
                                    ? 'bg-white text-primary-600 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {tab === 'violations' ? 'Anti-Cheat Audit' : tab}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-slate-500 font-semibold">Retrieving administration data...</p>
                </div>
            ) : (
                <>
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && analytics && (
                        <div className="space-y-8">
                            {/* Analytics cards grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Registered Users</span>
                                    <span className="text-4xl font-black text-slate-800">{analytics.totalUsers}</span>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Interviews Logged</span>
                                    <span className="text-4xl font-black text-slate-800">{analytics.totalInterviews}</span>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average Platform Score</span>
                                    <span className="text-4xl font-black text-primary-600">{analytics.averagePlatformScore} / 100</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Leaderboard */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2">User Leaderboard (Top Performers)</h3>
                                    <div className="space-y-3">
                                        {leaderboard.map((user, idx) => (
                                            <div key={user._id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-all">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-black text-slate-400 w-4">#{idx + 1}</span>
                                                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs uppercase">
                                                        {(user.name || user.fullName || 'U').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-800">{user.name || user.fullName}</div>
                                                        <div className="text-[10px] text-slate-400">{user.email}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-black text-primary-600">{user.averageScore}</span>
                                                    <div className="text-[9px] text-slate-400 font-semibold">{user.interviewsTaken} taken</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Platform Insights */}
                                <div className="space-y-6">
                                    {/* Most Popular Roles */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2">Most Popular Roles</h3>
                                        <div className="space-y-3">
                                            {analytics.popularRoles?.map((role, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                                    <span>{role._id || 'Unknown Role'}</span>
                                                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px]">{role.count} sessions</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Weakest skills */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2">Weakest Skills Across Platform</h3>
                                        <div className="space-y-3">
                                            {analytics.weakestSkills?.map((sk, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs font-semibold p-3 border-l-4 border-rose-500 bg-rose-50/30 rounded-r-xl">
                                                    <span className="text-slate-700 font-bold">{sk.skill}</span>
                                                    <span className="text-rose-600 font-black">Avg: {Math.round(sk.score)}/100</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            {/* Search bar */}
                            <form onSubmit={handleSearchSubmit} className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or username..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="grow px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-800"
                                />
                                <button
                                    type="submit"
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold cursor-pointer text-sm"
                                >
                                    Search Users
                                </button>
                            </form>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Search list results */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 lg:col-span-1 max-h-[500px] overflow-y-auto">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-50">Search Results</h4>
                                    {users.length === 0 ? (
                                        <div className="text-center py-10 text-slate-400 text-xs italic">No users found. Try searching.</div>
                                    ) : (
                                        users.map(u => (
                                            <div
                                                key={u._id}
                                                onClick={() => inspectUser(u)}
                                                className={`p-3 rounded-xl border cursor-pointer text-left transition-all ${
                                                    selectedUser?._id === u._id 
                                                        ? 'border-primary-500 bg-primary-50/20' 
                                                        : 'border-slate-100 hover:bg-slate-50'
                                                }`}
                                            >
                                                <div className="font-bold text-xs text-slate-800">{u.name || u.fullName}</div>
                                                <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* User Details Inspection */}
                                <div className="lg:col-span-2 space-y-4">
                                    {selectedUser ? (
                                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6 text-left">
                                            <div className="border-b border-slate-100 pb-4">
                                                <h3 className="text-xl font-black text-slate-800">{selectedUser.name || selectedUser.fullName}</h3>
                                                <p className="text-xs text-slate-400">Email: {selectedUser.email} | Provider: {selectedUser.authProvider}</p>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interviews History</h4>
                                                {userInterviews.length === 0 ? (
                                                    <div className="text-center py-6 text-slate-400 text-xs italic">This user hasn't completed any sessions yet.</div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {userInterviews.map((int, i) => (
                                                            <div key={int._id} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                                                                <div>
                                                                    <div className="font-bold text-slate-800">{int.role}</div>
                                                                    <div className="text-[10px] text-slate-400 capitalize">{int.level} level | {int.mode}</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="font-bold text-primary-600">{int.overallScore || 0} Score</span>
                                                                    <div className="text-[10px] text-slate-400">{int.status}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white p-20 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400 text-sm italic">
                                            Select a user from the results list to inspect details.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ANTI-CHEAT AUDIT TAB */}
                    {activeTab === 'violations' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2 text-left">Flagged Suspicious Behavior Audit</h3>
                            {violations.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-xs italic">No suspicious events flagged. Platform integrity intact!</div>
                            ) : (
                                <div className="overflow-x-auto text-left">
                                    <table className="w-full text-sm text-slate-600 border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-bold text-left">
                                                <th className="py-3 px-4">User</th>
                                                <th className="py-3 px-4">Role / Session</th>
                                                <th className="py-3 px-4 text-center">Violations Count</th>
                                                <th className="py-3 px-4">Status</th>
                                                <th className="py-3 px-4">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {violations.map(violation => (
                                                <tr key={violation._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-bold text-slate-800 text-xs">{violation.user?.name || violation.user?.fullName}</div>
                                                        <div className="text-[10px] text-slate-400">{violation.user?.email}</div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">{violation.role}</td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-bold font-mono">
                                                            {violation.suspiciousEvents}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-xs capitalize">{violation.status}</td>
                                                    <td className="py-3.5 px-4 text-xs text-slate-400">{new Date(violation.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* LOGS TAB */}
                    {activeTab === 'logs' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2 text-left">Admin Operations Audit Trail</h3>
                            <div className="space-y-3 text-left">
                                {adminLogs.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 text-xs italic">No operations logged yet.</div>
                                ) : (
                                    adminLogs.map(log => (
                                        <div key={log._id} className="p-3 border-l-4 border-slate-400 bg-slate-50 rounded-r-xl flex justify-between items-center text-xs">
                                            <div className="space-y-1">
                                                <div className="font-semibold text-slate-700">{log.action}</div>
                                                <div className="text-[10px] text-slate-400">Admin: {log.userId?.email} ({log.userId?.role})</div>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default AdminDashboard;
