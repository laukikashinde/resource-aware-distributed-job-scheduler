import { useState } from 'react';
import { SendHorizontal, CheckCheck, AlertCircle, Cpu, MemoryStick, ListOrdered, Terminal } from 'lucide-react';
import { submitTask, type TaskSubmitPayload, type Task } from '../services/api';

interface SubmitJobProps {
  onSubmitted: () => void;
}

const PRIORITY_OPTIONS = [
  { value: 0,  label: '0 — Normal',    hint: 'Standard background task' },
  { value: 1,  label: '1 — Medium',    hint: 'Slightly elevated priority' },
  { value: 5,  label: '5 — High',      hint: 'Skips ahead of normal tasks' },
  { value: 10, label: '10 — Critical', hint: 'Highest — processed first' },
];

type State = 'idle' | 'loading' | 'success' | 'error';

const inputStyle: React.CSSProperties = {
  width: '100%', borderRadius: 4, padding: '9px 12px',
  fontSize: 14, fontFamily: 'var(--font-mono)',
  background: 'var(--bg-page)',
  border: '1px solid var(--bd)',
  color: 'var(--dust)',
  outline: 'none',
  transition: 'border-color 150ms',
};

function Label({ htmlFor, icon, text, hint }: {
  htmlFor: string; icon: React.ReactNode; text: string; hint?: string;
}) {
  return (
    <div style={{ marginBottom: 7 }}>
      <label htmlFor={htmlFor} className="flex items-center gap-2"
        style={{ fontSize: 13, fontWeight: 600, color: 'var(--dust)' }}>
        {icon}{text}
      </label>
      {hint && <p style={{ fontSize: 11, marginTop: 3, color: 'var(--tx-dim)', paddingLeft: 20 }}>{hint}</p>}
    </div>
  );
}

export default function SubmitJob({ onSubmitted }: SubmitJobProps) {
  const [desc, setDesc]         = useState('');
  const [cpu, setCpu]           = useState(2);
  const [ram, setRam]           = useState(2);
  const [priority, setPriority] = useState(0);
  const [state, setState]       = useState<State>('idle');
  const [result, setResult]     = useState<Task | null>(null);
  const [errMsg, setErrMsg]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!desc.trim()) return;
    setState('loading');
    const payload: TaskSubmitPayload = { data: { task: desc.trim() }, required_cpu: cpu, required_ram: ram, priority };
    try {
      const task = await submitTask(payload);
      setResult(task);
      setState('success');
      setDesc(''); setCpu(2); setRam(2); setPriority(0);
      onSubmitted();
      setTimeout(() => { setState('idle'); setResult(null); }, 9000);
    } catch (err) {
      setErrMsg((err as Error).message);
      setState('error');
    }
  }

  return (
    <section>
      <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
        <Terminal size={15} color="var(--steel)" strokeWidth={1.8} />
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--steel)' }}>
          Submit New Job
        </span>
      </div>
      <div style={{ borderTop: '1px solid var(--bd)', marginBottom: 16 }} />

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)', borderRadius: 6 }}>
        {/* Console title bar */}
        <div className="flex items-center gap-2" style={{
          padding: '10px 16px',
          background: 'var(--bg-raised)', borderBottom: '1px solid var(--bd)',
          borderRadius: '6px 6px 0 0',
        }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--bd)', display: 'inline-block' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--bd)', display: 'inline-block' }} />
          <span className="font-mono" style={{ marginLeft: 8, fontSize: 11, color: 'var(--tx-dim)' }}>
            job-scheduler / new-task
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Description */}
          <div>
            <Label htmlFor="desc" icon={<Terminal size={12} color="var(--steel)" />} text="Task Description" />
            <input
              id="desc" type="text" required
              value={desc} onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. Large matrix computation, data pipeline job…"
              style={inputStyle}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--gold)'; }}
              onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = 'var(--bd)'; }}
            />
          </div>

          {/* CPU + RAM */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label htmlFor="cpu" icon={<Cpu size={12} color="var(--steel)" />} text="Required CPU" hint="cores needed" />
              <input id="cpu" type="number" min={1} max={256} required
                value={cpu} onChange={(e) => setCpu(Number(e.target.value))}
                style={inputStyle}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--gold)'; }}
                onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = 'var(--bd)'; }}
              />
            </div>
            <div>
              <Label htmlFor="ram" icon={<MemoryStick size={12} color="var(--steel)" />} text="Required RAM" hint="GB needed" />
              <input id="ram" type="number" min={1} max={512} required
                value={ram} onChange={(e) => setRam(Number(e.target.value))}
                style={inputStyle}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--gold)'; }}
                onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = 'var(--bd)'; }}
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="pri" icon={<ListOrdered size={12} color="var(--steel)" />} text="Priority" hint="Higher priority jobs skip ahead in the queue" />
            <select id="pri" value={priority} onChange={(e) => setPriority(Number(e.target.value))}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={(e) => { (e.target as HTMLSelectElement).style.borderColor = 'var(--gold)'; }}
              onBlur={(e)  => { (e.target as HTMLSelectElement).style.borderColor = 'var(--bd)'; }}
            >
              {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Submit button — Goldenrod CTA */}
          <button
            type="submit" disabled={state === 'loading'}
            className="flex items-center justify-center gap-2"
            style={{
              width: '100%', padding: '11px 0', borderRadius: 4, border: 'none',
              fontSize: 14, fontWeight: 700, cursor: state === 'loading' ? 'not-allowed' : 'pointer',
              background: state === 'loading' ? 'var(--gold-dark)' : 'var(--gold)',
              color: 'var(--coffee-dark)',
              opacity: state === 'loading' ? 0.75 : 1,
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => { if (state !== 'loading') (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = state === 'loading' ? 'var(--gold-dark)' : 'var(--gold)'; }}
          >
            {state === 'loading' ? (
              <>
                <span style={{
                  display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid var(--coffee-dark)', borderTopColor: 'transparent',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Submitting…
              </>
            ) : (
              <><SendHorizontal size={15} />Submit Job</>
            )}
          </button>

          {/* Success */}
          {state === 'success' && result && (
            <div className="flex gap-3" style={{
              borderRadius: 4, padding: '12px 14px',
              background: 'var(--s-completed-bg)', border: '1px solid var(--s-completed-bd)',
            }}>
              <CheckCheck size={16} color="var(--s-completed-text)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--s-completed-text)', margin: 0 }}>
                  Job submitted successfully
                </p>
                <p className="font-mono" style={{ fontSize: 12, marginTop: 5, color: 'var(--steel)', margin: '4px 0 2px' }}>
                  Task ID: {result.id.slice(-12).toUpperCase()}
                </p>
                <p style={{ fontSize: 12, color: 'var(--tx-dim)', margin: 0 }}>
                  Waiting for resource-aware scheduling…
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="flex gap-3" style={{
              borderRadius: 4, padding: '12px 14px',
              background: 'var(--s-failed-bg)', border: '1px solid var(--s-failed-bd)',
            }}>
              <AlertCircle size={16} color="var(--s-failed-text)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--s-failed-text)', margin: '0 0 4px' }}>
                  Submission failed
                </p>
                <p style={{ fontSize: 12, color: 'var(--tx-dim)', margin: '0 0 6px' }}>{errMsg}</p>
                <button type="button" onClick={() => setState('idle')}
                  style={{ fontSize: 12, color: 'var(--steel)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
