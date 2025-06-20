import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { Info } from '@mui/icons-material';
import { ShapValue } from '../types/explainability';

interface ShapBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: ShapValue;
}

export const ShapBreakdownModal: React.FC<ShapBreakdownModalProps> = ({
  isOpen,
  onClose,
  feature,
}) => {
  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'success.main';
    if (impact < 0) return 'error.main';
    return 'text.secondary';
  };

  const getImpactLabel = (impact: number) => {
    if (impact > 0) return 'Positive Impact';
    if (impact < 0) return 'Negative Impact';
    return 'Neutral Impact';
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={isOpen}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24,
        },
      }}
      onClose={onClose}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">Feature Impact Analysis</Typography>
          <Tooltip title="SHAP values show how each feature contributes to the prediction">
            <Info color="action" fontSize="small" />
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom variant="subtitle1">
            {feature.feature}
          </Typography>
          {feature.description && (
            <Typography paragraph color="text.secondary" variant="body2">
              {feature.description}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom variant="subtitle2">
            Impact Analysis
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              color={getImpactColor(feature.impact)}
              sx={{ fontWeight: 'bold' }}
              variant="h4"
            >
              {feature.impact > 0 ? '+' : ''}
              {feature.impact.toFixed(3)}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {getImpactLabel(feature.impact)}
            </Typography>
          </Box>
        </Box>

        {feature.details && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography gutterBottom variant="subtitle2">
              Additional Details
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {feature.details}
            </Typography>
          </>
        )}

        {feature.weight !== undefined && (
          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom variant="subtitle2">
              Feature Weight
            </Typography>
            <Typography color="text.secondary" variant="body2">
              This feature contributes {feature.weight.toFixed(2)}% to the overall prediction
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
