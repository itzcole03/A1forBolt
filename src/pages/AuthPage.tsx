import React, { useState, FormEvent } from 'react';
import { Button } from '@mui/material';
import { useAppStore, AppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';


const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAppStore((state: AppStore) => ({
    login: state.login,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
  }));

  const [email, setEmail] = useState('testuser@example.com'); // Default for easier testing
  const [password, setPassword] = useState('password123'); // Default for easier testing
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
        useAppStore.getState().addToast({message: 'Email and password are required.', type: 'error'});
        setLocalError('Email and password are required.');
        return;
    }
    try {
      await login({ email, password });
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please check your credentials.';
      useAppStore.getState().addToast({message: msg, type: 'error'});
      setLocalError(msg);
    }
  };

  // DEV BYPASS BUTTON (development only)
  const handleDevBypass = () => {
    const token = window.prompt('Paste the JWT token from backend console:');
    if (token && token.length > 10) {
      localStorage.setItem('authToken', token); // Use the correct key for the auth system
      window.location.reload();
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Redirect to dashboard or main app page after login
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    const err = useAppStore.getState().error;
    if (typeof err === 'string' && err.length > 0) {
      setLocalError(err);
      useAppStore.getState().addToast({message: err, type: 'error'});
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-surface p-4">
      <div className="w-full max-w-md p-8 space-y-6 glass rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text">Welcome Back</h1>
          <p className="text-text-muted">Sign in to access your AI Sports Betting Dashboard.</p>
        </div>

        {localError && (
          <div className="p-3 bg-red-500/10 text-red-400 rounded-lg flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-1">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="w-full px-4 py-2 bg-surface/50 border border-gray-600 rounded-lg text-text focus:ring-primary focus:border-primary placeholder-gray-500 shadow-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-1">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="w-full px-4 py-2 bg-surface/50 border border-gray-600 rounded-lg text-text focus:ring-primary focus:border-primary placeholder-gray-500 shadow-sm"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full px-4 py-3 bg-blue-600 text-white border-2 border-blue-800 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center font-semibold text-lg shadow-lg"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
          {/* DEV BYPASS BUTTON: Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              sx={{ mt: 2, border: '2px dashed #1976d2', color: '#1976d2' }}
              onClick={handleDevBypass}
            >
              DEV BYPASS (Paste JWT)
            </Button>
          )}
        </form>
        <p className="text-center text-sm text-text-muted">
          Don't have an account? <a href="#" className="font-medium text-primary hover:underline">Sign Up</a> 
          {/* Sign up functionality is not part of this immediate scope */}
        </p>
      </div>
    </div>
  );
};

export default AuthPage; 