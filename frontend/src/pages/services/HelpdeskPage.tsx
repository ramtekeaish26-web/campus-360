import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, Plus, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { servicesApi } from '../../services/servicesApi.js';
import { ServiceRequest } from '../../types/services.js';
import { ServiceRequestCard } from '../../components/services/ServiceRequestCard.js';

export const HelpdeskPage: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('ALL');
  const [category, setCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await servicesApi.getServiceRequests({
        status: status !== 'ALL' ? status : undefined,
        category: category !== 'ALL' ? category : undefined,
        search: search.trim() || undefined,
      });
      setRequests(res.requests || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [status, category]);

  const statuses = ['ALL', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const categories = ['ALL', 'ELECTRICAL', 'PROJECTOR', 'WIFI', 'CLEANLINESS', 'WATER', 'FURNITURE', 'INFRASTRUCTURE'];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-indigo-400" />
            Campus Helpdesk & Service Desk
          </h1>
          <p className="text-sm text-slate-400">
            Log, track, and resolve facility issues, lab hardware requests, electrical maintenance, and Wi-Fi tickets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/services/requests/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </Link>
          <button
            onClick={loadRequests}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadRequests()}
              placeholder="Search by ticket title, description, classroom..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={loadRequests}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Filter
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                status === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-xl p-8">
          <LifeBuoy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200 mb-1">No active service requests</h3>
          <p className="text-xs text-slate-500 mb-4">
            You do not have any service requests or tickets matching the selected filters.
          </p>
          <Link
            to="/services/requests/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Plus className="w-3.5 h-3.5" /> Submit New Request
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((request) => (
            <ServiceRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};
