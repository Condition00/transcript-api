import bcrypt from 'bcryptjs';
import prisma from '../prismaClient'
import { generateApiKey } from '../utils/apiKey';
import { Request, Response } from 'express';

export const registerApiKey = async (req: Request, res: Response): Promise<void> => {
    const { email, name } = req.body;

    if (!email || !name) {
        res.status(400).json({ error: 'Email and name are required' });
        return;
    }

    try {

        // check if user exists
        let user = await prisma.user.findUnique({
            where: {
                email: email,
            }
        });

        if (!user) {
            // create user if not exists
            user = await prisma.user.create({
                data: {
                    email: email,
                    name: name,
                }
            });
        }

        // gen plain api key
        const apiKey = generateApiKey();

        // hash the api key
        const hashedApiKey = await bcrypt.hash(apiKey, 10);

        // save to database
        await prisma.apiKey.create({
            data: {
                hashedKey: hashedApiKey,
                userId: user.id,
            }
        });

        res.status(201).json({
            message: 'API key created successfully',
            apiKey: apiKey
        });

    } catch (error) {
        console.error('Error creating API key:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
