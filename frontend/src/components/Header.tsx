import { Activity, Database, Cpu } from 'lucide-react';

interface HeaderProps {
  backendOnline: boolean | null;
  lastUpdated: Date | null;
  secondsAgo: number;
  autoRefresh: boolean;
  onToggleAutoRefresh: (v: boolean) => void;
  onRefresh: () => void;
}

export default function Header({
  backendOnline, lastUpdated, secondsAgo, autoRefresh, onToggleAutoRefresh, onRefresh,
}: HeaderProps) {
  const connecting = backendOnline === null;
  const online     = backendOnline === true;

  const dotStyle: React.CSSProperties = connecting
    ? { background: 'var(--gold)', animation: 'pulse 1.5s infinite' }
    : online
    ? { background: 'var(--s-completed-text)' }
    : { background: 'var(--s-failed-text)', animation: 'pulse 1.5s infinite' };

  const statusColor = connecting
    ? 'var(--steel)'
    : online
    ? 'var(--s-completed-text)'
    : 'var(--s-failed-text)';

  const statusLabel = connecting ? 'CONNECTING…' : online ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE';

  const updatedLabel = !lastUpdated
    ? null : secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`;

  return (
    <header style={{ background: 'var(--yale)', borderBottom: '2px solid var(--yale-rim)' }}>
      <div
        style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}
        className="flex items-stretch justify-between gap-6"
      >
        {/* ── Left: brand ── */}
        <div className="flex items-center gap-4" style={{ padding: '16px 0' }}>
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: 40, height: 40, borderRadius: 6,
              background: 'var(--yale-mid)',
              border: '1px solid var(--gold-border)',
            }}
          >
            <Cpu size={20} color="var(--gold)" strokeWidth={1.8} />
          </div>
          <div>
            <h1 style={{
              fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px',
              color: 'var(--dust)', margin: 0, lineHeight: 1,
            }}>
              Resource-Aware Distributed Job Scheduler
            </h1>
            <p style={{
              fontSize: 12, marginTop: 5, lineHeight: 1,
              color: 'var(--steel-light)', opacity: 0.85, letterSpacing: '0.01em',
            }}>
              Distributed task execution&nbsp;&nbsp;·&nbsp;&nbsp;resource-aware scheduling&nbsp;&nbsp;·&nbsp;&nbsp;fault tolerance
            </p>
          </div>
        </div>

        {/* ── Right: stack + status + controls ── */}
        <div className="flex items-center gap-5" style={{ padding: '12px 0' }}>

          {/* Stack tags */}
          <div className="flex items-center gap-2">
            {[
              { icon: <Activity size={11} strokeWidth={2} />, label: 'FastAPI' },
              { icon: <Database size={11} strokeWidth={2} />, label: 'MongoDB' },
            ].map((t) => (
              <span key={t.label} className="flex items-center gap-1.5" style={{
                padding: '4px 10px', borderRadius: 4,
                background: 'var(--yale-mid)',
                border: '1px solid var(--yale-rim)',
                color: 'var(--steel-light)',
                fontSize: 11, fontWeight: 500,
              }}>
                {t.icon}{t.label}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 32, background: 'var(--yale-rim)' }} />

          {/* Status */}
          <div className="flex flex-col items-end" style={{ gap: 4 }}>
            <div className="flex items-center gap-2" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: statusColor }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', ...dotStyle }} />
              {statusLabel}
            </div>
            {updatedLabel && (
              <span style={{ fontSize: 10, color: 'var(--tx-dim)', letterSpacing: '0.04em' }}>
                updated {updatedLabel}
              </span>
            )}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 32, background: 'var(--yale-rim)' }} />

          {/* Controls */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none" style={{ fontSize: 12, color: 'var(--steel)' }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => onToggleAutoRefresh(e.target.checked)}
                style={{ width: 13, height: 13, accentColor: 'var(--gold)', cursor: 'pointer' }}
              />
              Auto-refresh
            </label>
            <button
              onClick={onRefresh}
              style={{
                padding: '6px 14px', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: 'var(--gold)', border: 'none', color: 'var(--coffee-dark)',
                transition: 'background 150ms',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)'; }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Goldenrod underline accent */}
      <div style={{ height: 3, background: `linear-gradient(90deg, var(--gold) 0%, var(--gold-dark) 40%, transparent 75%)` }} />
    </header>
  );
}
