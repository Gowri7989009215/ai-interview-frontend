import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Editor from '@monaco-editor/react';

function Interview() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Core Interview states
    const [interview, setInterview] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Voice & Timer states
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120);
    
    // Monaco Sandbox runner states
    const [runningCode, setRunningCode] = useState(false);
    const [codeOutput, setCodeOutput] = useState(null);
    
    // Anti-Cheat & Suspicious action logs
    const [suspiciousCounter, setSuspiciousCounter] = useState(0);
    const [cheatAlert, setCheatAlert] = useState('');

    const recognitionRef = useRef(null);

    // 1. Fetch Interview Session
    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const { data } = await api.get(`/interview/${id}`);
                setInterview(data);
                
                // Pre-fill answer input if question has been previously answered (backward compatibility)
                const currentQuestion = data.questions[currentIdx];
                if (currentQuestion && currentQuestion.answerText) {
                    setAnswer(currentQuestion.answerText);
                }
            } catch (err) {
                alert('Failed to load interview');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchInterview();
    }, [id, currentIdx]);

    // 2. Anti-Cheat Handlers (Visibility Change, Copy, Paste, Context Menu)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                flagCheatIncident('Tab switch detected');
            }
        };

        const handleWindowBlur = () => {
            flagCheatIncident('Window focus lost');
        };

        const handleCopy = (e) => {
            e.preventDefault();
            flagCheatIncident('Copy action blocked');
        };

        const handlePaste = (e) => {
            flagCheatIncident('Paste action flagged');
        };

        const handleContextMenu = (e) => {
            e.preventDefault();
            flagCheatIncident('Right click blocked');
        };

        // Attach listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    const flagCheatIncident = (message) => {
        setSuspiciousCounter(prev => prev + 1);
        setCheatAlert(`⚠️ Anti-Cheat Warning: ${message}. Incident recorded for review.`);
        setTimeout(() => setCheatAlert(''), 5000);
    };

    // 3. Timer logic
    useEffect(() => {
        if (timeLeft > 0 && !submitting) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            handleSubmit();
        }
    }, [timeLeft, submitting]);

    // 4. Browser Speech API (Voice Capture)
    const startRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            return alert('Speech recognition not supported in this browser. Please type your answer.');
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            setAnswer(transcript);
        };

        recognitionRef.current.onerror = (err) => {
            console.error("Speech Recognition Error:", err);
            stopRecording();
        };

        recognitionRef.current.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
    };

    // 5. Code Sandbox Runner (Run Monaco Code)
    const handleRunCode = async () => {
        setRunningCode(true);
        setCodeOutput(null);
        try {
            const { data } = await api.post('/interview/run-tests', {
                interviewId: id,
                questionIndex: currentIdx,
                answerText: answer
            });
            setCodeOutput(data);
        } catch (err) {
            setCodeOutput({ error: err.response?.data?.message || 'Execution error.' });
        } finally {
            setRunningCode(false);
        }
    };

    // 6. Submit Answer & Advance / Redirect
    const handleSubmit = async () => {
        setSubmitting(true);
        stopRecording();
        setCodeOutput(null);
        try {
            const { data } = await api.post('/interview/submit', {
                interviewId: id,
                questionIndex: currentIdx,
                answerText: answer,
                duration: 120 - timeLeft,
                suspiciousEvents: suspiciousCounter
            });

            // Reset cheat counter for the next question
            setSuspiciousCounter(0);

            if (data.completed) {
                alert('Interview completed! Redirecting to report...');
                navigate(`/report/${id}`);
            } else {
                setInterview(data.interview);
                setCurrentIdx(data.nextIndex);
                setAnswer('');
                setTimeLeft(120);
            }
        } catch (err) {
            alert('Failed to submit answer. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
                <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-slate-500 font-medium">Launching sandbox and loading questions...</p>
            </div>
        );
    }

    if (!interview) return null;

    const currentQuestion = interview.questions[currentIdx];
    const isCodingQuestion = currentQuestion?.category === 'Coding' || interview.mode === 'Coding';

    return (
        <div className="max-w-4xl mx-auto space-y-6 px-4">
            {/* Anti-cheat notification banner */}
            {cheatAlert && (
                <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-xl text-sm flex gap-3 items-center shadow-md animate-bounce sticky top-20 z-40">
                    <span className="text-lg">🛡️</span>
                    <p className="font-semibold">{cheatAlert}</p>
                </div>
            )}

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
                {/* Header indicators */}
                <div className="flex justify-between items-center">
                    <span className="bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                        Question {currentIdx + 1} of {interview.questions.length}
                    </span>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-400">Time Left:</span>
                        <span className={`font-mono text-xl font-bold ${timeLeft < 25 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>

                {/* Question Info */}
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase">{currentQuestion?.category || 'Technical'}</span>
                        {suspiciousCounter > 0 && (
                            <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-0.5 rounded-md text-[10px] font-bold">Flags: {suspiciousCounter}</span>
                        )}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 leading-snug">{currentQuestion?.questionText}</h2>
                </div>

                {/* Question Type Layout */}
                {isCodingQuestion ? (
                    <div className="space-y-4">
                        {/* Monaco Editor Container */}
                        <div className="h-[380px] border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
                            <Editor
                                height="100%"
                                defaultLanguage="javascript"
                                theme="vs-dark"
                                value={answer || "/* Write your JavaScript solution here */\nfunction solution() {\n    \n}"}
                                onChange={(value) => setAnswer(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    automaticLayout: true,
                                }}
                            />
                        </div>

                        {/* Monaco controls */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleRunCode}
                                disabled={runningCode || submitting}
                                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 text-sm cursor-pointer"
                            >
                                {runningCode ? "Compiling..." : "Run Code Tests"}
                            </button>
                        </div>

                        {/* Code Sandbox Output console */}
                        {codeOutput && (
                            <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl font-mono text-xs space-y-2 shadow-inner border border-slate-800 max-h-48 overflow-y-auto">
                                <div className="text-slate-400 font-bold border-b border-slate-800 pb-1.5 mb-2 uppercase tracking-widest text-[9px]">Sandbox Output</div>
                                {codeOutput.error ? (
                                    <div className="text-rose-400">Runtime Error: {codeOutput.error}</div>
                                ) : (
                                    <>
                                        <div className="font-bold">Passed: {codeOutput.passedCount} / {codeOutput.totalCount} tests</div>
                                        <div className="space-y-1.5 pt-1">
                                            {codeOutput.results?.map((res, i) => (
                                                <div key={i} className={res.passed ? "text-emerald-400" : "text-rose-400"}>
                                                    [Test {i + 1}] Input: {JSON.stringify(res.input)} | Expected: {JSON.stringify(res.expected)} | Got: {JSON.stringify(res.actual || res.error)} {"->"} {res.passed ? "SUCCESS" : "FAILED"}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <textarea
                            className="w-full h-48 p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none text-slate-800 placeholder-slate-400"
                            placeholder="Type your answer here, or click standard microphone to enable Speech-to-Text..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            disabled={submitting}
                        />

                        {/* Speech recognition bar */}
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all shadow-md ${
                                    isRecording 
                                        ? 'bg-rose-500 text-white animate-pulse' 
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                }`}
                            >
                                <span className="text-lg">{isRecording ? '⏹️' : '🎙️'}</span>
                                {isRecording ? 'Listening...' : 'Enable Speech Input'}
                            </button>

                            {/* Bouncing audio waveform visualizer */}
                            {isRecording && (
                                <div className="flex items-center gap-1 h-6 pl-2">
                                    <span className="w-1 h-4 bg-rose-400 rounded-full animate-[bounce_0.8s_infinite_100ms]"></span>
                                    <span className="w-1 h-6 bg-rose-500 rounded-full animate-[bounce_0.8s_infinite_200ms]"></span>
                                    <span className="w-1 h-5 bg-rose-500 rounded-full animate-[bounce_0.8s_infinite_300ms]"></span>
                                    <span className="w-1 h-3 bg-rose-400 rounded-full animate-[bounce_0.8s_infinite_400ms]"></span>
                                    <span className="w-1 h-5 bg-rose-500 rounded-full animate-[bounce_0.8s_infinite_200ms]"></span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation controls */}
                <div className="mt-8 flex justify-end pt-4 border-t border-slate-100">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Grade & Next...
                            </>
                        ) : (
                            currentIdx === interview.questions.length - 1 ? 'Finish Interview' : 'Next Question'
                        )}
                    </button>
                </div>
            </div>
            
            <div className="bg-slate-100 p-4 rounded-xl text-center text-xs text-slate-400">
                ⚠️ Platform policies require staying focused. Switching windows or copy-pasting is logged.
            </div>
        </div>
    );
}

export default Interview;
