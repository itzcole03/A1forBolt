import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error
            console.error("API Error:", error.response.data);
            return Promise.reject(error.response.data);
        } else if (error.request) {
            // Request made but no response
            console.error("Network Error:", error.request);
            return Promise.reject({ message: "Network error occurred" });
        } else {
            // Request setup error
            console.error("Request Error:", error.message);
            return Promise.reject({ message: "Request setup failed" });
        }
    }
);

export const predictionsApi = {
    /**
     * Get predictions for a specific sport and date
     * @param {string} sport - The sport to get predictions for
     * @param {string} date - The date to get predictions for
     * @returns {Promise<Array>} Array of predictions
     */
    getPredictions: async (sport, date) => {
        try {
            const response = await api.get(`/predictions/${sport}`, {
                params: { date }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching predictions:", error);
            throw error;
        }
    },

    /**
     * Get optimized lineup based on predictions
     * @param {Array} predictions - Array of predictions to optimize
     * @param {number} legs - Number of legs in the lineup (2-6)
     * @returns {Promise<Object>} Optimized lineup
     */
    getOptimizedLineup: async (predictions, legs) => {
        try {
            const response = await api.post("/lineup/optimize", {
                predictions,
                legs
            });
            return response.data;
        } catch (error) {
            console.error("Error optimizing lineup:", error);
            throw error;
        }
    },

    /**
     * Get feature importance for a prediction
     * @param {string} predictionId - ID of the prediction
     * @returns {Promise<Object>} Feature importance data
     */
    getFeatureImportance: async (predictionId) => {
        try {
            const response = await api.get(`/predictions/${predictionId}/features`);
            return response.data;
        } catch (error) {
            console.error("Error fetching feature importance:", error);
            throw error;
        }
    },

    /**
     * Get model performance metrics
     * @returns {Promise<Object>} Model performance data
     */
    getModelPerformance: async () => {
        try {
            const response = await api.get("/analytics/model-performance");
            return response.data;
        } catch (error) {
            console.error("Error fetching model performance:", error);
            throw error;
        }
    },

    /**
     * Get real-time odds updates
     * @param {Array} predictionIds - Array of prediction IDs to track
     * @returns {Promise<Object>} Updated odds data
     */
    getOddsUpdates: async (predictionIds) => {
        try {
            const response = await api.post("/odds/updates", {
                predictionIds
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching odds updates:", error);
            throw error;
        }
    }
};