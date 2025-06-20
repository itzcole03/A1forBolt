import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../providers/useAuth';

interface LoginFormProps {
  onSuccess?: () => void;
  onToggleForm?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
      exit={{ opacity: 0, y: -20 }}
      initial={{ opacity: 0, y: 20 }}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="email"
          >
            Email
          </label>
          <input
            required
            className="input-primary mt-1"
            id="email"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="password"
          >
            Password
          </label>
          <input
            required
            className="input-primary mt-1"
            id="password"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <motion.p
            animate={{ opacity: 1 }}
            className="text-sm text-red-600 dark:text-red-400"
            initial={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}

        <button
          className="btn-primary w-full flex justify-center"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor"
              />
            </svg>
          ) : (
            'Sign In'
          )}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button
            className="text-primary-600 dark:text-primary-400 hover:underline focus:outline-none"
            type="button"
            onClick={onToggleForm}
          >
            Sign up
          </button>
        </p>
      </form>
    </motion.div>
  );
};

export default React.memo(LoginForm);
