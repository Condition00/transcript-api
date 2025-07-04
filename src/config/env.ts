import 'dotenv/config';

const requiredEnvVars = [
    'DATABASE_URL'
];

export function validateEnvironment() {
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('Missing required environment variables:', missingVars);
        process.exit(1);
    }
}

// Optional environment variables with defaults
export const config = {
    port: parseInt(process.env.PORT || '3005'),
    databaseUrl: process.env.DATABASE_URL!,
    flaskApiUrl: process.env.FLASK_API_URL || 'http://localhost:5000'
};
