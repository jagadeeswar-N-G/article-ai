import { Request, Response } from 'express';
import { retrieveAnswer } from '../utils/qdrant';

export const askQuestion = async (req: Request, res: Response) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    try {
        const answer = await retrieveAnswer(question);
        return res.status(200).json({ answer });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};