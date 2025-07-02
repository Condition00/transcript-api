import { Router } from "express";
import multer from "multer";
import { handleTranscription } from "../handlers/transcribe";

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post("/", upload.single("audio"), handleTranscription);

export default router;
