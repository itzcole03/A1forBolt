import React, { useState } from "react";
import { Box, Button, TextField, Typography, CircularProgress, Alert } from "@mui/material";
import { PredictionDisplay } from ".";

interface Features {
  [key: string]: number;
}

interface PredictionResult {
  value: number;
  confidence: number;
  payout: number;
  shap_values: Record<string, number>;
  explanation: string;
}

const DEFAULT_FEATURES: Features = {
  feature1: 0,
  feature2: 0,
  feature3: 0,
};

const validateFeatures = (features: Features) => {
  // Example: all features must be numbers and not NaN
  return Object.values(features).every((v) => typeof v === 'number' && !isNaN(v));
};

const PredictionForm: React.FC = () => {
  const [features, setFeatures] = useState<Features>(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeatures({ ...features, [e.target.name]: parseFloat(e.target.value) });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFeatures(features)) {
      setError("All features must be valid numbers.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Make a Prediction
      </Typography>
      <form onSubmit={handlePredict}>
        {Object.keys(features).map((key) => (
          <TextField
            key={key}
            name={key}
            label={key}
            type="number"
            value={features[key]}
            onChange={handleChange}
            margin="normal"
            fullWidth
            required
          />
        ))}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Predict"}
        </Button>
      </form>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {result && (
        <Box sx={{ mt: 4 }}>
          <PredictionDisplay prediction={{
            value: result.value,
            confidence: result.confidence,
            payout: result.payout,
            shapValues: result.shap_values,
            explanation: result.explanation,
          }} />
        </Box>
      )}
    </Box>
  );
};

export default PredictionForm;
