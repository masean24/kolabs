import type {
  ExecutionResult,
  IotFrame,
  IotSensorState,
  IotSimResult,
} from '../types/lab';

export const DEFAULT_IOT_SENSORS: IotSensorState = {
  tempC: 27,
  lightPct: 65,
  buttonPressed: false,
};

/**
 * Mengubah sketch Arduino/ESP32 sederhana menjadi JavaScript aman tanpa menyentuh string literal.
 */
function transpileArduinoToJs(sketch: string): string {
  const stringLiterals: string[] = [];
  const masked = sketch.replace(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g, (match) => {
    const idx = stringLiterals.push(match) - 1;
    return `__KODIE_STR_${idx}__`;
  });

  const strippedComments = masked
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  const transformed = strippedComments
    .replace(/\bvoid\s+(setup|loop)\s*\(\s*\)/g, 'function $1()')
    .replace(/\bconst\s+(?:unsigned\s+long|int|long|float|double|bool|boolean|String)\s+/g, 'const ')
    .replace(/\b(?:unsigned\s+long|int|long|float|double|bool|boolean|String)\s+/g, 'let ');

  return transformed.replace(/__KODIE_STR_(\d+)__/g, (_, i) => stringLiterals[Number(i)]);
}

/**
 * Simulator Board ESP32/Arduino 100% client-side.
 * Mendukung LED_MERAH (13), LED_KUNING (12), LED_HIJAU (11), BUZZER (8),
 * TOMBOL (2), SENSOR_SUHU (A0), SENSOR_CAHAYA (A1), LCD 16x2, dan Serial Monitor.
 */
export function runIotCode(
  code: string,
  sensors: IotSensorState = DEFAULT_IOT_SENSORS
): ExecutionResult {
  const start = performance.now();

  if (!/\bvoid\s+setup\s*\(/.test(code) && !/\bvoid\s+loop\s*\(/.test(code)) {
    const err = 'Fungsi void setup() dan void loop() tidak ditemukan di sketch.ino.';
    return {
      track: 'iot',
      ok: false,
      stdout: '',
      stderr: err,
      consoleLogs: [
        { id: `iot-err-${Date.now()}`, level: 'error', text: err, timestamp: Date.now() },
      ],
      exitCode: 1,
      durationMs: Math.round(performance.now() - start),
      errorRaw: err,
    };
  }

  try {
    const jsBody = transpileArduinoToJs(code);

    const pinModes: Record<number, 'INPUT' | 'OUTPUT'> = {};
    const pinValues: Record<number, number> = {
      13: 0,
      12: 0,
      11: 0,
      8: 0,
    };
    let lcd: [string, string] = ['Kodie ESP32 Siap', 'Menunggu data...'];
    let timeMs = 0;
    const serialLog: string[] = [];
    let pendingSerial: string[] = [];
    const frames: IotFrame[] = [];
    let opCount = 0;

    const pushFrame = () => {
      if (frames.length >= 45) return;
      frames.push({
        timeMs,
        leds: {
          red: Boolean(pinValues[13]),
          yellow: Boolean(pinValues[12]),
          green: Boolean(pinValues[11]),
        },
        buzzer: Boolean(pinValues[8]),
        lcd: [lcd[0], lcd[1]],
        serialLines: [...pendingSerial],
      });
      pendingSerial = [];
    };

    const guard = () => {
      opCount += 1;
      if (opCount > 2500) {
        throw new Error('Operasi terlalu banyak (periksa apakah ada loop tak terbatas).');
      }
    };

    const api = {
      HIGH: 1,
      LOW: 0,
      OUTPUT: 1,
      INPUT: 0,
      LED_MERAH: 13,
      LED_KUNING: 12,
      LED_HIJAU: 11,
      BUZZER: 8,
      TOMBOL: 2,
      A0: 0,
      A1: 1,
      SENSOR_SUHU: 0,
      SENSOR_CAHAYA: 1,
      pinMode: (pin: number, mode: number) => {
        guard();
        pinModes[pin] = mode === 1 ? 'OUTPUT' : 'INPUT';
      },
      digitalWrite: (pin: number, val: number) => {
        guard();
        pinValues[pin] = val ? 1 : 0;
      },
      digitalRead: (pin: number): number => {
        guard();
        if (pin === 2) return sensors.buttonPressed ? 1 : 0;
        return pinValues[pin] ?? 0;
      },
      analogRead: (pin: number): number => {
        guard();
        if (pin === 0) return Math.round(sensors.tempC);
        if (pin === 1) return Math.round(sensors.lightPct);
        return 0;
      },
      delay: (ms: number) => {
        guard();
        const clamped = Math.max(50, Math.min(3000, Number(ms) || 100));
        pushFrame();
        timeMs += clamped;
      },
      lcdPrint: (line1: unknown, line2: unknown = '') => {
        guard();
        lcd = [String(line1 ?? '').slice(0, 18), String(line2 ?? '').slice(0, 18)];
      },
      Serial: {
        begin: () => {},
        print: (val: unknown) => {
          guard();
          const line = String(val ?? '');
          serialLog.push(line);
          pendingSerial.push(line);
        },
        println: (val: unknown = '') => {
          guard();
          const line = String(val ?? '');
          serialLog.push(line);
          pendingSerial.push(line);
        },
      },
      Math,
    };

    const argNames = Object.keys(api);
    const argValues = Object.values(api);

    const wrappedSource = `
      "use strict";
      ${jsBody}
      if (typeof setup === "function") { setup(); }
      const __firstCount = __getFrameCount();
      if (typeof loop === "function") {
        loop();
        if (__getFrameCount() === __firstCount || __hasPendingState()) {
          __pushFrame();
        }
      }
      if (__getFrameCount() === 0) {
        __pushFrame();
      }
    `;

    const runner = new Function(
      ...argNames,
      '__getFrameCount',
      '__hasPendingState',
      '__pushFrame',
      wrappedSource
    );

    runner(
      ...argValues,
      () => frames.length,
      () => pendingSerial.length > 0 || true,
      pushFrame
    );

    // Pastikan tidak ada frame duplikat kosong berturut-turut di akhir tanpa perubahan
    const iotResult: IotSimResult = {
      frames,
      sensors,
      serialLog,
      pinModes,
    };

    const stdout = serialLog.join('\n');
    const durationMs = Math.max(1, Math.round(performance.now() - start));

    return {
      track: 'iot',
      ok: true,
      stdout,
      stderr: '',
      consoleLogs: stdout
        ? [{ id: `iot-ok-${Date.now()}`, level: 'log', text: stdout, timestamp: Date.now() }]
        : [],
      iotResult,
      exitCode: 0,
      durationMs,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      track: 'iot',
      ok: false,
      stdout: '',
      stderr: msg,
      consoleLogs: [
        { id: `iot-err-${Date.now()}`, level: 'error', text: msg, timestamp: Date.now() },
      ],
      exitCode: 1,
      durationMs: Math.round(performance.now() - start),
      errorRaw: msg,
    };
  }
}
