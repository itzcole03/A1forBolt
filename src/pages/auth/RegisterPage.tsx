import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, TextField, Link, Typography, Alert, Grid } from '@mui/material';
import { useStore } from '@/store';
import { apiService } from '@/services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useStore(state => state.setUser);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const user = await apiService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create account. Please try again.');
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

      <Grid container spacing={2}>
        <Grid item sm={6} xs={12}>
          <TextField
            fullWidth
            required
            autoComplete="given-name"
            id="firstName"
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item sm={6} xs={12}>
          <TextField
            fullWidth
            required
            autoComplete="family-name"
            id="lastName"
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </Grid>
      </Grid>

      <TextField
        fullWidth
        required
        autoComplete="email"
        id="email"
        label="Email Address"
        margin="normal"
        name="email"
        value={formData.email}
        onChange={handleChange}
      />

      <TextField
        fullWidth
        required
        autoComplete="new-password"
        id="password"
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
        autoComplete="new-password"
        id="confirmPassword"
        label="Confirm Password"
        margin="normal"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
      />

      <Button
        fullWidth
        disabled={isLoading}
        sx={{ mt: 3, mb: 2 }}
        type="submit"
        variant="contained"
      >
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" variant="body2">
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
