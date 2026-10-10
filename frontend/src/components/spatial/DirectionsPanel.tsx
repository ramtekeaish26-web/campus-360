import React, { useState } from 'react';
import {
  Navigation,
  ArrowRight,
  ArrowUpDown,
  Footprints,
  Clock,
  Accessibility,
  CheckCircle2,
  X,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { CampusPlace, Building, RouteResult } from '../../types/spatial.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';

interface DirectionsPanelProps {
  places: CampusPlace[];
  buildings: Building[];
  initialOrigin?: any;
  initialDestination?: any;
  onCalculateRoute: (origin: any, destination: any, accessibleOnly: boolean) => Promise<void>;
  onClearRoute: () => void;
  activeRoute: RouteResult | null;
  isLoading?: boolean;
  onClose?: () => void;
  userLocation?: { latitude: number; longitude: number } | null;
  onRequestUserLocation?: () => void;
}

export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  places,
  buildings,
  initialOrigin,
  initialDestination,
  onCalculateRoute,
  onClearRoute,
  activeRoute,
  isLoading = false,
  onClose,
  userLocation,
  onRequestUserLocation,
}) => {
  const [originType, setOriginType] = useState<string>(
    initialOrigin?.placeId ? `place:${initialOrigin.placeId}` : userLocation ? 'my-location' : 'place:' + (places[0]?.id || '')
  );
  const [destType, setDestType] = useState<string>(
    initialDestination?.id ? `place:${initialDestination.id}` : 'place:' + (places[1]?.id || '')
  );
  const [accessibleOnly, setAccessibleOnly] = useState(false);

  // Parse origin and destination objects for API
  const resolveParam = (val: string) => {
    if (val === 'my-location' && userLocation) {
      return { latitude: userLocation.latitude, longitude: userLocation.longitude };
    }
    const [type, id] = val.split(':');
    if (type === 'place') return { placeId: id };
    if (type === 'building') return { buildingId: id };
    return null;
  };

  const handleRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const origin = resolveParam(originType);
    const dest = resolveParam(destType);

    if (origin && dest) {
      onCalculateRoute(origin, dest, accessibleOnly);
    }
  };

  const handleSwap = () => {
    const temp = originType;
    setOriginType(destType);
    setDestType(temp);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Campus Wayfinding</h3>
            <p className="text-xs text-slate-500">Autonomous Walking Navigation</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleRouteSubmit} className="p-4 space-y-3 border-b border-slate-100 dark:border-slate-800">
        <div className="relative space-y-2">
          {/* Origin Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Starting Location (Point A)
            </label>
            <select
              value={originType}
              onChange={(e) => setOriginType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {userLocation && (
                <option value="my-location">📍 My Current Location (GPS)</option>
              )}
              <optgroup label="Campus Places">
                {places.map((p) => (
                  <option key={`p-${p.id}`} value={`place:${p.id}`}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Buildings">
                {buildings.map((b) => (
                  <option key={`b-${b.id}`} value={`building:${b.id}`}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-1 relative z-10">
            <button
              type="button"
              onClick={handleSwap}
              className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 dark:border-slate-700 text-slate-500 transition-colors shadow-sm"
              title="Swap Start and Destination"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Destination Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Destination (Point B)
            </label>
            <select
              value={destType}
              onChange={(e) => setDestType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <optgroup label="Campus Places">
                {places.map((p) => (
                  <option key={`p-${p.id}`} value={`place:${p.id}`}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Buildings">
                {buildings.map((b) => (
                  <option key={`b-${b.id}`} value={`building:${b.id}`}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Accessibility Route Filter */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={accessibleOnly}
              onChange={(e) => setAccessibleOnly(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <Accessibility className="w-3.5 h-3.5 text-emerald-500" />
              <span>Accessible Route Only</span>
            </div>
          </label>

          {activeRoute && (
            <button
              type="button"
              onClick={onClearRoute}
              className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Action Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full text-xs py-2.5"
          disabled={isLoading}
        >
          {isLoading ? 'Calculating Route...' : 'Find Walking Route'}
        </Button>
      </form>

      {/* Route Results & Steps */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeRoute ? (
          <div className="space-y-4">
            {/* Route Stats Summary Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200 dark:border-blue-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <Footprints className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {activeRoute.distanceMeters} meters
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>~{activeRoute.estimatedWalkingMinutes} min walk</span>
                  </div>
                </div>
              </div>

              {activeRoute.isAccessible && (
                <Badge variant="success" className="text-[10px]">
                  Barrier-Free
                </Badge>
              )}
            </div>

            {/* Step-by-Step Directions */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Walking Guidance ({activeRoute.segments.length} Steps)
              </h4>

              <div className="space-y-2">
                {activeRoute.segments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium leading-relaxed">{seg.instruction}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <span>{seg.distanceMeters}m</span>
                        <span>•</span>
                        <span>{seg.surface || 'Walkway'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Footprints className="w-10 h-10 mb-2 opacity-40 text-blue-500" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Select Start and Destination to plan your route.
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
              Calculates shortest path and walking time with accessible options.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
