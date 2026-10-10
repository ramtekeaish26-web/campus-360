import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Plus,
  Minus,
  Maximize2,
  Navigation,
  MapPin,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { CampusPlace, Building, RouteResult, LocationCategory } from '../../types/spatial.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';

interface CampusMapProps {
  buildings: Building[];
  places: CampusPlace[];
  categories: LocationCategory[];
  selectedPlace?: CampusPlace | null;
  selectedBuilding?: Building | null;
  activeRoute?: RouteResult | null;
  onSelectPlace?: (place: CampusPlace | null) => void;
  onSelectBuilding?: (building: Building | null) => void;
  onRequestDirections?: (destination: CampusPlace | Building) => void;
  height?: string;
  userLocation?: { latitude: number; longitude: number } | null;
  onRequestUserLocation?: () => void;
  isLocating?: boolean;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  buildings,
  places,
  categories,
  selectedPlace,
  selectedBuilding,
  activeRoute,
  onSelectPlace,
  onSelectBuilding,
  onRequestDirections,
  height = 'calc(100vh - 12rem)',
  userLocation,
  onRequestUserLocation,
  isLocating = false,
}) => {
  // Map viewport states (Center coordinates for TGPCET Campus Demo: 21.0125, 79.0275)
  const defaultCenter = { lat: 21.0125, lng: 79.0275 };
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeLayer, setActiveLayer] = useState<'all' | 'buildings' | 'places'>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter places by category
  const filteredPlaces = places.filter((p) => {
    if (selectedCategory === 'ALL') return true;
    return p.category?.code === selectedCategory;
  });

  // Pan to selected place or building
  useEffect(() => {
    if (selectedPlace) {
      setCenter({ lat: selectedPlace.latitude, lng: selectedPlace.longitude });
      setPanOffset({ x: 0, y: 0 });
    } else if (selectedBuilding) {
      setCenter({ lat: selectedBuilding.latitude, lng: selectedBuilding.longitude });
      setPanOffset({ x: 0, y: 0 });
    }
  }, [selectedPlace, selectedBuilding]);

  // Coordinate to SVG / Screen pixel mapping
  // Map bounds: Lat [21.0090, 21.0160] (height ~0.0070), Lng [79.0240, 79.0310] (width ~0.0070)
  const minLat = 21.009;
  const maxLat = 21.016;
  const minLng = 79.024;
  const maxLng = 79.031;

  const latLngToPercent = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setCenter(defaultCenter);
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xl select-none"
      style={{ height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Map Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-lg pointer-events-auto max-w-full">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            All Locations ({places.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.code
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {onRequestUserLocation && (
            <button
              onClick={onRequestUserLocation}
              disabled={isLocating}
              title="Where am I? (Browser Geolocation)"
              className={`p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-blue-400 hover:border-blue-500/50 shadow-lg transition-all ${
                userLocation ? 'text-emerald-400 border-emerald-500/60' : ''
              }`}
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            </button>
          )}

          <div className="flex flex-col rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 shadow-lg overflow-hidden">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-800"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={resetView}
            className="p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-lg transition-all"
            title="Reset Map View"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div
        className="w-full h-full relative cursor-grab active:cursor-grabbing transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Campus Map Background Grid & Vector Stylized Ground */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          {/* Subtle Campus Grid & Landscaping */}
          <svg className="w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="campus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#campus-grid)" />

            {/* Campus Boundary Greenery Lawn */}
            <circle cx="50%" cy="50%" r="42%" fill="#064e3b" fillOpacity="0.15" />
            <circle cx="35%" cy="30%" r="20%" fill="#065f46" fillOpacity="0.12" />
            <circle cx="70%" cy="65%" r="25%" fill="#065f46" fillOpacity="0.1" />

            {/* Sports Oval */}
            <ellipse cx="78%" cy="28%" rx="14%" ry="10%" fill="#1e293b" stroke="#059669" strokeWidth="1.5" strokeDasharray="4 2" fillOpacity="0.4" />
          </svg>
        </div>

        {/* Walking Paths Lines & Connectors Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {/* Campus Main Road Arteries */}
          <path
            d="M 50% 95% L 50% 50% L 35% 55% L 25% 30% M 50% 50% L 65% 40% L 78% 28% M 50% 50% L 68% 70%"
            fill="none"
            stroke="#475569"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
          <path
            d="M 50% 95% L 50% 50% L 35% 55% L 25% 30% M 50% 50% L 65% 40% L 78% 28% M 50% 50% L 68% 70%"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="3"
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />

          {/* Active Navigation Route Highlight Layer */}
          {activeRoute && activeRoute.routeGeometry && activeRoute.routeGeometry.coordinates && (
            <>
              {/* Glowing Route Pulse Background */}
              <polyline
                points={activeRoute.routeGeometry.coordinates
                  .map((coord) => {
                    const pos = latLngToPercent(coord[1], coord[0]);
                    return `${pos.x}%,${pos.y}%`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.4"
                className="animate-pulse"
              />
              {/* Sharp Walking Line */}
              <polyline
                points={activeRoute.routeGeometry.coordinates
                  .map((coord) => {
                    const pos = latLngToPercent(coord[1], coord[0]);
                    return `${pos.x}%,${pos.y}%`;
                  })
                  .join(' ')}
                fill="none"
                stroke={activeRoute.accessibleOnly ? '#10b981' : '#60a5fa'}
                strokeWidth="4"
                strokeDasharray="8 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
        </svg>

        {/* Buildings Footprint Polygons & Labels Layer */}
        {buildings.map((bld) => {
          const pos = latLngToPercent(bld.latitude, bld.longitude);
          const isSelected = selectedBuilding?.id === bld.id;

          return (
            <div
              key={bld.id}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectBuilding) onSelectBuilding(bld);
              }}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
            >
              {/* Building Structural Box */}
              <div
                className={`px-3 py-2 rounded-xl border transition-all duration-200 shadow-xl flex flex-col items-center min-w-[130px] text-center ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-500/30 scale-105'
                    : 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-blue-500/60 hover:scale-102 backdrop-blur-md'
                }`}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-75 font-semibold">
                  {bld.code}
                </span>
                <span className="text-xs font-bold leading-tight mt-0.5 max-w-[140px] truncate">
                  {bld.name}
                </span>

                {/* Building Type Tag */}
                <div className="flex items-center gap-1 mt-1 text-[10px] opacity-85">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{bld.buildingType}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Campus Places & Searchable Markers Layer */}
        {filteredPlaces.map((place) => {
          const pos = latLngToPercent(place.latitude, place.longitude);
          const isSelected = selectedPlace?.id === place.id;

          return (
            <div
              key={place.id}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectPlace) onSelectPlace(place);
              }}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-15"
            >
              {/* Interactive Location Pin */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border shadow-lg transition-transform duration-200 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 ring-4 ring-amber-400/40 scale-125 z-20'
                      : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/80 group-hover:scale-110'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </div>

                {/* Micro Label Tooltip on Hover / Selected */}
                <div
                  className={`mt-1 px-2 py-0.5 rounded-md bg-slate-900/95 border border-slate-700 text-[11px] font-semibold text-slate-200 whitespace-nowrap shadow-md transition-opacity pointer-events-none ${
                    isSelected ? 'opacity-100 ring-1 ring-amber-400' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {place.name}
                </div>
              </div>
            </div>
          );
        })}

        {/* User Current Location Indicator (if permitted) */}
        {userLocation && (
          <div
            style={{
              left: `${latLngToPercent(userLocation.latitude, userLocation.longitude).x}%`,
              top: `${latLngToPercent(userLocation.latitude, userLocation.longitude).y}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 animate-ping absolute" />
              <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg z-10" />
            </div>
            <div className="mt-1 px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-600/50 text-[10px] font-bold text-center">
              You are here
            </div>
          </div>
        )}
      </div>

      {/* Map Attribution & Demo Spatial Data Disclaimer */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 p-1.5 px-3 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 text-[10px] text-slate-400 pointer-events-auto">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        <span>TGPCET Spatial Engine • DEMO Spatial Dataset</span>
      </div>
    </div>
  );
};
