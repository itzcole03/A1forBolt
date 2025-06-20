import React, { useState } from 'react';
import {
  Fab,
  Modal,
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { Feedback as FeedbackIcon } from '@mui/icons-material';
import { useStorage } from '../hooks/useStorage';

interface FeedbackData {
  rating: number;
  comment: string;
  timestamp: number;
}

export const FeedbackWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const { clearAllCaches } = useStorage();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setRating(null);
    setComment('');
  };

  const handleSubmit = async () => {
    try {
      const feedback: FeedbackData = {
        rating: rating || 0,
        comment,
        timestamp: Date.now(),
      };

      // Store feedback in localStorage
      const existingFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
      existingFeedback.push(feedback);
      localStorage.setItem('userFeedback', JSON.stringify(existingFeedback));

      // Show success message
      setSnackbar({
        open: true,
        message: 'Thank you for your feedback!',
      });

      handleClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to submit feedback. Please try again.',
      });
    }
  };

  return (
    <>
      <Fab
        aria-label="feedback"
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={handleOpen}
      >
        <FeedbackIcon />
      </Fab>

      <Modal
        aria-labelledby="feedback-modal"
        open={open}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClose={handleClose}
      >
        <Box
          sx={{
            position: 'relative',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography gutterBottom component="h2" variant="h6">
            Share Your Feedback
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography component="legend">How was your experience?</Typography>
            <Rating size="large" value={rating} onChange={(_, newValue) => setRating(newValue)} />
          </Box>

          <TextField
            fullWidth
            multiline
            label="Additional Comments"
            rows={4}
            sx={{ mb: 3 }}
            value={comment}
            onChange={e => setComment(e.target.value)}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button disabled={!rating} variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        autoHideDuration={6000}
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity="success"
          sx={{ width: '100%' }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
