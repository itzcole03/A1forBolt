import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, TextField, Link, Typography, Alert } from '@mui/material';
import { useStore } from '@/store';
import { apiService } from '@/services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useStore(state => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await apiService.login(email, password);
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" sx={{ width: '100%' }} onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
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

      <TextField
        fullWidth
        required
        autoComplete="current-password"
        id="password"
        label="Password"
        margin="normal"
        name="password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <Button
        fullWidth
        disabled={isLoading}
        sx={{ mt: 3, mb: 2 }}
        type="submit"
        variant="contained"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ mb: 1 }} variant="body2">
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register" variant="body2">
            Sign up
          </Link>
        </Typography>
        <Link component={RouterLink} to="/forgot-password" variant="body2">
          Forgot password?
        </Link>
      </Box>
    </Box>
  );
}
