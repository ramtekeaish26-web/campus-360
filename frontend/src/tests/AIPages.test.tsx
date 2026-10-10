import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AIAssistantPage } from '../pages/ai/AIAssistantPage.js';
import { AdminAIPage } from '../pages/admin/AdminAIPage.js';
import { AuthContext } from '../context/AuthContext.js';

const mockQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const mockStudentAuth: any = {
  user: {
    id: 'd0000000-0000-0000-0000-000000000001',
    email: 'student@demo.local',
    roles: ['STUDENT'],
    profile: {
      firstName: 'Aarav',
      lastName: 'Deshmukh',
      prn: '202201640049281',
      department: { name: 'Computer Science & Engineering' },
    },
  },
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  login: async () => {},
  logout: () => {},
};

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

describe('Phase 5 Campus Intelligence Frontend Pages', () => {
  it('1. renders AIAssistantPage with welcoming header, suggested prompt chips and input form', () => {
    render(
      <QueryClientProvider client={mockQueryClient}>
        <AuthContext.Provider value={mockStudentAuth}>
          <BrowserRouter>
            <AIAssistantPage />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    expect(screen.getAllByText(/Campus Intelligence 360/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Suggested Queries/i)).toBeInTheDocument();
    expect(screen.getAllByText(/My Attendance/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Find Library/i)[0]).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask about your attendance/i)).toBeInTheDocument();
  });

  it('2. renders AdminAIPage with audit log metrics and safety table', () => {
    render(
      <QueryClientProvider client={mockQueryClient}>
        <AuthContext.Provider value={mockAdminAuth}>
          <BrowserRouter>
            <AdminAIPage />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Campus Intelligence Admin Console/i)).toBeInTheDocument();
    expect(screen.getByText(/Total AI Queries/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tool Invocations/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Policy Interceptions/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Safety & Execution Audit Trail/i)).toBeInTheDocument();
  });
});
