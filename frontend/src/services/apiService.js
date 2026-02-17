import axios from "axios";

const API_BASE = "http://localhost:5000";

/**
 * Send an audio blob to the backend for emotion prediction.
 * @param {Blob} audioBlob - Recorded audio blob from MediaRecorder
 * @returns {Promise<Object>} Prediction result
 */
export const predictEmotion = async (audioBlob) => {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");

  const response = await axios.post(`${API_BASE}/predict`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 15000,
  });

  return response.data;
};

/**
 * Check backend health status.
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  const response = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
  return response.data;
};
