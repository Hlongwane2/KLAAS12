import bcrypt from 'bcryptjs';
import { supabase } from './supabaseClient';

const CURRENT_USER_KEY = 'klaasCurrentUser';

export const defaultUser = {
    username: 'Klaas',
    password: bcrypt.hashSync('William', 10),
    email: 'hlongwaneklaas53@gmail.com',
    phone: '+278 944 0290',
    location: 'South Africa',
    address: '123 Main Street, Johannesburg, South Africa',
    memberSince: '2012-03-01T00:00:00Z',
    subscription: 'Premium Active',
    status: 'Active',
    securityLevel: 'High',
    sessions: 0,
    lastLogin: null,
    papers: [],
    quizzes: [],
    quizzesDone: 0,
    activity: [],
};

export async function getUser(username) {
    if (!username) return null;
    try {
        const { data, error } = await supabase.from('users').select('user_data').eq('username', username).single();
        if (error || !data) {
            if (username === defaultUser.username) {
                return defaultUser;
            }
            return null;
        }
        return data.user_data;
    } catch (e) {
        console.warn("Supabase auth failed. Defaulting to local dummy user.", e);
        return username === defaultUser.username ? defaultUser : null;
    }
}

export async function updateUser(user) {
    try {
        const { error } = await supabase.from('users').upsert({ 
            username: user.username, 
            user_data: user 
        }, { onConflict: 'username' });
        
        if (error) console.error("Error updating user in Supabase:", error);
    } catch (e) {
        console.warn("Offline/DB Error saving user:", e);
    }
    
    setCurrentUser(user.username);
    return user;
}

export async function addPaperToUser(username, paper) {
    const user = await getUser(username);
    if (!user) return null;
    user.papers = user.papers || [];
    user.papers.push(paper);
    return await updateUser(user);
}

export async function addQuizToUser(username, quiz) {
    const user = await getUser(username);
    if (!user) return null;
    user.quizzes = user.quizzes || [];
    user.quizzes.push(quiz);
    user.quizzesDone = (user.quizzesDone || 0) + 1;
    user.activity = user.activity || [];
    user.activity.unshift({ action: `Generated quiz '${quiz.title}'`, when: new Date().toISOString() });
    return await updateUser(user);
}

export async function getCurrentUser() {
    const currentUsername = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentUsername) {
        // Fallback for dev mode bypassed login
        const def = await getUser(defaultUser.username);
        return def || defaultUser;
    }
    return await getUser(currentUsername);
}

export function setCurrentUser(username) {
    if (username) {
        localStorage.setItem(CURRENT_USER_KEY, username);
    } else {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
}
