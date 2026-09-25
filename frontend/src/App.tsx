import { useEffect, useRef, useState, useCallback } from 'react';
import {
  fetchWorkers, fetchAllTasks, checkBackendHealth,
  type Worker, type Task,
} from './services/api';
import Header       from './components/Header';
import OverviewCards from './components/OverviewCards';
import WorkerGrid   from './components/WorkerGrid';
import SubmitJob    from './components/SubmitJob';
import TaskTable    from './components/TaskTable';
import SchedulingFlow from './components/SchedulingFlow';

const POLL_INTERVAL = 4000;

export default function App() {
  const [backendOnline, setBackendOnline]   = useState<boolean | null>(null);
  const [workers, setWorkers]               = useState<Worker[]>([]);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [workersError, setWorkersError]     = useState<string | null>(null);
  const [allTasks, setAllTasks]             = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading]     = useState(true);
  const [tasksError, setTasksError]         = useState<string | null>(null);
  const [lastUpdated, setLastUpdated]       = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh]       = useState(true);
  const [secondsAgo, setSecondsAgo]         = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async (showLoaders = false) => {
    if (showLoaders) { setWorkersLoading(true); setTasksLoading(true); }

    const online = await checkBackendHealth();
    setBackendOnline(online);

    if (!online) {
      setWorkersError('Backend is offline or unreachable.');
      setTasksError('Backend is offline or unreachable.');
      setWorkersLoading(false); setTasksLoading(false);
      return;
    }

    const [wr, tr] = await Promise.allSettled([fetchWorkers(), fetchAllTasks()]);

    if (wr.status === 'fulfilled') { setWorkers(wr.value); setWorkersError(null); }
    else { setWorkersError((wr.reason as Error).message); }
    setWorkersLoading(false);

    if (tr.status === 'fulfilled') { setAllTasks(tr.value); setTasksError(null); }
    else { setTasksError((tr.reason as Error).message); }
    setTasksLoading(false);

    setLastUpdated(new Date()); setSecondsAgo(0);
  }, []);

  useEffect(() => { refresh(true); }, [refresh]);

  useEffect(() => {
    if (autoRefresh) { intervalRef.current = setInterval(() => refresh(), POLL_INTERVAL); }
    else { if (intervalRef.current) clearInterval(intervalRef.current); }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, refresh]);

  useEffect(() => {
    timerRef.current = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const divider = <div style={{ borderTop: '1px solid var(--bd)', margin: '4px 0' }} />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', fontFamily: 'var(--font-sans)' }}>

      <Header
        backendOnline={backendOnline}
        lastUpdated={lastUpdated}
        secondsAgo={secondsAgo}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={setAutoRefresh}
        onRefresh={() => refresh(false)}
      />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 36 }}>

        {/* 1. Overview metrics */}
        <OverviewCards workers={workers} allTasks={allTasks} loading={workersLoading && tasksLoading} />

        {divider}

        {/* 2. Worker resource monitor */}
        <WorkerGrid workers={workers} loading={workersLoading} error={workersError} />

        {divider}

        {/* 3. Submit + Scheduling */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <SubmitJob onSubmitted={() => refresh()} />
          <SchedulingFlow />
        </div>

        {divider}

        {/* 4. Task history */}
        <TaskTable tasks={allTasks} loading={tasksLoading} error={tasksError} />

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 16, textAlign: 'center', fontSize: 12, color: 'var(--tx-dim)' }}>
          Resource-Aware Distributed Job Scheduler&nbsp;&nbsp;·&nbsp;&nbsp;FastAPI + MongoDB&nbsp;&nbsp;·&nbsp;&nbsp;
          <span className="font-mono">v0.1.0</span>
        </div>

      </main>
    </div>
  );
}
