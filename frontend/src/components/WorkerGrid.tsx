import { Monitor } from 'lucide-react';
import type { Worker } from '../services/api';
import WorkerCard from './WorkerCard';

interface WorkerGridProps {
  workers: Worker[];
  loading: boolean;
  error: string | null;
}

export default function WorkerGrid({ workers, loading, error }: WorkerGridProps) {
  const active = workers.filter((w) => w.status === 'active').length;

  return (
    <section>
      {/* ── Section header ── */}
      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
        <div className="flex items-center gap-2">
          <Monitor size={15} color="var(--steel)" strokeWidth={1.8} />
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--steel)' }}>
            Worker Resource Monitor
          </span>
        </div>
        {!loading && !error && workers.length > 0 && (
          <span style={{ fontSize: 12, color: 'var(--tx-dim)' }}>
            {active} / {workers.length} active
          </span>
        )}
      </div>
      <div style={{ borderTop: '1px solid var(--bd)', marginBottom: 16 }} />

      {loading && (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {[0, 1].map((i) => (
            <div key={i} className="animate-pulse" style={{
              height: 210, borderRadius: 6,
              background: 'var(--bg-card)', border: '1px solid var(--bd)',
            }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div style={{
          borderRadius: 6, padding: '12px 16px', fontSize: 13,
          background: 'var(--s-failed-bg)', border: '1px solid var(--s-failed-bd)', color: 'var(--s-failed-text)',
        }}>
          Unable to load workers — {error}
        </div>
      )}

      {!loading && !error && workers.length === 0 && (
        <div style={{
          borderRadius: 6, padding: '40px 16px', textAlign: 'center', fontSize: 13,
          background: 'var(--bg-card)', border: '1px solid var(--bd)', color: 'var(--tx-dim)',
        }}>
          No workers registered. Start a worker process to see it here.
        </div>
      )}

      {!loading && !error && workers.length > 0 && (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {workers.map((w) => <WorkerCard key={w.id} worker={w} />)}
        </div>
      )}
    </section>
  );
}
