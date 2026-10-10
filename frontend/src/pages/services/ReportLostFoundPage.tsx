import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ArrowLeft, Send } from 'lucide-react';
import { servicesApi } from '../../services/servicesApi.js';
import { LostFoundCategory, LostFoundType } from '../../types/services.js';

export const ReportLostFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<LostFoundType>('FOUND');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<LostFoundCategory>('ELECTRONICS');
  const [locationText, setLocationText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide title and description.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await servicesApi.reportLostFoundItem({
        type,
        title,
        description,
        category,
        locationText: locationText || null,
      });

      navigate('/lost-found');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to report item');
    } finally {
      setSubmitting(false);
    }
  };

  const categories: { label: string; value: LostFoundCategory }[] = [
    { label: 'Electronics & Gadgets', value: 'ELECTRONICS' },
    { label: 'ID Cards & Documents', value: 'ID_DOCUMENT' },
    { label: 'Books & Stationery', value: 'BOOK' },
    { label: 'Clothing & Bags', value: 'CLOTHING' },
    { label: 'Keys & Accessories', value: 'ACCESSORY' },
    { label: 'Other Items', value: 'OTHER' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
      <Link
        to="/lost-found"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Lost & Found
      </Link>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Report Lost or Found Item</h1>
            <p className="text-xs text-slate-400">
              List an item you found on campus or report belongings you have misplaced
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
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Report Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('FOUND')}
                className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                  type === 'FOUND'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                I Found an Item
              </button>
              <button
                type="button"
                onClick={() => setType('LOST')}
                className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                  type === 'LOST'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                I Lost an Item
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Item Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Casio scientific calculator with black cover"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LostFoundCategory)}
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
                Location Found / Lost
              </label>
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="e.g. Central Library table 12 or Canteen plaza"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description & Details *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe color, model, brand, distinctive markings, or where the item can be claimed..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <Link
              to="/lost-found"
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Post Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
