import express from 'express';
import { validateEnvironment, config } from './config/env';
import transcribeRouter from './routes/transcribe';
import authRouter from './routes/auth';

// Validate environment variables before starting
validateEnvironment();

const app = express();

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/transcribe", transcribeRouter);

app.listen(config.port, () => {
  console.log(`Running on ${config.port}`);
});
