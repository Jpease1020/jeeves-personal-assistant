import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const app = express();
const PORT = process.env.MCP_QUIZ_PORT || 4013;

app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'quiz-mcp' });
});

// Tool: generate_quiz
app.post('/tools/generate_quiz', async (req, res) => {
    try {
        const { subject, difficulty, count, userId } = req.body;

        if (!subject) {
            return res.status(400).json({ error: 'Subject is required' });
        }

        // Create quiz session
        const { data: session, error: sessionError } = await supabase
            .from('quiz_sessions')
            .insert({
                user_id: userId || 'default-user',
                subject,
                difficulty: difficulty || 'medium'
            })
            .select()
            .single();

        if (sessionError) {
            return res.status(500).json({ error: sessionError.message });
        }

        // Generate questions (simplified - in real app, use AI to generate from study materials)
        const questionCount = count || 5;
        const questions = generateQuestionsForSubject(subject, questionCount);

        // Store questions
        const questionInserts = questions.map(q => ({
            session_id: session.id,
            question: q.question,
            correct_answer: q.answer,
            topic: q.topic
        }));

        const { error: questionsError } = await supabase
            .from('quiz_questions')
            .insert(questionInserts);

        if (questionsError) {
            return res.status(500).json({ error: questionsError.message });
        }

        res.json({
            success: true,
            data: {
                session_id: session.id,
                subject,
                questions: questions.map(q => ({ question: q.question, topic: q.topic }))
            }
        });
    } catch (error: any) {
        console.error('Error generating quiz:', error);
        res.status(500).json({ error: error.message });
    }
});

// Tool: submit_answer
app.post('/tools/submit_answer', async (req, res) => {
    try {
        const { quiz_id, question_id, answer } = req.body;

        if (!question_id || !answer) {
            return res.status(400).json({ error: 'Question ID and answer are required' });
        }

        // Get question
        const { data: question, error: fetchError } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('id', question_id)
            .single();

        if (fetchError || !question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // Check if answer is correct
        const isCorrect = answer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();

        // Update question with user's answer
        const { error: updateError } = await supabase
            .from('quiz_questions')
            .update({
                user_answer: answer,
                is_correct: isCorrect
            })
            .eq('id', question_id);

        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }

        // Update learning progress
        // TODO: Implement spaced repetition logic

        res.json({
            success: true,
            data: {
                is_correct: isCorrect,
                correct_answer: question.correct_answer,
                feedback: isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${question.correct_answer}`
            }
        });
    } catch (error: any) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ error: error.message });
    }
});

// Tool: get_progress
app.post('/tools/get_progress', async (req, res) => {
    try {
        const { subject, userId } = req.body;

        if (!subject) {
            return res.status(400).json({ error: 'Subject is required' });
        }

        const { data, error } = await supabase
            .from('learning_progress')
            .select('*')
            .eq('user_id', userId || 'default-user')
            .eq('subject', subject);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const avgMastery = data && data.length > 0
            ? data.reduce((sum, item) => sum + (item.mastery_level || 0), 0) / data.length
            : 0;

        const weakAreas = data?.filter(item => (item.mastery_level || 0) < 0.5) || [];

        res.json({
            success: true,
            data: {
                subject,
                overall_mastery: avgMastery,
                weak_areas: weakAreas.map(item => item.topic),
                topics: data || []
            }
        });
    } catch (error: any) {
        console.error('Error getting progress:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function to generate sample questions
function generateQuestionsForSubject(subject: string, count: number) {
    const questionBank: Record<string, any[]> = {
        spanish: [
            { question: '¿Cómo estás?', answer: 'How are you?', topic: 'Basic Greetings' },
            { question: 'Translate: The house', answer: 'La casa', topic: 'Vocabulary' },
            { question: 'What is "to eat" in Spanish?', answer: 'comer', topic: 'Verbs' },
            { question: 'Translate: I love you', answer: 'Te amo', topic: 'Phrases' },
            { question: 'What does "Buenos días" mean?', answer: 'Good morning', topic: 'Greetings' }
        ],
        swift: [
            { question: 'What keyword is used to declare a constant in Swift?', answer: 'let', topic: 'Basics' },
            { question: 'What keyword is used for a variable in Swift?', answer: 'var', topic: 'Basics' },
            { question: 'What is the Swift equivalent of NSString?', answer: 'String', topic: 'Types' },
            { question: 'What protocol do types conform to for equality comparison?', answer: 'Equatable', topic: 'Protocols' },
            { question: 'What is the keyword for optional chaining?', answer: '?', topic: 'Optionals' }
        ],
        ai: [
            { question: 'What does LLM stand for?', answer: 'Large Language Model', topic: 'Terminology' },
            { question: 'What is the process of adjusting a pre-trained model called?', answer: 'Fine-tuning', topic: 'Training' },
            { question: 'What does RAG stand for in AI?', answer: 'Retrieval Augmented Generation', topic: 'Techniques' },
            { question: 'What is a neural network layer that processes sequential data?', answer: 'RNN or LSTM', topic: 'Architecture' },
            { question: 'What is the attention mechanism used in transformers?', answer: 'Self-attention', topic: 'Architecture' }
        ],
        green_card: [
            { question: 'How many stripes are on the US flag?', answer: '13', topic: 'US Symbols' },
            { question: 'Who is the current President of the United States?', answer: 'Joe Biden', topic: 'Government' },
            { question: 'What are the first 10 amendments called?', answer: 'Bill of Rights', topic: 'Constitution' },
            { question: 'How many senators does each state have?', answer: '2', topic: 'Government' },
            { question: 'What is the supreme law of the land?', answer: 'The Constitution', topic: 'Constitution' }
        ]
    };

    const questions = questionBank[subject.toLowerCase()] || questionBank.spanish;
    return questions.slice(0, Math.min(count, questions.length));
}

app.listen(PORT, () => {
    console.log(`🎓 Quiz MCP server running on http://localhost:${PORT}`);
});

