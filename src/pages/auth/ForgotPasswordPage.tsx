import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, TextField, Link, Typography, Alert } from '@mui/material';
import { apiService } from '@/services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      await apiService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" sx={{ width: '100%' }} onSubmit={handleSubmit}>
      <Typography sx={{ mb: 2 }} variant="h6">
        Reset your password
      </Typography>

      <Typography sx={{ mb: 3 }} variant="body2">
        Enter your email address and we'll send you a link to reset your password.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Password reset email sent. Please check your inbox.
        </Alert>
      )}

      <TextField
        autoFocus
        fullWidth
        required
        autoComplete="email"
        id="email"
        label="Email Address"
        margin="normal"
        name="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <Button
        fullWidth
        disabled={isLoading}
        sx={{ mt: 3, mb: 2 }}
        type="submit"
        variant="contained"
      >
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" variant="body2">
          Back to Sign In
        </Link>
      </Box>
    </Box>
  );
}
