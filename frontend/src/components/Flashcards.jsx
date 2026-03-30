import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, RotateCcw, Volume2, Maximize2 } from 'lucide-react';

export default function Flashcards({ cards, onBack }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [starred, setStarred] = useState(new Set());

    const currentCard = cards[currentIndex] || { question: 'No cards available', answer: 'Upload a paper to generate flashcards.' };

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev + 1), 100);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev - 1), 100);
        }
    };

    const toggleStar = (e) => {
        e.stopPropagation();
        const newStarred = new Set(starred);
        if (newStarred.has(currentIndex)) newStarred.delete(currentIndex);
        else newStarred.add(currentIndex);
        setStarred(newStarred);
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 fade-in h-full flex flex-col">
            <header className="flex items-center justify-between mb-12">
                <button 
                    onClick={onBack}
                    className="btn-apple-secondary"
                >
                    <ChevronLeft size={20} />
                    Back to Set
                </button>
                <div className="text-center">
                    <p className="text-sm font-bold uppercase tracking-widest text-[#86868B] mb-1">Flashcards</p>
                    <h2 className="text-2xl font-semibold">{currentIndex + 1} of {cards.length}</h2>
                </div>
                <div className="flex gap-4">
                    <button className="p-2.5 rounded-full bg-white border border-[#E8E8ED] text-[#86868B] hover:text-[#0071E3] transition-all">
                        <Volume2 size={20} />
                    </button>
                    <button className="p-2.5 rounded-full bg-white border border-[#E8E8ED] text-[#86868B] hover:text-[#0071E3] transition-all">
                        <Maximize2 size={20} />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center space-y-12">
                <div className="flashcard-container max-w-2xl" onClick={() => setIsFlipped(!isFlipped)}>
                    <motion.div 
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        className="flashcard-inner"
                    >
                        {/* Front */}
                        <div className="flashcard-face bg-white apple-card border-none shadow-apple-lg">
                            <button 
                                onClick={toggleStar}
                                className={`absolute top-6 right-6 p-2 transition-colors ${starred.has(currentIndex) ? 'text-[#FF9500]' : 'text-[#D2D2D7]'}`}
                            >
                                <Star fill={starred.has(currentIndex) ? 'currentColor' : 'none'} size={24} />
                            </button>
                            <div className="max-w-md">
                                <p className="text-[#86868B] text-xs font-bold uppercase tracking-widest mb-6">Question</p>
                                <h3 className="text-3xl leading-snug">{currentCard.question}</h3>
                            </div>
                            <p className="absolute bottom-8 text-[#86868B] text-sm">Click to flip</p>
                        </div>

                        {/* Back */}
                        <div className="flashcard-face flashcard-back bg-[#F5F5F7] shadow-inner">
                            <div className="max-w-md">
                                <p className="text-[#0071E3] text-xs font-bold uppercase tracking-widest mb-6">Answer</p>
                                <h3 className="text-2xl leading-relaxed text-[#1D1D1F]">{currentCard.answer}</h3>
                            </div>
                            <p className="absolute bottom-8 text-[#86868B] text-sm">Click to flip back</p>
                        </div>
                    </motion.div>
                </div>

                <div className="flex items-center gap-12">
                    <button 
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className={`p-6 rounded-full transition-all ${currentIndex === 0 ? 'text-[#D2D2D7]' : 'bg-white shadow-md hover:scale-110 text-[#1D1D1F]'}`}
                    >
                        <ChevronLeft size={32} />
                    </button>
                    
                    <button 
                        onClick={() => setIsFlipped(false)}
                        className="p-4 text-[#86868B] hover:text-[#0071E3] transition-colors"
                        title="Reset current card"
                    >
                        <RotateCcw size={24} />
                    </button>

                    <button 
                        onClick={handleNext}
                        disabled={currentIndex === cards.length - 1}
                        className={`p-6 rounded-full transition-all ${currentIndex === cards.length - 1 ? 'text-[#D2D2D7]' : 'bg-white shadow-md hover:scale-110 text-[#1D1D1F]'}`}
                    >
                        <ChevronRight size={32} />
                    </button>
                </div>
            </div>

            <div className="mt-auto py-8">
                <div className="w-full bg-[#E8E8ED] h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                        className="h-full bg-[#0071E3]"
                    />
                </div>
            </div>
        </div>
    );
}
