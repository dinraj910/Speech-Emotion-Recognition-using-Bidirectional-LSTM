"""
Speech Emotion Recognition — Flask API
=======================================
Serves a pre-trained Bidirectional LSTM model for real-time
speech emotion classification from audio input.

Endpoints
---------
POST /predict  — Upload audio file → emotion prediction
GET  /health   — Server health check
"""

import os
import uuid
import logging
import tempfile
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS

from services.feature_extractor import extract_features
from services.inference import EmotionPredictor

# ── Logging Setup ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("SER-API")

# ── Flask App ─────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ── Configuration ─────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "..", "model")

MODEL_PATH = os.path.join(MODEL_DIR, "final_ser_model.keras")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")

ALLOWED_EXTENSIONS = {"wav", "mp3", "webm", "ogg", "flac", "m4a"}
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB

app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

# ── Load Model at Startup ─────────────────────────────────────
predictor = EmotionPredictor(MODEL_PATH, SCALER_PATH)


# ── Helpers ────────────────────────────────────────────────────
def _allowed_file(filename: str) -> bool:
    """Check if the uploaded file has an allowed extension."""
    if "." not in filename:
        # Browser MediaRecorder may send blobs without extension
        return True
    return filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ── Routes ─────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    """Simple health-check endpoint."""
    return jsonify({
        "status": "healthy",
        "model_loaded": predictor.model is not None,
        "timestamp": datetime.utcnow().isoformat(),
    })


@app.route("/predict", methods=["POST"])
def predict():
    """
    Accept an audio file via multipart form-data,
    extract features, and return emotion prediction.
    """
    # ── Validate request ──────────────────────────────────────
    if "file" not in request.files:
        logger.warning("No file part in request")
        return jsonify({"error": "No audio file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        logger.warning("Empty filename")
        return jsonify({"error": "Empty filename"}), 400

    if not _allowed_file(file.filename):
        logger.warning(f"Unsupported file type: {file.filename}")
        return jsonify({"error": "Unsupported audio format"}), 400

    # ── Save to temp file ─────────────────────────────────────
    tmp_path = None
    try:
        # Determine extension (default to .webm for browser recordings)
        ext = ".webm"
        if file.filename and "." in file.filename:
            ext = "." + file.filename.rsplit(".", 1)[1].lower()

        tmp_fd, tmp_path = tempfile.mkstemp(suffix=ext)
        os.close(tmp_fd)
        file.save(tmp_path)

        logger.info(f"Saved temp file: {tmp_path} ({os.path.getsize(tmp_path)} bytes)")

        # ── Feature extraction ────────────────────────────────
        features = extract_features(tmp_path)

        # ── Inference ─────────────────────────────────────────
        result = predictor.predict(features)
        result["timestamp"] = datetime.utcnow().isoformat()

        return jsonify(result), 200

    except ValueError as ve:
        logger.error(f"Validation error: {ve}")
        return jsonify({"error": str(ve)}), 422

    except Exception as e:
        logger.exception("Prediction failed")
        return jsonify({"error": "Internal server error"}), 500

    finally:
        # Clean up temp file
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
            logger.debug(f"Cleaned up: {tmp_path}")


# ── Entry Point ────────────────────────────────────────────────
if __name__ == "__main__":
    logger.info("Starting Speech Emotion Recognition API on port 5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
