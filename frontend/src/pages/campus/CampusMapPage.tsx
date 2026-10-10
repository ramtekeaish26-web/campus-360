import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Search,
  Navigation,
  Compass,
  Building2,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  X,
  Footprints,
  Info,
} from 'lucide-react';
import { spatialApi } from '../../services/spatialApi.js';
import { CampusPlace, Building, RouteResult, SpatialSearchResult } from '../../types/spatial.js';
import { CampusMap } from '../../components/spatial/CampusMap.js';
import { DirectionsPanel } from '../../components/spatial/DirectionsPanel.js';
import { LocationCard } from '../../components/spatial/LocationCard.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';

export const CampusMapPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<CampusPlace | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

  // 1. Fetch Campus Map Spatial Bundle
  const { data: mapBundle, isLoading, error } = useQuery({
    queryKey: ['campus-map-bundle'],
    queryFn: () => spatialApi.getCampusMap(),
  });

  // 2. Fetch Live Search Results
  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ['campus-search', searchQuery],
    queryFn: () => spatialApi.searchCampus(searchQuery),
    enabled: searchQuery.trim().length > 1,
  });

  // Handle request for browser geolocation
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          // Permission denied
          setLocationPermissionDenied(true);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Calculate Route
  const handleCalculateRoute = async (origin: any, destination: any, accessibleOnly: boolean) => {
    setIsRouting(true);
    setRouteError(null);
    try {
      const res = await spatialApi.calculateRoute(origin, destination, accessibleOnly);
      setActiveRoute(res);
    } catch (err: any) {
      setRouteError(err.response?.data?.error?.message || 'Unable to calculate walking route.');
    } finally {
      setIsRouting(false);
    }
  };

  const handleSelectSearchResult = (result: SpatialSearchResult) => {
    setSearchQuery('');
    if (result.type === 'PLACE') {
      const p = mapBundle?.places.find((item) => item.id === result.id);
      if (p) setSelectedPlace(p);
    } else if (result.type === 'BUILDING') {
      const b = mapBundle?.buildings.find((item) => item.id === result.id);
      if (b) setSelectedBuilding(b);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Spinner size="lg" />
        <p className="text-sm font-semibold text-slate-500">Loading TGPCET Interactive Campus Map...</p>
      </div>
    );
  }

  const buildings = mapBundle?.buildings || [];
  const places = mapBundle?.places || [];
  const categories = mapBundle?.categories || [];

  return (
    <div className="space-y-4">
      {/* Page Header with Search & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Campus Spatial Map & Wayfinding
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Interactive navigation, building directories, facilities, and accessible walking routes across TGPCET.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search library, labs, CSE, canteen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchQuery.trim().length > 1 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-72 overflow-y-auto p-1.5">
              {isSearching ? (
                <div className="p-3 text-center text-xs text-slate-500">Searching campus locations...</div>
              ) : searchResults && searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((res) => (
                    <button
                      key={`${res.type}-${res.id}`}
                      onClick={() => handleSelectSearchResult(res)}
                      className="w-full p-2 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                          {res.type === 'BUILDING' ? (
                            <Building2 className="w-3.5 h-3.5" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{res.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {res.buildingName ? `${res.buildingName} • ` : ''}
                            {res.category}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-slate-500">No campus locations match your query.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Geolocation Permission Notice (if denied) */}
      {locationPermissionDenied && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            Location permission was denied. You can still search and choose any campus place as your starting point!
          </span>
        </div>
      )}

      {/* Main Split Grid: Map Canvas + Sidebar Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map View Area (7 or 8 columns on large screens) */}
        <div className={`col-span-1 lg:col-span-${showDirections || selectedPlace || selectedBuilding ? '8' : '12'} transition-all duration-300`}>
          <CampusMap
            buildings={buildings}
            places={places}
            categories={categories}
            selectedPlace={selectedPlace}
            selectedBuilding={selectedBuilding}
            activeRoute={activeRoute}
            onSelectPlace={(p) => {
              setSelectedPlace(p);
              setSelectedBuilding(null);
            }}
            onSelectBuilding={(b) => {
              setSelectedBuilding(b);
              setSelectedPlace(null);
            }}
            userLocation={userLocation}
            onRequestUserLocation={handleRequestLocation}
            isLocating={isLocating}
          />
        </div>

        {/* Dynamic Context Panel (Directions / Place Details / Buildings) */}
        {(showDirections || selectedPlace || selectedBuilding) && (
          <div className="col-span-1 lg:col-span-4 h-[calc(100vh-12rem)] flex flex-col">
            {showDirections ? (
              <DirectionsPanel
                places={places}
                buildings={buildings}
                initialOrigin={userLocation ? 'my-location' : selectedPlace ? { placeId: selectedPlace.id } : undefined}
                initialDestination={selectedPlace || selectedBuilding}
                onCalculateRoute={handleCalculateRoute}
                onClearRoute={() => setActiveRoute(null)}
                activeRoute={activeRoute}
                isLoading={isRouting}
                onClose={() => setShowDirections(false)}
                userLocation={userLocation}
                onRequestUserLocation={handleRequestLocation}
              />
            ) : selectedPlace ? (
              <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location Overview</span>
                  <button
                    onClick={() => setSelectedPlace(null)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  <LocationCard
                    place={selectedPlace}
                    onGetDirections={() => setShowDirections(true)}
                  />
                  {selectedPlace.room && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white">Floor & Room Location</div>
                      <div className="text-slate-500">
                        {selectedPlace.room.floor?.name || 'Floor'} • Room {selectedPlace.room.roomNumber} ({selectedPlace.room.name})
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedBuilding ? (
              <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Building Details</span>
                  <button
                    onClick={() => setSelectedBuilding(null)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  <LocationCard
                    building={selectedBuilding}
                    onGetDirections={() => setShowDirections(true)}
                  />
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white">Floors & Facilities</div>
                    <div className="text-slate-500">
                      {selectedBuilding.floors?.length || 0} Floors • {selectedBuilding.entrances?.length || 0} Accessible Entrances
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
