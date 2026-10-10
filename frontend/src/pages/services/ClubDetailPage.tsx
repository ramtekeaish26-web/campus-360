import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, ArrowLeft, Shield, CheckCircle, Plus } from 'lucide-react';
import { servicesApi } from '../../services/servicesApi.js';
import { Club } from '../../types/services.js';
import { StatusBadge } from '../../components/services/StatusBadge.js';

export const ClubDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadClub = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const res = await servicesApi.getClubBySlug(slug);
      setClub(res.club);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Club not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClub();
  }, [slug]);

  const handleJoin = async () => {
    if (!club) return;
    try {
      setActionLoading(true);
      await servicesApi.joinClub(club.id);
      await loadClub();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to join');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!club) return;
    try {
      setActionLoading(true);
      await servicesApi.leaveClub(club.id);
      await loadClub();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to leave');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="space-y-4">
        <Link to="/clubs" className="inline-flex items-center gap-1.5 text-xs text-indigo-400">
          <ArrowLeft className="w-4 h-4" /> Back to Clubs
        </Link>
        <div className="p-5 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-sm">
          {error || 'Club not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <Link
        to="/clubs"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Clubs
      </Link>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <StatusBadge status={club.category} type="category" />
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>{club.memberCount} Registered Members</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">{club.name}</h1>
            {club.department && (
              <p className="text-xs text-slate-400">
                Department Affiliation: <span className="text-indigo-400">{club.department.name}</span>
              </p>
            )}
          </div>

          <div>
            {club.isMember ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4" /> {club.userRole || 'Member'}
                </span>
                <button
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  Leave Club
                </button>
              </div>
            ) : (
              <button
                onClick={handleJoin}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
              >
                <Plus className="w-4 h-4" /> Join Community
              </button>
            )}
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line">
          {club.description}
        </div>

        {/* Member Directory */}
        {club.members && club.members.length > 0 && (
          <div className="pt-6 border-t border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Community Leads & Members
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {club.members.map((m) => (
                <div
                  key={m.id}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{m.name}</div>
                    <div className="text-2xs text-slate-500">Joined {new Date(m.joinedAt).toLocaleDateString()}</div>
                  </div>
                  <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
