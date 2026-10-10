import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  MapPin,
  Building2,
  ExternalLink,
  ChevronRight,
  Wifi,
  Droplets,
  Car,
  HeartPulse,
  Coffee,
  Printer,
  BookMarked,
  Bath,
  Accessibility,
} from 'lucide-react';
import { spatialApi } from '../../services/spatialApi.js';
import { Facility } from '../../types/spatial.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { Badge } from '../../components/ui/Badge.js';

export const FacilitiesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ['campus-facilities'],
    queryFn: () => spatialApi.getFacilities(),
  });

  const getIcon = (code: string) => {
    switch (code) {
      case 'WIFI':
        return <Wifi className="w-5 h-5" />;
      case 'DRINKING_WATER':
        return <Droplets className="w-5 h-5" />;
      case 'WASHROOM':
        return <Bath className="w-5 h-5" />;
      case 'PARKING':
        return <Car className="w-5 h-5" />;
      case 'ACCESSIBLE_ENTRANCE':
        return <Accessibility className="w-5 h-5" />;
      case 'MEDICAL':
        return <HeartPulse className="w-5 h-5" />;
      case 'FOOD':
        return <Coffee className="w-5 h-5" />;
      case 'PRINTING':
        return <Printer className="w-5 h-5" />;
      case 'STUDY_AREA':
        return <BookMarked className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const filteredFacilities = facilities.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.code.toLowerCase().includes(q) ||
      (f.description && f.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Campus Facilities & Amenities
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Locate high-speed Wi-Fi zones, purified drinking water stations, restrooms, cafeteria, first aid, and parking.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search facilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Facilities Grid */}
      {isLoading ? (
        <div className="flex justify-center p-16">
          <Spinner size="lg" />
        </div>
      ) : filteredFacilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFacilities.map((fac: any) => {
            const places = fac.placeFacilities?.map((pf: any) => pf.place) || [];
            const buildings = fac.buildingFacilities?.map((bf: any) => bf.building) || [];

            return (
              <div
                key={fac.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      {getIcon(fac.code)}
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {fac.code}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{fac.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {fac.description || 'Institutional amenity available for all students and faculty.'}
                    </p>
                  </div>
                </div>

                {/* Associated Locations Links */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Available At ({places.length + buildings.length} Locations)
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {places.map((p: any) => (
                      <Link
                        key={p.id}
                        to={`/campus/locations/${p.slug}`}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 hover:text-blue-600 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between transition-colors"
                      >
                        <span className="truncate">{p.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </Link>
                    ))}
                    {buildings.map((b: any) => (
                      <Link
                        key={b.id}
                        to={`/campus/buildings/${b.id}`}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 hover:text-blue-600 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between transition-colors"
                      >
                        <span className="truncate">{b.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Facilities Found</h3>
          <p className="text-xs text-slate-500 mt-1">No facility matches your search keywords.</p>
        </div>
      )}
    </div>
  );
};
