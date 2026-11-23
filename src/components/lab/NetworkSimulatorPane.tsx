import { useEffect, useState } from 'react';
import { Activity, Monitor, Network, RotateCcw, Server, Terminal } from 'lucide-react';
import type { NetworkSimResult } from '../../types/lab';

interface NetworkSimulatorPaneProps {
  networkResult: NetworkSimResult | undefined;
  runSignal: number;
}

const NODE_COORDS: Record<string, { x: number; y: number }> = {
  pc: { x: 65, y: 82 },
  sw: { x: 195, y: 82 },
  router: { x: 345, y: 82 },
  server: { x: 495, y: 82 },
};

export function NetworkSimulatorPane({
  networkResult,
  runSignal,
}: NetworkSimulatorPaneProps) {
  const [replayTick, setReplayTick] = useState(0);
  const [packetPos, setPacketPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const lastPing =
    networkResult && networkResult.pings.length > 0
      ? networkResult.pings[networkResult.pings.length - 1]
      : null;

  useEffect(() => {
    if (!lastPing || lastPing.hops.length < 2) {
      setPacketPos(null);
      return;
    }

    const hops = lastPing.hops;
    const sequence = lastPing.success
      ? [...hops, ...[...hops].reverse().slice(1)]
      : hops;

    let rafId = 0;
    const totalDuration = lastPing.success ? 1500 : 750;
    const startTs = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTs;
      const progress = Math.min(1, elapsed / totalDuration);
      const segTotal = sequence.length - 1;
      const scaled = progress * segTotal;
      const segIdx = Math.min(segTotal - 1, Math.floor(scaled));
      const localT = scaled - segIdx;

      const from = NODE_COORDS[sequence[segIdx]] ?? NODE_COORDS.pc;
      const to = NODE_COORDS[sequence[segIdx + 1]] ?? NODE_COORDS.router;

      setPacketPos({
        x: from.x + (to.x - from.x) * localT,
        y: from.y + (to.y - from.y) * localT,
      });

      if (progress < 1) {
        rafId = window.requestAnimationFrame(animate);
      } else {
        setPacketPos(null);
      }
    };

    rafId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(rafId);
  }, [lastPing, runSignal, replayTick]);

  if (!networkResult) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="kodie-card-blue max-w-sm rounded-2xl border border-blue-200/80 p-5 shadow-xs">
          <Network className="mx-auto mb-2 h-8 w-8 text-[#1D4ED8]" />
          <p className="text-xs font-extrabold text-[#0F172A]">
            🌐 Topologi Lab Jaringan Cisco Siap!
          </p>
          <p className="mt-1 text-[11px] font-medium text-slate-700">
            Atur perintah Cisco IOS di kiri, lalu tekan{' '}
            <strong>Run Kode</strong> untuk menyalakan port router &amp; menguji
            paket ping.
          </p>
        </div>
      </div>
    );
  }

  const g0 = networkResult.interfaces['g0/0'];
  const g1 = networkResult.interfaces['g0/1'];

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Topologi Interaktif SVG */}
      <div className="border-b border-slate-200/80 bg-[#F4F7FC] p-3 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1D4ED8] px-2.5 py-0.5 text-[10px] font-extrabold text-white">
              <Activity className="h-3 w-3 text-[#C6F64D]" />
              Hostname: {networkResult.hostname}
            </span>
            {lastPing && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                  lastPing.success
                    ? 'bg-[#C6F64D] text-[#0F172A]'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                }`}
              >
                Ping {lastPing.targetIp}:{' '}
                {lastPing.success
                  ? `4/4 Berhasil (${lastPing.rttMs} ms)`
                  : '0/4 Gagal'}
              </span>
            )}
          </div>

          {lastPing && (
            <button
              type="button"
              onClick={() => setReplayTick((t) => t + 1)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-[#0F172A] hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Kirim Ping Ulang</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-2 dark:border-slate-800 dark:bg-[#0B1222]">
          <svg
            viewBox="0 0 560 175"
            className="mx-auto h-40 w-full min-w-[440px] max-w-[580px]"
          >
            {/* Link PC <-> Switch */}
            <line
              x1={65}
              y1={82}
              x2={195}
              y2={82}
              stroke="#22C55E"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx={98} cy={82} r="4.5" fill="#22C55E" />
            <circle cx={162} cy={82} r="4.5" fill="#22C55E" />

            {/* Link Switch <-> Router g0/0 */}
            <line
              x1={195}
              y1={82}
              x2={345}
              y2={82}
              stroke={networkResult.pcToRouterUp ? '#22C55E' : '#F43F5E'}
              strokeWidth="4"
              strokeDasharray={networkResult.pcToRouterUp ? undefined : '7 5'}
              strokeLinecap="round"
            />
            <circle
              cx={232}
              cy={82}
              r="5"
              fill={networkResult.pcToRouterUp ? '#22C55E' : '#F43F5E'}
            />
            <circle
              cx={304}
              cy={82}
              r="5"
              fill={networkResult.pcToRouterUp ? '#22C55E' : '#F43F5E'}
            />

            {/* Link Router g0/1 <-> Server */}
            <line
              x1={345}
              y1={82}
              x2={495}
              y2={82}
              stroke={networkResult.routerToServerUp ? '#22C55E' : '#F43F5E'}
              strokeWidth="4"
              strokeDasharray={networkResult.routerToServerUp ? undefined : '7 5'}
              strokeLinecap="round"
            />
            <circle
              cx={386}
              cy={82}
              r="5"
              fill={networkResult.routerToServerUp ? '#22C55E' : '#F43F5E'}
            />
            <circle
              cx={458}
              cy={82}
              r="5"
              fill={networkResult.routerToServerUp ? '#22C55E' : '#F43F5E'}
            />

            {/* Label Interface Router */}
            <text
              x="295"
              y="66"
              textAnchor="middle"
              className="fill-slate-600 text-[10px] font-bold dark:fill-slate-300"
            >
              g0/0
            </text>
            <text
              x="275"
              y="108"
              textAnchor="middle"
              className="fill-slate-500 text-[9px] font-mono dark:fill-slate-400"
            >
              {g0.ip ?? 'no ip'}
            </text>

            <text
              x="396"
              y="66"
              textAnchor="middle"
              className="fill-slate-600 text-[10px] font-bold dark:fill-slate-300"
            >
              g0/1
            </text>
            <text
              x="418"
              y="108"
              textAnchor="middle"
              className="fill-slate-500 text-[9px] font-mono dark:fill-slate-400"
            >
              {g1.ip ?? 'no ip'}
            </text>

            {/* Node 1: PC-Siswa */}
            <g transform="translate(35, 52)">
              <rect
                width="60"
                height="56"
                rx="14"
                fill="#EFF6FF"
                stroke="#1D4ED8"
                strokeWidth="2.5"
              />
              <foreignObject x="16" y="10" width="28" height="28">
                <Monitor className="h-6 w-6 text-[#1D4ED8]" />
              </foreignObject>
              <text
                x="30"
                y="49"
                textAnchor="middle"
                className="fill-[#0F172A] text-[9px] font-extrabold"
              >
                PC-Siswa
              </text>
            </g>
            <text
              x="65"
              y="126"
              textAnchor="middle"
              className="fill-slate-600 text-[10px] font-mono font-bold dark:fill-slate-300"
            >
              192.168.1.10
            </text>

            {/* Node 2: Switch SW1 */}
            <g transform="translate(168, 57)">
              <rect
                width="54"
                height="46"
                rx="12"
                fill="#EEFFC2"
                stroke="#65A30D"
                strokeWidth="2.5"
              />
              <text
                x="27"
                y="24"
                textAnchor="middle"
                className="fill-[#0F172A] text-[10px] font-extrabold"
              >
                SW1
              </text>
              <text
                x="27"
                y="37"
                textAnchor="middle"
                className="fill-slate-700 text-[8px] font-bold"
              >
                Switch L2
              </text>
            </g>

            {/* Node 3: Router */}
            <g transform="translate(314, 50)">
              <circle
                cx="31"
                cy="32"
                r="30"
                fill="#1D4ED8"
                stroke="#0F172A"
                strokeWidth="2.5"
              />
              <text
                x="31"
                y="30"
                textAnchor="middle"
                className="fill-white text-[10px] font-extrabold"
              >
                ROUTER
              </text>
              <text
                x="31"
                y="43"
                textAnchor="middle"
                className="fill-[#C6F64D] text-[9px] font-bold"
              >
                {networkResult.hostname.slice(0, 9)}
              </text>
            </g>

            {/* Node 4: Server Kodie */}
            <g transform="translate(465, 52)">
              <rect
                width="60"
                height="56"
                rx="14"
                fill="#0F172A"
                stroke="#3B82F6"
                strokeWidth="2.5"
              />
              <foreignObject x="16" y="10" width="28" height="28">
                <Server className="h-6 w-6 text-[#C6F64D]" />
              </foreignObject>
              <text
                x="30"
                y="49"
                textAnchor="middle"
                className="fill-white text-[9px] font-extrabold"
              >
                Server
              </text>
            </g>
            <text
              x="495"
              y="126"
              textAnchor="middle"
              className="fill-slate-600 text-[10px] font-mono font-bold dark:fill-slate-300"
            >
              10.0.0.10
            </text>

            {/* Paket ICMP Ping Animasi */}
            {packetPos && (
              <g transform={`translate(${packetPos.x}, ${packetPos.y})`}>
                <circle
                  r="10"
                  fill={lastPing?.success ? '#C6F64D' : '#FB7185'}
                  opacity="0.45"
                />
                <circle
                  r="6"
                  fill={lastPing?.success ? '#C6F64D' : '#F43F5E'}
                  stroke="#0F172A"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* CLI Terminal Cisco IOS */}
      <div className="flex min-h-0 flex-1 flex-col bg-[#0F172A] text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
            <Terminal className="h-3.5 w-3.5 text-[#C6F64D]" />
            Cisco IOS Console Output
          </span>
        </div>
        <pre className="min-h-0 flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed text-emerald-300">
          {networkResult.cliTranscript.join('\n') || 'Belum ada perintah IOS dijalankan.'}
        </pre>
      </div>
    </div>
  );
}
