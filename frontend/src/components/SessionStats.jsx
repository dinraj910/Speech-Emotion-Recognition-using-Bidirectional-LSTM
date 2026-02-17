import React from "react";

/**
 * Session analytics: duration, emotion counts, and time distribution.
 */

const EMOTION_COLORS = {
    Angry: "#e74c3c",
    Happy: "#27ae60",
    Sad: "#3498db",
    Disgust: "#8e44ad",
};

/**
 * Format seconds into MM:SS string.
 */
const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const SessionStats = ({ sessionStart, emotionCounts, totalPredictions }) => {
    // Calculate session duration
    const elapsed = sessionStart
        ? Math.floor((Date.now() - sessionStart) / 1000)
        : 0;

    // Calculate percentage for each emotion
    const emotionPercentages = {};
    const emotions = ["Angry", "Happy", "Sad", "Disgust"];

    emotions.forEach((emotion) => {
        const count = emotionCounts[emotion] || 0;
        emotionPercentages[emotion] =
            totalPredictions > 0 ? ((count / totalPredictions) * 100).toFixed(1) : "0.0";
    });

    return (
        <div className="session-stats">
            <h6 className="section-title mb-3">Session Analytics</h6>

            {/* Duration */}
            <div className="stat-row d-flex justify-content-between align-items-center mb-3 p-2 stat-item">
                <span className="text-muted">Session Duration</span>
                <strong>{formatDuration(elapsed)}</strong>
            </div>

            <div className="stat-row d-flex justify-content-between align-items-center mb-3 p-2 stat-item">
                <span className="text-muted">Total Predictions</span>
                <strong>{totalPredictions}</strong>
            </div>

            {/* Emotion Breakdown */}
            <div className="emotion-breakdown mt-3">
                <p className="small text-muted mb-2">Emotion Distribution</p>
                {emotions.map((emotion) => (
                    <div
                        key={emotion}
                        className="d-flex justify-content-between align-items-center mb-2"
                    >
                        <div className="d-flex align-items-center">
                            <span
                                className="me-2"
                                style={{
                                    display: "inline-block",
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    backgroundColor: EMOTION_COLORS[emotion],
                                }}
                            />
                            <span className="small">{emotion}</span>
                        </div>
                        <div className="text-end">
                            <span className="small text-muted me-2">
                                {emotionCounts[emotion] || 0}×
                            </span>
                            <span
                                className="small fw-bold"
                                style={{ color: EMOTION_COLORS[emotion] }}
                            >
                                {emotionPercentages[emotion]}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SessionStats;
