import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Navigation,
  ArrowLeft,
  Sparkles,
  Layers,
  DoorOpen,
  Phone,
  Mail,
  ExternalLink,
  Users,
} from 'lucide-react';
import { spatialApi } from '../../services/spatialApi.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';

export const BuildingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedFloorNumber, setSelectedFloorNumber] = useState<number>(0);

  const { data: building, isLoading, error } = useQuery({
    queryKey: ['campus-building', id],
    queryFn: () => spatialApi.getBuildingById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Building Not Found</h2>
        <p className="text-xs text-slate-500">The requested building record does not exist or has been archived.</p>
        <Link to="/campus/buildings">
          <Button variant="outline" className="text-xs">
            Back to Building Directory
          </Button>
        </Link>
      </div>
    );
  }

  const floors = building.floors || [];
  const currentFloor = floors.find((f) => f.floorNumber === selectedFloorNumber) || floors[0];
  const rooms = currentFloor?.rooms || [];

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {building.name}
            </h1>
            <Badge variant="primary" className="text-xs font-mono">
              {building.code}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{building.buildingType} Block • TGPCET Autonomous Campus</p>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Floor Layout */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              About this Building
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {building.description || 'No detailed architectural description available.'}
            </p>

            {/* Facilities */}
            {building.facilities && building.facilities.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Available Facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {building.facilities.map((f, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      {f.facility.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Floor Structure & Rooms */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Floor Directory & Rooms
                </h2>
                <p className="text-xs text-slate-500">Select a floor level to view classrooms, labs, and faculty cabins.</p>
              </div>

              {/* Floor Level Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                {floors.map((fl) => (
                  <button
                    key={fl.id}
                    onClick={() => setSelectedFloorNumber(fl.floorNumber)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedFloorNumber === fl.floorNumber
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {fl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Rooms Grid for Selected Floor */}
            {rooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {rooms.map((rm) => (
                  <div
                    key={rm.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-500/50 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold">
                          Room {rm.roomNumber}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1">{rm.name}</h4>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {rm.roomType}
                      </Badge>
                    </div>

                    {rm.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">{rm.description}</p>
                    )}

                    {rm.capacity && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>Capacity: {rm.capacity} Seats</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-xl">
                No rooms mapped on {currentFloor?.name || 'this floor'} yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Map & Actions Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Spatial Coordinates
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div>Latitude: {building.latitude.toFixed(6)}</div>
              <div>Longitude: {building.longitude.toFixed(6)}</div>
            </div>

            {/* Entrances */}
            {building.entrances && building.entrances.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Building Entrances</h4>
                <div className="space-y-1.5">
                  {building.entrances.map((ent) => (
                    <div
                      key={ent.id}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <DoorOpen className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{ent.name}</span>
                      </div>
                      {ent.accessibilityStatus && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Wheelchair Ramp
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Link to={`/campus/map?buildingId=${building.id}`} className="block">
                <Button variant="outline" className="w-full text-xs flex items-center justify-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>Locate on Campus Map</span>
                </Button>
              </Link>
              <Link to={`/campus/map?destBuildingId=${building.id}&directions=true`} className="block">
                <Button variant="primary" className="w-full text-xs flex items-center justify-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Walking Directions</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
