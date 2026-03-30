const GROQ_API_KEY = 'GROQ_API_KEY';
const GROQ_API_BASE = 'GROQ_API_BASE';

export const getGroqApiKey = () => import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem(GROQ_API_KEY) || '';
export const setGroqApiKey = (value) => {
    if (value) {
        localStorage.setItem(GROQ_API_KEY, value);
    } else {
        localStorage.removeItem(GROQ_API_KEY);
    }
};

export const getGroqApiBase = () => {
    return localStorage.getItem(GROQ_API_BASE) || import.meta.env.VITE_GROQ_API_BASE || 'https://api.groq.dev';
};

export const setGroqApiBase = (value) => {
    if (value) {
        localStorage.setItem(GROQ_API_BASE, value);
    } else {
        localStorage.removeItem(GROQ_API_BASE);
    }
};

export const testGroqKey = async (manualKey = null) => {
    const apiKey = manualKey || getGroqApiKey();
    if (!apiKey) throw new Error('No GROQ API key is set. Save your key in settings first.');

    const base = getGroqApiBase();
    const endpoints = ['/v1/test', '/v1/parse', '/v1/models', '/v1/generate', '/v1/engines'];

    let lastError = null;
    for (const path of endpoints) {
        const endpoint = `${base.replace(/\/+$/, '')}${path}`;
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                return true;
            }

            if (response.status === 401 || response.status === 403) {
                const text = await response.text();
                throw new Error(`GROQ key invalid or forbidden (${response.status}): ${text}`);
            }

            if (response.status === 404) {
                lastError = new Error(`GROQ key test endpoint not found at ${endpoint} (404)`);
                continue;
            }

            lastError = new Error(`GROQ key test failed at ${endpoint}: ${response.status} ${await response.text()}`);
        } catch (error) {
            lastError = error;
            // If the server refuses at this endpoint, try the next candidate endpoint.
        }
    }

    const errMsg = lastError
        ? `GROQ key test failed: ${lastError.message}`
        : 'GROQ key test failed: no working endpoint found';
    console.warn(errMsg);
    throw new Error(errMsg);
};

const cleanPaperText = (text) => {
    if (!text) return '';
    return text
        .replace(/NC\d+.*?\s/gi, '')
        .replace(/Page\s+\d+/gi, '')
        .replace(/\(\d{8,}\)/g, '')
        .replace(/Copyright.*?\n/gi, '')
        .replace(/-\d+-/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

export const generateFromGroq = async (paperText, questionCount = 10, difficulty = 'medium', type = 'quiz') => {
    const apiKey = getGroqApiKey();
    if (!apiKey) throw new Error('No GROQ API key is set.');

    const cleanedText = cleanPaperText(paperText);
    const base = getGroqApiBase();
    const candidates = [
        { path: '/v1/parse', canBeJSON: true },
        { path: '/v1/generate', canBeJSON: false },
    ];

    const isFlashcard = type === 'flashcard';
    const systemPrompt = isFlashcard 
        ? `Generate 10 Smart Flashcards. Format: JSON with "flashcards" array of {id, question: "Concept", answer: "Explanation"}. IGNORE metadata.`
        : `Generate a JSON quiz. IGNORE headers, footers, and metadata. Extract ${questionCount} ${difficulty} level questions from the academic content only. Return ONLY JSON.`;

    let lastError;
    for (const candidate of candidates) {
        const endpoint = `${base}${candidate.path}`;
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: cleanedText,
                    questionCount,
                    difficulty,
                    type,
                    ...(candidate.path === '/v1/generate' && {
                        prompt: systemPrompt,
                    }),
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                lastError = new Error(`GROQ generate (${endpoint}) failed with ${response.status}: ${errorText}`);
                if (response.status === 401 || response.status === 403) {
                    throw lastError;
                }
                continue;
            }

            const result = await response.json();
            
            // Handle Flashcard format
            if (isFlashcard && result.flashcards) {
                return result.flashcards;
            }

            // Handle Quiz format
            if (result && result.questions && Array.isArray(result.questions)) {
                return {
                    title: result.title || 'GROQ Quiz',
                    questions: result.questions,
                };
            }

            lastError = new Error(`GROQ response unexpected format from ${endpoint}`);
            continue;
        } catch (error) {
            lastError = error;
            if (/invalid|forbidden|401|403/.test(error.message.toLowerCase())) {
                throw error;
            }
        }
    }

    console.warn('GROQ all endpoints failed', lastError);
    throw lastError || new Error('GROQ generate failed for all endpoints');
};
