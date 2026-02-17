"""
Inference Service
-----------------
Loads the pre-trained Bidirectional LSTM model and StandardScaler,
runs prediction on extracted features, and returns structured results.
"""

import os
import numpy as np
import joblib
import logging
import tensorflow as tf

from .feature_extractor import MAX_FRAMES, N_FEATURES

logger = logging.getLogger(__name__)

# Emotion class mapping (must match training label encoding)
CLASS_MAP = {
    0: "Angry",
    1: "Happy",
    2: "Sad",
    3: "Disgust",
}


class EmotionPredictor:
    """Encapsulates model + scaler for speech emotion prediction."""

    def __init__(self, model_path: str, scaler_path: str):
        """
        Load the Keras model and fitted StandardScaler.

        Parameters
        ----------
        model_path : str
            Path to the saved Keras model (.keras or .h5).
        scaler_path : str
            Path to the saved StandardScaler (scaler.pkl).
        """
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler not found: {scaler_path}")

        logger.info(f"Loading model from: {model_path}")
        self.model = tf.keras.models.load_model(model_path)
        logger.info("Model loaded successfully")

        logger.info(f"Loading scaler from: {scaler_path}")
        self.scaler = joblib.load(scaler_path)
        logger.info("Scaler loaded successfully")

    def predict(self, features: np.ndarray) -> dict:
        """
        Apply scaler, reshape, and run model prediction.

        Parameters
        ----------
        features : np.ndarray
            Raw feature matrix of shape (MAX_FRAMES, N_FEATURES).

        Returns
        -------
        dict
            {
                "emotion": str,
                "confidence": float,
                "probabilities": { "Angry": float, ... }
            }
        """
        # Scale features (reshape to 2D for scaler, then back to 3D)
        features_2d = features.reshape(-1, features.shape[-1])
        features_scaled = self.scaler.transform(features_2d)
        features_3d = features_scaled.reshape(1, MAX_FRAMES, N_FEATURES)

        # Run prediction
        probabilities = self.model.predict(features_3d, verbose=0)[0]

        predicted_idx = int(np.argmax(probabilities))
        confidence = float(np.max(probabilities))
        emotion = CLASS_MAP[predicted_idx]

        # Build probability map
        prob_map = {
            CLASS_MAP[i]: round(float(probabilities[i]), 4)
            for i in range(len(CLASS_MAP))
        }

        logger.info(f"Prediction: {emotion} (confidence={confidence:.4f})")

        return {
            "emotion": emotion,
            "confidence": round(confidence, 4),
            "probabilities": prob_map,
        }
