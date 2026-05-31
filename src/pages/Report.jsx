import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

function Report() {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const { data } = await api.get(`/interview/${id}/report`);
                setReport(data);
            } catch (err) {
                alert('Failed to load performance report');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto py-20 text-center space-y-4">
                <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-slate-500 font-semibold">Compiling metrics and generating final report card...</p>
            </div>
        );
    }

    if (!report) return null;

    // Define chart scores safely
    const technicalScore = report.radarMetrics?.technical || report.skillScores?.technical || 50;
    const communicationScore = report.radarMetrics?.communication || report.skillScores?.communication || 50;
    const clarityScore = report.radarMetrics?.clarity || report.skillScores?.clarity || 50;
    const relevanceScore = report.radarMetrics?.relevance || report.skillScores?.relevance || 50;
    const depthScore = report.radarMetrics?.depth || report.skillScores?.depth || 50;

    const chartData = {
        labels: ['Technical Depth', 'Communication', 'Clarity', 'Relevance', 'Context Depth'],
        datasets: [
            {
                label: 'Score card',
                data: [technicalScore, communicationScore, clarityScore, relevanceScore, depthScore],
                backgroundColor: 'rgba(2, 132, 199, 0.2)',
                borderColor: 'rgba(2, 132, 199, 1)',
                borderWidth: 3,
                pointBackgroundColor: 'rgba(2, 132, 199, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(2, 132, 199, 1)'
            },
        ],
    };

    const radarOptions = {
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: { display: true },
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: { stepSize: 20 }
            }
        },
        plugins: {
            legend: { display: false }
        }
    };

    const overallScore = report.overallRating || report.overallScore || 0;
    const hiringScore = report.hiringReadinessScore || overallScore;
    const confidence = report.confidenceLevel || 'Medium';

    return (
        <div className="max-w-5xl mx-auto space-y-10 mb-20 px-4 print:my-0 print:p-0 print:space-y-6 print:max-w-full">
            {/* Header score card */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 print:shadow-none print:border-none print:p-0">
                <div className="space-y-3 text-center md:text-left">
                    <span className="bg-primary-50 text-primary-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider print:border print:border-slate-200">
                        Official Session Report
                    </span>
                    <h1 className="text-4xl font-extrabold text-slate-800 leading-tight">Performance Summary</h1>
                    <p className="text-slate-500 text-sm">Detailed feedback and growth map for **{report.role}** role</p>
                </div>

                <div className="flex gap-8 justify-center items-center">
                    {/* Overall Score Circle */}
                    <div className="relative w-36 h-36">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="72" cy="72" r="62" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                            <circle 
                                cx="72" 
                                cy="72" 
                                r="62" 
                                stroke="#0284c7" 
                                strokeWidth="10" 
                                fill="none"
                                strokeDasharray={389.5} 
                                strokeDashoffset={389.5 * (1 - overallScore / 100)} 
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-slate-800">{overallScore}</span>
                            <span className="text-[10px] font-bold text-slate-400">OVERALL RATING</span>
                        </div>
                    </div>

                    {/* Hiring Readiness Score */}
                    <div className="space-y-1 text-center md:text-left border-l border-slate-100 pl-8 print:border-none">
                        <div className="text-3xl font-black text-slate-800">{hiringScore}%</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hiring Readiness</div>
                        <div className="pt-2">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                confidence === 'High' ? 'bg-emerald-50 text-emerald-700' :
                                confidence === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                                {confidence} Confidence
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-6">
                {/* Radar Skill chart */}
                <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 space-y-4 print:shadow-none">
                    <h3 className="text-xl font-bold text-slate-800 border-b border-slate-50 pb-3">Radar Skill Map</h3>
                    <div className="h-72 relative">
                        <Radar data={chartData} options={radarOptions} />
                    </div>
                </div>

                {/* AI Summary Strengths/Weaknesses/Gaps */}
                <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 space-y-4 print:shadow-none">
                    <h3 className="text-xl font-bold text-slate-800 border-b border-slate-50 pb-3">AI Evaluation Metrics</h3>
                    <div className="space-y-4">
                        {/* Strengths */}
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Strengths</h4>
                            <div className="flex flex-wrap gap-2 pt-1.5">
                                {(report.strengths || report.summary?.strengths || ['Strong Communication', 'Problem Solving']).map((str, idx) => (
                                    <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-lg text-xs font-semibold">
                                        ✓ {str}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Weaknesses */}
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-semibold">Areas of Improvement</h4>
                            <div className="flex flex-wrap gap-2 pt-1.5">
                                {(report.weaknesses || report.summary?.weaknesses || ['Clarify code logic', 'Expand on frameworks']).map((wk, idx) => (
                                    <span key={idx} className="bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1 rounded-lg text-xs font-semibold">
                                        ✗ {wk}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Gaps */}
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-semibold">Skills Gaps Detected</h4>
                            <div className="flex flex-wrap gap-2 pt-1.5">
                                {(report.skillGaps || ['Docker', 'VM sandboxes']).map((gap, idx) => (
                                    <span key={idx} className="bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-lg text-xs font-semibold">
                                        ⚠ {gap}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations & Career roadmap */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 space-y-6 print:shadow-none">
                <h3 className="text-xl font-bold text-slate-800 border-b border-slate-50 pb-3">Claude AI Career Roadmap</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 print:grid-cols-3 print:gap-4">
                    {/* Topics to Study */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommended Topics</h4>
                        <ul className="space-y-1.5">
                            {(report.recommendations?.topics || ['Advanced JS Async patterns', 'Virtual contexts']).map((topic, i) => (
                                <li key={i} className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                                    📚 {topic}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Projects to Build */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-semibold">Learning Projects</h4>
                        <ul className="space-y-1.5">
                            {(report.recommendations?.projects || ['JS virtual execution script', 'Speech waveform dashboard']).map((project, i) => (
                                <li key={i} className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                                    🛠️ {project}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Recommended Roles */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-semibold">Qualifying Target Roles</h4>
                        <ul className="space-y-1.5">
                            {(report.recommendations?.roles || [report.role]).map((role, i) => (
                                <li key={i} className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                                    💼 {role}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Development roadmap text */}
                {report.recommendations?.roadmap && (
                    <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Growth Path Summary</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{report.recommendations.roadmap}</p>
                    </div>
                )}
            </div>

            {/* Actions panel */}
            <div className="flex justify-center gap-4 print:hidden">
                <button 
                    onClick={handlePrint}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary-500/20 transition-all active:scale-95 text-sm cursor-pointer"
                >
                    Download PDF Report
                </button>
                <Link 
                    to="/dashboard" 
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3.5 rounded-2xl font-bold transition-all text-sm"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}

export default Report;
