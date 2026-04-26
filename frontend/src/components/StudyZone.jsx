import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Brain, Loader2, Search, Plus, Sparkles, Laptop, BookOpen, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { generateQuizFromPaper, generateFlashcardsFromPaper } from '../utils/gemini';
import { createWorker } from 'tesseract.js';
import Flashcards from './Flashcards';

// Simple text extraction - users should upload text files or images
const extractTextFromPdf = async (arrayBuffer) => {
    // For now, return a message that PDF extraction requires server-side processing
    return '[PDF file uploaded - text extraction requires server-side processing. Please upload text files or images instead.]';
};

const extractTextFromImage = async (dataUrl) => {
    const worker = createWorker({ logger: () => {} });
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(dataUrl);
    await worker.terminate();
    return text.trim();
};

export default function StudyZone({ currentUser, onUpdateUser, onStartQuiz, offlineMode, onBack }) {
    const [papers, setPapers] = useState(currentUser.papers || []);
    // ... items omitted for brevity ...
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(null); 
    const [error, setError] = useState('');
    const [questionCount, setQuestionCount] = useState(10);
    const [difficulty, setDifficulty] = useState('medium');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingFlashcards, setViewingFlashcards] = useState(null); // Paper ID

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        setError('');

        try {
            const type = file.type.includes('image') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'text';
            let content = '';
            let parsedText = '';

            if (type === 'pdf') {
                const arrayBuffer = await file.arrayBuffer();
                parsedText = await extractTextFromPdf(arrayBuffer);
                content = '';
            } else if (type === 'image') {
                content = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (event) => resolve(event.target.result);
                    reader.readAsDataURL(file);
                });
                parsedText = await extractTextFromImage(content);
            } else {
                parsedText = await file.text();
                content = parsedText;
            }

            if (!parsedText || parsedText.length < 20) {
                throw new Error('Unable to extract text from this file.');
            }

            const newPaper = {
                id: Date.now(),
                name: file.name,
                type,
                content,
                parsedText,
                uploadedAt: new Date().toISOString(),
                quiz: null,
            };

            const updatedPapers = [...papers, newPaper];
            const updatedUser = { ...currentUser, papers: updatedPapers };
            setPapers(updatedPapers);
            onUpdateUser(updatedUser);
        } catch (err) {
            setError(err.message || 'Upload failed.');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleGenerateStudySet = async (paper) => {
        setIsGenerating(paper.id);
        setError('');
        try {
            const textToUse = (paper.parsedText || paper.content || '').trim();
            
            // Parallel generation for speed
            const [quiz, flashcards] = await Promise.all([
                generateQuizFromPaper(textToUse, paper.type, {
                    questionCount,
                    difficulty,
                    offlineMode,
                }),
                generateFlashcardsFromPaper(textToUse, {
                    offlineMode,
                })
            ]);

            const updatedPapers = papers.map((p) => p.id === paper.id ? { ...p, quiz, flashcards } : p);
            const updatedUser = {
                ...currentUser,
                papers: updatedPapers,
                quizzesDone: (currentUser.quizzesDone || 0) + 1,
            };
            setPapers(updatedPapers);
            onUpdateUser(updatedUser);
        } catch (err) {
            setError(err.message || 'Failed to generate content.');
        } finally {
            setIsGenerating(null);
        }
    };

    const getFlashcardsFromQuiz = (quiz) => {
        if (!quiz || !quiz.questions) return [];
        return quiz.questions.map(q => ({
            question: q.question,
            answer: q.correctAnswer || q.options[0],
            starred: false
        }));
    };

    const filteredPapers = papers.filter(paper => 
        paper.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (viewingFlashcards) {
        const paper = papers.find(p => p.id === viewingFlashcards);
        // Use pre-generated smart flashcards, or extract from quiz if they don't exist
        const flashcards = paper?.flashcards || (paper?.quiz ? getFlashcardsFromQuiz(paper.quiz) : []);
        return <Flashcards cards={flashcards} onBack={() => setViewingFlashcards(null)} />;
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-6 fade-in">
            <header className="mb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div>
                        <button onClick={onBack} className="mb-6 btn-apple-secondary lg:hidden">
                            <ArrowLeft size={18} /> Dashboard
                        </button>
                        <h2 className="text-4xl font-semibold tracking-tight mb-2">Study Sets</h2>
                        <p className="text-[#86868B] text-lg">Your personal library of learning resources.</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search your sets..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#E8E8ED]/50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-none"
                            />
                        </div>
                        <label className="btn-apple-primary cursor-pointer whitespace-nowrap shadow-apple-soft">
                            <Plus size={18} />
                            Add Set
                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.txt,.pdf" />
                        </label>
                    </div>
                </div>
            </header>

            {/* Error UI */}
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 mb-8 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-2xl text-[#FF3B30] flex items-center gap-3"
                    >
                        <X size={18} className="cursor-pointer" onClick={() => setError('')} />
                        <span className="text-sm font-medium">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Upload Placeholder */}
                <motion.label 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="apple-card border-dashed border-2 border-[#E8E8ED] bg-transparent flex flex-col items-center justify-center p-10 cursor-pointer text-[#86868B] hover:border-[#0071E3]/30 hover:bg-white transition-all min-h-[280px]"
                >
                    <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-4">
                        <Upload size={32} className="text-[#0071E3]" />
                    </div>
                    <p className="font-semibold text-[#1D1D1F] mb-1">Upload New Paper</p>
                    <p className="text-sm">PDF, Images, or Text</p>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.txt,.pdf" />
                </motion.label>

                {isUploading && (
                    <div className="apple-card p-10 flex flex-col items-center justify-center min-h-[280px]">
                        <div className="relative mb-6">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="w-20 h-20 border-[3px] border-[#0071E3]/10 border-t-[#0071E3] rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FileText className="text-[#0071E3]/30" size={24} />
                            </div>
                        </div>
                        <p className="font-semibold text-lg">Processing...</p>
                        <p className="text-sm text-[#86868B]">Analyzing content structure</p>
                    </div>
                )}

                <AnimatePresence mode="popLayout">
                    {filteredPapers.map((paper) => (
                        <motion.div 
                            key={paper.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="apple-card group"
                        >
                            <div className="p-8 h-full flex flex-col">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="p-3 bg-[#F5F5F7] rounded-2xl group-hover:bg-[#0071E3]/5 transition-colors">
                                        <BookOpen className="text-[#0071E3]" size={24} />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">
                                            {paper.type}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2 group-hover:text-[#0071E3] transition-colors leading-tight truncate px-1" title={paper.name}>
                                        {paper.name}
                                    </h3>
                                    <p className="text-[#86868B] text-sm px-1 mb-6">
                                        Uploaded on {new Date(paper.uploadedAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="mt-auto space-y-3">
                                    {paper.quiz ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => onStartQuiz(paper.quiz)} 
                                                className="btn-apple-primary w-full justify-center text-xs"
                                            >
                                                Start Quiz
                                            </button>
                                            <button 
                                                onClick={() => setViewingFlashcards(paper.id)}
                                                className="btn-apple-secondary w-full justify-center text-xs"
                                            >
                                                Flashcards
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleGenerateStudySet(paper)}
                                            disabled={isGenerating === paper.id}
                                            className="w-full btn-apple-primary justify-center group/btn"
                                        >
                                            {isGenerating === paper.id ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <>
                                                    <Sparkles size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                                    Generate Study Set
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {papers.length === 0 && !isUploading && (
                <div className="mt-20 text-center">
                    <Laptop size={64} className="mx-auto text-[#E8E8ED] mb-6" />
                    <h3 className="text-2xl font-semibold mb-2">Build Your Library</h3>
                    <p className="text-[#86868B] max-w-sm mx-auto">Upload documents to transform them into interactive study sets automatically using AI.</p>
                </div>
            )}
        </div>
    );
}
