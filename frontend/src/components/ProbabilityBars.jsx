import React from "react";

/**
 * Horizontal probability bars for each emotion class.
 * Smooth animated width transitions.
 */

const BAR_CONFIG = {
    Angry: { color: "#e74c3c", bg: "#fdecea" },
    Happy: { color: "#27ae60", bg: "#e8f8f0" },
    Sad: { color: "#3498db", bg: "#eaf2f8" },
    Disgust: { color: "#8e44ad", bg: "#f4ecf7" },
};

const EMOTION_ORDER = ["Angry", "Happy", "Sad", "Disgust"];

const ProbabilityBars = ({ probabilities }) => {
    return (
        <div className="probability-bars">
            <h6 className="section-title mb-3">Emotion Probabilities</h6>
            {EMOTION_ORDER.map((emotion) => {
                const probability = probabilities?.[emotion] || 0;
                const config = BAR_CONFIG[emotion];
                const percent = (probability * 100).toFixed(1);

                return (
                    <div key={emotion} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="bar-label">{emotion}</span>
                            <span className="bar-value" style={{ color: config.color }}>
                                {percent}%
                            </span>
                        </div>
                        <div
                            className="progress"
                            style={{ height: "10px", backgroundColor: config.bg, borderRadius: "5px" }}
                        >
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                    width: `${percent}%`,
                                    backgroundColor: config.color,
                                    borderRadius: "5px",
                                    transition: "width 0.5s ease",
                                }}
                                aria-valuenow={percent}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProbabilityBars;
