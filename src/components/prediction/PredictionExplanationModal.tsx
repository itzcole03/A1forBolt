import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { ShapExplanation } from './ShapExplanation';
import { PredictionWithExplanation } from '../../core/types/prediction';

interface PredictionExplanationModalProps {
  open: boolean;
  onClose: () => void;
  prediction: PredictionWithExplanation;
}

export const PredictionExplanationModal: React.FC<PredictionExplanationModalProps> = ({
  open,
  onClose,
  prediction,
}) => {
  const [selectedModel, setSelectedModel] = React.useState(0);

  const handleModelChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedModel(newValue);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      open={open}
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh',
        },
      }}
      onClose={onClose}
    >
      <DialogTitle>
        <Box alignItems="center" display="flex" justifyContent="space-between">
          <Typography variant="h6">Prediction Explanation</Typography>
          <Box alignItems="center" display="flex">
            <Tooltip title="SHAP values show how each feature contributes to the prediction">
              <IconButton size="small">
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box mb={3}>
          <Typography gutterBottom variant="subtitle1">
            Overall Prediction
          </Typography>
          <Box alignItems="center" display="flex" gap={2}>
            <Typography color="primary" variant="h4">
              {(prediction.prediction * 100).toFixed(1)}%
            </Typography>
            <Typography color="textSecondary" variant="body2">
              Confidence: {(prediction.confidence * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Box>

        <Tabs
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          value={selectedModel}
          variant="scrollable"
          onChange={handleModelChange}
        >
          {prediction.explanations.map((explanation, index) => (
            <Tab
              key={explanation.modelName}
              id={`model-tab-${index}`}
              label={explanation.modelName}
            />
          ))}
        </Tabs>

        <Box mt={2}>
          {prediction.explanations.map((explanation, index) => (
            <Box
              key={explanation.modelName}
              hidden={selectedModel !== index}
              id={`model-tabpanel-${index}`}
              role="tabpanel"
            >
              <ShapExplanation explanation={explanation} />
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
