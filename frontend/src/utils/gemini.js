import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGroqApiKey, generateFromGroq } from './groq';

// We'll store the API key in localStorage for now, allowing the user to set it in settings.
const getApiKey = () => import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('GEMINI_API_KEY') || "";

const cleanPaperText = (text) => {
    if (!text) return '';
    
    // Remove common exam headers and metadata using Regex
    return text
        // NC codes / Exam codes like NC870 (E) (N18)V
        .replace(/NC\d+.*?\s/gi, '')
        // Page numbers
        .replace(/Page\s+\d+/gi, '')
        // Date formats like (12041002)
        .replace(/\(\d{8,}\)/g, '')
        // Copyright notices
        .replace(/Copyright.*?\n/gi, '')
        // Exam identifiers like -1- or -2-
        .replace(/-\d+-/g, '')
        // Multiple spaces or line breaks
        .replace(/\s+/g, ' ')
        .trim();
};

const fallbackGenerateQuiz = (paperContent) => {
    const cleaned = cleanPaperText(paperContent);
    const split = cleaned.split(/[\.\n]+/).filter(Boolean);
    const questions = [];

    for (let i = 0; i < split.length && questions.length < 7; i++) {
        const sentence = split[i].trim();
        // Ignore sentences that are too short or look like metadata
        if (sentence.length < 40) continue;
        if (/NC\d+|Page|Copyright|\(\d+\)|- \d+ -/i.test(sentence)) continue;

        const q = sentence.includes('?') ? sentence : `What is the key takeaway regarding: ${sentence}?`;
        questions.push({
            id: i + 1,
            question: q,
            options: [
                'Primary Conclusion',
                'Secondary Effect',
                'Methodological Approach',
                'None of the above'
            ],
            answerIndex: 0,
            explanation: 'Based on the extracted text segment.'
        });
    }

    if (questions.length === 0) {
        questions.push({
            id: 1,
            question: 'What is the primary objective of the source text provided?',
            options: ['Analysis', 'Instruction', 'Examination', 'Review'],
            answerIndex: 0,
            explanation: 'Fallback summary question.'
        });
    }

    return {
        title: 'Document Summary Quiz',
        questions,
    };
};

export const generateQuizFromPaper = async (paperContent, fileType = 'text', options = {}) => {
    const questionCount = options.questionCount || 10;
    const difficulty = options.difficulty || 'medium';
    const offlineMode = options.offlineMode || false;

    if (!paperContent || paperContent.length < 20) {
        throw new Error('Paper content is too short for quiz generation.');
    }

    const apiKey = getApiKey();
    const groqKey = getGroqApiKey();
    if (offlineMode) {
        console.log('Offline mode enabled: using local quiz generation');
        return fallbackGenerateQuiz(paperContent);
    }

    if (groqKey) {
        try {
            return await generateFromGroq(paperContent, questionCount, difficulty);
        } catch (err) {
            console.warn('GROQ generation failed, falling back to Gemini/local', err);
        }
    }

    if (!apiKey) {
        console.warn('No Gemini key available, using local fallback generation');
        return fallbackGenerateQuiz(paperContent);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];

    const getAvailableModel = async () => {
        let lastError;
        for (const modelName of modelNames) {
            try {
                const candidate = genAI.getGenerativeModel({ model: modelName });
                await candidate.generateContent('ping');
                return modelName;
            } catch (error) {
                lastError = error;
                const message = (error && error.message) ? error.message.toLowerCase() : '';
                if (!/not found|404|model_not_found/.test(message)) {
                    throw error;
                }
            }
        }
        throw lastError || new Error('No available Gemini models found. Check API enablement.');
    };

    const prompt = `
        You are an expert educator. Your task is to extract academic quiz questions from the provided text.
        
        CRITICAL RULES:
        1. IGNORE administrative metadata. Skip all headers, footers, copyright notices, page numbers, NC codes, and exam dates (e.g., "(12041002)").
        2. BE CONTENT-AWARE: Start generating questions only from the actual educational content.
        3. Format everything precisely in JSON.

        Generate exactly ${questionCount} ${difficulty} level questions.

        The JSON should follow this structure:
        {
          "title": "Topic-based Title",
          "questions": [
            {
              "id": 1,
              "question": "The question text",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "answerIndex": 0,
              "explanation": "Brief explanation"
            }
          ]
        }

        Only return the JSON object, NO other text.
    `;

    try {
        const selectedModel = await getAvailableModel();
        const model = genAI.getGenerativeModel({ model: selectedModel });
        const result = await model.generateContent(prompt + "\n\nContent:\n" + paperContent);
        const response = await result.response;
        const text = await response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return fallbackGenerateQuiz(paperContent);
    } catch (error) {
        console.error("Gemini Error:", error);
        return fallbackGenerateQuiz(paperContent);
    }
};

const fallbackGenerateFlashcards = (paperContent) => {
    const cleaned = cleanPaperText(paperContent);
    const split = cleaned.split(/[\.\n]+/).filter(Boolean);
    const cards = [];

    for (let i = 0; i < split.length && cards.length < 8; i++) {
        const sentence = split[i].trim();
        if (sentence.length < 50) continue;
        if (/NC\d+|Page|Copyright|\(\d+\)|- \d+ -/i.test(sentence)) continue;

        // Split into two parts for a "question/answer" feel
        const mid = Math.floor(sentence.length / 2);
        const front = sentence.substring(0, mid).trim() + "...";
        const back = "... " + sentence.substring(mid).trim();

        cards.push({
            id: i + 1,
            question: front,
            answer: back,
            starred: false
        });
    }

    if (cards.length === 0) {
        cards.push({
            id: 1,
            question: 'Document Content',
            answer: 'Summary of the uploaded paper and its key educational objectives.',
            starred: false
        });
    }

    return cards;
};

export const generateFlashcardsFromPaper = async (paperContent, options = {}) => {
    const { offlineMode = false } = options;
    if (offlineMode) return fallbackGenerateFlashcards(paperContent);

    const apiKey = getApiKey();
    if (!apiKey) return fallbackGenerateFlashcards(paperContent);

    const cleanedText = cleanPaperText(paperContent);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
        You are an expert tutor. Create a set of 10 high-quality flashcards from the provided text.
        
        CRITICAL RULES:
        1. FOCUS on definitions, key concepts, formulas, and historical dates.
        2. IGNORE metadata, headers, footers, and administrative text.
        3. For each flashcard, provide a "question" (concise term or concept) and an "answer" (comprehensive explanation).
        
        STRUCTURE:
        Return a JSON object:
        {
          "flashcards": [
            {
              "id": 1,
              "question": "The Term or Concept",
              "answer": "The detailed explanation or definition"
            }
          ]
        }
        
        Only return the JSON object.
    `;

    try {
        const result = await model.generateContent(prompt + "\n\nContent:\n" + cleanedText);
        const text = await result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            return data.flashcards.map(c => ({ ...c, starred: false }));
        }
        return fallbackGenerateFlashcards(paperContent);
    } catch (error) {
        console.error("Gemini Flashcard Error:", error);
        return fallbackGenerateFlashcards(paperContent);
    }
};

export const testGeminiKey = async (manualKey = null) => {
    const apiKey = manualKey || getApiKey();
    if (!apiKey) throw new Error('No Gemini API key is set.');

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelNames = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-1.0-pro',
    ];

    let lastError;
    let attemptedModels = [];

    for (const modelName of modelNames) {
        try {
            attemptedModels.push(modelName);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            // Minimal test to check model accessibility
            const result = await model.generateContent('ping');
            const response = await result.response;
            const text = await response.text();
            
            if (text && text.length > 0) {
                return { success: true, model: modelName };
            }
        } catch (error) {
            lastError = error;
            const message = (error && error.message) ? error.message.toLowerCase() : '';
            
            // Fatal auth errors
            if (message.includes('api_key_invalid') || message.includes('invalid api key')) {
                throw new Error('Invalid Gemini API Key. Please regenerate it at https://aistudio.google.com/apikey');
            }
            if (message.includes('permission') || message.includes('forbidden')) {
                throw new Error('API Key Permission Error. Please ensure "Generative Language API" is enabled in your Google Cloud Project.');
            }
            
            // If it's 404, we continue to the next model
            if (/not found|404|model_not_found/.test(message)) {
                continue;
            }
            
            // Stop early for other specific errors (quota, safety)
            throw new Error(`Gemini Error (${modelName}): ${error.message}`);
        }
    }

    // If we're here, all models in our list returned 404
    throw new Error(`No models found (Tried: ${attemptedModels.join(', ')}). This usually means the API is not enabled for your key. Go to https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com and click "Enable".`);
};
