import { NextFunction, Request, RequestHandler, Response } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

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

        const flaskResponse = await axios.post<flaskResponseType>('http://localhost:5000/transcribe', {
            audio: audioBase64,
        });

        const { transcript } = flaskResponse.data
        const { summary, actionItems, confidence } = flaskResponse.data;

        //ph
        // const summary = "Sample Summary coming soon!";
        // const actionItems = ["Task 1", "Task 2", "Task 3"];


        fs.unlinkSync(audioPath);

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
