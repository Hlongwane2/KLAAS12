import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import bcrypt from 'bcryptjs';
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
    const [studyTimer, setStudyTimer] = useState(null);
    const [currentTaskId, setCurrentTaskId] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Account Editing State
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [accountData, setAccountData] = useState({ username: '', email: '' });
    const [passwordData, setPasswordData] = useState({ current: '', newPassword: '' });
    const [searchQuery, setSearchQuery] = useState('');

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

    const handleSaveAccount = () => {
        if (!accountData.username.trim() || !accountData.email.trim()) {
            showStatus('Username and email cannot be empty.', 'error');
            return;
        }
        onUpdateUser({ ...currentUser, ...accountData });
        setIsEditingAccount(false);
        showStatus('Account information updated successfully.', 'success');
    };

    const handleSavePassword = () => {
        if (!bcrypt.compareSync(passwordData.current, currentUser.password)) {
            showStatus('Current password is incorrect.', 'error');
            return;
        }
        if (!passwordData.newPassword || passwordData.newPassword.length < 4) {
            showStatus('New password must be at least 4 characters.', 'error');
            return;
        }
        const newHashed = bcrypt.hashSync(passwordData.newPassword, 10);
        onUpdateUser({ ...currentUser, password: newHashed });
        setIsChangingPassword(false);
        setPasswordData({ current: '', newPassword: '' });
        showStatus('Password changed successfully.', 'success');
    };

    useEffect(() => {
        let interval;
        if (studyTimer) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [studyTimer]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}h ${mins}m ${secs}s`;
        } else if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    };

    const handleStartTask = (taskId) => {
        if (studyTimer && studyTimer === taskId) {
            // Stop timer
            setStudyTimer(null);
            setCurrentTaskId(null);
            
            // Add time spent to task
            const updatedTasks = (currentUser.studyTasks || []).map(task => {
                if (task.id === taskId) {
                    const timeSpent = (task.timeSpent || 0) + elapsedTime;
                    return { ...task, timeSpent, lastStudied: new Date().toISOString() };
                }
                return task;
            });
            
            // Add activity log
            const task = currentUser.studyTasks.find(t => t.id === taskId);
            const newActivity = {
                action: `Studied "${task?.text}" for ${formatTime(elapsedTime)}`,
                when: new Date().toISOString(),
                taskId: taskId,
                duration: elapsedTime
            };
            
            const updatedUser = {
                ...currentUser,
                studyTasks: updatedTasks,
                activity: [newActivity, ...(currentUser.activity || [])],
                totalStudyTime: (currentUser.totalStudyTime || 0) + elapsedTime
            };
            
            onUpdateUser(updatedUser);
            setElapsedTime(0);
        } else {
            // Start new timer
            if (studyTimer) {
                // Save previous task time first
                const updatedTasks = (currentUser.studyTasks || []).map(task => {
                    if (task.id === studyTimer) {
                        const timeSpent = (task.timeSpent || 0) + elapsedTime;
                        return { ...task, timeSpent, lastStudied: new Date().toISOString() };
                    }
                    return task;
                });
                
                const prevTask = currentUser.studyTasks.find(t => t.id === studyTimer);
                const newActivity = {
                    action: `Studied "${prevTask?.text}" for ${formatTime(elapsedTime)}`,
                    when: new Date().toISOString(),
                    taskId: studyTimer,
                    duration: elapsedTime
                };
                
                onUpdateUser({
                    ...currentUser,
                    studyTasks: updatedTasks,
                    activity: [newActivity, ...(currentUser.activity || [])],
                    totalStudyTime: (currentUser.totalStudyTime || 0) + elapsedTime
                });
            }
            
            setStudyTimer(taskId);
            setCurrentTaskId(taskId);
            setElapsedTime(0);
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

    const navItems = [];

    const stats = [
        { label: 'Activity Logs', value: currentUser?.activity?.length || 0, icon: History, color: 'text-[#0071E3]', tab: 'SETTINGS' },
        { label: 'Completed', value: currentUser?.quizzesDone || 0, icon: Shield, color: 'text-[#34C759]', tab: 'SETTINGS' },
        { label: 'Time Spent', value: formatTime(currentUser?.totalStudyTime || 0), icon: Clock, color: 'text-[#FF9500]', tab: 'SETTINGS' },
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
                                            (currentUser.studyTasks || []).map(task => {
                                                const isTimerActive = studyTimer === task.id;
                                                const taskTimeSpent = task.timeSpent || 0;
                                                const displayTime = isTimerActive ? taskTimeSpent + elapsedTime : taskTimeSpent;
                                                
                                                return (
                                                <motion.div 
                                                    layout
                                                    key={task.id} 
                                                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                                                        task.completed ? 'bg-[#F5F5F7] opacity-60' : 'bg-white border border-[#E8E8ED] hover:border-[#0071E3]/30'
                                                    } ${isTimerActive ? 'border-[#0071E3] border-2 shadow-lg' : ''}`}
                                                >
                                                    <button 
                                                        onClick={() => handleToggleTask(task.id)}
                                                        className={`transition-colors ${task.completed ? 'text-[#34C759]' : 'text-[#D2D2D7] hover:text-[#0071E3]'}`}
                                                    >
                                                        {task.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                        <span className={`text-lg ${task.completed ? 'line-through text-[#86868B]' : 'font-medium'}`}>
                                                            {task.text}
                                                        </span>
                                                        {task.lastStudied && (
                                                            <p className="text-xs text-[#86868B] mt-1">
                                                                Last studied: {new Date(task.lastStudied).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            <p className="text-sm font-semibold text-[#0071E3]">
                                                                {formatTime(displayTime)}
                                                            </p>
                                                            {isTimerActive && (
                                                                <p className="text-xs text-[#34C759] font-medium">Studying...</p>
                                                            )}
                                                        </div>
                                                        <button 
                                                            onClick={() => handleStartTask(task.id)}
                                                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                                                isTimerActive 
                                                                    ? 'bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90'
                                                                    : 'bg-[#0071E3] text-white hover:bg-[#0071E3]/90'
                                                            }`}
                                                        >
                                                            {isTimerActive ? 'Stop' : 'Start'}
                                                        </button>
                                                        <button onClick={() => handleDeleteTask(task.id)} className="text-[#86868B] hover:text-[#FF3B30] p-2">
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* History Section */}
                            <section>
                                <h3 className="text-xl font-semibold mb-6">Activity History</h3>
                                <div className="apple-card divide-y divide-[#E8E8ED] mb-12">
                                    {currentUser.activity?.length > 0 ? (
                                        currentUser.activity.map((a, i) => (
                                            <div key={i} className="p-6 flex items-start gap-4 hover:bg-[#F5F5F7] transition-colors">
                                                <div className="mt-1 w-10 h-10 rounded-full bg-white shadow-sm border border-black/5 flex items-center justify-center shrink-0">
                                                    <History size={18} className="text-[#0071E3]" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-[#1D1D1F] mb-1">{a.action}</p>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-sm text-[#86868B]">{formatDateTime(a.when)}</p>
                                                        {a.duration && (
                                                            <span className="text-xs bg-[#0071E3]/10 text-[#0071E3] px-2 py-1 rounded-full font-medium">
                                                                {formatTime(a.duration)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-20 text-center">
                                            <History size={48} className="mx-auto text-[#D2D2D7] mb-4 opacity-20" />
                                            <p className="text-[#86868B]">No activity recorded yet.</p>
                                        </div>
                                    )}
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
                                            <h4 className="text-2xl font-semibold">{currentUser?.username || 'Klaas'}</h4>
                                            <p className="text-[#86868B]">{currentUser?.email || 'hlongwaneklaas53@gmail.com'}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8 text-center">
                                        <div className="bg-[#F5F5F7] p-6 rounded-2xl">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#86868B] mb-2">Member Since</p>
                                            <p className="text-lg font-medium">{currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}</p>
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
                            {/* Account Management Section */}
                            <section>
                                <h3 className="text-xl font-semibold mb-6">Account</h3>
                                <div className="apple-card divide-y divide-[#E8E8ED]">
                                    {isEditingAccount ? (
                                        <div className="p-6 bg-[#F5F5F7]">
                                            <h4 className="font-medium text-lg mb-4 text-[#1D1D1F]">Edit Account Info</h4>
                                            <div className="space-y-3 mb-5">
                                                <input type="text" value={accountData.username} onChange={e => setAccountData({...accountData, username: e.target.value})} placeholder="Username" className="w-full px-4 py-3 bg-white border-transparent rounded-xl text-sm focus:border-[#0071E3] transition-all outline-none" />
                                                <input type="email" value={accountData.email} onChange={e => setAccountData({...accountData, email: e.target.value})} placeholder="Email" className="w-full px-4 py-3 bg-white border-transparent rounded-xl text-sm focus:border-[#0071E3] transition-all outline-none" />
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={handleSaveAccount} className="btn-apple-primary py-2 px-6">Save</button>
                                                <button onClick={() => setIsEditingAccount(false)} className="btn-apple-secondary py-2 px-6">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => { setAccountData({ username: currentUser.username || '', email: currentUser.email || '' }); setIsEditingAccount(true); }}
                                            className="p-6 flex items-center justify-between hover:bg-[#F5F5F7] transition-colors cursor-pointer"
                                        >
                                            <div>
                                                <p className="font-medium text-lg text-[#1D1D1F]">Account Information</p>
                                                <p className="text-sm text-[#86868B]">Update your email, username, and personal details.</p>
                                            </div>
                                            <ChevronRight size={20} className="text-[#D2D2D7]" />
                                        </div>
                                    )}

                                    {isChangingPassword ? (
                                        <div className="p-6 bg-[#F5F5F7]">
                                            <h4 className="font-medium text-lg mb-4 text-[#1D1D1F]">Change Password</h4>
                                            <div className="space-y-3 mb-5">
                                                <input type="password" value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} placeholder="Current Password" className="w-full px-4 py-3 bg-white border-transparent rounded-xl text-sm focus:border-[#0071E3] transition-all outline-none" />
                                                <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} placeholder="New Password" className="w-full px-4 py-3 bg-white border-transparent rounded-xl text-sm focus:border-[#0071E3] transition-all outline-none" />
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={handleSavePassword} className="btn-apple-primary py-2 px-6">Update Password</button>
                                                <button onClick={() => { setIsChangingPassword(false); setPasswordData({ current: '', newPassword: '' }); }} className="btn-apple-secondary py-2 px-6">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => setIsChangingPassword(true)}
                                            className="p-6 flex items-center justify-between hover:bg-[#F5F5F7] transition-colors cursor-pointer"
                                        >
                                            <div>
                                                <p className="font-medium text-lg text-[#1D1D1F]">Change Password</p>
                                                <p className="text-sm text-[#86868B]">Update your encryption and login credentials.</p>
                                            </div>
                                            <ChevronRight size={20} className="text-[#D2D2D7]" />
                                        </div>
                                    )}

                                    <div className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-lg text-[#FF3B30]">Sign Out</p>
                                            <p className="text-sm text-[#86868B]">Log out of your Klaas account on this device.</p>
                                        </div>
                                        <button
                                            onClick={onLogout}
                                            className="flex items-center gap-2 px-6 py-3 bg-[#FF3B30]/10 text-[#FF3B30] rounded-xl font-semibold hover:bg-[#FF3B30]/20 transition-colors"
                                        >
                                            <LogOut size={18} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                );
            case 'DASHBOARD':
            default:
                return (
                    <div className="max-w-6xl mx-auto py-10 fade-in px-6">
                        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-4xl font-semibold tracking-tight mb-2">Welcome, {currentUser.username}</h2>
                                <p className="text-[#86868B] text-lg">Pick up where you left off today.</p>
                            </div>
                            <div className="relative w-full md:w-72 shrink-0">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" />
                                <input 
                                    type="text" 
                                    placeholder="Search your study sets..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-[#E8E8ED] hover:border-[#D2D2D7] focus:border-[#0071E3] rounded-full py-3 pl-11 pr-4 text-sm outline-none transition-colors shadow-apple-soft"
                                />
                            </div>
                        </header>

                        {/* Recent Stat Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
                                        {currentUser.papers?.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4).map(paper => (
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
                                        ))}

                                        {(!currentUser.papers || currentUser.papers.length === 0) && (
                                            <div className="col-span-2 apple-card p-12 text-center border-dashed border-2">
                                                <Plus size={32} className="mx-auto text-[#D2D2D7] mb-4" />
                                                <p className="text-[#86868B]">No study sets yet. Start by uploading a paper.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center justify-between mb-6 px-1">
                                        <h3 className="text-xl font-semibold">Recent History</h3>
                                        <button onClick={() => setActiveTab('SETTINGS')} className="text-[#0071E3] font-medium text-sm hover:underline">View All</button>
                                    </div>
                                    <div className="apple-card divide-y divide-[#E8E8ED]">
                                        {currentUser.activity?.length > 0 ? (
                                            currentUser.activity.slice(0, 5).map((a, i) => (
                                                <div key={i} className="p-6 flex items-start gap-4 hover:bg-[#F5F5F7] transition-colors">
                                                    <div className="mt-1 w-10 h-10 rounded-full bg-white shadow-sm border border-black/5 flex items-center justify-center shrink-0">
                                                        <History size={18} className="text-[#0071E3]" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-[#1D1D1F] mb-1">{a.action}</p>
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-sm text-[#86868B]">{formatDateTime(a.when)}</p>
                                                            {a.duration && (
                                                                <span className="text-xs bg-[#0071E3]/10 text-[#0071E3] px-2 py-1 rounded-full font-medium">
                                                                    {formatTime(a.duration)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center">
                                                <History size={32} className="mx-auto text-[#D2D2D7] mb-4 opacity-20" />
                                                <p className="text-[#86868B]">No activity recorded yet.</p>
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
                <div className="flex items-center gap-3 mb-12 px-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('DASHBOARD')}>
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
                    <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-black/5 mb-4 relative hover:bg-white transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#E8E8ED] flex items-center justify-center">
                                    <User size={16} className="text-[#86868B]" />
                                </div>
                                <div className="flex-1 truncate max-w-[120px]">
                                    <p className="text-xs font-bold truncate">{currentUser.username}</p>
                                    <p className="text-[10px] text-[#86868B] truncate">{currentUser.email}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setActiveTab('SETTINGS')}
                                className="p-2 text-[#86868B] hover:text-[#0071E3] hover:bg-[#F5F5F7] rounded-full transition-colors"
                                title="Settings"
                            >
                                <Settings size={18} />
                            </button>
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
            <main className="flex-1 overflow-y-auto relative h-screen pb-24 lg:pb-0">
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
                <div className="lg:hidden bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-[#E8E8ED]">
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('DASHBOARD')}>
                         <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white shadow-sm">
                            <Shield size={18} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">Klaas</h1>
                    </div>
                    <button onClick={() => setActiveTab('SETTINGS')} className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center shadow-sm border border-[#E8E8ED]">
                        <Settings size={20} className="text-[#86868B]" />
                    </button>
                </div>

                {renderContent()}
            </main>

            {/* Bottom Navigation (Mobile only) */}
            {navItems.length > 0 && (
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#E8E8ED] z-50 flex justify-around items-center pt-2 pb-[env(safe-area-inset-bottom,16px)] px-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setActiveQuiz(null);
                            }}
                            className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${
                                activeTab === item.id 
                                ? 'text-[#0071E3]' 
                                : 'text-[#86868B] hover:text-[#1D1D1F]'
                            }`}
                        >
                            <item.icon size={24} className="mb-1" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            )}
        </div>
    );
}
