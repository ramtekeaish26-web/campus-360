import React from 'react';
import { Phone, MapPin, AlertTriangle, ShieldAlert, Mail } from 'lucide-react';
import { EmergencyContact } from '../../types/services.js';

interface EmergencyCardProps {
  contact: EmergencyContact;
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({ contact }) => {
  const isHighPriority = contact.priority === 1;

  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        isHighPriority
          ? 'bg-rose-950/20 border-rose-500/40 shadow-sm shadow-rose-950/20'
          : 'bg-slate-900/60 border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg ${
              isHighPriority ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isHighPriority ? <ShieldAlert className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">{contact.name}</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              {contact.category}
            </span>
          </div>
        </div>

        {contact.isDemo && (
          <span className="text-2xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            DEMO
          </span>
        )}
      </div>

      {contact.instructions && (
        <p className="text-xs text-slate-300 mb-4 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
          {contact.instructions}
        </p>
      )}

      <div className="space-y-2 text-xs text-slate-400 mb-4">
        {contact.locationText && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{contact.locationText}</span>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{contact.email}</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
        <div className="text-sm font-mono font-bold text-slate-100">
          {contact.phone}
          {contact.altPhone && <span className="text-xs text-slate-400 font-normal"> / {contact.altPhone}</span>}
        </div>

        <a
          href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            isHighPriority
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          <Phone className="w-3 h-3" /> Call Contact
        </a>
      </div>
    </div>
  );
};
