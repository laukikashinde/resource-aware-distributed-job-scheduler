import { Server, Clock, Zap, CheckCircle, XCircle } from 'lucide-react';
import type { Worker, Task } from '../services/api';

interface OverviewCardsProps {
  workers: Worker[];
  allTasks: Task[];
  loading: boolean;
}

/* ── Skeleton ── */
function Skel({ wide }: { wide?: boolean }) {
  return (
    <div
      className={`animate-pulse ${wide ? 'col-span-2' : ''}`}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)', borderRadius: 6, height: 100 }}
    />
  );
}

/* ── Small metric card ── */
interface SmallCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
  valueColor: string;
  borderLeftColor?: string;
}

function SmallCard({ icon, label, value, sub, valueColor, borderLeftColor }: SmallCardProps) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--bd)',
      borderLeft: borderLeftColor ? `3px solid ${borderLeftColor}` : '1px solid var(--bd)',
      borderRadius: 6,
      padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--tx-meta)' }}>
          {label}
        </span>
        {icon}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: valueColor }}>
        {String(value).padStart(2, '0')}
      </div>
      <div style={{ fontSize: 12, color: 'var(--tx-dim)', lineHeight: 1.3 }}>{sub}</div>
    </div>
  );
}

export default function OverviewCards({ workers, allTasks, loading }: OverviewCardsProps) {
  const activeWorkers = workers.filter((w) => w.status === 'active').length;
  const deadWorkers   = workers.filter((w) => w.status === 'dead').length;
  const totalWorkers  = workers.length;

  const pending   = allTasks.filter((t) => t.status === 'pending').length;
  const running   = allTasks.filter((t) => t.status === 'running').length;
  const completed = allTasks.filter((t) => t.status === 'completed').length;
  const failed    = allTasks.filter((t) => t.status === 'failed').length;

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        <Skel wide /><Skel /><Skel /><Skel /><Skel />
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>

      {/* ── Workers — primary card, double-wide ── */}
      <div style={{
        gridColumn: 'span 2',
        background: 'var(--bg-card)',
        border: '1px solid var(--bd)',
        borderLeft: '4px solid var(--gold)',
        borderRadius: 6,
        padding: '18px 22px',
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        {/* Icon */}
        <div style={{
          flexShrink: 0, width: 48, height: 48, borderRadius: 8,
          background: 'var(--gold-faint)',
          border: '1px solid var(--gold-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Server size={22} color="var(--gold)" strokeWidth={1.8} />
        </div>

        {/* Stat */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--tx-meta)', marginBottom: 6 }}>
            Active Workers
          </div>
          <div className="flex items-baseline gap-3">
            <span style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, color: 'var(--gold)' }}>
              {String(activeWorkers).padStart(2, '0')}
            </span>
            <span style={{ fontSize: 13, color: 'var(--tx-dim)' }}>
              / {totalWorkers} registered
            </span>
          </div>
          <div style={{
            fontSize: 12, marginTop: 6,
            color: deadWorkers > 0 ? 'var(--s-failed-text)' : 'var(--steel)',
          }}>
            {deadWorkers > 0 ? `${deadWorkers} worker(s) dead` : 'All workers healthy'}
          </div>
        </div>

        {/* Mini worker list */}
        {workers.length > 0 && (
          <div className="flex flex-col" style={{ gap: 6, flexShrink: 0 }}>
            {workers.slice(0, 4).map((w) => (
              <div key={w.id} className="flex items-center gap-2">
                <span style={{
                  display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                  background: w.status === 'active' ? 'var(--s-completed-text)' : 'var(--s-failed-text)',
                }} />
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--tx-dim)' }}>
                  {w.id.slice(-6).toUpperCase()}
                </span>
              </div>
            ))}
            {workers.length > 4 && (
              <span style={{ fontSize: 11, color: 'var(--tx-dim)' }}>+{workers.length - 4} more</span>
            )}
          </div>
        )}
      </div>

      {/* Pending */}
      <SmallCard
        icon={<Clock size={15} color="var(--steel)" strokeWidth={1.8} />}
        label="Pending"
        value={pending}
        sub="Waiting for resources"
        valueColor="var(--steel-light)"
        borderLeftColor="var(--steel-dim)"
      />

      {/* Running */}
      <SmallCard
        icon={<Zap size={15} color="var(--gold)" strokeWidth={1.8} />}
        label="Running"
        value={running}
        sub="Currently executing"
        valueColor="var(--gold)"
        borderLeftColor={running > 0 ? 'var(--gold)' : undefined}
      />

      {/* Completed */}
      <SmallCard
        icon={<CheckCircle size={15} color="var(--s-completed-text)" strokeWidth={1.8} />}
        label="Completed"
        value={completed}
        sub="Finished successfully"
        valueColor="var(--s-completed-text)"
        borderLeftColor={completed > 0 ? 'var(--s-completed-text)' : undefined}
      />

      {/* Failed */}
      <SmallCard
        icon={<XCircle size={15} color="var(--s-failed-text)" strokeWidth={1.8} />}
        label="Failed"
        value={failed}
        sub="Requires recovery"
        valueColor="var(--s-failed-text)"
        borderLeftColor={failed > 0 ? 'var(--s-failed-text)' : undefined}
      />
    </div>
  );
}
