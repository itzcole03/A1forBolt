import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useStore } from '@/store';
import { authService } from '@/services/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(
        formData.username,
        formData.email,
        formData.password
      );
      setUser(response.user);
      navigate('/');
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography gutterBottom align="center" variant="h4">
            Create Account
          </Typography>
          <Typography align="center" color="text.secondary" sx={{ mb: 4 }} variant="body2">
            Join Betting Analyzer to start tracking your bets
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              autoFocus
              fullWidth
              required
              label="Username"
              margin="normal"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              required
              label="Email"
              margin="normal"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              required
              label="Password"
              margin="normal"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              required
              label="Confirm Password"
              margin="normal"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              disabled={loading}
              size="large"
              sx={{ mt: 3, mb: 2 }}
              type="submit"
              variant="contained"
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link component="button" variant="body2" onClick={() => navigate('/login')}>
                Already have an account? Sign in
              </Link>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
