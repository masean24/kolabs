import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Code2, Eye } from 'lucide-react';
import { GRADE_TRACKS, SPECIALIZATION_TRACKS, TRACK_META } from '../../config/brand';
import {
  getTemplateById,
  getTemplatesForGradeAndTrack,
} from '../../data/templates';
import { runAiDataCode } from '../../runners/aiRunner';
import {
  type SmokeTestSpec,
  runApiServerCode,
  sendApiRequest,
} from '../../runners/apiRunner';
import { compileBlocksToPython, runBlocks } from '../../runners/blockRunner';
import { runCppCode } from '../../runners/cppRunner';
import { DEFAULT_IOT_SENSORS, runIotCode } from '../../runners/iotRunner';
import { runNetworkCode } from '../../runners/networkRunner';
import { runPythonCode } from '../../runners/pythonRunner';
import { runSqlCode } from '../../runners/sqlRunner';
import { runTurtleCode } from '../../runners/turtleRunner';
import { runTypeScriptCode } from '../../runners/tsRunner';
import { WEB_CONSOLE_SOURCE, buildWebSrcDoc } from '../../runners/webRunner';
import type {
  AuthGateReason,
  ConsoleEntry,
  ExecutionResult,
  GradeLevel,
  IotSensorState,
  KikoMood,
  KodieLabProps,
  LabFiles,
  LabTemplate,
  SavedProject,
  TrackId,
  WebFileKey,
} from '../../types/lab';
import { evaluateMission } from '../../utils/missionEvaluator';
import {
  DEFAULT_DEMO_USER,
  clearTemplateCode,
  loadDemoAccountState,
  loadPreferences,
  loadSavedTemplateCode,
  saveDemoAccountState,
  savePreferences,
  saveTemplateCode,
} from '../../utils/storage';
import { AuthGateModal } from './AuthGateModal';
import { BlocklyEditorPane } from './BlocklyEditorPane';
import { CodeEditorPane } from './CodeEditorPane';
import { KikoMissionBar } from './KikoMissionBar';
import { LabHeader } from './LabHeader';
import { MyProjectsModal } from './MyProjectsModal';
import { OutputPane } from './OutputPane';

function isValidGrade(val: string | null): val is GradeLevel {
  return val === 'sd' || val === 'smp' || val === 'sma';
}

function isValidTrack(val: string | null): val is TrackId {
  return (
    val === 'blocks' ||
    val === 'turtle' ||
    val === 'web' ||
    val === 'python' ||
    val === 'cpp' ||
    val === 'sql' ||
    val === 'typescript' ||
    val === 'software_api' ||
    val === 'network' ||
    val === 'iot' ||
    val === 'ai_data'
  );
}

export function KodieLab({
  initialGrade,
  initialTrack,
  initialTemplateId,
  user: hostUser,
  onRequireLogin,
  onMissionComplete,
  onCodeChange,
  embedded = false,
}: KodieLabProps) {
  // Baca URL query params & preferensi awal sekali
  const bootstrap = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const prefs = loadPreferences();
    const initialAccount = loadDemoAccountState();
    const hasInitialUser =
      hostUser !== undefined ? Boolean(hostUser) : initialAccount.loggedIn;

    const qTemplate = params.get('template');
    const explicitTpl = getTemplateById(
      initialTemplateId || qTemplate || prefs.templateId || ''
    );

    const qGrade = params.get('level');
    const qTrack = params.get('track');

    const grade: GradeLevel =
      initialGrade ??
      (isValidGrade(qGrade) ? qGrade : undefined) ??
      explicitTpl?.grade ??
      prefs.grade ??
      'sd';

    const curatedTracks = GRADE_TRACKS[grade];
    let track: TrackId =
      initialTrack ??
      (isValidTrack(qTrack) ? qTrack : undefined) ??
      explicitTpl?.track ??
      prefs.track ??
      curatedTracks[0];

    if (
      !hasInitialUser &&
      (TRACK_META[track].requiresAuth ||
        (grade === 'sd' && TRACK_META[track].isSpecialization))
    ) {
      track = curatedTracks[0];
    }

    const available = getTemplatesForGradeAndTrack(grade, track);
    let template =
      (explicitTpl && explicitTpl.track === track ? explicitTpl : undefined) ??
      available[0];

    if (!hasInitialUser && template.tier === 'advance') {
      template = available.find((t) => t.tier === 'free') ?? available[0];
    }

    const saved = loadSavedTemplateCode(track, template.id);

    return {
      grade,
      track,
      template,
      files: saved?.files ?? { ...template.files },
      stdin: saved?.stdin ?? template.defaultStdin ?? '',
      fontSize: prefs.fontSize ?? 14,
      theme: prefs.theme ?? 'light',
      showAllTracks:
        prefs.showAllTracks ??
        (!curatedTracks.includes(track) && !TRACK_META[track].isSpecialization),
      showSmpSpecialization:
        grade === 'smp' && SPECIALIZATION_TRACKS.includes(track),
      autoRunWeb: prefs.autoRunWeb ?? true,
    };
  }, [initialGrade, initialTrack, initialTemplateId, hostUser]);

  const [grade, setGrade] = useState<GradeLevel>(bootstrap.grade);
  const [track, setTrack] = useState<TrackId>(bootstrap.track);
  const [activeTemplate, setActiveTemplate] = useState<LabTemplate>(
    bootstrap.template
  );
  const [files, setFiles] = useState<LabFiles>(bootstrap.files);
  const [stdin, setStdin] = useState<string>(bootstrap.stdin);
  const [activeWebFile, setActiveWebFile] = useState<WebFileKey>('index.html');

  const [fontSize, setFontSize] = useState<number>(bootstrap.fontSize);
  const [theme, setTheme] = useState<'light' | 'dark'>(bootstrap.theme);
  const [uiLang, setUiLang] = useState<'id' | 'en'>('id');
  const [showAllTracks, setShowAllTracks] = useState<boolean>(
    bootstrap.showAllTracks
  );
  const [showSmpSpecialization, setShowSmpSpecialization] = useState<boolean>(
    bootstrap.showSmpSpecialization
  );
  const [autoRunWeb, setAutoRunWeb] = useState<boolean>(bootstrap.autoRunWeb);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved'>('saved');

  // State Auth Demo / Akun Siswa
  const [accountState, setAccountState] = useState(() => loadDemoAccountState());
  const effectiveUser =
    hostUser !== undefined
      ? hostUser
      : accountState.loggedIn
      ? accountState.user
      : null;

  const [authGateReason, setAuthGateReason] = useState<AuthGateReason | null>(
    null
  );
  const [pendingTemplateAfterLogin, setPendingTemplateAfterLogin] =
    useState<LabTemplate | null>(null);
  const [pendingTrackAfterLogin, setPendingTrackAfterLogin] =
    useState<TrackId | null>(null);
  const [myProjectsOpen, setMyProjectsOpen] = useState(false);

  // State Eksekusi
  const [isRunning, setIsRunning] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [turtleRunSignal, setTurtleRunSignal] = useState(0);
  const [networkRunSignal, setNetworkRunSignal] = useState(0);
  const [iotRunSignal, setIotRunSignal] = useState(0);
  const [iotSensors, setIotSensors] = useState<IotSensorState>(
    DEFAULT_IOT_SENSORS
  );

  // State Web Preview & Console Bridge
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [webRunId, setWebRunId] = useState<string>(() => `web-${Date.now()}`);
  const [webSrcDoc, setWebSrcDoc] = useState<string>(() =>
    bootstrap.track === 'web'
      ? buildWebSrcDoc(bootstrap.files, `web-${Date.now()}`)
      : ''
  );
  const [webConsoleLogs, setWebConsoleLogs] = useState<ConsoleEntry[]>([]);
  const [webPreviewMode, setWebPreviewMode] = useState<'desktop' | 'mobile'>(
    'desktop'
  );

  // Layout Responsif: Split Resizer Desktop & 2-Tab Mobile
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const [splitPercent, setSplitPercent] = useState(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'output'>('editor');
  const [hasNewMobileOutput, setHasNewMobileOutput] = useState(false);

  // Toast Notifikasi
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 2600);
  }, []);

  // Sinkronkan kelas `.dark` pada <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Simpan preferensi global ke localStorage
  useEffect(() => {
    savePreferences({
      grade,
      track,
      templateId: activeTemplate.id,
      fontSize,
      theme,
      showAllTracks,
      autoRunWeb,
    });
  }, [grade, track, activeTemplate.id, fontSize, theme, showAllTracks, autoRunWeb]);

  // Simpan state akun demo ke localStorage
  useEffect(() => {
    saveDemoAccountState(accountState);
  }, [accountState]);

  // Auto-save kode & stdin (debounce 350ms)
  useEffect(() => {
    setSaveStatus('saving');
    const timer = window.setTimeout(() => {
      saveTemplateCode(track, activeTemplate.id, files, stdin);
      setSaveStatus('saved');
    }, 350);
    return () => window.clearTimeout(timer);
  }, [track, activeTemplate.id, files, stdin]);

  // Bridge Console dari Web iframe via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        !iframeRef.current?.contentWindow ||
        event.source !== iframeRef.current.contentWindow
      ) {
        return;
      }
      const data = event.data as
        | { source?: string; runId?: string; level?: ConsoleEntry['level']; text?: string }
        | undefined;
      if (!data || data.source !== WEB_CONSOLE_SOURCE || data.runId !== webRunId) {
        return;
      }
      const level = data.level ?? 'log';
      const entry: ConsoleEntry = {
        id: `web-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        level,
        text: data.text ?? '',
        timestamp: Date.now(),
      };
      setWebConsoleLogs((prev) => [...prev.slice(-99), entry]);
      if (level === 'error') {
        setResult((prev) =>
          prev && prev.track === 'web'
            ? { ...prev, ok: false, errorRaw: entry.text }
            : prev
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [webRunId]);

  const templatesForView = useMemo(
    () => getTemplatesForGradeAndTrack(grade, track),
    [grade, track]
  );

  const generatedPythonForBlocks = useMemo(
    () =>
      track === 'blocks' ? compileBlocksToPython(files['blocks.json'] ?? '') : undefined,
    [track, files]
  );

  const missionEvaluation = useMemo(
    () =>
      evaluateMission(activeTemplate, files, result, generatedPythonForBlocks),
    [activeTemplate, files, result, generatedPythonForBlocks]
  );

  // Reward XP otomatis saat 3/3 kriteria tercapai
  const awardedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (
      activeTemplate.tier === 'scratchpad' ||
      !missionEvaluation.allPassed ||
      awardedRef.current.has(activeTemplate.id)
    ) {
      return;
    }
    awardedRef.current.add(activeTemplate.id);

    onMissionComplete?.({
      templateId: activeTemplate.id,
      xpEarned: activeTemplate.xpReward,
      grade,
      track,
    });

    setAccountState((prev) => {
      if (prev.completedMissionIds.includes(activeTemplate.id)) return prev;
      return {
        ...prev,
        completedMissionIds: [...prev.completedMissionIds, activeTemplate.id],
        totalXp: prev.totalXp + activeTemplate.xpReward,
      };
    });
  }, [
    missionEvaluation.allPassed,
    activeTemplate.id,
    activeTemplate.tier,
    activeTemplate.xpReward,
    grade,
    track,
    onMissionComplete,
  ]);

  const loadTemplateIntoWorkspace = useCallback(
    (tpl: LabTemplate) => {
      setActiveTemplate(tpl);
      const saved = loadSavedTemplateCode(tpl.track, tpl.id);
      const nextFiles = saved?.files ?? { ...tpl.files };
      const nextStdin = saved?.stdin ?? tpl.defaultStdin ?? '';
      setFiles(nextFiles);
      setStdin(nextStdin);
      setResult(null);
      setWebConsoleLogs([]);
      setLoadingStatus(null);
      if (tpl.track === 'web') {
        const rid = `web-${Date.now()}`;
        setWebRunId(rid);
        setWebSrcDoc(buildWebSrcDoc(nextFiles, rid));
      }
    },
    []
  );

  const requestAuthGate = useCallback(
    (reason: AuthGateReason) => {
      onRequireLogin?.(reason);
      setAuthGateReason(reason);
    },
    [onRequireLogin]
  );

  const handleSelectGrade = (nextGrade: GradeLevel) => {
    setGrade(nextGrade);
    const curated = GRADE_TRACKS[nextGrade];
    const allowCurrent =
      nextGrade === 'sma'
        ? curated.includes(track) ||
          (Boolean(effectiveUser) && TRACK_META[track].isSpecialization)
        : nextGrade === 'smp'
        ? curated.includes(track) ||
          (showSmpSpecialization &&
            Boolean(effectiveUser) &&
            TRACK_META[track].isSpecialization)
        : curated.includes(track);

    const nextTrack = showAllTracks && (nextGrade !== 'sd' || !TRACK_META[track].isSpecialization)
      ? track
      : allowCurrent
      ? track
      : curated[0];
    setTrack(nextTrack);

    const list = getTemplatesForGradeAndTrack(nextGrade, nextTrack);
    const chosen =
      (effectiveUser
        ? list[0]
        : list.find((t) => t.tier === 'free') ?? list[0]);
    if (chosen) loadTemplateIntoWorkspace(chosen);
  };

  const handleSelectTrack = (nextTrack: TrackId) => {
    if (TRACK_META[nextTrack].requiresAuth && !effectiveUser) {
      setPendingTrackAfterLogin(nextTrack);
      requestAuthGate('specialization_lab');
      return;
    }
    setTrack(nextTrack);
    const list = getTemplatesForGradeAndTrack(grade, nextTrack);
    const chosen =
      (effectiveUser
        ? list[0]
        : list.find((t) => t.tier === 'free') ?? list[0]);
    if (chosen) loadTemplateIntoWorkspace(chosen);
  };

  const handleSelectTemplate = (tpl: LabTemplate) => {
    if (tpl.tier === 'advance' && !effectiveUser) {
      setPendingTemplateAfterLogin(tpl);
      requestAuthGate('advance_mission');
      return;
    }
    loadTemplateIntoWorkspace(tpl);
  };

  const handleRun = useCallback(async () => {
    if (isRunning) return;

    if (track === 'web') {
      const start = performance.now();
      const rid = `web-${Date.now()}`;
      setWebRunId(rid);
      setWebConsoleLogs([]);
      setWebSrcDoc(buildWebSrcDoc(files, rid));
      setResult({
        track: 'web',
        ok: true,
        stdout: 'Preview Web diperbarui',
        stderr: '',
        consoleLogs: [],
        durationMs: Math.max(1, Math.round(performance.now() - start)),
      });
      if (window.innerWidth < 1024) setHasNewMobileOutput(true);
      return;
    }

    if (track === 'blocks') {
      const blockRes = runBlocks(files['blocks.json'] ?? '');
      setResult(blockRes);
      setTurtleRunSignal((s) => s + 1);
      if (window.innerWidth < 1024) setHasNewMobileOutput(true);
      return;
    }

    if (track === 'network') {
      const netRes = runNetworkCode(files['router_config.ios'] ?? '');
      setResult(netRes);
      setNetworkRunSignal((s) => s + 1);
      if (window.innerWidth < 1024) setHasNewMobileOutput(true);
      return;
    }

    if (track === 'iot') {
      const iotRes = runIotCode(files['sketch.ino'] ?? '', iotSensors);
      setResult(iotRes);
      setIotRunSignal((s) => s + 1);
      if (window.innerWidth < 1024) setHasNewMobileOutput(true);
      return;
    }

    setIsRunning(true);
    setLoadingStatus(`Menyiapkan runtime ${TRACK_META[track].label}...`);

    try {
      let execResult: ExecutionResult;
      if (track === 'python') {
        execResult = await runPythonCode(
          files['main.py'] ?? '',
          stdin,
          setLoadingStatus
        );
      } else if (track === 'turtle') {
        execResult = await runTurtleCode(
          files['turtle_art.py'] ?? '',
          setLoadingStatus
        );
        setTurtleRunSignal((s) => s + 1);
      } else if (track === 'ai_data') {
        execResult = await runAiDataCode(
          files['model_ai.py'] ?? '',
          setLoadingStatus
        );
      } else if (track === 'software_api') {
        const smokeSpecs: SmokeTestSpec[] =
          activeTemplate.id === 'sma-api-courses'
            ? [
                { method: 'GET', path: '/api/kursus' },
                {
                  method: 'POST',
                  path: '/api/kursus',
                  body: { judul: 'Node.js', level: 'SMA' },
                },
              ]
            : activeTemplate.id === 'sma-api-detail'
            ? [
                { method: 'GET', path: '/api/siswa/1' },
                { method: 'GET', path: '/api/siswa/999' },
              ]
            : [];
        execResult = await runApiServerCode(
          files['server.ts'] ?? '',
          smokeSpecs,
          setLoadingStatus
        );
      } else if (track === 'cpp') {
        execResult = await runCppCode(
          files['main.cpp'] ?? '',
          stdin,
          setLoadingStatus
        );
      } else if (track === 'sql') {
        execResult = await runSqlCode(files['query.sql'] ?? '', setLoadingStatus);
      } else {
        execResult = await runTypeScriptCode(
          files['main.ts'] ?? '',
          setLoadingStatus
        );
      }

      setResult(execResult);
      if (window.innerWidth < 1024) {
        setHasNewMobileOutput(true);
      }
    } finally {
      setIsRunning(false);
      setLoadingStatus(null);
    }
  }, [isRunning, track, files, stdin, iotSensors, activeTemplate.id]);

  const handleChangeIotSensors = useCallback(
    (nextSensors: IotSensorState) => {
      setIotSensors(nextSensors);
      if (track === 'iot') {
        const iotRes = runIotCode(files['sketch.ino'] ?? '', nextSensors);
        setResult(iotRes);
        setIotRunSignal((s) => s + 1);
      }
    },
    [track, files]
  );

  const handleSendApiTest = useCallback(
    (
      method: 'GET' | 'POST' | 'PUT' | 'DELETE',
      path: string,
      bodyJson: string
    ) => {
      const response = sendApiRequest(method, path, bodyJson);
      setResult((prev) => {
        if (!prev || prev.track !== 'software_api' || !prev.apiResult) return prev;
        return {
          ...prev,
          apiResult: {
            ...prev.apiResult,
            lastResponse: response,
            smokeTests: [...prev.apiResult.smokeTests, response],
          },
        };
      });
    },
    []
  );

  // Auto-Run Web Stack (debounce ~450ms)
  useEffect(() => {
    if (track !== 'web' || !autoRunWeb) return;
    const timer = window.setTimeout(() => {
      const rid = `web-${Date.now()}`;
      setWebRunId(rid);
      setWebConsoleLogs([]);
      setWebSrcDoc(buildWebSrcDoc(files, rid));
      setResult({
        track: 'web',
        ok: true,
        stdout: 'Auto-run diperbarui',
        stderr: '',
        consoleLogs: [],
        durationMs: 2,
      });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [track, autoRunWeb, files]);

  const handleChangeCode = useCallback(
    (fileName: string, nextValue: string) => {
      setFiles((prev) => {
        const updated = { ...prev, [fileName]: nextValue };
        onCodeChange?.({ track, templateId: activeTemplate.id, files: updated });
        return updated;
      });
    },
    [track, activeTemplate.id, onCodeChange]
  );

  const handleCopyCode = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Kode berhasil disalin ke clipboard!');
    } catch {
      showToast('Tidak dapat mengakses clipboard browser.');
    }
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    if (!effectiveUser) {
      requestAuthGate('download_file');
      return;
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`File ${fileName} berhasil diunduh!`);
  };

  const handleResetCode = () => {
    clearTemplateCode(track, activeTemplate.id);
    const resetFiles = { ...activeTemplate.files };
    const resetStdin = activeTemplate.defaultStdin ?? '';
    setFiles(resetFiles);
    setStdin(resetStdin);
    setResult(null);
    setWebConsoleLogs([]);
    if (track === 'web') {
      const rid = `web-${Date.now()}`;
      setWebRunId(rid);
      setWebSrcDoc(buildWebSrcDoc(resetFiles, rid));
    }
    showToast('Kode dikembalikan ke template awal.');
  };

  const handleApplySolution = () => {
    if (!effectiveUser) {
      requestAuthGate('view_solution');
      return;
    }
    if (!activeTemplate.solutionFiles) return;
    const sol = { ...activeTemplate.solutionFiles };
    setFiles(sol);
    if (track === 'web') {
      const rid = `web-${Date.now()}`;
      setWebRunId(rid);
      setWebSrcDoc(buildWebSrcDoc(sol, rid));
    }
    showToast('Kunci solusi Kiko diterapkan! Coba tekan Run untuk mengujinya.');
  };

  const handleOpenMyProjects = () => {
    if (!effectiveUser) {
      requestAuthGate('my_projects');
      return;
    }
    setMyProjectsOpen(true);
  };

  const handleSaveCurrentProject = (name: string) => {
    const newProj: SavedProject = {
      id: `proj-${Date.now()}`,
      name,
      grade,
      track,
      templateId: activeTemplate.id,
      files: { ...files },
      stdin,
      updatedAt: Date.now(),
    };
    setAccountState((prev) => ({
      ...prev,
      savedProjects: [newProj, ...prev.savedProjects],
    }));
    showToast(`Proyek "${name}" tersimpan di Proyek Saya!`);
  };

  const handleLoadProject = (proj: SavedProject) => {
    const tpl =
      getTemplateById(proj.templateId) ??
      getTemplatesForGradeAndTrack(proj.grade, proj.track)[0];
    setGrade(proj.grade);
    setTrack(proj.track);
    if (tpl) setActiveTemplate(tpl);
    setFiles({ ...proj.files });
    setStdin(proj.stdin);
    setResult(null);
    setMyProjectsOpen(false);
    if (proj.track === 'web') {
      const rid = `web-${Date.now()}`;
      setWebRunId(rid);
      setWebSrcDoc(buildWebSrcDoc(proj.files, rid));
    }
    showToast(`Proyek "${proj.name}" dimuat!`);
  };

  const handleDeleteProject = (projectId: string) => {
    setAccountState((prev) => ({
      ...prev,
      savedProjects: prev.savedProjects.filter((p) => p.id !== projectId),
    }));
    showToast('Proyek dihapus.');
  };

  const handleAuthAction = () => {
    if (hostUser !== undefined) {
      if (!hostUser) requestAuthGate('my_projects');
      return;
    }
    if (accountState.loggedIn) {
      setAccountState((prev) => ({ ...prev, loggedIn: false }));
      if (TRACK_META[track].requiresAuth) {
        const fallbackTrack = GRADE_TRACKS[grade][0];
        setTrack(fallbackTrack);
        const list = getTemplatesForGradeAndTrack(grade, fallbackTrack);
        const freeTpl = list.find((t) => t.tier === 'free') ?? list[0];
        if (freeTpl) loadTemplateIntoWorkspace(freeTpl);
      } else if (activeTemplate.tier === 'advance') {
        const freeTpl =
          templatesForView.find((t) => t.tier === 'free') ?? templatesForView[0];
        if (freeTpl) loadTemplateIntoWorkspace(freeTpl);
      }
      showToast('Beralih ke Mode Tamu.');
    } else {
      setAuthGateReason('my_projects');
    }
  };

  const handleLoginDemo = () => {
    setAccountState((prev) => ({
      ...prev,
      loggedIn: true,
      user: { ...DEFAULT_DEMO_USER, grade },
    }));
    setAuthGateReason(null);
    if (pendingTrackAfterLogin) {
      const nextTrack = pendingTrackAfterLogin;
      setTrack(nextTrack);
      const list = getTemplatesForGradeAndTrack(grade, nextTrack);
      if (list[0]) loadTemplateIntoWorkspace(list[0]);
      setPendingTrackAfterLogin(null);
    } else if (pendingTemplateAfterLogin) {
      loadTemplateIntoWorkspace(pendingTemplateAfterLogin);
      setPendingTemplateAfterLogin(null);
    }
    showToast('Berhasil masuk sebagai Siswa Demo! Semua fitur terbuka.');
  };

  // Drag resizer untuk Desktop (>= 1024px)
  useEffect(() => {
    if (!isDraggingSplit) return;

    const handleMove = (e: MouseEvent) => {
      const box = splitContainerRef.current;
      if (!box) return;
      const rect = box.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(72, Math.max(28, pct)));
    };
    const handleUp = () => setIsDraggingSplit(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDraggingSplit]);

  const kikoMood: KikoMood = isRunning
    ? 'thinking'
    : result?.errorRaw || webConsoleLogs.some((l) => l.level === 'error')
    ? 'error'
    : missionEvaluation.allPassed
    ? 'celebrate'
    : 'idle';

  return (
    <div
      className={`flex flex-col bg-[#F8FAFC] text-[#0F172A] dark:bg-[#070D1C] dark:text-slate-100 ${
        embedded
          ? 'h-full min-h-[640px]'
          : 'min-h-screen lg:h-screen lg:overflow-hidden'
      }`}
    >
      <LabHeader
        grade={grade}
        track={track}
        templateId={activeTemplate.id}
        templates={templatesForView}
        showAllTracks={showAllTracks}
        showSmpSpecialization={showSmpSpecialization}
        fontSize={fontSize}
        theme={theme}
        uiLang={uiLang}
        user={effectiveUser}
        totalXp={accountState.totalXp}
        savedProjectsCount={accountState.savedProjects.length}
        embedded={embedded}
        onSelectGrade={handleSelectGrade}
        onSelectTrack={handleSelectTrack}
        onToggleShowAllTracks={() => setShowAllTracks((prev) => !prev)}
        onToggleSmpSpecialization={() =>
          setShowSmpSpecialization((prev) => !prev)
        }
        onSelectTemplate={handleSelectTemplate}
        onFontSizeChange={(delta) =>
          setFontSize((prev) => Math.min(24, Math.max(12, prev + delta)))
        }
        onToggleTheme={() =>
          setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
        }
        onChangeUiLang={(lang) => {
          setUiLang(lang);
          showToast(
            lang === 'id' ? 'Bahasa UI: Indonesia' : 'UI Language: English'
          );
        }}
        onOpenMyProjects={handleOpenMyProjects}
        onAuthAction={handleAuthAction}
        onRegisterAction={() => requestAuthGate('my_projects')}
        onNavPlaceholderClick={(target) =>
          showToast(`Navigasi web utama: ${target}`)
        }
      />

      <KikoMissionBar
        template={activeTemplate}
        grade={grade}
        evaluation={missionEvaluation}
        mood={kikoMood}
        user={effectiveUser}
        onApplySolution={handleApplySolution}
        onRequestAuthForXp={() => requestAuthGate('save_xp')}
      />

      {/* Navigasi 2 Tab Khusus Mobile/Tablet (< 1024px) */}
      <div className="mx-3 mt-2.5 flex gap-1.5 rounded-full border border-slate-200 bg-white p-1 shadow-xs lg:hidden dark:border-slate-800 dark:bg-[#0F172A]">
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 font-display text-xs font-extrabold transition ${
            mobileTab === 'editor'
              ? 'bg-[#1E4ED8] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          <Code2 className="h-4 w-4" />
          <span>
            1.{' '}
            {uiLang === 'id'
              ? track === 'blocks'
                ? 'Susun Blok'
                : 'Editor Kode'
              : track === 'blocks'
              ? 'Build Blocks'
              : 'Code Editor'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMobileTab('output');
            setHasNewMobileOutput(false);
          }}
          className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 font-display text-xs font-extrabold transition ${
            mobileTab === 'output'
              ? 'bg-[#1E4ED8] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>{uiLang === 'id' ? '2. Hasil & Konsol' : '2. Output & Console'}</span>
          {hasNewMobileOutput && mobileTab !== 'output' && (
            <span
              className="h-2.5 w-2.5 rounded-full bg-[#D9F952] ring-2 ring-[#0F172A]"
              aria-label="Output baru tersedia"
            />
          )}
        </button>
      </div>

      {/* Area Kerja Utama: Floating Split-Screen Cards */}
      <div
        ref={splitContainerRef}
        className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col gap-2 p-3 sm:px-5 sm:pb-4 lg:flex-row lg:gap-0 lg:overflow-hidden"
        style={
          {
            '--kodie-left-w': `${splitPercent}%`,
          } as React.CSSProperties
        }
      >
        {/* Panel Kiri: Editor Kode atau Blockly */}
        <section
          className={`min-h-[480px] flex-1 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm lg:min-h-0 lg:flex lg:flex-none lg:w-[var(--kodie-left-w)] dark:border-slate-800 dark:bg-[#0B1222] ${
            mobileTab === 'editor' ? 'flex' : 'hidden'
          }`}
        >
          {track === 'blocks' ? (
            <BlocklyEditorPane
              workspaceJson={files['blocks.json'] ?? ''}
              theme={theme}
              saveStatus={saveStatus}
              isRunning={isRunning}
              user={effectiveUser}
              onChangeBlocks={(nextJson) =>
                handleChangeCode('blocks.json', nextJson)
              }
              onRunBlocks={handleRun}
              onDownloadPython={handleDownloadFile}
              onSaveProject={handleOpenMyProjects}
              onResetBlocks={handleResetCode}
            />
          ) : (
            <CodeEditorPane
              track={track}
              files={files}
              activeWebFile={activeWebFile}
              fontSize={fontSize}
              theme={theme}
              saveStatus={saveStatus}
              autoRunWeb={autoRunWeb}
              isRunning={isRunning}
              user={effectiveUser}
              onSelectWebFile={setActiveWebFile}
              onChangeCode={handleChangeCode}
              onToggleAutoRunWeb={() => setAutoRunWeb((prev) => !prev)}
              onRun={handleRun}
              onCopyCode={handleCopyCode}
              onDownloadFile={handleDownloadFile}
              onSaveProject={handleOpenMyProjects}
              onResetCode={handleResetCode}
            />
          )}
        </section>

        {/* Drag Resizer Desktop */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Ubah lebar panel editor dan output"
          onMouseDown={() => setIsDraggingSplit(true)}
          className="group hidden w-3 shrink-0 cursor-col-resize items-center justify-center lg:flex"
        >
          <div
            className={`h-12 w-1.5 rounded-full transition-colors ${
              isDraggingSplit
                ? 'bg-[#1D4ED8]'
                : 'bg-slate-300/80 group-hover:bg-[#1D4ED8] dark:bg-slate-700'
            }`}
          />
        </div>

        {/* Panel Kanan: Output & Konsol */}
        <section
          className={`min-h-[480px] min-w-0 flex-1 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm lg:min-h-0 lg:flex dark:border-slate-800 dark:bg-[#0F172A] ${
            mobileTab === 'output' ? 'flex' : 'hidden'
          }`}
        >
          <OutputPane
            track={track}
            grade={grade}
            theme={theme}
            isRunning={isRunning}
            loadingStatus={loadingStatus}
            stdin={stdin}
            webSrcDoc={webSrcDoc}
            webPreviewMode={webPreviewMode}
            webConsoleLogs={webConsoleLogs}
            result={result}
            turtleRunSignal={turtleRunSignal}
            networkRunSignal={networkRunSignal}
            iotRunSignal={iotRunSignal}
            iotSensors={iotSensors}
            iframeRef={iframeRef}
            isDraggingSplit={isDraggingSplit}
            onChangeStdin={setStdin}
            onChangeWebPreviewMode={setWebPreviewMode}
            onRefreshWeb={handleRun}
            onClearConsole={() => setWebConsoleLogs([])}
            onChangeIotSensors={handleChangeIotSensors}
            onSendApiTest={handleSendApiTest}
          />
        </section>
      </div>

      {/* Modal AuthGate & Proyek Saya */}
      <AuthGateModal
        reason={authGateReason}
        onClose={() => {
          setAuthGateReason(null);
          setPendingTemplateAfterLogin(null);
          setPendingTrackAfterLogin(null);
        }}
        onLoginDemo={handleLoginDemo}
      />

      <MyProjectsModal
        open={myProjectsOpen}
        projects={accountState.savedProjects}
        defaultProjectName={`${activeTemplate.title} (${grade.toUpperCase()})`}
        onClose={() => setMyProjectsOpen(false)}
        onSaveCurrent={handleSaveCurrentProject}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[10000] rounded-2xl border border-slate-700 bg-[#0F172A] px-4 py-2.5 text-xs font-bold text-[#C6F64D] shadow-xl"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
