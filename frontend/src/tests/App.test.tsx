import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from '../App.js';

describe('App Routing & Route Protection', () => {
  it('redirects unauthenticated users to /login when attempting to access root or dashboard', async () => {
    // Clear any token in localStorage
    localStorage.removeItem('campus360_token');

    render(<App />);

    // Unauthenticated state should present the login interface
    expect(await screen.findByText(/Access Campus 360/i)).toBeInTheDocument();
  });
});
