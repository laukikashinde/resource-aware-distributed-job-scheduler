import { GitMerge } from 'lucide-react';

const STEPS = [
  { n: '01', label: 'Submit',          detail: 'POST /tasks/submit — CPU, RAM, priority' },
  { n: '02', label: 'Check Resources', detail: 'required_cpu ≤ available_cpu  AND  required_ram ≤ available_ram' },
  { n: '03', label: 'Check Priority',  detail: 'Higher priority value → scheduled first' },
  { n: '04', label: 'Select Worker',   detail: 'Oldest high-priority task matched to capable worker' },
  { n: '05', label: 'Allocate',        detail: 'Atomic MongoDB transaction decrements worker resources' },
  { n: '06', label: 'Execute',         detail: 'Worker processes job (10–60 s simulation)' },
  { n: '07', label: 'Release',         detail: 'Resources restored on completion, failure, or recovery' },
];

export default function SchedulingFlow() {
  return (
    <section>
      <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
        <GitMerge size={15} color="var(--steel)" strokeWidth={1.8} />
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--steel)' }}>
          How Scheduling Works
        </span>
      </div>
      <div style={{ borderTop: '1px solid var(--bd)', marginBottom: 16 }} />

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--bd)', borderRadius: 6, padding: '20px 22px',
      }}>
        {STEPS.map((step, i) => (
          <div key={step.n} className="flex gap-4" style={{ marginBottom: i < STEPS.length - 1 ? 0 : 0 }}>
            {/* Spine */}
            <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
              <div className="flex items-center justify-center font-mono" style={{
                width: 30, height: 30, borderRadius: 4,
                background: 'var(--yale-mid)',
                border: '1px solid var(--bd-strong)',
                color: 'var(--gold)',
                fontSize: 11, fontWeight: 700,
                flexShrink: 0,
              }}>
                {step.n}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 1, flex: 1, background: 'var(--yale-rim)',
                  marginTop: 3, marginBottom: 3, minHeight: 14,
                }} />
              )}
            </div>

            {/* Text */}
            <div style={{ paddingBottom: i < STEPS.length - 1 ? 12 : 0, paddingTop: 3 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--dust)', margin: '0 0 3px' }}>
                {step.label}
              </p>
              <p className="font-mono" style={{ fontSize: 11, color: 'var(--tx-meta)', margin: 0, lineHeight: 1.5 }}>
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
