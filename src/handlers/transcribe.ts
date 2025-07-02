import { NextFunction, Request, RequestHandler, Response } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export const handleTranscription: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const file = req.file as Express.Multer.File;

    if(!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    try {
        const audioPath = path.resolve(file.path);
        // const audioBase64 = fs.readFileSync(audioPath, { encoding: 'base64' });

        // // transcription via whisper-tiny

        // const whisperResponse = await axios.post('http://localhost:11434/api/generate',{
        //     model: 'whisper-tiny',
        //     audio: audioBase64,
        // });

        // const transcript = whisperResponse.data || '[No transcript returned]';

        //ph
        const transcript = "Sample Transcript output";
        const summary = "Sample Summary output";
        const actionItems = ["Task 1", "Task 2", "Task 3"];


        fs.unlinkSync(audioPath);

        res.json({
            transcript,
            summary,
            actionItems: actionItems,
            confidence: 0.95,
        });
    } catch (err) {
        console.error('Error processing file:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
