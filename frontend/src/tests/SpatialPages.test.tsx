import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';
import { CampusMapPage } from '../pages/campus/CampusMapPage.js';
import { BuildingsPage } from '../pages/campus/BuildingsPage.js';
import { FacilitiesPage } from '../pages/campus/FacilitiesPage.js';
import { RoomsPage } from '../pages/campus/RoomsPage.js';
import { LocationDetailPage } from '../pages/campus/LocationDetailPage.js';
import { spatialApi } from '../services/spatialApi.js';

// Mock spatial API
vi.mock('../services/spatialApi.js', () => ({
  spatialApi: {
    getCampusMap: vi.fn(),
    getBuildings: vi.fn(),
    getBuildingById: vi.fn(),
    getPlaces: vi.fn(),
    getPlaceById: vi.fn(),
    getPlaceBySlug: vi.fn(),
    getRooms: vi.fn(),
    getFacilities: vi.fn(),
    searchCampus: vi.fn(),
    calculateRoute: vi.fn(),
  },
}));

const mockStudentUser = {
  id: 'student-uuid-1',
  email: 'student@demo.local',
  roles: ['STUDENT' as const],
  isActive: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  profile: {
    id: 'prof-1',
    userId: 'student-uuid-1',
    firstName: 'Aarav',
    lastName: 'Sharma',
    prn: 'TGPCET-2023-CS-001',
    department: { id: 'dept-1', name: 'Computer Science', code: 'CSE' },
  },
};

function renderWithProviders(ui: React.ReactElement, user: any = mockStudentUser) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const mockAuth = {
    user,
    token: 'mock-token',
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
    hasRole: (role: any) => user?.roles.includes(role),
    hasAnyRole: (roles: any[]) => roles.some((r) => user?.roles.includes(r)),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={mockAuth as any}>
        <BrowserRouter>{ui}</BrowserRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

describe('Phase 3 Campus Spatial Core Frontend Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders CampusMapPage with category filters and interactive map canvas', async () => {
    vi.mocked(spatialApi.getCampusMap).mockResolvedValueOnce({
      campus: {
        id: 'camp-1',
        name: 'TGPCET Main Campus (Mohgaon)',
        code: 'TGPCET_MOHGAON_MAIN',
        address: 'Mohgaon, Wardha Road, Nagpur',
        latitude: 21.0118,
        longitude: 79.0275,
        status: 'ACTIVE',
      },
      buildings: [
        {
          id: 'bld-1',
          campusId: 'camp-1',
          name: 'Academic Block A',
          code: 'BLD_ACAD_A',
          buildingType: 'ACADEMIC',
          latitude: 21.0130,
          longitude: 79.0280,
          status: 'ACTIVE',
        },
      ],
      places: [
        {
          id: 'pl-1',
          campusId: 'camp-1',
          name: 'Central Library',
          slug: 'central-library',
          categoryId: 'cat-1',
          latitude: 21.0120,
          longitude: 79.0262,
          status: 'ACTIVE',
          category: { id: 'cat-1', code: 'LIBRARY', name: 'Library', displayOrder: 1 },
        },
      ],
      categories: [{ id: 'cat-1', code: 'LIBRARY', name: 'Library', displayOrder: 1 }],
      paths: [],
    });

    renderWithProviders(<CampusMapPage />);

    expect(await screen.findByText(/Campus Spatial Map & Wayfinding/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search library, labs, CSE, canteen.../i)).toBeInTheDocument();
  });

  it('renders BuildingsPage with building cards and type filters', async () => {
    vi.mocked(spatialApi.getBuildings).mockResolvedValueOnce([
      {
        id: 'bld-1',
        campusId: 'camp-1',
        name: 'Academic Block A (CSE, IT)',
        code: 'BLD_ACAD_A',
        description: 'Engineering wing housing Computer Science and IT labs.',
        buildingType: 'ACADEMIC',
        latitude: 21.0130,
        longitude: 79.0280,
        status: 'ACTIVE',
        facilities: [{ facility: { id: 'f-1', code: 'WIFI', name: 'High-Speed Wi-Fi' } }],
      },
    ]);

    renderWithProviders(<BuildingsPage />);

    expect(await screen.findByText(/Campus Building Directory/i)).toBeInTheDocument();
    expect(await screen.findByText(/Academic Block A \(CSE, IT\)/i)).toBeInTheDocument();
    expect(screen.getByText(/All Buildings/i)).toBeInTheDocument();
  });

  it('renders FacilitiesPage with facilities and amenity badges', async () => {
    vi.mocked(spatialApi.getFacilities).mockResolvedValueOnce([
      {
        id: 'fac-1',
        code: 'WIFI',
        name: 'High-Speed Campus Wi-Fi',
        description: 'Institutional fiber network coverage',
        placeFacilities: [],
        buildingFacilities: [],
      },
    ] as any);

    renderWithProviders(<FacilitiesPage />);

    expect(await screen.findByText(/Campus Facilities & Amenities/i)).toBeInTheDocument();
    expect(await screen.findByText(/High-Speed Campus Wi-Fi/i)).toBeInTheDocument();
  });

  it('renders RoomsPage with room list and filters', async () => {
    vi.mocked(spatialApi.getRooms).mockResolvedValueOnce([
      {
        id: 'room-1',
        floorId: 'fl-1',
        roomNumber: '102',
        name: 'Advanced Computing & AI Lab',
        roomType: 'LAB',
        capacity: 45,
        status: 'ACTIVE',
        floor: {
          id: 'fl-1',
          buildingId: 'bld-1',
          name: 'Ground Floor',
          floorNumber: 0,
          displayOrder: 0,
          status: 'ACTIVE',
          building: {
            id: 'bld-1',
            campusId: 'camp-1',
            name: 'Academic Block A',
            code: 'BLD_ACAD_A',
            buildingType: 'ACADEMIC',
            latitude: 21.013,
            longitude: 79.028,
            status: 'ACTIVE',
          },
        },
      },
    ]);

    renderWithProviders(<RoomsPage />);

    expect(await screen.findByText(/Classroom & Laboratory Directory/i)).toBeInTheDocument();
    expect(await screen.findByText(/Advanced Computing & AI Lab/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 102/i)).toBeInTheDocument();
  });

  it('renders LocationDetailPage with QR slug identifier', async () => {
    vi.mocked(spatialApi.getPlaceBySlug).mockResolvedValueOnce({
      id: 'pl-1',
      campusId: 'camp-1',
      name: 'Central Library & Digital Hub',
      slug: 'central-library',
      description: 'Autonomous central repository with over 40,000 technical titles.',
      categoryId: 'cat-1',
      latitude: 21.012,
      longitude: 79.0262,
      phone: '+91 712 280 1024',
      email: 'library@tgpcet.edu.in',
      status: 'ACTIVE',
      category: { id: 'cat-1', code: 'LIBRARY', name: 'Library', displayOrder: 1 },
      facilities: [{ facility: { id: 'f-1', code: 'WIFI', name: 'Wi-Fi' } }],
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            user: mockStudentUser,
            token: 'mock-token',
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
            hasRole: () => true,
            hasAnyRole: () => true,
          } as any}
        >
          <MemoryRouter initialEntries={['/campus/locations/central-library']}>
            <Routes>
              <Route path="/campus/locations/:slug" element={<LocationDetailPage />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Central Library & Digital Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/QR Wayfinding Target/i)).toBeInTheDocument();
  });
});
