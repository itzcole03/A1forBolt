import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

interface LocationState {
  from: {
    pathname: string;
  };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as LocationState)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid email or password');
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
            Welcome Back
          </Typography>
          <Typography align="center" color="text.secondary" sx={{ mb: 4 }} variant="body2">
            Sign in to continue to Betting Analyzer
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              autoFocus
              fullWidth
              required
              label="Email"
              margin="normal"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              required
              label="Password"
              margin="normal"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
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
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link component="button" variant="body2" onClick={() => navigate('/register')}>
                Don't have an account? Sign up
              </Link>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
