import type {
  GradeLevel,
  LabFiles,
  LabUser,
  SavedProject,
  TrackId,
} from '../types/lab';

const PREFIX = 'kodie_lab_v1';

export interface LabPreferences {
  grade: GradeLevel;
  track: TrackId;
  templateId: string;
  fontSize: number;
  theme: 'light' | 'dark';
  showAllTracks: boolean;
  autoRunWeb: boolean;
}

export interface DemoAccountState {
  loggedIn: boolean;
  user: LabUser;
  completedMissionIds: string[];
  totalXp: number;
  savedProjects: SavedProject[];
}

export const DEFAULT_DEMO_USER: LabUser = {
  id: 'demo-student-1',
  name: 'Siswa Demo',
  grade: 'smp',
  avatarInitials: 'SD',
  isDemo: true,
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Abaikan jika storage penuh / mode privat
  }
}

export function loadPreferences(): Partial<LabPreferences> {
  return safeGet<Partial<LabPreferences>>(`${PREFIX}:prefs`, {});
}

export function savePreferences(prefs: LabPreferences): void {
  safeSet(`${PREFIX}:prefs`, prefs);
}

export interface StoredWorkspaceCode {
  files: LabFiles;
  stdin: string;
  updatedAt: number;
}

export function loadSavedTemplateCode(
  track: TrackId,
  templateId: string
): StoredWorkspaceCode | null {
  return safeGet<StoredWorkspaceCode | null>(
    `${PREFIX}:code:${track}:${templateId}`,
    null
  );
}

export function saveTemplateCode(
  track: TrackId,
  templateId: string,
  files: LabFiles,
  stdin: string
): void {
  safeSet(`${PREFIX}:code:${track}:${templateId}`, {
    files,
    stdin,
    updatedAt: Date.now(),
  });
}

export function clearTemplateCode(track: TrackId, templateId: string): void {
  try {
    window.localStorage.removeItem(`${PREFIX}:code:${track}:${templateId}`);
  } catch {
    // ignore
  }
}

const DEFAULT_ACCOUNT_STATE: DemoAccountState = {
  loggedIn: false,
  user: DEFAULT_DEMO_USER,
  completedMissionIds: [],
  totalXp: 0,
  savedProjects: [],
};

export function loadDemoAccountState(): DemoAccountState {
  const loaded = safeGet<Partial<DemoAccountState>>(
    `${PREFIX}:account`,
    DEFAULT_ACCOUNT_STATE
  );
  return {
    loggedIn: Boolean(loaded.loggedIn),
    user: loaded.user ?? DEFAULT_DEMO_USER,
    completedMissionIds: Array.isArray(loaded.completedMissionIds)
      ? loaded.completedMissionIds
      : [],
    totalXp: typeof loaded.totalXp === 'number' ? loaded.totalXp : 0,
    savedProjects: Array.isArray(loaded.savedProjects) ? loaded.savedProjects : [],
  };
}

export function saveDemoAccountState(state: DemoAccountState): void {
  safeSet(`${PREFIX}:account`, state);
}
