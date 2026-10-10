import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Building2,
  ExternalLink,
  Phone,
  Mail,
  Sparkles,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { CampusPlace, Building } from '../../types/spatial.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';

interface LocationCardProps {
  place?: CampusPlace;
  building?: Building;
  onViewOnMap?: () => void;
  onGetDirections?: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  place,
  building,
  onViewOnMap,
  onGetDirections,
}) => {
  const item = place || building;
  if (!item) return null;

  const isPlace = !!place;
  const photoUrl =
    item.images && item.images.length > 0
      ? item.images[0].url
      : 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80';

  const title = item.name;
  const description = item.description || 'TGPCET autonomous campus facility.';
  const slug = place?.slug;

  return (
    <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={photoUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="primary" className="text-xs font-semibold backdrop-blur-md">
            {place ? place.category?.name || 'Place' : building?.buildingType || 'Building'}
          </Badge>
        </div>

        {/* Bottom Title on Image */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-bold text-base leading-tight truncate drop-shadow-sm">{title}</h3>
          {building && (
            <span className="text-xs text-slate-300 font-mono">Code: {building.code}</span>
          )}
          {place?.building && (
            <div className="flex items-center gap-1 text-xs text-slate-300 mt-0.5">
              <Building2 className="w-3 h-3" />
              <span className="truncate">{place.building.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Facilities Chips */}
        {item.facilities && item.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {item.facilities.slice(0, 3).map((f, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                {f.facility.name}
              </span>
            ))}
            {item.facilities.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{item.facilities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          {slug ? (
            <Link
              to={`/campus/locations/${slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Details & QR</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          ) : building ? (
            <Link
              to={`/campus/buildings/${building.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Floors & Rooms</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1.5">
            {onViewOnMap && (
              <button
                onClick={onViewOnMap}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="View on Map"
              >
                <MapPin className="w-4 h-4 text-blue-500" />
              </button>
            )}

            {onGetDirections && (
              <Button
                variant="primary"
                onClick={onGetDirections}
                className="text-xs px-2.5 py-1.5 h-auto flex items-center gap-1"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Directions</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
