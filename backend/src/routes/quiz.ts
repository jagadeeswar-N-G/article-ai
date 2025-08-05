import { Request, Response } from 'express';

export const generateQuiz = (req: Request, res: Response) => {
    const { topic, numberOfQuestions } = req.body;

    // Sample quiz data generation logic
    const quizData = {
        topic: topic || 'General Knowledge',
        questions: Array.from({ length: numberOfQuestions || 5 }, (_, index) => ({
            question: `Sample question ${index + 1} on ${topic || 'General Knowledge'}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            answer: 'Option A' // Placeholder answer
        }))
    };

    res.json(quizData);
};