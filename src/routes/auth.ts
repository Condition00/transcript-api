import { Router } from 'express';
import { registerApiKey } from '../handlers/auth';

const router = Router();

router.post('/register', registerApiKey);

export default router;
