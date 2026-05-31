import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-8 mt-20">
            <div className="max-w-3xl">
                <h1 className="text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                    Master Your Next <span className="text-primary-600">AI-Powered</span> Interview
                </h1>
                <p className="text-xl text-gray-600 mb-10">
                    Upload your resume and get clinical practice with our adaptive AI interview engine.
                    Real-time feedback, voice recognition, and personalized insights.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link to="/register" className="bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl hover:bg-primary-700 hover:translate-y-[-2px] transition-all">
                        Get Started Free
                    </Link>
                    <a href="#features" className="bg-white text-gray-800 px-8 py-4 rounded-xl text-lg font-bold border border-gray-200 shadow-sm hover:bg-gray-50 transition-all">
                        Learn More
                    </a>
                </div>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {[
                    { title: "Adaptive Tech", desc: "AI adjusts difficulty based on your answers.", icon: "🚀" },
                    { title: "Voice & Text", desc: "Practice with real-time voice-to-text conversion.", icon: "🎙️" },
                    { title: "Skill Analytics", desc: "Detailed reports on your strengths and gaps.", icon: "📊" }
                ].map((feature, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all">
                        <div className="text-4xl mb-4">{feature.icon}</div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
