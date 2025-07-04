import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export function generateApiKey(): string {
    return crypto.randomBytes(32).toString('hex');
}

export async function verifyApiKey(apiKey: string, hashedApiKey: string): Promise<boolean> {
    return bcrypt.compare(apiKey, hashedApiKey);
}
