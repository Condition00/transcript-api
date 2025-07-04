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
    return "Transcription service is running"

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
    confidence_scores = []
    for segment in segments:
        transcription += segment.text + " "
        # confidence logic (I used no_speech_prob by faster-whisper for confidence)
        if segment.no_speech_prob is not None:
            confidence_scores.append(1.0 - segment.no_speech_prob)

    # average confidence
    avg_confidence = round(sum(confidence_scores)/len(confidence_scores), 3) if confidence_scores else 0.0

    # Gemini for summarization and action Items. (I have to add confidence logic)
    prompt = f"""
    You are a helpful assistant.

    Here is the transcript of a conversation:

    \"\"\"
    {transcription}
    \"\"\"

    Please do the following:
    1. Provide a concise summary.
    2. List clear and actionable next steps as action items.

    Respond **ONLY in this exact JSON format**:

    {{
    "summary": "<summary>",
    "actionItems": ["<action item 1>", "<action item 2>", "..."]
    }}

    No commentary, no markdown, no formatting — just raw JSON.
    """

    gemini_response = gemini_model.generate_content(prompt)


    #parsing the response idk have to make it strict some eroors (fixed working fine)
    import json
    import re

    # clear accidental newlines
    raw_text = gemini_response.text.strip()

    # Try to extract the first {...} block (if Gemini wrapped it in explanation) (idk gpt does this)
    match = re.search(r'\{.*\}', raw_text, re.DOTALL)

    # json logic
    if match:
        try:
            parsed = json.loads(match.group())
            summary = parsed.get("summary", "")
            action_items = parsed.get("actionItems", [])
        except Exception as err:
            print("❌ Failed to parse cleaned JSON:", err)
            summary = "Summary not generated"
            action_items = []
    else:
        print("❌ No valid JSON found in response")
        summary = "Summary not generated"
        action_items = []

    # Clean up
    os.remove(audio_path)

    return jsonify({"transcript": transcription.strip(),
                    "summary": summary.strip(),
                    "actionItems": action_items,
                    "confidence": avg_confidence
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
