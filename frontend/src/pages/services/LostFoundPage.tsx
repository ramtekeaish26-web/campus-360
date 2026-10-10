import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Search, Filter, RefreshCw, AlertCircle, X } from 'lucide-react';
import { servicesApi } from '../../services/servicesApi.js';
import { LostFoundItem, LostFoundType } from '../../types/services.js';
import { LostFoundCard } from '../../components/services/LostFoundCard.js';

export const LostFoundPage: React.FC = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<string>('ALL');
  const [category, setCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Claim modal state
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [claimDescription, setClaimDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await servicesApi.getLostFoundItems({
        type: type !== 'ALL' ? type : undefined,
        category: category !== 'ALL' ? category : undefined,
        search: search.trim() || undefined,
      });
      setItems(res.items || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load lost & found items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [type, category]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setClaiming(true);
      await servicesApi.submitLostFoundClaim(selectedItem.id, {
        description: claimDescription,
        contactInfo,
      });
      setClaimSuccess(true);
      setTimeout(() => {
        setSelectedItem(null);
        setClaimSuccess(false);
        setClaimDescription('');
        setContactInfo('');
        loadItems();
      }, 1500);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit claim');
    } finally {
      setClaiming(false);
    }
  };

  const categories = ['ALL', 'ID_DOCUMENT', 'ELECTRONICS', 'BOOK', 'CLOTHING', 'ACCESSORY', 'OTHER'];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-400" />
            Lost & Found Desk
          </h1>
          <p className="text-sm text-slate-400">
            Report lost belongings, list found campus items, and submit verified ownership claims
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/lost-found/report"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Report Item
          </Link>
          <button
            onClick={loadItems}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
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
              onKeyDown={(e) => e.key === 'Enter' && loadItems()}
              placeholder="Search calculator, ID card, keys, water bottle, earphones..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={loadItems}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">Type:</span>
            {['ALL', 'LOST', 'FOUND'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  type === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1">Category:</span>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-2 py-0.5 text-2xs font-medium rounded-lg transition-colors ${
                  category === c
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {c.replace('_', ' ')}
              </button>
            ))}
          </div>
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
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-xl p-8">
          <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200 mb-1">No items found</h3>
          <p className="text-xs text-slate-500 mb-4">
            No lost or found items matched your filter.
          </p>
          <Link
            to="/lost-found/report"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Plus className="w-3.5 h-3.5" /> Report Lost or Found Item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <LostFoundCard key={item.id} item={item} onClaim={(it) => setSelectedItem(it)} />
          ))}
        </div>
      )}

      {/* Claim Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 mb-1">
              Submit Claim: {selectedItem.title}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Describe identifying details (marks, scratches, serial numbers, content) to verify ownership with security.
            </p>

            {claimSuccess ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl text-center">
                Claim submitted successfully! Administration will review and contact you.
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Proof / Description of Ownership *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={claimDescription}
                    onChange={(e) => setClaimDescription(e.target.value)}
                    placeholder="e.g. Has a small green sticker on the back and contains notes in CSE subjects..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Contact Phone / Email *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="e.g. +91 98900 12345 or your institutional email"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={claiming}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
                  >
                    {claiming ? 'Submitting...' : 'Submit Claim'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
