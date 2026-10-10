import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldAlert,
  Building2,
  MapPin,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Footprints,
} from 'lucide-react';
import { spatialApi } from '../../services/spatialApi.js';
import { Building, CampusPlace, Facility, Room } from '../../types/spatial.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';

export const AdminCampusPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'buildings' | 'places' | 'facilities' | 'rooms'>('buildings');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form States
  const [buildingForm, setBuildingForm] = useState({
    name: '',
    code: '',
    description: '',
    buildingType: 'ACADEMIC',
    latitude: 21.0125,
    longitude: 79.0275,
  });

  const [placeForm, setPlaceForm] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    latitude: 21.0125,
    longitude: 79.0275,
    phone: '',
    email: '',
  });

  // Queries
  const { data: mapBundle, isLoading } = useQuery({
    queryKey: ['admin-campus-bundle'],
    queryFn: () => spatialApi.getCampusMap(),
  });

  const { data: facilities = [] } = useQuery({
    queryKey: ['admin-facilities'],
    queryFn: () => spatialApi.getFacilities(),
  });

  // Mutations
  const createBuildingMutation = useMutation({
    mutationFn: (data: any) =>
      spatialApi.createBuilding({
        ...data,
        campusId: mapBundle?.campus?.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campus-bundle'] });
      queryClient.invalidateQueries({ queryKey: ['campus-map-bundle'] });
      setIsCreateModalOpen(false);
      setFeedbackMessage({ text: 'Building created successfully in spatial registry.', type: 'success' });
    },
    onError: (err: any) => {
      setFeedbackMessage({ text: err.response?.data?.error?.message || 'Failed to create building', type: 'error' });
    },
  });

  const deleteBuildingMutation = useMutation({
    mutationFn: (id: string) => spatialApi.deleteBuilding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campus-bundle'] });
      queryClient.invalidateQueries({ queryKey: ['campus-map-bundle'] });
      setFeedbackMessage({ text: 'Building deactivated successfully.', type: 'success' });
    },
    onError: (err: any) => {
      setFeedbackMessage({ text: err.response?.data?.error?.message || 'Failed to delete building', type: 'error' });
    },
  });

  const createPlaceMutation = useMutation({
    mutationFn: (data: any) =>
      spatialApi.createPlace({
        ...data,
        campusId: mapBundle?.campus?.id,
        categoryId: data.categoryId || mapBundle?.categories[0]?.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campus-bundle'] });
      queryClient.invalidateQueries({ queryKey: ['campus-map-bundle'] });
      setIsCreateModalOpen(false);
      setFeedbackMessage({ text: 'Campus place registered successfully.', type: 'success' });
    },
    onError: (err: any) => {
      setFeedbackMessage({ text: err.response?.data?.error?.message || 'Failed to create place', type: 'error' });
    },
  });

  const deletePlaceMutation = useMutation({
    mutationFn: (id: string) => spatialApi.deletePlace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campus-bundle'] });
      queryClient.invalidateQueries({ queryKey: ['campus-map-bundle'] });
      setFeedbackMessage({ text: 'Campus place deactivated.', type: 'success' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const buildings = mapBundle?.buildings || [];
  const places = mapBundle?.places || [];
  const categories = mapBundle?.categories || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Campus Spatial Administration
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional GIS and Spatial registry: manage campus boundaries, buildings, rooms, places, and paths.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="text-xs flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {activeTab === 'buildings' ? 'Building' : 'Location Place'}</span>
        </Button>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-600">
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('buildings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'buildings'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Buildings ({buildings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('places')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'places'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Places & POIs ({places.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('facilities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'facilities'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Facilities ({facilities.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'buildings' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">Building Name</th>
                  <th className="pb-3 px-3">Code</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Coordinates (Lat, Lng)</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {buildings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{b.name}</td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">{b.code}</td>
                    <td className="py-3 px-3">
                      <Badge variant="secondary" className="text-[10px]">
                        {b.buildingType}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => deleteBuildingMutation.mutate(b.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Deactivate Building"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'places' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">Place Name</th>
                  <th className="pb-3 px-3">QR Slug</th>
                  <th className="pb-3 px-3">Category</th>
                  <th className="pb-3 px-3">Building</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {places.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                    <td className="py-3 px-3 font-mono text-blue-600">/campus/locations/{p.slug}</td>
                    <td className="py-3 px-3">
                      <Badge variant="primary" className="text-[10px]">
                        {p.category?.name || 'Place'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{p.building?.name || 'Campus Wide'}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => deletePlaceMutation.mutate(p.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Deactivate Place"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'facilities' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map((fac) => (
              <div
                key={fac.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{fac.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-bold">
                    {fac.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{fac.description || 'Facility amenity'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={activeTab === 'buildings' ? 'Create Campus Building' : 'Register Campus Place'}
      >
        {activeTab === 'buildings' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createBuildingMutation.mutate(buildingForm);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Building Name</label>
              <input
                type="text"
                required
                value={buildingForm.name}
                onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                placeholder="e.g. Innovation & Technology Complex"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Code</label>
                <input
                  type="text"
                  required
                  value={buildingForm.code}
                  onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value })}
                  placeholder="BLD_INNOVATION"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Building Type</label>
                <select
                  value={buildingForm.buildingType}
                  onChange={(e) => setBuildingForm({ ...buildingForm, buildingType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <option value="ACADEMIC">ACADEMIC</option>
                  <option value="ADMINISTRATIVE">ADMINISTRATIVE</option>
                  <option value="LIBRARY">LIBRARY</option>
                  <option value="CANTEEN">CANTEEN</option>
                  <option value="AUDITORIUM">AUDITORIUM</option>
                  <option value="LAB">LAB</option>
                  <option value="SPORTS">SPORTS</option>
                  <option value="PARKING">PARKING</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={buildingForm.latitude}
                  onChange={(e) => setBuildingForm({ ...buildingForm, latitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={buildingForm.longitude}
                  onChange={(e) => setBuildingForm({ ...buildingForm, longitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                value={buildingForm.description}
                onChange={(e) => setBuildingForm({ ...buildingForm, description: e.target.value })}
                rows={3}
                placeholder="Architectural purpose and facilities..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={createBuildingMutation.isPending}>
                {createBuildingMutation.isPending ? 'Saving...' : 'Save Building'}
              </Button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createPlaceMutation.mutate(placeForm);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Place Name</label>
              <input
                type="text"
                required
                value={placeForm.name}
                onChange={(e) => setPlaceForm({ ...placeForm, name: e.target.value })}
                placeholder="e.g. Robotics Center of Excellence"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">URL / QR Slug</label>
                <input
                  type="text"
                  required
                  value={placeForm.slug}
                  onChange={(e) => setPlaceForm({ ...placeForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="robotics-coe"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={placeForm.categoryId}
                  onChange={(e) => setPlaceForm({ ...placeForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={placeForm.latitude}
                  onChange={(e) => setPlaceForm({ ...placeForm, latitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={placeForm.longitude}
                  onChange={(e) => setPlaceForm({ ...placeForm, longitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                value={placeForm.description}
                onChange={(e) => setPlaceForm({ ...placeForm, description: e.target.value })}
                rows={3}
                placeholder="Details, facilities, and visiting guidelines..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={createPlaceMutation.isPending}>
                {createPlaceMutation.isPending ? 'Saving...' : 'Register Place'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
