# Transcript API

A TypeScript/Node.js API for audio transcription using Faster Whisper and gemini summarizations, with Express and Python backend integration.

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd transcript-api
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Development

1. Start the development server:
```bash
npm run start:dev
```

2. The API will be available at `http://localhost:3003`

### Production

1. Build the TypeScript code:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Technologies Used

- **Backend:** Express.js, Flask, Multer, Faster Whisper, gemini-2.0-flash
- **Build:** TypeScript, Python 

## License

ISC
