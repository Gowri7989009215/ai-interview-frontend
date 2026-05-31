import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function ResumeUpload() {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Handle Drag over
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Validate File
    const validateAndSetFile = (selectedFile) => {
        setError('');
        setSuccess('');
        
        if (!selectedFile) return;

        // Size check (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("File size exceeds 5MB limit. Please upload a smaller file.");
            return;
        }

        // Extension check
        if (selectedFile.type !== "application/pdf") {
            setError("Only PDF files are supported.");
            return;
        }

        setFile(selectedFile);
        setSuccess(`Selected file: ${selectedFile.name}`);
    };

    // Handle Drop
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    // Handle Manual Input Select
    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    // Submit File
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return setError("Please select a file to upload.");

        setUploading(true);
        setError('');
        setProgress(10);

        const formData = new FormData();
        formData.append('resume', file);

        // Simulate progress bar increments
        const progressTimer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressTimer);
                    return 90;
                }
                return prev + 15;
            });
        }, 300);

        try {
            const { data } = await api.post('/resume/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            clearInterval(progressTimer);
            setProgress(100);
            setSuccess("Resume parsed successfully!");
            
            setTimeout(() => {
                navigate('/interview-setup');
            }, 1200);
        } catch (err) {
            clearInterval(progressTimer);
            setProgress(0);
            setError(err.response?.data?.message || "Failed to parse resume. Ensure it is a valid text PDF.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-12 px-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight text-center mb-2">Upload Resume</h2>
                <p className="text-slate-500 text-sm text-center mb-8">We use AI to customize your practice questions based on your background</p>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm flex items-start gap-2 shadow-sm animate-pulse">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 text-sm flex items-start gap-2 shadow-sm">
                        <span>✓</span>
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Drag and Drop Zone */}
                    <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                            dragActive ? 'border-primary-500 bg-primary-50/50' : 'border-slate-200 hover:border-primary-400'
                        }`}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileSelect} 
                            accept=".pdf" 
                            className="hidden" 
                        />
                        <div className="text-4xl mb-4">📄</div>
                        <h4 className="font-bold text-slate-700 mb-1">Drag and drop your resume here</h4>
                        <p className="text-slate-400 text-xs">Supports PDF files up to 5MB</p>
                    </div>

                    {/* Progress Bar */}
                    {progress > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-500 font-bold">
                                <span>Uploading & Parsing...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="bg-primary-600 h-full transition-all duration-300 rounded-full" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={uploading || !file}
                        className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {uploading ? "Analyzing..." : "Process Resume"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResumeUpload;
