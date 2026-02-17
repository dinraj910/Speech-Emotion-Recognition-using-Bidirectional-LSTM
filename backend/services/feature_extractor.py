"""
Feature Extraction Service
--------------------------
Extracts audio features matching the training pipeline exactly:
  - Resample to 16kHz
  - Trim silence
  - 40 MFCCs (n_fft=400, hop_length=160)
  - Delta + Delta-Delta → 120 features
  - Pad/Truncate to 400 frames
"""

import numpy as np
import librosa
import logging

logger = logging.getLogger(__name__)

# ── Constants (must match training notebook) ──────────────────
SAMPLE_RATE = 16000
N_MFCC = 40
N_FFT = 400
HOP_LENGTH = 160
MAX_FRAMES = 400
N_FEATURES = 120  # 40 MFCC + 40 delta + 40 delta²


def extract_features(file_path: str) -> np.ndarray:
    """
    Extract MFCC + delta + delta² features from an audio file.

    Parameters
    ----------
    file_path : str
        Path to the audio file (WAV, MP3, WebM, etc.).

    Returns
    -------
    np.ndarray
        Feature matrix of shape (MAX_FRAMES, N_FEATURES) = (400, 120).

    Raises
    ------
    ValueError
        If the audio is too short after trimming (< 0.1 seconds).
    """
    logger.info(f"Extracting features from: {file_path}")

    # Load and resample to 16 kHz
    y, sr = librosa.load(file_path, sr=SAMPLE_RATE)
    logger.debug(f"Loaded audio: {len(y)} samples, sr={sr}")

    # Trim leading/trailing silence
    y, _ = librosa.effects.trim(y)

    if len(y) < sr * 0.1:
        raise ValueError("Audio too short after trimming silence (< 0.1s)")

    # Extract 40 MFCCs
    mfcc = librosa.feature.mfcc(
        y=y,
        sr=sr,
        n_mfcc=N_MFCC,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
    )

    # Compute delta and delta-delta
    delta = librosa.feature.delta(mfcc)
    delta2 = librosa.feature.delta(mfcc, order=2)

    # Stack → (120, T) then transpose → (T, 120)
    features = np.vstack([mfcc, delta, delta2]).T

    # Pad or truncate to MAX_FRAMES
    features = _pad_or_truncate(features)

    logger.info(f"Feature shape: {features.shape}")
    return features


def _pad_or_truncate(features: np.ndarray) -> np.ndarray:
    """Ensure feature matrix has exactly MAX_FRAMES rows."""
    if features.shape[0] > MAX_FRAMES:
        return features[:MAX_FRAMES]
    elif features.shape[0] < MAX_FRAMES:
        pad_width = MAX_FRAMES - features.shape[0]
        return np.pad(features, ((0, pad_width), (0, 0)), mode="constant")
    return features
