import { useEffect, useState } from 'react';
import {
  Cpu,
  Pause,
  Play,
  RotateCcw,
  Sun,
  Terminal,
  Thermometer,
  Volume2,
} from 'lucide-react';
import type { IotSensorState, IotSimResult } from '../../types/lab';

interface IotSimulatorPaneProps {
  iotResult: IotSimResult | undefined;
  sensors: IotSensorState;
  runSignal: number;
  onChangeSensors: (next: IotSensorState) => void;
}

export function IotSimulatorPane({
  iotResult,
  sensors,
  runSignal,
  onChangeSensors,
}: IotSimulatorPaneProps) {
  const frames = iotResult?.frames ?? [];
  const [frameIdx, setFrameIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [replayTick, setReplayTick] = useState(0);

  useEffect(() => {
    if (frames.length === 0) return;
    setFrameIdx(0);
    setPaused(false);
  }, [runSignal, replayTick, frames.length]);

  useEffect(() => {
    if (paused || frames.length <= 1 || frameIdx >= frames.length - 1) return;

    const currentTime = frames[frameIdx]?.timeMs ?? 0;
    const nextTime = frames[frameIdx + 1]?.timeMs ?? currentTime + 500;
    const waitMs = Math.max(180, Math.min(1800, nextTime - currentTime));

    const timer = window.setTimeout(() => {
      setFrameIdx((idx) => Math.min(frames.length - 1, idx + 1));
    }, waitMs);

    return () => window.clearTimeout(timer);
  }, [frameIdx, paused, frames]);

  const currentFrame = frames[frameIdx] ?? {
    timeMs: 0,
    leds: { red: false, yellow: false, green: false },
    buzzer: false,
    lcd: ['Kodie ESP32', 'Tekan Run Kode'],
    serialLines: [],
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto">
      {/* Board Virtual Kodie-ESP32 */}
      <div className="border-b border-slate-200/80 bg-[#F4F7FC] p-3 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEFFC2] px-3 py-0.5 text-[11px] font-extrabold text-[#0F172A] ring-1 ring-lime-300">
            <Cpu className="h-3.5 w-3.5" />
            Board ESP32 Virtual ({frames.length > 0 ? `Langkah ${frameIdx + 1}/${frames.length}` : 'Standby'})
          </span>

          {frames.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-[#0F172A] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {paused ? (
                  <>
                    <Play className="h-3 w-3" />
                    <span>Lanjut</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-3 w-3" />
                    <span>Jeda</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setReplayTick((t) => t + 1)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-[#0F172A] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Ulang</span>
              </button>
            </div>
          )}
        </div>

        {/* PCB Visual */}
        <div className="rounded-2xl border-2 border-[#1D4ED8]/40 bg-[#0F172A] p-4 text-white shadow-md">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* 3 LED + Buzzer */}
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <div className="flex items-center justify-around gap-2">
                {[
                  {
                    label: 'MERAH',
                    pin: 'D13',
                    on: currentFrame.leds.red,
                    onClass: 'bg-rose-500 shadow-[0_0_20px_#F43F5E] border-rose-300',
                    offClass: 'bg-rose-950 border-rose-900/70',
                  },
                  {
                    label: 'KUNING',
                    pin: 'D12',
                    on: currentFrame.leds.yellow,
                    onClass: 'bg-amber-400 shadow-[0_0_20px_#FACC15] border-amber-200',
                    offClass: 'bg-amber-950 border-amber-900/70',
                  },
                  {
                    label: 'HIJAU',
                    pin: 'D11',
                    on: currentFrame.leds.green,
                    onClass: 'bg-[#C6F64D] shadow-[0_0_20px_#C6F64D] border-lime-200',
                    offClass: 'bg-emerald-950 border-emerald-900/70',
                  },
                ].map((led) => (
                  <div key={led.pin} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`h-8 w-8 rounded-full border-2 transition-all duration-200 ${
                        led.on ? led.onClass : led.offClass
                      }`}
                    />
                    <span className="font-mono text-[10px] font-bold text-slate-300">
                      {led.label}
                    </span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
                      {led.pin}
                    </span>
                  </div>
                ))}
              </div>

              {/* Indikator Buzzer */}
              <div
                className={`flex items-center justify-between rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  currentFrame.buzzer
                    ? 'border-[#C6F64D] bg-[#C6F64D]/15 text-[#C6F64D]'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Volume2
                    className={`h-4 w-4 ${currentFrame.buzzer ? 'animate-bounce' : ''}`}
                  />
                  Buzzer (PIN 8)
                </span>
                <span className="font-mono text-[11px]">
                  {currentFrame.buzzer ? 'BEEP! ON' : 'OFF'}
                </span>
              </div>
            </div>

            {/* Layar LCD 16x2 */}
            <div className="flex flex-col justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>LCD 16×2 I2C</span>
                <span className="font-mono text-sky-400">0x27</span>
              </div>
              <div className="rounded-xl border-4 border-slate-700 bg-[#172554] px-3 py-3 font-mono text-sm font-bold tracking-wide text-[#C6F64D] shadow-inner">
                <div className="truncate">{currentFrame.lcd[0] || '\u00A0'}</div>
                <div className="mt-1 truncate text-[#D7FF73]/90">
                  {currentFrame.lcd[1] || '\u00A0'}
                </div>
              </div>
              <div className="text-[10px] text-slate-400">
                Ubah slider sensor di bawah untuk memicu reaksi real-time!
              </div>
            </div>
          </div>
        </div>

        {/* Panel Sensor Interaktif */}
        <div className="mt-2.5 grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-3 dark:border-slate-800 dark:bg-[#0B1222]">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-[#0F172A] dark:text-slate-200">
              <span className="inline-flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5 text-rose-500" />
                Suhu (A0)
              </span>
              <span className="font-mono text-[#1D4ED8] dark:text-[#C6F64D]">
                {sensors.tempC}°C
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={45}
              value={sensors.tempC}
              onChange={(e) =>
                onChangeSensors({ ...sensors, tempC: Number(e.target.value) })
              }
              aria-label="Slider Sensor Suhu"
              className="mt-1.5 w-full accent-[#1D4ED8]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-[#0F172A] dark:text-slate-200">
              <span className="inline-flex items-center gap-1">
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                Cahaya (A1)
              </span>
              <span className="font-mono text-[#1D4ED8] dark:text-[#C6F64D]">
                {sensors.lightPct}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={sensors.lightPct}
              onChange={(e) =>
                onChangeSensors({ ...sensors, lightPct: Number(e.target.value) })
              }
              aria-label="Slider Sensor Cahaya"
              className="mt-1.5 w-full accent-[#1D4ED8]"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end">
            <button
              type="button"
              onClick={() =>
                onChangeSensors({
                  ...sensors,
                  buttonPressed: !sensors.buttonPressed,
                })
              }
              className={`w-full rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
                sensors.buttonPressed
                  ? 'border-[#0F172A] bg-[#C6F64D] text-[#0F172A]'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              🔘 Tombol D2: {sensors.buttonPressed ? 'DITEKAN' : 'LEPAS'}
            </button>
          </div>
        </div>
      </div>

      {/* Serial Monitor */}
      <div className="flex min-h-[140px] flex-1 flex-col bg-[#0F172A] text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
            <Terminal className="h-3.5 w-3.5 text-[#C6F64D]" />
            Serial Monitor (9600 baud)
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-3 font-mono text-xs text-emerald-300">
          {iotResult && iotResult.serialLog.length > 0 ? (
            <pre className="whitespace-pre-wrap">{iotResult.serialLog.join('\n')}</pre>
          ) : (
            <p className="italic text-slate-500">
              Output dari Serial.println() akan tampil di sini...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
