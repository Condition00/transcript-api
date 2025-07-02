import express from 'express';
import transcribeRouter from './routes/transcribe';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use("/api/transcribe", transcribeRouter);

app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});
