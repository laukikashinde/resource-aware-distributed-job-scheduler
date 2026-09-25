const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

export { API_BASE_URL };

// ── Types ────────────────────────────────────────────────────────────────────

export interface Worker {
  id: string;
  cpu_cores: number;
  ram: number;
  available_cpu: number;
  available_ram: number;
  status: string;
  last_heartbeat: string;
}

export interface Task {
  id: string;
  status: string;
  data: Record<string, unknown>;
  priority: number;
  assigned_worker: string | null;
  retry_count: number;
  started_at: string | null;
  created_at: string;
  updated_at: string;
  required_cpu: number;
  required_ram: number;
  allocated_cpu: number;
  allocated_ram: number;
}

export interface TaskSubmitPayload {
  data: { task: string };
  required_cpu: number;
  required_ram: number;
  priority: number;
}

export interface ApiError {
  detail: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as ApiError;
      detail = body.detail ?? detail;
    } catch {
      // non-JSON body
    }

    // Map status codes to friendly messages
    const messages: Record<number, string> = {
      404: 'Resource not found.',
      422: detail, // backend validation message is usually helpful
      429: 'Rate limit hit — please wait a moment.',
      500: 'Backend server error.',
    };

    throw new Error(messages[res.status] ?? detail);
  }

  return res.json() as Promise<T>;
}

// ── API calls ────────────────────────────────────────────────────────────────

export async function fetchWorkers(): Promise<Worker[]> {
  return request<Worker[]>('/workers/get_workers');
}

export async function fetchPendingTasks(): Promise<Task[]> {
  return request<Task[]>('/tasks/tasks');
}

export async function fetchAllTasks(statusFilter?: string): Promise<Task[]> {
  const qs = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
  return request<Task[]>(`/tasks/all${qs}`);
}

export async function submitTask(payload: TaskSubmitPayload): Promise<Task> {
  return request<Task>('/tasks/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    // /tasks/all has no rate limit — use it as the health probe to avoid
    // burning the 10/min budget on /workers/get_workers
    const res = await fetch(`${API_BASE_URL}/tasks/all`);
    return res.ok || res.status === 429;
  } catch {
    return false;
  }
}
