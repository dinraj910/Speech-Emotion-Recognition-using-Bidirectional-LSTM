# 🎙️ Speech Emotion Recognition

> Real-time speech emotion detection using a Bidirectional LSTM model, served via a Flask API with a React frontend.

![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.18-orange?logo=tensorflow&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-3.1-black?logo=flask&logoColor=white)

---

## 📋 Overview

This application classifies speech into **four emotions** — Angry, Happy, Sad, Disgust — using a pre-trained Bidirectional LSTM model trained on the **CREMA-D** dataset.

The system captures audio from the browser microphone in real-time, sends 3-second chunks to a Flask backend for feature extraction and inference, and displays results in an interactive dashboard.

---

## 🏗️ Architecture

```
┌──────────────┐    Audio (WebM)    ┌──────────────┐
│   React UI   │ ──────────────────►│  Flask API   │
│   (Vite)     │ ◄────────────────  │  (Python)    │
│              │    JSON Response   │              │
│  Dashboard   │                    │  /predict    │
│  Components  │                    │  /health     │
└──────────────┘                    └──────┬───────┘
                                          │
                                   ┌──────▼───────┐
                                   │   Pipeline   │
                                   │  1. librosa  │
                                   │  2. Scaler   │
                                   │  3. Bi-LSTM  │
                                   └──────────────┘
```

---

## 🔬 Feature Extraction Pipeline

The audio preprocessing exactly mirrors the training pipeline:

| Step | Detail |
|------|--------|
| Resample | 16,000 Hz |
| Trim | Remove leading/trailing silence |
| MFCC | 40 coefficients, n_fft=400, hop=160 |
| Delta | 1st-order derivative of MFCCs |
| Delta² | 2nd-order derivative of MFCCs |
| Stack | 40 + 40 + 40 = **120 features** |
| Sequence | Pad/truncate to **400 frames** |
| Scale | StandardScaler (fitted on training data) |
| Input Shape | `(1, 400, 120)` |

---

## 🧠 Model Summary

- **Type**: Bidirectional LSTM (Keras)
- **Architecture**: Masking → BiLSTM(128) → Dropout → BiLSTM(64) → Dropout → Dense(64, ReLU) → Dense(4, Softmax)
- **Training Data**: CREMA-D (filtered to 4 emotions)
- **Output**: Softmax probabilities for [Angry, Happy, Sad, Disgust]

---

## 📡 API Documentation

### `POST /predict`

Upload an audio file for emotion prediction.

**Request**: `multipart/form-data` with `file` field

**Response**:
```json
{
  "emotion": "Happy",
  "confidence": 0.8423,
  "probabilities": {
    "Angry": 0.0512,
    "Happy": 0.8423,
    "Sad": 0.0601,
    "Disgust": 0.0464
  },
  "timestamp": "2026-02-17T15:45:00.000000"
}
```

### `GET /health`

Health check endpoint.

---

## 📁 Project Structure

```
speech-emotion-app/
├── backend/
│   ├── app.py                  # Flask API server
│   ├── requirements.txt        # Python dependencies
│   └── services/
│       ├── feature_extractor.py  # Audio → MFCC features
│       └── inference.py          # Model prediction service
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmotionCard.jsx     # Detected emotion display
│   │   │   ├── ProbabilityBars.jsx # Probability visualization
│   │   │   ├── Timeline.jsx        # Prediction history
│   │   │   ├── MicRecorder.jsx     # Browser mic recording
│   │   │   └── SessionStats.jsx    # Session analytics
│   │   ├── pages/
│   │   │   └── Dashboard.jsx       # Main dashboard layout
│   │   ├── services/
│   │   │   └── apiService.js       # Axios API wrapper
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   └── package.json
├── model/
│   ├── final_ser_model.keras       # Trained Bi-LSTM model
│   └── scaler.pkl                  # Fitted StandardScaler
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm 9+

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start server
python app.py
# → API running at http://localhost:5000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → App running at http://localhost:5173
```

---

## 🖼️ Screenshots

<!-- Add screenshots here -->

| Dashboard | Live Prediction |
|-----------|-----------------|
| *Coming soon* | *Coming soon* |

---

## 🐳 Docker (Optional)

```dockerfile
# Backend
FROM python:3.9-slim
WORKDIR /app
COPY backend/ .
COPY model/ /app/model/
RUN pip install -r requirements.txt
EXPOSE 5000
CMD ["python", "app.py"]
```

---

## 📝 License

This project is for educational and portfolio purposes.

---

## 🙏 Acknowledgments

- [CREMA-D Dataset](https://github.com/CheyneyComputerScience/CREMA-D) — Crowd-sourced Emotional Multimodal Actors Dataset
- [librosa](https://librosa.org/) — Audio feature extraction
- [TensorFlow/Keras](https://www.tensorflow.org/) — Deep learning framework
