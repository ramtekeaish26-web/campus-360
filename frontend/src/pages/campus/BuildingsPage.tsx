import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  MapPin,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  Navigation,
} from 'lucide-react';
import { spatialApi } from '../../services/spatialApi.js';
import { Building, BuildingType } from '../../types/spatial.js';
import { LocationCard } from '../../components/spatial/LocationCard.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { Badge } from '../../components/ui/Badge.js';

export const BuildingsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const navigate = useNavigate();

  const { data: buildings = [], isLoading } = useQuery({
    queryKey: ['campus-buildings', searchQuery, selectedType],
    queryFn: () => spatialApi.getBuildings(searchQuery, selectedType),
  });

  const buildingTypes: { label: string; value: string }[] = [
    { label: 'All Buildings', value: 'ALL' },
    { label: 'Academic Wings', value: 'ACADEMIC' },
    { label: 'Administrative', value: 'ADMINISTRATIVE' },
    { label: 'Library', value: 'LIBRARY' },
    { label: 'Canteen & Food', value: 'CANTEEN' },
    { label: 'Auditorium', value: 'AUDITORIUM' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Campus Building Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explore academic blocks, administrative hubs, laboratories, libraries, and student amenities.
          </p>
        </div>

        <Link
          to="/campus/map"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-colors self-start"
        >
          <MapPin className="w-4 h-4" />
          <span>Interactive Campus Map</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by building name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1">
          {buildingTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedType === t.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Buildings Grid */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Spinner size="lg" />
        </div>
      ) : buildings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {buildings.map((bld) => (
            <LocationCard
              key={bld.id}
              building={bld}
              onViewOnMap={() => navigate(`/campus/map?buildingId=${bld.id}`)}
              onGetDirections={() => navigate(`/campus/map?destBuildingId=${bld.id}&directions=true`)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Buildings Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No campus buildings match the selected type or search keywords.
          </p>
        </div>
      )}
    </div>
  );
};
