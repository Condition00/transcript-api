import { NextFunction, Request, RequestHandler, Response } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { config } from '../config/env';

type flaskResponseType = {
    transcript: string;
    summary: string;
    actionItems: string[];
    confidence: number;
}

export const handleTranscription: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const file = req.file as Express.Multer.File;

    if(!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    try {
        const audioPath = path.resolve(file.path);
        const audioBase64 = fs.readFileSync(audioPath, { encoding: 'base64' });

        const flaskResponse = await axios.post<flaskResponseType>(`${config.flaskApiUrl}/transcribe`, {
            audio: audioBase64,
        });

        const { transcript } = flaskResponse.data
        const { summary, actionItems, confidence } = flaskResponse.data;

        //ph
        // const summary = "Sample Summary coming soon!";
        // const actionItems = ["Task 1", "Task 2", "Task 3"];


        // Clean up uploaded file
        try {
            fs.unlinkSync(audioPath);
        } catch (cleanupError) {
            console.warn('Failed to delete uploaded file:', cleanupError);
        }

        res.json({
            transcript,
            summary,
            actionItems: actionItems,
            confidence: confidence,
        });
    } catch (err) {
        console.error('Error processing file:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
