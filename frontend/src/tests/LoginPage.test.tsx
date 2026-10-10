import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage.js';
import { AuthProvider } from '../context/AuthContext.js';

describe('LoginPage Component', () => {
  it('renders login page with TGPCET branding and tabs', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/Access Campus 360/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Student/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Faculty/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Admin/i })).toBeInTheDocument();
  });

  it('switches role tabs and updates demo identifier', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    );

    const facultyTab = screen.getByRole('button', { name: /^Faculty/i });
    fireEvent.click(facultyTab);

    expect(screen.getByDisplayValue('faculty@demo.local')).toBeInTheDocument();

    const adminTab = screen.getByRole('button', { name: /^Admin/i });
    fireEvent.click(adminTab);

    expect(screen.getByDisplayValue('admin@demo.local')).toBeInTheDocument();
  });
});
