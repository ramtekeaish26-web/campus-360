import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, ArrowLeft, Calendar, MapPin, Tag, ShieldCheck, CheckCircle } from 'lucide-react';
import { servicesApi } from '../../services/servicesApi.js';
import { LostFoundItem } from '../../types/services.js';
import { StatusBadge } from '../../components/services/StatusBadge.js';

export const LostFoundDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<LostFoundItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimDescription, setClaimDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const loadItem = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await servicesApi.getLostFoundItemById(id);
      setItem(res.item);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Item not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [id]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setClaiming(true);
      await servicesApi.submitLostFoundClaim(id, {
        description: claimDescription,
        contactInfo,
      });
      setClaimSuccess(true);
      setClaimDescription('');
      setContactInfo('');
      await loadItem();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit claim');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="space-y-4">
        <Link to="/lost-found" className="inline-flex items-center gap-1.5 text-xs text-indigo-400">
          <ArrowLeft className="w-4 h-4" /> Back to Lost & Found
        </Link>
        <div className="p-5 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-sm">
          {error || 'Item not found'}
        </div>
      </div>
    );
  }

  const isLost = item.type === 'LOST';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <Link
        to="/lost-found"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Lost & Found
      </Link>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isLost
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {item.type}
            </span>
            <StatusBadge status={item.status} type="status" />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Reported on {new Date(item.itemDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">{item.title}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-400" />
              <span>Category: {item.category.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>{item.locationText || item.location?.name || 'Campus Grounds'}</span>
            </div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line">
          {item.description}
        </div>

        {/* Claim / Ownership Submission Section */}
        {item.status === 'OPEN' && (
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              {isLost ? 'Found this item? Report retrieval' : 'Claim Ownership of this Item'}
            </h3>

            {claimSuccess ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Claim submitted! Security and Estate desk will review and reach out to you.
              </div>
            ) : (
              <form onSubmit={handleClaim} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Proof or Details of Ownership *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={claimDescription}
                    onChange={(e) => setClaimDescription(e.target.value)}
                    placeholder="Provide identifying markings, serial numbers, specific stickers or contents..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Contact Phone / Email *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="+91 98900 12345 or your institutional email"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={claiming}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
                >
                  {claiming ? 'Submitting...' : 'Submit Claim'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Claims View for Item Reporter or Admin */}
        {item.claims && item.claims.length > 0 && (
          <div className="pt-6 border-t border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200">
              Submitted Claims ({item.claims.length})
            </h3>
            <div className="space-y-2">
              {item.claims.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{c.claimant.name}</div>
                    <div className="text-slate-400 mt-0.5">{c.description}</div>
                    <div className="text-2xs text-slate-500 mt-1">Contact: {c.contactInfo}</div>
                  </div>
                  <StatusBadge status={c.status} type="status" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
