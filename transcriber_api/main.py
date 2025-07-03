from flask import Flask, request, jsonify
from faster_whisper import WhisperModel
import base64
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

gemini_model = genai.GenerativeModel("gemini-2.0-flash-001")


app = Flask(__name__)
model = WhisperModel("base", device="cpu", compute_type="int8") # currently cpu (have to default it to gpu)

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

    # Gemini for summarization

    prompt = f"""
    Transcript:
    {transcription}

    Now:
    1. Summarize the conversation.
    2. Extract action items as a JSON list.
    Respond in JSON format:
    {{
    "summary": "<summary here>",
    "actionItems": ["<item 1>", "<item 2>", "..."]
    }}
    """

    gemini_response = gemini_model.generate_content(prompt)

    #parsing the response
    import json
    try:
        parsed = json.loads(gemini_response.text)
        summary = parsed.get("summary", "")
        action_items = parsed.get("actionItems", [])
    except Exception as err:
        print("Failed to parse Gemini response:", err)
        summary = "Failed to summarize"
        action_items = []

    # Clean up
    os.remove(audio_path)

    return jsonify({"transcript": transcription.strip(),
                    "summary": summary.strip(),
                    "actionItems": action_items
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
