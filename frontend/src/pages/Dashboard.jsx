import React, { useState, useCallback, useEffect, useRef } from "react";

import EmotionCard from "../components/EmotionCard";
import ProbabilityBars from "../components/ProbabilityBars";
import Timeline from "../components/Timeline";
import MicRecorder from "../components/MicRecorder";
import SessionStats from "../components/SessionStats";
import { predictEmotion } from "../services/apiService";

/**
 * Main Dashboard page.
 * Manages all state: recording, predictions, session tracking.
 */
const Dashboard = () => {
    // ── State ──────────────────────────────────────────────────
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentEmotion, setCurrentEmotion] = useState(null);
    const [confidence, setConfidence] = useState(0);
    const [probabilities, setProbabilities] = useState({});
    const [history, setHistory] = useState([]);
    const [emotionCounts, setEmotionCounts] = useState({});
    const [sessionStart, setSessionStart] = useState(null);
    const [error, setError] = useState(null);

    // Force re-render for session timer
    const [, setTick] = useState(0);
    const timerRef = useRef(null);

    // Update session timer every second
    useEffect(() => {
        if (isListening && sessionStart) {
            timerRef.current = setInterval(() => setTick((t) => t + 1), 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isListening, sessionStart]);

    // ── Toggle Listening ───────────────────────────────────────
    const handleToggle = useCallback(() => {
        if (!isListening) {
            // Starting a new session
            setSessionStart(Date.now());
            setError(null);
        }
        setIsListening((prev) => !prev);
    }, [isListening]);

    // ── Handle Audio Chunk ─────────────────────────────────────
    const handleAudioReady = useCallback(
        async (audioBlob) => {
            if (isProcessing) return; // Avoid flooding

            setIsProcessing(true);
            setError(null);

            try {
                const result = await predictEmotion(audioBlob);

                setCurrentEmotion(result.emotion);
                setConfidence(result.confidence);
                setProbabilities(result.probabilities);

                // Update history
                const entry = {
                    emotion: result.emotion,
                    confidence: result.confidence,
                    timestamp: new Date().toISOString(),
                };
                setHistory((prev) => [...prev, entry]);

                // Update emotion counts
                setEmotionCounts((prev) => ({
                    ...prev,
                    [result.emotion]: (prev[result.emotion] || 0) + 1,
                }));
            } catch (err) {
                console.error("Prediction error:", err);
                setError(
                    err.response?.data?.error || "Failed to connect to server"
                );
            } finally {
                setIsProcessing(false);
            }
        },
        [isProcessing]
    );

    const totalPredictions = history.length;

    return (
        <div className="dashboard-container">
            {/* ── Header ─────────────────────────────────────────── */}
            <header className="text-center mb-4">
                <h1 className="app-title">Speech Emotion Recognition</h1>
                <p className="app-subtitle text-muted">
                    Real-time emotion detection using LSTM
                </p>
            </header>

            <div className="container">
                <div className="row g-4">
                    {/* ── Left Column ────────────────────────────────── */}
                    <div className="col-lg-8">
                        {/* Mic Recorder */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body p-4">
                                <MicRecorder
                                    isListening={isListening}
                                    onToggle={handleToggle}
                                    onAudioReady={handleAudioReady}
                                />

                                {/* Loading indicator */}
                                {isProcessing && (
                                    <div className="text-center mt-3">
                                        <div
                                            className="spinner-border spinner-border-sm text-primary"
                                            role="status"
                                        >
                                            <span className="visually-hidden">Analyzing...</span>
                                        </div>
                                        <span className="ms-2 text-muted small">
                                            Analyzing audio...
                                        </span>
                                    </div>
                                )}

                                {/* Error display */}
                                {error && (
                                    <div className="alert alert-warning mt-3 mb-0 py-2 small">
                                        ⚠️ {error}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Emotion Card */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body p-4">
                                <EmotionCard
                                    emotion={currentEmotion}
                                    confidence={confidence}
                                />
                            </div>
                        </div>

                        {/* Probability Bars */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body p-4">
                                <ProbabilityBars probabilities={probabilities} />
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column ───────────────────────────────── */}
                    <div className="col-lg-4">
                        {/* Timeline */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body p-4">
                                <Timeline history={history} maxItems={10} />
                            </div>
                        </div>

                        {/* Session Stats */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body p-4">
                                <SessionStats
                                    sessionStart={sessionStart}
                                    emotionCounts={emotionCounts}
                                    totalPredictions={totalPredictions}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
