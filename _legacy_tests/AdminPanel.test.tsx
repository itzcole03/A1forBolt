import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminPanel from '../AdminPanel';
import { useAuth } from '../../../hooks/useAuth';
import { adminService } from '../../../services/adminService';

// Mock the auth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock the admin service
jest.mock('../../../services/adminService', () => ({
  adminService: {
    getSystemMetrics: jest.fn(),
    getUsers: jest.fn(),
    getSystemLogs: jest.fn(),
    updateUserStatus: jest.fn(),
  },
}));

const mockUser = {
  id: '1',
  email: 'admin@example.com',
  role: 'admin',
};

const mockMetrics = {
  apiStatus: 'online',
  databaseStatus: 'connected',
  websocketStatus: 'active',
  cpuUsage: 32,
  memoryUsage: 4.2,
  storageUsage: 256,
};

const mockUsers = [
  {
    id: '1',
    email: 'user1@example.com',
    role: 'user',
    lastLogin: '2024-03-20T10:00:00Z',
    status: 'active',
  },
  {
    id: '2',
    email: 'user2@example.com',
    role: 'user',
    lastLogin: '2024-03-20T09:00:00Z',
    status: 'suspended',
  },
];

const mockLogs = [
  {
    id: '1',
    timestamp: '2024-03-20T10:00:00Z',
    level: 'info',
    message: 'System started',
    source: 'system',
  },
  {
    id: '2',
    timestamp: '2024-03-20T09:00:00Z',
    level: 'warning',
    message: 'High CPU usage',
    source: 'monitor',
  },
];

describe('AdminPanel', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    (adminService.getSystemMetrics as jest.Mock).mockResolvedValue(mockMetrics);
    (adminService.getUsers as jest.Mock).mockResolvedValue(mockUsers);
    (adminService.getSystemLogs as jest.Mock).mockResolvedValue(mockLogs);
  });

  it('renders the admin panel with overview tab', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminPanel />
      </QueryClientProvider>
    );

    // Check if the title is rendered
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();

    // Check if the tabs are rendered
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Logs')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    // Check if system metrics are loaded
    await waitFor(() => {
      expect(screen.getByText('32%')).toBeInTheDocument();
      expect(screen.getByText('4.2GB')).toBeInTheDocument();
      expect(screen.getByText('256GB')).toBeInTheDocument();
    });
  });

  it('switches to users tab and displays user list', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminPanel />
      </QueryClientProvider>
    );

    // Click on Users tab
    fireEvent.click(screen.getByText('Users'));

    // Check if user list is loaded
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });
  });

  it('handles user status update', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminPanel />
      </QueryClientProvider>
    );

    // Click on Users tab
    fireEvent.click(screen.getByText('Users'));

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });

    // Click suspend button for first user
    const suspendButton = screen.getAllByText('Suspend')[0];
    fireEvent.click(suspendButton);

    // Check if updateUserStatus was called
    await waitFor(() => {
      expect(adminService.updateUserStatus).toHaveBeenCalledWith('1', 'suspend');
    });
  });

  it('displays system logs', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminPanel />
      </QueryClientProvider>
    );

    // Click on Logs tab
    fireEvent.click(screen.getByText('Logs'));

    // Check if logs are loaded
    await waitFor(() => {
      expect(screen.getByText('System started')).toBeInTheDocument();
      expect(screen.getByText('High CPU usage')).toBeInTheDocument();
    });
  });
});
