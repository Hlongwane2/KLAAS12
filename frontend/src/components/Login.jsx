import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
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

    const pageStyle = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F7',
    };

    const boxStyle = {
        width: '100%',
        maxWidth: '300px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        padding: '24px 20px 18px 20px',
    };

    const titleStyle = {
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: '16px',
        letterSpacing: '-0.3px',
    };

    const inputWrapStyle = {
        position: 'relative',
        marginBottom: '8px',
    };

    const iconStyle = {
        position: 'absolute',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#86868B',
        pointerEvents: 'none',
    };

    const inputStyle = {
        width: '100%',
        paddingLeft: '32px',
        paddingRight: '10px',
        paddingTop: '8px',
        paddingBottom: '8px',
        backgroundColor: '#F5F5F7',
        border: '1px solid transparent',
        borderRadius: '10px',
        fontSize: '13px',
        outline: 'none',
        boxSizing: 'border-box',
        color: '#1D1D1F',
    };

    const btnStyle = {
        width: '100%',
        marginTop: '12px',
        padding: '9px',
        backgroundColor: '#0071E3',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
    };

    const toggleStyle = {
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #E8E8ED',
        textAlign: 'center',
    };

    const toggleLinkStyle = {
        fontSize: '11px',
        color: '#0071E3',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '500',
    };

    return (
        <div style={pageStyle}>
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                style={{ width: '100%', maxWidth: '300px' }}
            >
                <div style={boxStyle}>
                    <div style={titleStyle}>{isLogin ? 'Sign In' : 'Create Account'}</div>

                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'signup'}
                                initial={{ opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div style={inputWrapStyle}>
                                    <span style={iconStyle}><User size={13} /></span>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        style={inputStyle}
                                        required
                                    />
                                </div>

                                {!isLogin && (
                                    <>
                                        <div style={inputWrapStyle}>
                                            <span style={iconStyle}><Mail size={13} /></span>
                                            <input
                                                type="email"
                                                placeholder="Email address"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                style={inputStyle}
                                                required
                                            />
                                        </div>
                                        <div style={inputWrapStyle}>
                                            <span style={iconStyle}><Phone size={13} /></span>
                                            <input
                                                type="tel"
                                                placeholder="Phone (optional)"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                style={inputStyle}
                                            />
                                        </div>
                                    </>
                                )}

                                <div style={inputWrapStyle}>
                                    <span style={iconStyle}><Lock size={13} /></span>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        style={inputStyle}
                                        required
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ color: '#FF3B30', fontSize: '11px', textAlign: 'center', margin: '6px 0 0' }}
                            >
                                {error}
                            </motion.p>
                        )}

                        <button type="submit" disabled={isLoading} style={btnStyle}>
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                                />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </form>

                    <div style={toggleStyle}>
                        <button
                            style={toggleLinkStyle}
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        >
                            {isLogin ? "Don't have an ID? Create one." : "Already have an ID? Sign in."}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
