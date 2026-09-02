import { useEffect, useState } from 'react';
import { History, X, RefreshCw, Clock, User, Layers } from 'lucide-react';
import type { AuditEventItem } from '../types/recovery';
import { recoveryApi } from '../api/recoveryApi';
import { formatDate } from '../utils/formatters';

interface AuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditTrailDrawer = ({ isOpen, onClose }: AuditTrailDrawerProps) => {
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEvents();
    }
  }, [isOpen]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await recoveryApi.getAuditEvents(50);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load audit events', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-xl bg-[#0b0f19] border-l border-sky-500/20 shadow-2xl h-full flex flex-col animate-slide-left">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Immutable Regulatory Audit Trail
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                PostgreSQL <code>audit_events</code> stream
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadEvents}
              disabled={loading}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mx-auto" />
              <p className="text-xs text-slate-400">Loading audit records from database...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No audit events recorded yet. Create or execute a recovery case to start tracking.
            </div>
          ) : (
            <div className="relative border-l border-slate-800 ml-4 space-y-6">
              {events.map((ev) => (
                <div key={ev.id} className="relative pl-6 space-y-1.5">
                  {/* Dot */}
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-[#0b0f19]" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      {ev.event_type}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(ev.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed font-mono">
                    {ev.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-0.5">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Actor: {ev.actor}</span>
                    </span>
                    {ev.recovery_case_id && (
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Layers className="w-3 h-3" />
                        <span>Case #{ev.recovery_case_id}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>Compliant with RBI & Gateway Audit Standards</span>
          <span className="text-emerald-400">Tamper-Proof</span>
        </div>
      </div>
    </div>
  );
};
