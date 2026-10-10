import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationsPage } from '../pages/services/NotificationsPage.js';
import { AuthContext } from '../context/AuthContext.js';

const mockQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const mockAdminAuth: any = {
  user: {
    id: 'd0000000-0000-0000-0000-000000000003',
    email: 'admin@demo.local',
    roles: ['ADMIN'],
    profile: {
      firstName: 'Admin',
      lastName: 'Officer',
      prn: 'ADM-TGPCET-01',
    },
  },
  token: 'mock-admin-token',
  isAuthenticated: true,
  isLoading: false,
  login: async () => {},
  logout: () => {},
};

const mockStudentAuth: any = {
  user: {
    id: 'd0000000-0000-0000-0000-000000000001',
    email: 'student@demo.local',
    roles: ['STUDENT'],
    profile: {
      firstName: 'Aarav',
      lastName: 'Deshmukh',
      prn: '202201640049281',
    },
  },
  token: 'mock-student-token',
  isAuthenticated: true,
  isLoading: false,
  login: async () => {},
  logout: () => {},
};

describe('Phase 7 Proactive Notifications Frontend Tests', () => {
  it('1. renders Admin notifications page with broadcast and audit tools', async () => {
    render(
      <QueryClientProvider client={mockQueryClient}>
        <AuthContext.Provider value={mockAdminAuth}>
          <BrowserRouter>
            <NotificationsPage />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Smart Campus Notification Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Broadcast/i)).toBeInTheDocument();
    expect(screen.getByText(/Audit/i)).toBeInTheDocument();
    expect(screen.getByText(/Preferences/i)).toBeInTheDocument();
    expect(screen.getByText(/Ask AI About Today's Alerts & Deadlines/i)).toBeInTheDocument();
  });

  it('2. renders Student notification center without Admin Broadcast button', async () => {
    render(
      <QueryClientProvider client={mockQueryClient}>
        <AuthContext.Provider value={mockStudentAuth}>
          <BrowserRouter>
            <NotificationsPage />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Smart Campus Notification Center/i)).toBeInTheDocument();
    expect(screen.queryByText(/Broadcast/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Audit/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Preferences/i)).toBeInTheDocument();
  });
});
