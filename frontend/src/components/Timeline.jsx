import React from "react";

/**
 * Timeline showing the last N emotion predictions with timestamps.
 */

const EMOTION_COLORS = {
    Angry: "#e74c3c",
    Happy: "#27ae60",
    Sad: "#3498db",
    Disgust: "#8e44ad",
};

const Timeline = ({ history, maxItems = 10 }) => {
    const recent = history.slice(-maxItems).reverse();

    return (
        <div className="timeline-section">
            <h6 className="section-title mb-3">Emotion Timeline</h6>

            {recent.length === 0 ? (
                <p className="text-muted small">No predictions yet</p>
            ) : (
                <div className="timeline-list">
                    {recent.map((entry, idx) => (
                        <div
                            key={idx}
                            className="timeline-item d-flex align-items-center mb-2 p-2"
                            style={{
                                borderLeft: `3px solid ${EMOTION_COLORS[entry.emotion] || "#ccc"}`,
                                backgroundColor: "#fafbfc",
                                borderRadius: "0 6px 6px 0",
                            }}
                        >
                            <span
                                className="badge me-2"
                                style={{
                                    backgroundColor: EMOTION_COLORS[entry.emotion] || "#ccc",
                                    fontSize: "0.75rem",
                                    minWidth: "60px",
                                }}
                            >
                                {entry.emotion}
                            </span>
                            <span className="text-muted small">
                                {new Date(entry.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="ms-auto text-muted small">
                                {(entry.confidence * 100).toFixed(0)}%
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Timeline;
