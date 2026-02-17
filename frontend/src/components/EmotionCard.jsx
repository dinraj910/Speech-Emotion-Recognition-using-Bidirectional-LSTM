import React from "react";

/**
 * Emotion display card with animated transitions.
 * Shows current detected emotion and confidence percentage.
 */

const EMOTION_CONFIG = {
    Angry: { emoji: "😠", color: "#e74c3c", bg: "#fdecea" },
    Happy: { emoji: "😊", color: "#27ae60", bg: "#e8f8f0" },
    Sad: { emoji: "😢", color: "#3498db", bg: "#eaf2f8" },
    Disgust: { emoji: "🤢", color: "#8e44ad", bg: "#f4ecf7" },
};

const EmotionCard = ({ emotion, confidence }) => {
    const config = EMOTION_CONFIG[emotion] || {
        emoji: "🎙️",
        color: "#95a5a6",
        bg: "#f8f9fa",
    };

    return (
        <div
            className="emotion-card text-center p-4"
            style={{
                backgroundColor: emotion ? config.bg : "#f8f9fa",
                borderLeft: `4px solid ${config.color}`,
                transition: "all 0.4s ease",
            }}
        >
            <div className="emotion-emoji mb-2" style={{ fontSize: "3.5rem" }}>
                {config.emoji}
            </div>

            <h2
                className="emotion-label mb-1"
                style={{ color: config.color, fontWeight: 600 }}
            >
                {emotion || "Waiting..."}
            </h2>

            <p className="confidence-text text-muted mb-0">
                {emotion ? (
                    <>
                        Confidence:{" "}
                        <strong style={{ color: config.color }}>
                            {(confidence * 100).toFixed(1)}%
                        </strong>
                    </>
                ) : (
                    "Start recording to detect emotion"
                )}
            </p>
        </div>
    );
};

export default EmotionCard;
