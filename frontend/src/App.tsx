import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.js';
import { ProtectedRoute } from './components/auth/ProtectedRoute.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { LoginPage } from './pages/auth/LoginPage.js';
import { DashboardPage } from './pages/dashboard/DashboardPage.js';
import { ProfilePage } from './pages/profile/ProfilePage.js';
import { UnauthorizedPage } from './pages/unauthorized/UnauthorizedPage.js';
import { NotFoundPage } from './pages/notfound/NotFoundPage.js';

import { SubjectsPage } from './pages/academic/SubjectsPage.js';
import { SchedulePage } from './pages/academic/SchedulePage.js';
import { AttendancePage } from './pages/academic/AttendancePage.js';
import { AssignmentsPage } from './pages/academic/AssignmentsPage.js';
import { ExamsPage } from './pages/academic/ExamsPage.js';
import { ResultsPage } from './pages/academic/ResultsPage.js';
import { CalendarPage } from './pages/academic/CalendarPage.js';

import { CampusMapPage } from './pages/campus/CampusMapPage.js';
import { BuildingsPage } from './pages/campus/BuildingsPage.js';
import { BuildingDetailPage } from './pages/campus/BuildingDetailPage.js';
import { FacilitiesPage } from './pages/campus/FacilitiesPage.js';
import { RoomsPage } from './pages/campus/RoomsPage.js';
import { LocationDetailPage } from './pages/campus/LocationDetailPage.js';
import { AdminCampusPage } from './pages/campus/AdminCampusPage.js';

import { NoticesPage } from './pages/services/NoticesPage.js';
import { NoticeDetailPage } from './pages/services/NoticeDetailPage.js';
import { EventsPage } from './pages/services/EventsPage.js';
import { EventDetailPage } from './pages/services/EventDetailPage.js';
import { ClubsPage } from './pages/services/ClubsPage.js';
import { ClubDetailPage } from './pages/services/ClubDetailPage.js';
import { HelpdeskPage } from './pages/services/HelpdeskPage.js';
import { NewServiceRequestPage } from './pages/services/NewServiceRequestPage.js';
import { ServiceRequestDetailPage } from './pages/services/ServiceRequestDetailPage.js';
import { ServiceDirectoryPage } from './pages/services/ServiceDirectoryPage.js';
import { LostFoundPage } from './pages/services/LostFoundPage.js';
import { ReportLostFoundPage } from './pages/services/ReportLostFoundPage.js';
import { LostFoundDetailPage } from './pages/services/LostFoundDetailPage.js';
import { EmergencyPage } from './pages/services/EmergencyPage.js';
import { NotificationsPage } from './pages/services/NotificationsPage.js';
import { AdminServicesPage } from './pages/services/AdminServicesPage.js';
import { AIAssistantPage } from './pages/ai/AIAssistantPage.js';
import { AdminAIPage } from './pages/admin/AdminAIPage.js';
import { AnalyticsDashboardPage } from './pages/analytics/AnalyticsDashboardPage.js';
import { RoleRoute } from './components/auth/RoleRoute.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes wrapped in AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Phase 2 Academic Core Routes */}
              <Route path="/academic" element={<Navigate to="/academic/subjects" replace />} />
              <Route path="/academic/subjects" element={<SubjectsPage />} />
              <Route path="/academic/schedule" element={<SchedulePage />} />
              <Route path="/academic/attendance" element={<AttendancePage />} />
              <Route path="/academic/assignments" element={<AssignmentsPage />} />
              <Route path="/academic/exams" element={<ExamsPage />} />
              <Route path="/academic/results" element={<ResultsPage />} />
              <Route path="/academic/calendar" element={<CalendarPage />} />

              {/* Phase 3 Campus Spatial Core & Wayfinding Routes */}
              <Route path="/campus" element={<Navigate to="/campus/map" replace />} />
              <Route path="/campus/map" element={<CampusMapPage />} />
              <Route path="/campus/buildings" element={<BuildingsPage />} />
              <Route path="/campus/buildings/:id" element={<BuildingDetailPage />} />
              <Route path="/campus/facilities" element={<FacilitiesPage />} />
              <Route path="/campus/rooms" element={<RoomsPage />} />
              <Route path="/campus/locations/:slug" element={<LocationDetailPage />} />

              {/* Phase 4 Campus Services & Engagement Routes */}
              <Route path="/notices" element={<NoticesPage />} />
              <Route path="/notices/:id" element={<NoticeDetailPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/clubs" element={<ClubsPage />} />
              <Route path="/clubs/:slug" element={<ClubDetailPage />} />

              <Route path="/services" element={<ServiceDirectoryPage />} />
              <Route path="/services/directory" element={<ServiceDirectoryPage />} />
              <Route path="/services/requests" element={<HelpdeskPage />} />
              <Route path="/services/requests/new" element={<NewServiceRequestPage />} />
              <Route path="/services/requests/:id" element={<ServiceRequestDetailPage />} />

              <Route path="/lost-found" element={<LostFoundPage />} />
              <Route path="/lost-found/report" element={<ReportLostFoundPage />} />
              <Route path="/lost-found/:id" element={<LostFoundDetailPage />} />

              <Route path="/emergency" element={<EmergencyPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Phase 5 Campus Intelligence & Gemini AI Routes */}
              <Route path="/ai" element={<AIAssistantPage />} />
              <Route path="/assistant" element={<AIAssistantPage />} />
              <Route
                path="/admin/ai"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <AdminAIPage />
                  </RoleRoute>
                }
              />

              {/* Phase 6 Smart Campus Intelligence & Analytics Routes */}
              <Route path="/analytics" element={<AnalyticsDashboardPage />} />
              <Route path="/intelligence" element={<AnalyticsDashboardPage />} />

              {/* Admin Exclusive Spatial & Services Routes */}
              <Route
                path="/admin/campus"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <AdminCampusPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/services"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <AdminServicesPage />
                  </RoleRoute>
                }
              />
            </Route>

            {/* Error & Fallback Routes */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
