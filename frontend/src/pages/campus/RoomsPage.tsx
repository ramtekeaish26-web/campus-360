import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  DoorClosed,
  Search,
  Building2,
  Users,
  MapPin,
  Filter,
} from 'lucide-react';
import { spatialApi } from '../../services/spatialApi.js';
import { Room } from '../../types/spatial.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { Badge } from '../../components/ui/Badge.js';

export const RoomsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('ALL');

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['campus-rooms', selectedRoomType, searchQuery],
    queryFn: () => spatialApi.getRooms(undefined, undefined, selectedRoomType, searchQuery),
  });

  const roomTypes: { label: string; value: string }[] = [
    { label: 'All Types', value: 'ALL' },
    { label: 'Classrooms', value: 'CLASSROOM' },
    { label: 'Laboratories', value: 'LAB' },
    { label: 'Offices & Admin', value: 'OFFICE' },
    { label: 'Faculty Cabins', value: 'FACULTY_ROOM' },
    { label: 'Seminar Halls', value: 'SEMINAR_HALL' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <DoorClosed className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Classroom & Laboratory Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search smart classrooms, computer centers, engineering workshops, and departmental seminar halls.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by room name, number, or lab..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Room Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1">
          {roomTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedRoomType(t.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedRoomType === t.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Table / Grid */}
      {isLoading ? (
        <div className="flex justify-center p-16">
          <Spinner size="lg" />
        </div>
      ) : rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((rm) => (
            <div
              key={rm.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-blue-500/60 transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                      Room {rm.roomNumber}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">{rm.name}</h3>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {rm.roomType}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {rm.floor?.building?.name || 'Building'} • {rm.floor?.name || 'Floor'}
                  </span>
                </div>

                {rm.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {rm.description}
                  </p>
                )}
              </div>

              {/* Bottom Metadata & Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  {rm.capacity && (
                    <>
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rm.capacity} Seats</span>
                    </>
                  )}
                </div>

                {rm.floor?.buildingId && (
                  <Link
                    to={`/campus/buildings/${rm.floor.buildingId}`}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Building
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
          <DoorClosed className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Rooms Found</h3>
          <p className="text-xs text-slate-500 mt-1">No room matches your filter criteria.</p>
        </div>
      )}
    </div>
  );
};
