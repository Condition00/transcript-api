import { Router } from "express";
import multer from "multer";
import { handleTranscription } from "../handlers/transcribe";
import { validateApiKey } from "../middleware/auth";

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post("/", validateApiKey, upload.single("audio"), handleTranscription);

export default router;
