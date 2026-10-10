import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnalyticsDashboardPage } from '../pages/analytics/AnalyticsDashboardPage.js';
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

describe('Phase 6 Smart Campus Analytics Frontend Tests', () => {
  it('1. renders Admin analytics dashboard with filters and export button', async () => {
    render(
      <QueryClientProvider client={mockQueryClient}>
        <AuthContext.Provider value={mockAdminAuth}>
          <BrowserRouter>
            <AnalyticsDashboardPage />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Campus 360 Intelligence & Analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/ADMIN INTELLIGENCE/i)).toBeInTheDocument();
    expect(screen.getByText(/Export CSV/i)).toBeInTheDocument();
    expect(screen.getByText(/TODAY/i)).toBeInTheDocument();
    expect(screen.getByText(/30D/i)).toBeInTheDocument();
  });

  it('2. renders Student analytics dashboard without Admin institutional export', async () => {
    render(
      <QueryClientProvider client={mockQueryClient}>
        <AuthContext.Provider value={mockStudentAuth}>
          <BrowserRouter>
            <AnalyticsDashboardPage />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Campus 360 Intelligence & Analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/STUDENT INTELLIGENCE/i)).toBeInTheDocument();
    expect(screen.queryByText(/Export CSV/i)).not.toBeInTheDocument();
  });
});
