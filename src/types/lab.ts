export type GradeLevel = 'sd' | 'smp' | 'sma';

export type TrackId =
  | 'blocks'
  | 'turtle'
  | 'web'
  | 'python'
  | 'cpp'
  | 'sql'
  | 'typescript'
  | 'software_api'
  | 'network'
  | 'iot'
  | 'ai_data';

export type WebFileKey = 'index.html' | 'style.css' | 'script.js';

export type LabFiles = Record<string, string>;

export type KikoMood = 'idle' | 'happy' | 'thinking' | 'error' | 'celebrate';

export type TurtleCommand =
  | { type: 'move'; distance: number }
  | { type: 'goto'; x: number; y: number }
  | { type: 'turn'; angle: number }
  | { type: 'setheading'; angle: number }
  | { type: 'pen'; down: boolean }
  | { type: 'color'; penColor: string; fillColor?: string }
  | { type: 'fillcolor'; fillColor: string }
  | { type: 'pensize'; size: number }
  | { type: 'begin_fill' }
  | { type: 'end_fill' }
  | { type: 'circle'; radius: number; extent?: number }
  | { type: 'dot'; size?: number; color?: string }
  | { type: 'bgcolor'; color: string }
  | { type: 'write'; text: string; fontSize?: number }
  | { type: 'speed'; value: number }
  | { type: 'visibility'; visible: boolean }
  | { type: 'clear' };

export interface ConsoleEntry {
  id: string;
  level: 'log' | 'info' | 'warn' | 'error' | 'system';
  text: string;
  timestamp: number;
}

export interface SqlTableResult {
  columns: string[];
  values: (string | number | null | Uint8Array)[][];
  statement: string;
}

export interface TsDiagnostic {
  line: number;
  column: number;
  code: number;
  message: string;
  category: 'error' | 'warning';
}

export interface NetworkInterfaceState {
  name: 'GigabitEthernet0/0' | 'GigabitEthernet0/1';
  shortName: 'g0/0' | 'g0/1';
  ip: string | null;
  mask: string | null;
  adminUp: boolean;
  linkUp: boolean;
}

export interface NetworkPingResult {
  targetIp: string;
  success: boolean;
  hops: string[];
  rttMs: number;
  packetLossPct: number;
  reason: string;
}

export interface NetworkSimResult {
  hostname: string;
  interfaces: Record<'g0/0' | 'g0/1', NetworkInterfaceState>;
  pcToRouterUp: boolean;
  routerToServerUp: boolean;
  cliTranscript: string[];
  pings: NetworkPingResult[];
  warnings: string[];
}

export interface IotSensorState {
  tempC: number;
  lightPct: number;
  buttonPressed: boolean;
}

export interface IotFrame {
  timeMs: number;
  leds: { red: boolean; yellow: boolean; green: boolean };
  buzzer: boolean;
  lcd: [string, string];
  serialLines: string[];
}

export interface IotSimResult {
  frames: IotFrame[];
  sensors: IotSensorState;
  serialLog: string[];
  pinModes: Record<number, 'INPUT' | 'OUTPUT'>;
}

export interface AiRegressionChart {
  kind: 'regression';
  title: string;
  xLabel: string;
  yLabel: string;
  points: { x: number; y: number }[];
  slope: number;
  intercept: number;
  r2: number;
  testX?: number;
  testPredY?: number;
}

export interface AiBarChart {
  kind: 'bar';
  title: string;
  items: { label: string; value: number; color?: string }[];
}

export interface AiMetricsSummary {
  modelName: string;
  accuracyPct: number;
  totalSamples: number;
  predictions: {
    input: string;
    actual: string;
    predicted: string;
    correct: boolean;
  }[];
}

export interface AiDataResult {
  charts: (AiRegressionChart | AiBarChart)[];
  metrics?: AiMetricsSummary;
}

export interface ApiRouteInfo {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
}

export interface ApiTestResponse {
  method: string;
  path: string;
  status: number;
  statusText: string;
  body: unknown;
  durationMs: number;
  logs: string[];
}

export interface ApiSimResult {
  routes: ApiRouteInfo[];
  lastResponse?: ApiTestResponse;
  smokeTests: ApiTestResponse[];
}

export interface ExecutionResult {
  track: TrackId;
  ok: boolean;
  stdout: string;
  stderr: string;
  consoleLogs: ConsoleEntry[];
  turtleCommands?: TurtleCommand[];
  generatedPython?: string;
  sqlTables?: SqlTableResult[];
  sqlAffectedRows?: number;
  sqlStatementsRun?: number;
  tsDiagnostics?: TsDiagnostic[];
  networkResult?: NetworkSimResult;
  iotResult?: IotSimResult;
  aiResult?: AiDataResult;
  apiResult?: ApiSimResult;
  exitCode?: number;
  durationMs: number;
  errorRaw?: string;
}

export interface MissionCriterion {
  id: string;
  label: string;
  mode: 'static' | 'runtime';
  checkStatic?: (files: LabFiles, generatedPython?: string) => boolean;
  checkRuntime?: (result: ExecutionResult, files: LabFiles) => boolean;
}

export interface LabTemplate {
  id: string;
  grade: GradeLevel;
  track: TrackId;
  tier: 'free' | 'advance' | 'scratchpad';
  title: string;
  subtitle: string;
  xpReward: number;
  files: LabFiles;
  defaultStdin?: string;
  missionTitle: string;
  missionGoal: string;
  criteria: MissionCriterion[];
  hints: string[];
  solutionFiles?: LabFiles;
}

export interface LabUser {
  id: string;
  name: string;
  grade: GradeLevel;
  avatarInitials: string;
  isDemo?: boolean;
}

export type AuthGateReason =
  | 'advance_mission'
  | 'my_projects'
  | 'download_file'
  | 'view_solution'
  | 'save_xp'
  | 'specialization_lab';

export interface SavedProject {
  id: string;
  name: string;
  grade: GradeLevel;
  track: TrackId;
  templateId: string;
  files: LabFiles;
  stdin: string;
  updatedAt: number;
}

export interface KodieLabProps {
  /** Initial grade filter when embedded or routed */
  initialGrade?: GradeLevel;
  /** Initial language track when embedded or routed */
  initialTrack?: TrackId;
  /** Initial template ID to load */
  initialTemplateId?: string;
  /** Authenticated user from host LMS; omit/null to use standalone Demo Guest/Student switcher */
  user?: LabUser | null;
  /** Hook called when Guest attempts an authenticated action (advance mission, save project, download, etc.) */
  onRequireLogin?: (reason: AuthGateReason) => void;
  /** Hook fired when a mission reaches 3/3 criteria */
  onMissionComplete?: (payload: { templateId: string; xpEarned: number; grade: GradeLevel; track: TrackId }) => void;
  /** Hook fired whenever code changes */
  onCodeChange?: (payload: { track: TrackId; templateId: string; files: LabFiles }) => void;
  /** Compact mode for embedding inside LMS lesson panes */
  embedded?: boolean;
}
