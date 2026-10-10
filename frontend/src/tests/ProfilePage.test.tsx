import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ProfilePage } from '../pages/profile/ProfilePage.js';
import * as AuthContextModule from '../context/AuthContext.js';

describe('ProfilePage Component', () => {
  it('renders student profile information correctly', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'd0000000-0000-0000-0000-000000000001',
        email: 'student@demo.local',
        isActive: true,
        roles: ['STUDENT'],
        profile: {
          id: 'e0000000-0000-0000-0000-000000000001',
          firstName: 'Aarav',
          lastName: 'Deshmukh',
          prn: '202201640049281',
          phone: '+91 98765 43210',
          bio: 'Final-Year B.Tech Candidate (CSE)',
          avatarUrl: null,
          department: {
            id: 'b0000000-0000-0000-0000-000000000001',
            code: 'CSE',
            name: 'Computer Science & Engineering',
          },
          program: {
            id: 'c0000000-0000-0000-0000-000000000001',
            code: 'BTECH_CSE',
            name: 'B.Tech in Computer Science & Engineering',
            degree: 'B.Tech',
            durationYears: 4,
          },
        },
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      hasRole: vi.fn().mockReturnValue(true),
      hasAnyRole: vi.fn().mockReturnValue(true),
    });

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Aarav Deshmukh')).toBeInTheDocument();
    expect(screen.getAllByText(/202201640049281/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Computer Science & Engineering/i).length).toBeGreaterThanOrEqual(1);
  });
});
