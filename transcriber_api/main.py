from flask import Flask, request, jsonify
from faster_whisper import WhisperModel
import base64
import os

app = Flask(__name__)

# Load GPU-accelerated Whisper model
model = WhisperModel("base", compute_type="float16")

@app.route("/")
def home():
    return "Transcription API is running ✅"

@app.route("/transcribe", methods=["POST"])
def transcribe():
    data = request.get_json()
    audio_base64 = data.get("audio")

    if not audio_base64:
        return jsonify({"error": "Missing audio"}), 400

    # Save temp audio file
    audio_path = "temp_audio.wav"
    with open(audio_path, "wb") as f:
        f.write(base64.b64decode(audio_base64))

    # Run transcription
    segments, _ = model.transcribe(audio_path)

    transcription = ""
    for segment in segments:
        transcription += segment.text + " "

    # Clean up
    os.remove(audio_path)

    return jsonify({"transcript": transcription.strip()})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
