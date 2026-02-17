import React, { useRef, useState, useCallback, useEffect } from "react";

/**
 * Microphone recorder using the browser MediaRecorder API.
 * Records 3-second audio chunks and calls onAudioReady callback.
 */

const CHUNK_DURATION = 3000; // 3 seconds

const MicRecorder = ({ isListening, onToggle, onAudioReady }) => {
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);
    const [micStatus, setMicStatus] = useState("idle"); // idle | requesting | active | error

    /**
     * Start recording: get microphone permission,
     * then continuously record 3-second chunks.
     */
    const startRecording = useCallback(async () => {
        try {
            setMicStatus("requesting");

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });

            streamRef.current = stream;
            setMicStatus("active");

            // Function to record one chunk
            const recordChunk = () => {
                if (!streamRef.current) return;

                const mediaRecorder = new MediaRecorder(streamRef.current, {
                    mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                        ? "audio/webm;codecs=opus"
                        : "audio/webm",
                });

                const chunks = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunks.push(e.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    if (chunks.length > 0) {
                        const blob = new Blob(chunks, { type: "audio/webm" });
                        onAudioReady(blob);
                    }
                };

                mediaRecorderRef.current = mediaRecorder;
                mediaRecorder.start();

                // Stop after CHUNK_DURATION ms
                setTimeout(() => {
                    if (mediaRecorder.state === "recording") {
                        mediaRecorder.stop();
                    }
                }, CHUNK_DURATION);
            };

            // Record first chunk immediately
            recordChunk();

            // Then record every CHUNK_DURATION
            intervalRef.current = setInterval(recordChunk, CHUNK_DURATION + 200);
        } catch (err) {
            console.error("Microphone access error:", err);
            setMicStatus("error");
        }
    }, [onAudioReady]);

    /**
     * Stop recording: stop MediaRecorder, release stream, clear interval.
     */
    const stopRecording = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state === "recording"
        ) {
            mediaRecorderRef.current.stop();
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        setMicStatus("idle");
    }, []);

    // React to parent toggle
    useEffect(() => {
        if (isListening) {
            startRecording();
        } else {
            stopRecording();
        }

        return () => stopRecording();
    }, [isListening, startRecording, stopRecording]);

    // Status indicator styling
    const statusConfig = {
        idle: { text: "Microphone Off", color: "#95a5a6", icon: "🎙️" },
        requesting: { text: "Requesting Access...", color: "#f39c12", icon: "⏳" },
        active: { text: "Listening...", color: "#27ae60", icon: "🔴" },
        error: { text: "Mic Error", color: "#e74c3c", icon: "⚠️" },
    };

    const status = statusConfig[micStatus];

    return (
        <div className="mic-recorder text-center">
            {/* Status Indicator */}
            <div className="d-flex align-items-center justify-content-center mb-3">
                <span
                    className="mic-dot me-2"
                    style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: status.color,
                        animation: micStatus === "active" ? "pulse 1.5s infinite" : "none",
                    }}
                />
                <span className="small" style={{ color: status.color }}>
                    {status.text}
                </span>
            </div>

            {/* Toggle Button */}
            <button
                className={`btn btn-lg ${isListening ? "btn-outline-danger" : "btn-primary"
                    } rounded-pill px-4`}
                onClick={onToggle}
                disabled={micStatus === "requesting"}
            >
                {status.icon}{" "}
                {isListening ? "Stop Listening" : "Start Listening"}
            </button>
        </div>
    );
};

export default MicRecorder;
