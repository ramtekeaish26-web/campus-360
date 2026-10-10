import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  ArrowLeft,
  Building2,
  Sparkles,
  Phone,
  Mail,
  Globe,
  QrCode,
  Share2,
  CheckCircle2,
  Clock,
  DoorOpen,
} from 'lucide-react';
import { spatialApi } from '../../services/spatialApi.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';

export const LocationDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: place, isLoading, error } = useQuery({
    queryKey: ['campus-place-slug', slug],
    queryFn: () => spatialApi.getPlaceBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <MapPin className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Location Not Found</h2>
        <p className="text-xs text-slate-500">The location associated with slug &quot;{slug}&quot; could not be resolved.</p>
        <Link to="/campus/map">
          <Button variant="outline" className="text-xs">
            Open Campus Map
          </Button>
        </Link>
      </div>
    );
  }

  const photos = place.images && place.images.length > 0 ? place.images : [];
  const qrUrl = window.location.href;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 p-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-xs">
            {place.category?.name || 'Campus Place'}
          </Badge>
        </div>
      </div>

      {/* Hero Banner / Photo Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl min-h-[260px] flex flex-col justify-end p-6 md:p-8">
        {photos.length > 0 ? (
          <img
            src={photos[0].url}
            alt={place.name}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="relative z-10 space-y-2 text-white">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">
            TGPCET AUTONOMOUS SPATIAL DIRECTORY
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{place.name}</h1>
          {place.building && (
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>{place.building.name}</span>
              {place.room && (
                <span>
                  • {place.room.floor?.name || 'Floor'} (Room {place.room.roomNumber})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Description, Facilities, Photos */}
        <div className="md:col-span-2 space-y-6">
          {/* About */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Location Description
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {place.description || 'Verified TGPCET campus destination and facility.'}
            </p>

            {/* Facilities */}
            {place.facilities && place.facilities.length > 0 && (
              <div className="pt-2">
                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Facilities Available Here
                </h3>
                <div className="flex flex-wrap gap-2">
                  {place.facilities.map((f, idx) => (
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

          {/* Contact & Hours */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Official Inquiries & Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {place.phone ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="font-mono text-slate-800 dark:text-slate-200">{place.phone}</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-400">
                  Phone: Information not available
                </div>
              )}

              {place.email ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="truncate text-slate-800 dark:text-slate-200">{place.email}</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-400">
                  Email: Information not available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: QR Code Card & Quick Directions */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 inline-block mx-auto">
              <QrCode className="w-28 h-28 text-slate-900 dark:text-white" />
            </div>

            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">QR Wayfinding Target</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Scan with any smartphone camera to open directions directly.
              </p>
              <div className="mt-2 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400 break-all select-all">
                {qrUrl}
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Link to={`/campus/map?placeId=${place.id}`} className="block">
                <Button variant="outline" className="w-full text-xs flex items-center justify-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>Locate on Map</span>
                </Button>
              </Link>
              <Link to={`/campus/map?destPlaceId=${place.id}&directions=true`} className="block">
                <Button variant="primary" className="w-full text-xs flex items-center justify-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Walking Route</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
