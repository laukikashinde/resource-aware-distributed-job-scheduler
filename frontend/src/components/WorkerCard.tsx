import type { Worker } from '../services/api';

interface WorkerCardProps {
  worker: Worker;
}

function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 5)    return 'just now';
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

interface ResBarProps {
  label: string;
  available: number;
  total: number;
  isActive: boolean;
}

function ResBar({ label, available, total, isActive }: ResBarProps) {
  const allocated    = total - available;
  const allocPct     = total > 0 ? Math.round((allocated / total) * 100) : 0;
  const availPct     = 100 - allocPct;
  const unit         = label === 'CPU' ? 'cores' : 'GB';
  const barFill      = allocPct > 0 && isActive ? 'var(--gold)' : 'var(--yale-rim)';
  const trackColor   = 'var(--bg-page)';

  return (
    <div>
      {/* Row: label + values */}
      <div className="flex items-center justify-between" style={{ marginBottom: 7 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--tx-dim)' }}>
          {label}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--dust)' }}>
            {available}
            <span style={{ fontWeight: 400, color: 'var(--tx-meta)', fontSize: 12 }}> / {total} {unit}</span>
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: 12, minWidth: 36, textAlign: 'right',
              color: allocPct > 0 ? 'var(--gold)' : 'var(--tx-dim)',
              fontWeight: allocPct > 0 ? 600 : 400,
            }}
          >
            {availPct}%
          </span>
        </div>
      </div>

      {/* Bar */}
      <div style={{ height: 7, borderRadius: 4, background: trackColor, overflow: 'hidden' }}>
        <div className="res-bar" style={{ height: '100%', borderRadius: 4, width: `${allocPct}%`, background: barFill }} />
      </div>

      {/* Sub-labels */}
      <div className="flex justify-between" style={{ marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--tx-dim)' }}>{allocPct}% allocated</span>
        <span style={{ fontSize: 11, color: 'var(--tx-dim)' }}>{available} available</span>
      </div>
    </div>
  );
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  const isActive = worker.status === 'active';
  const shortId  = worker.id.slice(-8).toUpperCase();
  const isBusy   = (worker.cpu_cores - worker.available_cpu) > 0;

  const borderColor = !isActive
    ? 'rgba(196,117,106,0.4)'
    : isBusy
    ? 'var(--gold-border)'
    : 'var(--bd)';

  const statusLabel = !isActive ? 'DEAD' : isBusy ? 'BUSY' : 'IDLE';
  const statusBg    = !isActive ? 'rgba(196,117,106,0.12)' : isBusy ? 'var(--gold-faint)' : 'rgba(122,191,148,0.10)';
  const statusBd    = !isActive ? 'rgba(196,117,106,0.3)'  : isBusy ? 'var(--gold-border)' : 'rgba(122,191,148,0.25)';
  const statusColor = !isActive ? 'var(--s-failed-text)'  : isBusy ? 'var(--gold)' : 'var(--s-completed-text)';
  const dotColor    = !isActive ? 'var(--s-failed-text)'  : isBusy ? 'var(--gold)' : 'var(--s-completed-text)';

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${borderColor}`,
      borderRadius: 6,
      display: 'flex', flexDirection: 'column',
      opacity: isActive ? 1 : 0.6,
    }}>

      {/* ── Header row ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'var(--bg-raised)',
        borderBottom: '1px solid var(--bd-soft)',
        borderRadius: '6px 6px 0 0',
      }}>
        <div className="flex items-center gap-2">
          <span style={{
            display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
            background: dotColor,
            boxShadow: isBusy && isActive ? `0 0 6px var(--gold)` : undefined,
          }} />
          <span className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--dust)' }}>
            WORKER&nbsp;
            <span style={{ color: 'var(--gold)' }}>{shortId}</span>
          </span>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.09em',
          padding: '3px 8px', borderRadius: 3,
          background: statusBg, border: `1px solid ${statusBd}`, color: statusColor,
        }}>
          {statusLabel}
        </span>
      </div>

      {/* ── Resource bars ── */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ResBar label="CPU" available={worker.available_cpu} total={worker.cpu_cores} isActive={isActive} />
        <ResBar label="RAM" available={worker.available_ram} total={worker.ram}       isActive={isActive} />
      </div>

      {/* ── Footer ── */}
      <div style={{
        borderTop: '1px solid var(--bd-soft)',
        padding: '9px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--tx-dim)' }}>
          Heartbeat
        </span>
        <span className="font-mono" style={{ fontSize: 12, color: isActive ? 'var(--steel-light)' : 'var(--s-failed-text)' }}>
          {timeAgo(worker.last_heartbeat)}
        </span>
      </div>
    </div>
  );
}
