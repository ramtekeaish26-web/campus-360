import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, MapPin, Phone, Mail, Globe, Search, ArrowRight, LifeBuoy } from 'lucide-react';
import { servicesApi } from '../../services/servicesApi.js';
import { CampusServiceDirectoryItem } from '../../types/services.js';

export const ServiceDirectoryPage: React.FC = () => {
  const [directory, setDirectory] = useState<CampusServiceDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadDirectory = async () => {
      try {
        setLoading(true);
        const res = await servicesApi.getServiceDirectory();
        setDirectory(res.directory || []);
      } catch (e) {
        // Fallback or ignore
      } finally {
        setLoading(false);
      }
    };
    loadDirectory();
  }, []);

  const filtered = directory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-6 h-6 text-indigo-400" />
            Campus Services Directory
          </h1>
          <p className="text-sm text-slate-400">
            Official administrative desks, student support counters, library services, and campus amenities
          </p>
        </div>

        <Link
          to="/services/requests"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors self-start md:self-auto"
        >
          <LifeBuoy className="w-4 h-4" /> Helpdesk Tickets
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search service desks, exam cell, library, canteen, parking..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-xl p-8">
          <Compass className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200 mb-1">No services matched your query</h3>
          <p className="text-xs text-slate-500">Try searching for library, canteen, administration, or accounts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {item.category}
                  </span>
                  {item.building && (
                    <span className="text-2xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded truncate max-w-[140px]">
                      {item.building.name}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-1">{item.name}</h3>
                <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                  {item.description || 'Institutional campus facility service point.'}
                </p>

                <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                  {item.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.phone}</span>
                    </div>
                  )}
                  {item.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{item.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <Link
                  to={`/campus/locations/${item.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <MapPin className="w-3.5 h-3.5" /> Navigate on Map <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
