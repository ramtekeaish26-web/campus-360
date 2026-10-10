import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NoticesPage } from '../pages/services/NoticesPage.js';
import { EventsPage } from '../pages/services/EventsPage.js';
import { ClubsPage } from '../pages/services/ClubsPage.js';
import { HelpdeskPage } from '../pages/services/HelpdeskPage.js';
import { EmergencyPage } from '../pages/services/EmergencyPage.js';

// Mock Auth Context
vi.mock('../context/AuthContext.js', () => ({
  useAuth: () => ({
    user: {
      id: 'mock-student-id',
      email: 'student@demo.local',
      roles: ['STUDENT'],
      profile: { firstName: 'Demo', lastName: 'Student' },
    },
    isAuthenticated: true,
  }),
}));

// Mock servicesApi
vi.mock('../services/servicesApi.js', () => ({
  servicesApi: {
    getNotices: vi.fn().mockResolvedValue({
      notices: [
        {
          id: 'n1',
          title: 'End-Semester Exam Schedule',
          summary: 'Schedule for autumn examinations released.',
          content: 'Details on timetable.',
          category: 'EXAM',
          priority: 'URGENT',
          publishedAt: new Date().toISOString(),
          author: { id: 'a1', name: 'Admin Office', email: 'admin@tgpcet.edu' },
          isRead: false,
        },
      ],
      total: 1,
    }),
    getEvents: vi.fn().mockResolvedValue({
      events: [
        {
          id: 'e1',
          title: 'Code-A-Thon 2025',
          description: 'Autonomous 24-hour hackathon.',
          category: 'TECHNICAL',
          startDateTime: new Date().toISOString(),
          endDateTime: new Date().toISOString(),
          venue: 'Lab A-101',
          registeredCount: 45,
          capacity: 100,
          registrationRequired: true,
          isRegistered: false,
          organizer: { id: 'f1', name: 'Faculty Coordinator' },
        },
      ],
      total: 1,
    }),
    getClubs: vi.fn().mockResolvedValue({
      clubs: [
        {
          id: 'c1',
          name: 'Coding & Open Source Community',
          slug: 'cosc-tgpcet',
          description: 'Developer hub for web, cloud, and hackathons.',
          category: 'TECHNICAL',
          memberCount: 28,
          isMember: true,
          userRole: 'LEAD',
        },
      ],
    }),
    getServiceRequests: vi.fn().mockResolvedValue({
      requests: [
        {
          id: 'r1',
          title: 'Projector HDMI port broken',
          description: 'No video output signal.',
          category: 'PROJECTOR',
          priority: 'HIGH',
          status: 'OPEN',
          locationDetails: 'Room A-204',
          requester: { id: 's1', name: 'Demo Student', email: 'student@demo.local' },
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
    }),
    getEmergencyContacts: vi.fn().mockResolvedValue({
      contacts: [
        {
          id: 'em1',
          name: 'Campus Security Control Room',
          category: 'SECURITY',
          phone: '+91 712 2800 100',
          instructions: '24/7 security assistance.',
          priority: 1,
          isDemo: true,
          status: 'ACTIVE',
        },
      ],
    }),
  },
}));

describe('Phase 4 Campus Services Frontend Pages', () => {
  it('1. renders NoticesPage with circulars and category filters', async () => {
    render(
      <MemoryRouter>
        <NoticesPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Notices & Circulars/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('End-Semester Exam Schedule')).toBeInTheDocument();
    });
  });

  it('2. renders EventsPage with hackathons and registration badges', async () => {
    render(
      <MemoryRouter>
        <EventsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Campus Events & Hackathons/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Code-A-Thon 2025')).toBeInTheDocument();
    });
  });

  it('3. renders ClubsPage with student communities', async () => {
    render(
      <MemoryRouter>
        <ClubsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Clubs & Student Communities/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Coding & Open Source Community')).toBeInTheDocument();
    });
  });

  it('4. renders HelpdeskPage with tickets', async () => {
    render(
      <MemoryRouter>
        <HelpdeskPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Campus Helpdesk & Service Desk/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Projector HDMI port broken')).toBeInTheDocument();
    });
  });

  it('5. renders EmergencyPage with safety directory', async () => {
    render(
      <MemoryRouter>
        <EmergencyPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Campus Safety & Emergency Contacts/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Campus Security Control Room')).toBeInTheDocument();
    });
  });
});
