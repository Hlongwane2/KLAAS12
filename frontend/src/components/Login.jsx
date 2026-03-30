import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import bcrypt from 'bcryptjs';
import { getUser, updateUser } from '../utils/storage';

export default function Login({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Artificial delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 800));

        if (isLogin) {
            const user = await getUser(formData.username);
            if (user && bcrypt.compareSync(formData.password, user.password)) {
                onLoginSuccess(user);
            } else {
                setError('Invalid username or password');
            }
        } else {
            const existingUser = await getUser(formData.username);
            if (existingUser) {
                setError('Username already exists');
            } else if (!formData.email || !formData.password) {
                setError('Please fill all required fields');
            } else {
                const newUser = {
                    ...formData,
                    password: bcrypt.hashSync(formData.password, 10),
                    papers: [],
                    quizzes: [],
                    activity: [{ action: 'Account created', when: new Date().toISOString() }],
                    createdAt: new Date().toISOString(),
                    securityLevel: 'Standard'
                };
                await updateUser(newUser);
                onLoginSuccess(newUser);
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F5F5F7]">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="w-full max-w-[440px]"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-[22%] bg-white shadow-apple-soft mb-6 border border-black/5"
                    >
                        <ShieldCheck size={40} className="text-[#0071E3]" />
                    </motion.div>
                    <h1 className="text-4xl font-semibold tracking-tight text-[#1D1D1F] mb-3">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </h1>
                    <p className="text-[#86868B] text-lg font-medium">
                        {isLogin ? 'Welcome back to Klaas' : 'Start your study journey'}
                    </p>
                </div>

                <div className="apple-card p-10 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'signup'}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <div className="space-y-4">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-[#F5F5F7] border-transparent focus:bg-white focus:border-[#0071E3] transition-all rounded-xl text-lg outline-none"
                                            required
                                        />
                                    </div>

                                    {!isLogin && (
                                        <>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={20} />
                                                <input
                                                    type="email"
                                                    placeholder="Email address"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                    className="w-full pl-12 pr-4 py-4 bg-[#F5F5F7] border-transparent focus:bg-white focus:border-[#0071E3] transition-all rounded-xl text-lg outline-none"
                                                    required
                                                />
                                            </div>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={20} />
                                                <input
                                                    type="tel"
                                                    placeholder="Phone number (optional)"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                    className="w-full pl-12 pr-4 py-4 bg-[#F5F5F7] border-transparent focus:bg-white focus:border-[#0071E3] transition-all rounded-xl text-lg outline-none"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={20} />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-[#F5F5F7] border-transparent focus:bg-white focus:border-[#0071E3] transition-all rounded-xl text-lg outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {error && (
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[#FF3B30] text-sm text-center font-medium"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-apple-primary justify-center py-4 text-lg group"
                        >
                            {isLoading ? (
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                                />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-[#E8E8ED] text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-[#0071E3] font-medium hover:underline text-lg"
                        >
                            {isLogin ? "Don't have an ID? Create yours now." : "Already have an ID? Sign in."}
                        </button>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[#86868B] text-sm">
                        By continuing, you agree to Klaas's <br />
                        <span className="text-[#1D1D1F] font-medium cursor-pointer hover:underline">Terms of Service</span> and <span className="text-[#1D1D1F] font-medium cursor-pointer hover:underline">Privacy Policy</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
