import { Request, Response, NextFunction } from 'express';
import prisma from '../prismaClient';
import { verifyApiKey } from '../utils/apiKey';

export const validateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
        res.status(401).json({ error: 'API key is required' });
        return;
    }

    try {
        // Get all API keys from database
        const apiKeys = await prisma.apiKey.findMany({
            select: {
                hashedKey: true,
                userId: true,
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            }
        });

        // Check if the provided API key matches any hashed key
        let validApiKey = null;
        for (const dbApiKey of apiKeys) {
            const isValid = await verifyApiKey(apiKey, dbApiKey.hashedKey);
            if (isValid) {
                validApiKey = dbApiKey;
                break;
            }
        }

        if (!validApiKey) {
            res.status(401).json({ error: 'Invalid API key' });
            return;
        }

        // Add user info to request for use in subsequent handlers
        (req as any).user = validApiKey.user;
        next();
    } catch (error) {
        console.error('Error validating API key:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
