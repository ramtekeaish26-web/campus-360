import React, { useState, useEffect } from 'react';
import { ShieldAlert, Phone, AlertTriangle, LifeBuoy, RefreshCw } from 'lucide-react';
import { servicesApi } from '../../services/servicesApi.js';
import { EmergencyContact } from '../../types/services.js';
import { EmergencyCard } from '../../components/services/EmergencyCard.js';

export const EmergencyPage: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const res = await servicesApi.getEmergencyContacts();
      setContacts(res.contacts || []);
    } catch (e) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" /> Emergency Directory
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
            Campus Safety & Emergency Contacts
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Immediate assistance lines for campus security, medical emergencies, fire hazards, and confidential student grievance support.
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <a
            href="tel:+917122800100"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-colors shadow-lg shadow-rose-600/30"
          >
            <Phone className="w-4 h-4" /> Call Security Control (+91 712 2800 100)
          </a>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-300">Important Safety Protocol:</strong> In case of active fire or physical hazard, activate the nearest manual call point alarm and calmly proceed to the designated assembly zone at the central sports ground.
        </div>
      </div>

      {/* Contact Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {contacts.map((contact) => (
            <EmergencyCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  );
};
