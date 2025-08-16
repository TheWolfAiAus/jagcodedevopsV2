export interface Action {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  status: 'idle' | 'running' | 'success' | 'error';
  lastRun: Date | null;
  lastResult: string | null;
}
