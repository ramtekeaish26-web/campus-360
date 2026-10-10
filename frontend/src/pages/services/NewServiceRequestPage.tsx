import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LifeBuoy, ArrowLeft, Send } from 'lucide-react';
import { servicesApi } from '../../services/servicesApi';
import { spatialApi } from '../../services/spatialApi';
import { ServiceRequestCategory, ServiceRequestPriority } from '../../types/services';
import { Building, CampusPlace } from '../../types/spatial';

export const NewServiceRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ServiceRequestCategory>('ELECTRICAL');
  const [priority, setPriority] = useState<ServiceRequestPriority>('MEDIUM');
  const [buildingId, setBuildingId] = useState<string>('');
  const [locationDetails, setLocationDetails] = useState('');
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await spatialApi.getBuildings();
        setBuildings(Array.isArray(res) ? res : (res as any).buildings || []);
      } catch (e) {
        // Fallback or ignore
      }
    };
    fetchBuildings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and detailed description.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await servicesApi.createServiceRequest({
        title,
        description,
        category,
        priority,
        buildingId: buildingId || null,
        locationDetails: locationDetails || null,
      });

      navigate(`/services/requests/${res.request.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit service request');
    } finally {
      setSubmitting(false);
    }
  };

  const categories: { label: string; value: ServiceRequestCategory }[] = [
    { label: 'Electrical & Power', value: 'ELECTRICAL' },
    { label: 'Projectors & AV Systems', value: 'PROJECTOR' },
    { label: 'Wi-Fi & Internet Connectivity', value: 'WIFI' },
    { label: 'Housekeeping & Cleanliness', value: 'CLEANLINESS' },
    { label: 'Drinking Water & Plumbing', value: 'WATER' },
    { label: 'Benches & Furniture', value: 'FURNITURE' },
    { label: 'Infrastructure & Civil Repairs', value: 'INFRASTRUCTURE' },
    { label: 'General Campus Service', value: 'GENERAL' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
      <Link
        to="/services/requests"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Helpdesk Requests
      </Link>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Submit Campus Service Request</h1>
            <p className="text-xs text-slate-400">
              Report campus utility problems, classroom hardware faults, or maintenance issues
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs text-red-400 bg-red-950/30 border border-red-500/20 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Issue Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Projector HDMI port damaged in Room A-204"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Service Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceRequestCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ServiceRequestPriority)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">Low (Routine maintenance)</option>
                <option value="MEDIUM">Medium (Standard attention)</option>
                <option value="HIGH">High (Impacting lecture or lab)</option>
                <option value="URGENT">Urgent (Safety / immediate outage)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Building (Phase 3 Spatial Reference)
              </label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Campus Building</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Room / Exact Location Details
              </label>
              <input
                type="text"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder="e.g. 2nd Floor, Room 204, Desk 12"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue, symptoms, when it occurs, or any safety precautions..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <Link
              to="/services/requests"
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 shadow-md shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting Ticket...' : 'Log Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
