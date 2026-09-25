import { useState } from 'react';
import { List } from 'lucide-react';
import type { Task } from '../services/api';

interface TaskTableProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

type StatusFilter = 'all' | 'pending' | 'running' | 'completed' | 'failed';

/* ── Status config — palette only ── */
const S: Record<string, { dot: string; text: string; bg: string; bd: string }> = {
  pending:   { dot: 'var(--steel)',              text: 'var(--steel-light)',   bg: 'var(--s-pending-bg)',   bd: 'var(--s-pending-bd)' },
  running:   { dot: 'var(--gold)',               text: 'var(--gold)',          bg: 'var(--s-running-bg)',   bd: 'var(--s-running-bd)' },
  completed: { dot: 'var(--s-completed-text)',   text: 'var(--s-completed-text)', bg: 'var(--s-completed-bg)', bd: 'var(--s-completed-bd)' },
  failed:    { dot: 'var(--s-failed-text)',      text: 'var(--s-failed-text)', bg: 'var(--s-failed-bg)',    bd: 'var(--s-failed-bd)' },
};

const PRI: Record<number, { label: string; color: string }> = {
  0:  { label: 'Normal',   color: 'var(--tx-dim)' },
  1:  { label: 'Medium',   color: 'var(--steel)' },
  5:  { label: 'High',     color: 'var(--gold)' },
  10: { label: 'Critical', color: 'var(--s-failed-text)' },
};

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Running', value: 'running' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
];

function StatusPill({ s }: { s: string }) {
  const cfg = S[s] ?? { dot: 'var(--steel)', text: 'var(--steel)', bg: 'transparent', bd: 'var(--bd)' };
  return (
    <span className="inline-flex items-center gap-2" style={{
      padding: '3px 8px', borderRadius: 3, fontSize: 12, fontWeight: 600,
      background: cfg.bg, border: `1px solid ${cfg.bd}`, color: cfg.text,
    }}>
      <span style={{
        display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
        background: cfg.dot, flexShrink: 0,
        animation: s === 'running' ? 'pulse 1.5s infinite' : undefined,
      }} />
      {s}
    </span>
  );
}

function shortId(id: string) { return id.slice(-8).toUpperCase(); }

function fmtTime(iso: string | null | undefined) {
  if (!iso) return <span style={{ color: 'var(--tx-dim)' }}>—</span>;
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getDesc(data: Record<string, unknown>): string {
  return typeof data.task === 'string' ? data.task : JSON.stringify(data);
}

function TH({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <th style={{
      padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700,
      letterSpacing: '0.07em', textTransform: 'uppercase',
      color: 'var(--dust)', background: 'var(--yale)',
      borderBottom: '2px solid var(--bd-strong)',
      whiteSpace: 'nowrap', minWidth: wide ? 160 : undefined,
    }}>
      {children}
    </th>
  );
}

export default function TaskTable({ tasks, loading, error }: TaskTableProps) {
  const [filter, setFilter] = useState<StatusFilter>('all');

  const counts: Record<StatusFilter, number> = {
    all:       tasks.length,
    pending:   tasks.filter((t) => t.status === 'pending').length,
    running:   tasks.filter((t) => t.status === 'running').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    failed:    tasks.filter((t) => t.status === 'failed').length,
  };

  const visible = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <section>
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginBottom: 14 }}>
        <div className="flex items-center gap-2">
          <List size={15} color="var(--steel)" strokeWidth={1.8} />
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--steel)' }}>
            Task Execution History
          </span>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            const cfg = f.value !== 'all' ? S[f.value] : null;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: '5px 14px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 150ms',
                  background: active ? (cfg ? cfg.bg : 'var(--bg-active)') : 'var(--bg-card)',
                  border: `1px solid ${active ? (cfg ? cfg.bd : 'var(--bd-strong)') : 'var(--bd)'}`,
                  color: active ? (cfg ? cfg.text : 'var(--dust)') : 'var(--tx-meta)',
                }}
              >
                {f.label}
                <span className="font-mono" style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                  {counts[f.value]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--bd)', marginBottom: 16 }} />

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)', borderRadius: 6, overflowX: 'auto' }}>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse" style={{ height: 44, borderRadius: 4, background: 'var(--bg-raised)' }} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: '14px 16px', fontSize: 13, color: 'var(--s-failed-text)' }}>
            Failed to load tasks — {error}
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div style={{ padding: '48px 16px', textAlign: 'center', fontSize: 14, color: 'var(--tx-dim)' }}>
            {filter === 'all' ? 'No tasks yet. Submit a job to see execution history.' : `No ${filter} tasks.`}
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <TH>Task ID</TH>
                <TH wide>Description</TH>
                <TH>Status</TH>
                <TH>Priority</TH>
                <TH>CPU</TH>
                <TH>RAM</TH>
                <TH>Worker</TH>
                <TH>Created</TH>
                <TH>Started</TH>
                <TH>Updated</TH>
              </tr>
            </thead>
            <tbody>
              {visible.map((task, idx) => {
                const isRunning = task.status === 'running';
                const evenBg = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)';
                const rowBg = isRunning ? 'rgba(219,161,44,0.05)' : evenBg;

                return (
                  <tr key={task.id}
                    style={{ background: rowBg, borderBottom: '1px solid var(--bd-soft)', transition: 'background 120ms' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = rowBg; }}
                  >
                    <td className="font-mono" style={{ padding: '11px 16px', fontSize: 12, color: 'var(--gold)' }}>
                      {shortId(task.id)}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--dust)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getDesc(task.data)}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <StatusPill s={task.status} />
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: (PRI[task.priority] ?? PRI[0]).color }}>
                      {(PRI[task.priority] ?? { label: `P${task.priority}` }).label}
                    </td>
                    <td className="font-mono" style={{ padding: '11px 16px', fontSize: 13, color: 'var(--steel-light)' }}>
                      {task.required_cpu}
                    </td>
                    <td className="font-mono" style={{ padding: '11px 16px', fontSize: 13, color: 'var(--steel-light)' }}>
                      {task.required_ram}
                    </td>
                    <td className="font-mono" style={{ padding: '11px 16px', fontSize: 12, color: 'var(--steel)' }}>
                      {task.assigned_worker ? shortId(task.assigned_worker) : '—'}
                    </td>
                    <td className="font-mono" style={{ padding: '11px 16px', fontSize: 12, color: 'var(--tx-dim)', whiteSpace: 'nowrap' }}>
                      {fmtTime(task.created_at)}
                    </td>
                    <td className="font-mono" style={{ padding: '11px 16px', fontSize: 12, color: 'var(--tx-dim)', whiteSpace: 'nowrap' }}>
                      {fmtTime(task.started_at)}
                    </td>
                    <td className="font-mono" style={{ padding: '11px 16px', fontSize: 12, color: 'var(--tx-dim)', whiteSpace: 'nowrap' }}>
                      {fmtTime(task.updated_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
