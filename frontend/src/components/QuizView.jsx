import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function QuizView({ quiz, onBack }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const questions = quiz.questions;
    const current = questions[currentQuestion];

    const handleAnswer = (index) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(index);
        
        if (index === current.answerIndex) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestion + 1 < questions.length) {
            setCurrentQuestion(c => c + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            setIsFinished(true);
        }
    };

    if (isFinished) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto text-center py-10"
            >
                <div className="glass-card p-10">
                    <CheckCircle2 size={64} className="mx-auto text-success mb-6" />
                    <h2 className="text-4xl font-bold mb-2">Quiz Completed!</h2>
                    <p className="text-muted mb-8">{quiz.title}</p>
                    
                    <div className="text-6xl font-black mb-10">
                        {score} <span className="text-2xl font-normal text-muted">/ {questions.length}</span>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button onClick={onBack} className="btn-ghost flex items-center gap-2">
                            <ArrowLeft size={18} /> Back to Library
                        </button>
                        <button onClick={() => window.location.reload()} className="btn-primary flex items-center gap-2">
                            <RefreshCw size={18} /> Retake Quiz
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={onBack} className="mb-10 btn-apple-secondary">
                <ArrowLeft size={18} /> Back to Library
            </button>

            <div className="mb-10">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-muted text-sm uppercase tracking-wider font-semibold">Question {currentQuestion + 1} of {questions.length}</span>
                    <span className="text-primary font-bold">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-glass-border rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        className="h-full bg-primary"
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card p-8"
                >
                    <h3 className="text-2xl font-semibold mb-8">{current.question}</h3>
                    
                    <div className="grid gap-4">
                        {current.options.map((option, idx) => {
                            let status = "default";
                            if (selectedAnswer !== null) {
                                if (idx === current.answerIndex) status = "correct";
                                else if (idx === selectedAnswer) status = "incorrect";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    className={`p-5 text-left rounded-xl transition-all border ${
                                        status === "correct" ? "bg-success/20 border-success text-success" :
                                        status === "incorrect" ? "bg-error/20 border-error text-error" :
                                        selectedAnswer !== null ? "bg-glass-bg border-glass-border opacity-50" :
                                        "bg-glass-bg border-glass-border hover:border-primary/50 hover:bg-glass-highlight"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{option}</span>
                                        {status === "correct" && <CheckCircle2 size={18} />}
                                        {status === "incorrect" && <XCircle size={18} />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {selectedAnswer !== null && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-8 pt-8 border-t border-glass-border"
                        >
                            <div className="p-4 bg-primary/10 rounded-lg mb-6">
                                <p className="text-sm font-semibold text-primary mb-1">Explanation</p>
                                <p className="text-muted">{current.explanation}</p>
                            </div>
                            
                            <button onClick={nextQuestion} className="w-full btn-primary flex justify-center items-center gap-2">
                                {currentQuestion + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}
                                <ChevronRight size={18} />
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
