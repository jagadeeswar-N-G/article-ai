import { Request, Response } from 'express';
import { storeEmbedding } from '../utils/embed';

export const embedData = async (req: Request, res: Response) => {
    try {
        const { data } = req.body;
        if (!data) {
            return res.status(400).json({ error: 'Data is required' });
        }

        const embedding = await storeEmbedding(data);
        return res.status(200).json({ embedding });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while storing the embedding' });
    }
};