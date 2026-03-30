import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    BookOpen, 
    Settings, 
    LogOut, 
    User, 
    History, 
    Shield, 
    Clock, 
    Key,
    UserCircle,
    Loader2,
    CheckCircle,
    Circle,
    Plus,
    Trash2,
    Search,
    ChevronRight,
    HelpCircle,
    ArrowLeft,
    Sun,
    Moon
} from 'lucide-react';

import { testGeminiKey } from '../utils/gemini';
import { getGroqApiKey, setGroqApiKey, getGroqApiBase, setGroqApiBase, testGroqKey } from '../utils/groq';
import StudyZone from './StudyZone';
import QuizView from './QuizView';

export default function Dashboard({ currentUser, onLogout, onUpdateUser, theme, onThemeToggle }) {
    const [activeTab, setActiveTab] = useState('DASHBOARD');
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [apiKey, setApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
    const [groqKey, setGroqKeyState] = useState(getGroqApiKey());
    const [groqBase, setGroqBase] = useState(getGroqApiBase());
    const [offlineMode, setOfflineMode] = useState(localStorage.getItem('KLAAS_OFFLINE_MODE') === 'true');
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
    const [isTestingGemini, setIsTestingGemini] = useState(false);
    const [isTestingGroq, setIsTestingGroq] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');

    const isGeminiEnv = !!import.meta.env.VITE_GEMINI_API_KEY;
    const isGroqEnv = !!import.meta.env.VITE_GROQ_API_KEY;

    const showStatus = (text, type = 'info') => {
        setStatusMessage({ text, type });
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 4500);
    };

    const handleSaveApiKey = () => {
        localStorage.setItem('GEMINI_API_KEY', apiKey);
        showStatus('Gemini API key saved successfully', 'success');
        onUpdateUser({ ...currentUser, apiKey });
    };

    const handleSaveGroqKey = () => {
        setGroqApiKey(groqKey);
        showStatus('GROQ API key saved successfully', 'success');
        onUpdateUser({ ...currentUser, groqKey });
    };

    const handleSaveGroqBase = () => {
        setGroqApiBase(groqBase);
        showStatus('GROQ API base URL saved successfully', 'success');
    };

    const handleTestGroqKey = async () => {
        setIsTestingGroq(true);
        setStatusMessage({ text: 'Testing GROQ key...', type: 'info' });
        try {
            await testGroqKey(groqKey);
            showStatus('GROQ key is valid and connected.', 'success');
        } catch (err) {
            showStatus(err.message || 'GROQ key test failed.', 'error');
        } finally {
            setIsTestingGroq(false);
        }
    };

    const handleTestApiKey = async () => {
        setIsTestingGemini(true);
        setStatusMessage({ text: 'Testing Gemini key...', type: 'info' });
        try {
            const result = await testGeminiKey(apiKey);
            showStatus(`Gemini key is valid and connected. Using model: ${result.model}`, 'success');
        } catch (err) {
            showStatus(err.message || 'Gemini key test failed.', 'error');
        } finally {
            setIsTestingGemini(false);
        }
    };

    const handleAddTask = () => {
        if (!newTaskText.trim()) return;
        const newTask = {
            id: Date.now(),
            text: newTaskText.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        const updatedUser = {
            ...currentUser,
            studyTasks: [newTask, ...(currentUser.studyTasks || [])]
        };
        onUpdateUser(updatedUser);
        setNewTaskText('');
    };

    const handleToggleTask = (taskId) => {
        const updatedTasks = (currentUser.studyTasks || []).map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        onUpdateUser({ ...currentUser, studyTasks: updatedTasks });
    };

    const handleDeleteTask = (taskId) => {
        const updatedTasks = (currentUser.studyTasks || []).filter(task => task.id !== taskId);
        onUpdateUser({ ...currentUser, studyTasks: updatedTasks });
    };

    const handleToggleOfflineMode = () => {
        const newValue = !offlineMode;
        setOfflineMode(newValue);
        localStorage.setItem('KLAAS_OFFLINE_MODE', newValue);
        showStatus(`Offline mode ${newValue ? 'enabled' : 'disabled'}`, 'info');
    };

    const formatDateTime = (value) => {
        if (!value) return 'Never';
        const date = new Date(value);
        return date.toLocaleString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    };

    const navItems = [
        { label: 'Overview', id: 'DASHBOARD', icon: LayoutDashboard },
        { label: 'Study Zone', id: 'STUDY', icon: BookOpen },
        { label: 'History', id: 'ACTIVITY', icon: History },
        { label: 'Settings', id: 'SETTINGS', icon: Settings },
    ];

    const stats = [
        { label: 'Study Sets', value: currentUser.papers?.length || 0, icon: BookOpen, color: 'text-[#0071E3]', tab: 'STUDY' },
        { label: 'Completed', value: currentUser.quizzesDone || 0, icon: Shield, color: 'text-[#34C759]', tab: 'ACTIVITY' },
        { label: 'Time Spent', value: `${currentUser.sessions || 0}h`, icon: Clock, color: 'text-[#FF9500]', tab: 'ACTIVITY' },
        { label: 'Account', value: currentUser.securityLevel, icon: UserCircle, color: 'text-[#AF52DE]', tab: 'SETTINGS' },
    ];

    const renderContent = () => {
        if (activeQuiz) {
            return <QuizView quiz={activeQuiz} onBack={() => setActiveQuiz(null)} />;
        }

        switch (activeTab) {
            case 'STUDY':
                return (
                    <StudyZone 
                        currentUser={currentUser} 
                        onUpdateUser={onUpdateUser} 
                        onStartQuiz={setActiveQuiz}
                        offlineMode={offlineMode}
                        onBack={() => setActiveTab('DASHBOARD')}
                    />
                );
            case 'SETTINGS':
                return (
                    <div className="max-w-4xl mx-auto py-10 fade-in px-6">
                        <header className="mb-12">
                            <button onClick={() => setActiveTab('DASHBOARD')} className="mb-6 btn-apple-secondary lg:hidden">
                                <ArrowLeft size={18} /> Dashboard
                            </button>
                            <h2 className="text-4xl font-semibold tracking-tight mb-2">Settings</h2>
                            <p className="text-[#86868B] text-lg">Manage your account and preferences.</p>
                        </header>

                        <div className="space-y-12">
                            {/* AI Section */}
                            <section>
                                <h3 className="text-xl font-semibold mb-6">AI Configuration</h3>
                                <div className="apple-card overflow-hidden">
                                    {/* Appearance Toggle */}
                                    <div className="p-6 border-b border-[#E8E8ED]">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-lg">Appearance</p>
                                                <p className="text-sm text-[#86868B]">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                                            </div>
                                            <button 
                                                onClick={onThemeToggle}
                                                className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 ${theme === 'dark' ? 'bg-[#0071E3]' : 'bg-[#D2D2D7]'}`}
                                            >
                                                <motion.div 
                                                    animate={{ x: theme === 'dark' ? 24 : 0 }}
                                                    className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center z-10"
                                                >
                                                    {theme === 'dark' ? <Moon size={12} className="text-[#0071E3]" /> : <Sun size={12} className="text-[#FF9500]" />}
                                                </motion.div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Offline Generation Toggle */}
                                    <div className="p-6 border-b border-[#E8E8ED]">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-lg">Offline Generation</p>
                                                <p className="text-sm text-[#86868B]">Generate local quizzes without an API key</p>
                                            </div>
                                            <button 
                                                onClick={handleToggleOfflineMode}
                                                className={`w-14 h-8 rounded-full transition-all relative ${offlineMode ? 'bg-[#34C759]' : 'bg-[#D2D2D7]'}`}
                                            >
                                                <motion.div 
                                                    animate={{ x: offlineMode ? 26 : 4 }}
                                                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* API Keys */}
                                    <div className="p-6 space-y-8">
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="text-sm font-medium">Gemini API Key</label>
                                                {isGeminiEnv && <span className="text-[10px] bg-[#0071E3]/10 text-[#0071E3] px-2 py-1 rounded-full font-bold uppercase">System Enforced</span>}
                                            </div>
                                            <div className="flex gap-3">
                                                <input 
                                                    type="password" 
                                                    placeholder={isGeminiEnv ? "Using System Credentials" : "Enter API Key"} 
                                                    value={apiKey}
                                                    disabled={isGeminiEnv}
                                                    onChange={(e) => setApiKey(e.target.value)}
                                                    className="flex-1 px-4 py-3 bg-[#F5F5F7] border-transparent rounded-xl text-sm focus:bg-white focus:border-[#0071E3] transition-all outline-none"
                                                />
                                                {!isGeminiEnv && <button onClick={handleSaveApiKey} className="btn-apple-secondary py-2">Save</button>}
                                                <button 
                                                    onClick={handleTestApiKey} 
                                                    disabled={isTestingGemini}
                                                    className="btn-apple-primary py-2 px-6"
                                                >
                                                    {isTestingGemini ? <Loader2 size={16} className="animate-spin" /> : 'Test'}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium block mb-3">GROQ Configuration</label>
                                            <div className="space-y-3">
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Base URL (e.g. api.groq.com)"
                                                        value={groqBase}
                                                        onChange={(e) => setGroqBase(e.target.value)}
                                                        className="flex-1 px-4 py-3 bg-[#F5F5F7] border-transparent rounded-xl text-sm focus:bg-white focus:border-[#0071E3] transition-all outline-none"
                                                    />
                                                    <button onClick={handleSaveGroqBase} className="btn-apple-secondary py-2">Save</button>
                                                </div>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="password"
                                                        placeholder={isGroqEnv ? "Using System Credentials" : "Enter Key"}
                                                        value={groqKey}
                                                        disabled={isGroqEnv}
                                                        onChange={(e) => setGroqKeyState(e.target.value)}
                                                        className="flex-1 px-4 py-3 bg-[#F5F5F7] border-transparent rounded-xl text-sm focus:bg-white focus:border-[#0071E3] transition-all outline-none"
                                                    />
                                                    {!isGroqEnv && <button onClick={handleSaveGroqKey} className="btn-apple-secondary py-2">Save</button>}
                                                    <button onClick={handleTestGroqKey} disabled={isTestingGroq} className="btn-apple-primary py-2 px-6">
                                                        {isTestingGroq ? <Loader2 size={16} className="animate-spin" /> : 'Test'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Study Tasks Section */}
                            <section>
                                <h3 className="text-xl font-semibold mb-6">Study Tasks</h3>
                                <div className="apple-card p-6">
                                    <div className="flex gap-3 mb-6">
                                        <input 
                                            type="text" 
                                            placeholder="What's your next study goal?"
                                            value={newTaskText}
                                            onChange={(e) => setNewTaskText(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                                            className="flex-1 px-4 py-4 bg-[#F5F5F7] border-transparent rounded-xl text-lg focus:bg-white focus:border-[#0071E3] transition-all outline-none"
                                        />
                                        <button onClick={handleAddTask} className="btn-apple-primary p-4 shrink-0">
                                            <Plus size={24} />
                                        </button>
                                    </div>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {(currentUser.studyTasks || []).length === 0 ? (
                                            <div className="text-center py-12">
                                                <CheckCircle size={48} className="mx-auto text-[#D2D2D7] mb-4" />
                                                <p className="text-[#86868B] text-lg">All caught up! Add a new goal to begin.</p>
                                            </div>
                                        ) : (
                                            (currentUser.studyTasks || []).map(task => (
                                                <motion.div 
                                                    layout
                                                    key={task.id} 
                                                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                                                        task.completed ? 'bg-[#F5F5F7] opacity-60' : 'bg-white border border-[#E8E8ED] hover:border-[#0071E3]/30'
                                                    }`}
                                                >
                                                    <button 
                                                        onClick={() => handleToggleTask(task.id)}
                                                        className={`transition-colors ${task.completed ? 'text-[#34C759]' : 'text-[#D2D2D7] hover:text-[#0071E3]'}`}
                                                    >
                                                        {task.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                                                    </button>
                                                    <span className={`flex-1 text-lg ${task.completed ? 'line-through text-[#86868B]' : 'font-medium'}`}>
                                                        {task.text}
                                                    </span>
                                                    <button onClick={() => handleDeleteTask(task.id)} className="text-[#86868B] hover:text-[#FF3B30] p-2">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Profile Section */}
                            <section>
                                <h3 className="text-xl font-semibold mb-6">Profile</h3>
                                <div className="apple-card p-8">
                                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#E8E8ED]">
                                        <div className="w-20 h-20 rounded-full bg-[#E8E8ED] flex items-center justify-center">
                                            <User size={40} className="text-[#86868B]" />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-semibold">{currentUser.username}</h4>
                                            <p className="text-[#86868B]">{currentUser.email}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8 text-center">
                                        <div className="bg-[#F5F5F7] p-6 rounded-2xl">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#86868B] mb-2">Member Since</p>
                                            <p className="text-lg font-medium">{new Date(currentUser.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-[#F5F5F7] p-6 rounded-2xl">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#86868B] mb-2">Security</p>
                                            <div className="flex items-center justify-center gap-2 text-[#34C759]">
                                                <Shield size={16} />
                                                <p className="text-lg font-medium">Standard</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                );
            case 'ACTIVITY':
                return (
                    <div className="max-w-4xl mx-auto py-10 fade-in px-6">
                        <header className="mb-12">
                            <button onClick={() => setActiveTab('DASHBOARD')} className="mb-6 btn-apple-secondary lg:hidden">
                                <ArrowLeft size={18} /> Dashboard
                            </button>
                            <h2 className="text-4xl font-semibold tracking-tight mb-2">History</h2>
                            <p className="text-[#86868B] text-lg">Your recent learning activity and milestones.</p>
                        </header>
                        
                        <div className="apple-card divide-y divide-[#E8E8ED]">
                            {currentUser.activity?.length > 0 ? (
                                currentUser.activity.map((a, i) => (
                                    <div key={i} className="p-6 flex items-start gap-4 hover:bg-[#F5F5F7] transition-colors">
                                        <div className="mt-1 w-10 h-10 rounded-full bg-white shadow-sm border border-black/5 flex items-center justify-center shrink-0">
                                            <History size={18} className="text-[#0071E3]" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-[#1D1D1F] mb-1">{a.action}</p>
                                            <p className="text-sm text-[#86868B]">{formatDateTime(a.when)}</p>
                                        </div>
                                        <ChevronRight size={16} className="text-[#D2D2D7] mt-2" />
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center">
                                    <History size={48} className="mx-auto text-[#D2D2D7] mb-4 opacity-20" />
                                    <p className="text-[#86868B]">No activity recorded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'DASHBOARD':
            default:
                return (
                    <div className="max-w-6xl mx-auto py-10 fade-in px-6">
                        <header className="mb-12">
                            <h2 className="text-4xl font-semibold tracking-tight mb-2">Welcome, {currentUser.username}</h2>
                            <p className="text-[#86868B] text-lg">Pick up where you left off today.</p>
                        </header>

                        {/* Recent Stat Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {stats.map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => setActiveTab(stat.tab)}
                                    className="apple-card p-6 cursor-pointer hover:scale-[1.02] transition-transform"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-2.5 rounded-xl bg-[#F5F5F7] ${stat.color}`}>
                                            <stat.icon size={22} />
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#86868B] mb-1">{stat.label}</p>
                                    <p className="text-3xl font-semibold">{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <section>
                                    <div className="flex items-center justify-between mb-6 px-1">
                                        <h3 className="text-xl font-semibold">Active Study Sets</h3>
                                        <button onClick={() => setActiveTab('STUDY')} className="text-[#0071E3] font-medium text-sm hover:underline">View All</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentUser.papers?.slice(0, 4).map(paper => (
                                            <div 
                                                key={paper.id} 
                                                onClick={() => setActiveTab('STUDY')}
                                                className="apple-card p-6 flex items-center gap-4 hover:border-[#0071E3]/20 cursor-pointer hover:scale-[1.01] transition-all"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
                                                    <BookOpen size={20} className="text-[#0071E3]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{paper.name}</p>
                                                    <p className="text-[10px] text-[#86868B] uppercase tracking-wide">{paper.type} • {new Date(paper.uploadedAt).toLocaleDateString()}</p>
                                                </div>
                                                <ChevronRight size={16} className="text-[#D2D2D7]" />
                                            </div>
                                        )) || (
                                            <div className="col-span-2 apple-card p-12 text-center border-dashed border-2">
                                                <Plus size={32} className="mx-auto text-[#D2D2D7] mb-4" />
                                                <p className="text-[#86868B]">No study sets yet. Start by uploading a paper.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="apple-card bg-black p-10 overflow-hidden relative">
                                    <div className="relative z-10 text-white max-w-sm">
                                        <h3 className="text-3xl font-semibold mb-3">AI Deep Learning</h3>
                                        <p className="text-white/60 mb-6 leading-relaxed text-sm">Convert your static notes into interactive 3D flashcards and smart quizzes instantly.</p>
                                        <button onClick={() => setActiveTab('STUDY')} className="bg-white text-black px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors">Launch Studio</button>
                                    </div>
                                    <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#0071E3]/20 to-transparent flex items-center justify-center">
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            className="w-48 h-48 border-[12px] border-white/5 rounded-full"
                                        />
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-8">
                                <section className="apple-card p-6 bg-white">
                                    <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
                                        Your Goals
                                        <button onClick={() => setActiveTab('SETTINGS')} className="text-[#0071E3] p-1"><Plus size={18}/></button>
                                    </h3>
                                    <div className="space-y-4">
                                        {(currentUser.studyTasks || []).slice(0, 5).map(task => (
                                            <div key={task.id} className="flex items-center gap-3">
                                                <div className={`shrink-0 w-2 h-2 rounded-full ${task.completed ? 'bg-[#34C759]' : 'bg-[#D2D2D7]'}`} />
                                                <p className={`text-sm truncate ${task.completed ? 'text-[#86868B] line-through' : 'font-medium'}`}>{task.text}</p>
                                            </div>
                                        ))}
                                        {(currentUser.studyTasks || []).length === 0 && <p className="text-xs text-[#86868B] italic">No active goals.</p>}
                                    </div>
                                </section>

                                <section className="apple-card p-6 bg-white">
                                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                        <HelpCircle size={18} className="text-[#0071E3]" />
                                        Study Tips
                                    </h3>
                                    <div className="bg-[#F5F5F7] p-5 rounded-2xl mb-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-[#86868B] mb-2">Space Repetition</p>
                                        <p className="text-sm leading-snug">Review your flashcards every 2 days to optimize memory retention.</p>
                                    </div>
                                    <div className="bg-[#F5F5F7] p-5 rounded-2xl">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-[#86868B] mb-2">Active Recall</p>
                                        <p className="text-sm leading-snug">Try to answer the question before flipping the card!</p>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F5F5F7]">
            {/* Sidebar */}
            <aside className="w-[280px] bg-[#F5F5F7] border-r border-[#E8E8ED] flex flex-col p-6 hidden lg:flex sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-12 px-2">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-lg">
                        <Shield size={24} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Klaas</h1>
                </div>

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setActiveQuiz(null);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-medium ${
                                activeTab === item.id 
                                ? 'bg-white shadow-apple-soft text-[#0071E3]' 
                                : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E8E8ED]/50'
                            }`}
                        >
                            <item.icon size={22} className={activeTab === item.id ? 'text-[#0071E3]' : ''} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto space-y-1">
                    <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-black/5 mb-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-[#E8E8ED] flex items-center justify-center">
                                <User size={16} className="text-[#86868B]" />
                            </div>
                            <div className="flex-1 truncate">
                                <p className="text-xs font-bold truncate">{currentUser.username}</p>
                                <p className="text-[10px] text-[#86868B] truncate">{currentUser.email}</p>
                            </div>
                        </div>
                        <button 
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#FF3B30]/10 text-[#FF3B30] rounded-xl text-xs font-bold hover:bg-[#FF3B30]/20 transition-colors"
                        >
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative h-screen">
                {/* Status Bar */}
                <AnimatePresence>
                    {statusMessage.text && (
                        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
                            <motion.div 
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                className={`px-6 py-3 rounded-full shadow-apple-soft backdrop-blur-xl border flex items-center gap-3 font-medium ${
                                    statusMessage.type === 'success' 
                                    ? 'bg-[#34C759]/10 border-[#34C759]/20 text-[#34C759]' 
                                    : statusMessage.type === 'error'
                                    ? 'bg-[#FF3B30]/10 border-[#FF3B30]/20 text-[#FF3B30]'
                                    : 'bg-white/80 border-black/5 text-[#1D1D1F]'
                                }`}
                            >
                                {statusMessage.type === 'success' ? <CheckCircle size={18} /> : statusMessage.type === 'error' ? <Shield size={18}/> : <Loader2 size={18} className="animate-spin" />}
                                {statusMessage.text}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Mobile Header (Mobile only) */}
                <div className="lg:hidden apple-glass sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold tracking-tight">Klaas</h1>
                    <button onClick={() => setActiveTab('SETTINGS')} className="w-10 h-10 rounded-full bg-[#E8E8ED] flex items-center justify-center">
                        <User size={20} className="text-[#86868B]" />
                    </button>
                </div>

                {renderContent()}
            </main>
        </div>
    );
}
