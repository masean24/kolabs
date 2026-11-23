import type * as BlocklyType from 'blockly';
import type { ConsoleEntry, ExecutionResult, TurtleCommand } from '../types/lab';

export interface BlockNodeJson {
  type: string;
  id?: string;
  fields?: Record<string, string | number>;
  inputs?: Record<string, { block?: BlockNodeJson; shadow?: BlockNodeJson }>;
  next?: { block?: BlockNodeJson };
}

export interface BlockWorkspaceJson {
  blocks?: {
    languageVersion?: number;
    blocks?: BlockNodeJson[];
  };
}

const PEN_COLOR_OPTIONS: [string, string][] = [
  ['🔵 Biru Kodie', '#1D4ED8'],
  ['🟢 Hijau Lime', '#65A30D'],
  ['🔴 Merah', '#EF4444'],
  ['🟠 Oranye', '#F97316'],
  ['🟡 Kuning Emas', '#EAB308'],
  ['🟣 Ungu', '#8B5CF6'],
  ['🩷 Merah Muda', '#EC4899'],
  ['🩵 Biru Langit', '#06B6D4'],
  ['⚫ Hitam', '#0F172A'],
];

const COMPARE_OPS: [string, string][] = [
  ['=', '=='],
  ['≠', '!='],
  ['>', '>'],
  ['<', '<'],
  ['≥', '>='],
  ['≤', '<='],
];

let blocksRegistered = false;

/**
 * Mendaftarkan blok visual Kiko ramah siswa SD ke instansi Blockly.
 * Aman dipanggil berkali-kali (idempotent).
 */
export function registerKodieBlocks(Blockly: typeof BlocklyType): void {
  if (blocksRegistered) return;
  blocksRegistered = true;

  Blockly.Blocks['kiko_start'] = {
    init() {
      this.appendDummyInput().appendField('🚀 Saat tombol Jalankan ditekan');
      this.setNextStatement(true, null);
      this.setColour('#1D4ED8');
      this.setTooltip('Titik mulai program Kiko!');
    },
  };

  Blockly.Blocks['kiko_forward'] = {
    init() {
      this.appendDummyInput()
        .appendField('➡️ Maju')
        .appendField(new Blockly.FieldNumber(100, -500, 500, 1), 'DIST')
        .appendField('langkah');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2563EB');
      this.setTooltip('Menggerakkan Kiko maju sesuai arah hadapnya.');
    },
  };

  Blockly.Blocks['kiko_backward'] = {
    init() {
      this.appendDummyInput()
        .appendField('⬅️ Mundur')
        .appendField(new Blockly.FieldNumber(50, -500, 500, 1), 'DIST')
        .appendField('langkah');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2563EB');
      this.setTooltip('Menggerakkan Kiko mundur.');
    },
  };

  Blockly.Blocks['kiko_turn_right'] = {
    init() {
      this.appendDummyInput()
        .appendField('↪️ Belok kanan')
        .appendField(new Blockly.FieldNumber(90, 0, 360, 1), 'ANGLE')
        .appendField('derajat');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0284C7');
      this.setTooltip('Memutar arah Kiko ke kanan.');
    },
  };

  Blockly.Blocks['kiko_turn_left'] = {
    init() {
      this.appendDummyInput()
        .appendField('↩️ Belok kiri')
        .appendField(new Blockly.FieldNumber(90, 0, 360, 1), 'ANGLE')
        .appendField('derajat');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0284C7');
      this.setTooltip('Memutar arah Kiko ke kiri.');
    },
  };

  Blockly.Blocks['kiko_circle'] = {
    init() {
      this.appendDummyInput()
        .appendField('⭕ Gambar lingkaran jari-jari')
        .appendField(new Blockly.FieldNumber(45, 5, 220, 1), 'RADIUS');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2563EB');
      this.setTooltip('Menggambar lingkaran dari posisi Kiko saat ini.');
    },
  };

  Blockly.Blocks['kiko_home'] = {
    init() {
      this.appendDummyInput().appendField('🏠 Kembali ke tengah kanvas');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0284C7');
      this.setTooltip('Memindahkan Kiko ke titik awal (0, 0).');
    },
  };

  Blockly.Blocks['kiko_pen_color'] = {
    init() {
      this.appendDummyInput()
        .appendField('🎨 Warna pena')
        .appendField(new Blockly.FieldDropdown(PEN_COLOR_OPTIONS), 'COLOR');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#7C3AED');
      this.setTooltip('Mengganti warna garis gambar Kiko.');
    },
  };

  Blockly.Blocks['kiko_pen_size'] = {
    init() {
      this.appendDummyInput()
        .appendField('✏️ Tebal pena')
        .appendField(new Blockly.FieldNumber(3, 1, 20, 1), 'SIZE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#7C3AED');
      this.setTooltip('Mengatur ketebalan garis.');
    },
  };

  Blockly.Blocks['kiko_pen_up'] = {
    init() {
      this.appendDummyInput().appendField('🕊️ Angkat pena (pindah tanpa garis)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#7C3AED');
      this.setTooltip('Kiko berpindah tanpa meninggalkan jejak garis.');
    },
  };

  Blockly.Blocks['kiko_pen_down'] = {
    init() {
      this.appendDummyInput().appendField('🖊️ Turunkan pena (mulai menggambar)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#7C3AED');
      this.setTooltip('Kiko mulai menggambar garis lagi.');
    },
  };

  Blockly.Blocks['kiko_begin_fill'] = {
    init() {
      this.appendDummyInput()
        .appendField('🪣 Mulai isi warna')
        .appendField(new Blockly.FieldDropdown(PEN_COLOR_OPTIONS), 'COLOR');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9333EA');
      this.setTooltip('Menandai awal bentuk yang akan diisi warna.');
    },
  };

  Blockly.Blocks['kiko_end_fill'] = {
    init() {
      this.appendDummyInput().appendField('✨ Selesai isi warna');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9333EA');
      this.setTooltip('Menutup dan mewarnai bagian dalam bentuk.');
    },
  };

  Blockly.Blocks['kiko_say'] = {
    init() {
      this.appendDummyInput()
        .appendField('💬 Kiko bicara')
        .appendField(new Blockly.FieldTextInput('Halo Kodie!'), 'TEXT');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0D9488');
      this.setTooltip('Menampilkan pesan Kiko di panel konsol.');
    },
  };

  Blockly.Blocks['kiko_repeat'] = {
    init() {
      this.appendDummyInput()
        .appendField('🔁 Ulangi')
        .appendField(new Blockly.FieldNumber(4, 1, 100, 1), 'TIMES')
        .appendField('kali');
      this.appendStatementInput('DO').appendField('lakukan');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#D97706');
      this.setTooltip('Mengulang blok di dalamnya beberapa kali.');
    },
  };

  Blockly.Blocks['kiko_set_var'] = {
    init() {
      this.appendDummyInput()
        .appendField('📦 Atur')
        .appendField(new Blockly.FieldTextInput('skor'), 'VAR')
        .appendField('=')
        .appendField(new Blockly.FieldNumber(10, -9999, 9999, 1), 'VAL');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#E11D48');
      this.setTooltip('Menyimpan angka ke dalam kotak memori (variabel).');
    },
  };

  Blockly.Blocks['kiko_change_var'] = {
    init() {
      this.appendDummyInput()
        .appendField('➕ Ubah')
        .appendField(new Blockly.FieldTextInput('skor'), 'VAR')
        .appendField('sebesar')
        .appendField(new Blockly.FieldNumber(1, -9999, 9999, 1), 'DELTA');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#E11D48');
      this.setTooltip('Menambah atau mengurangi nilai variabel.');
    },
  };

  Blockly.Blocks['kiko_if_else'] = {
    init() {
      this.appendDummyInput()
        .appendField('🤔 Jika')
        .appendField(new Blockly.FieldTextInput('skor'), 'VAR')
        .appendField(new Blockly.FieldDropdown(COMPARE_OPS), 'OP')
        .appendField(new Blockly.FieldNumber(10, -9999, 9999, 1), 'VAL')
        .appendField('maka');
      this.appendStatementInput('THEN').appendField('lakukan');
      this.appendStatementInput('ELSE').appendField('selainnya');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#D97706');
      this.setTooltip('Mengambil keputusan berdasarkan isi variabel.');
    },
  };
}

export const KODIE_BLOCKLY_TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '🚀 Mulai',
      colour: '#1D4ED8',
      contents: [{ kind: 'block', type: 'kiko_start' }],
    },
    {
      kind: 'category',
      name: '🐢 Gerak',
      colour: '#2563EB',
      contents: [
        { kind: 'block', type: 'kiko_forward', fields: { DIST: 100 } },
        { kind: 'block', type: 'kiko_backward', fields: { DIST: 50 } },
        { kind: 'block', type: 'kiko_turn_right', fields: { ANGLE: 90 } },
        { kind: 'block', type: 'kiko_turn_left', fields: { ANGLE: 90 } },
        { kind: 'block', type: 'kiko_circle', fields: { RADIUS: 45 } },
        { kind: 'block', type: 'kiko_home' },
      ],
    },
    {
      kind: 'category',
      name: '🎨 Pena & Pesan',
      colour: '#7C3AED',
      contents: [
        { kind: 'block', type: 'kiko_pen_color' },
        { kind: 'block', type: 'kiko_pen_size', fields: { SIZE: 3 } },
        { kind: 'block', type: 'kiko_pen_up' },
        { kind: 'block', type: 'kiko_pen_down' },
        { kind: 'block', type: 'kiko_begin_fill' },
        { kind: 'block', type: 'kiko_end_fill' },
        { kind: 'block', type: 'kiko_say', fields: { TEXT: 'Hebat!' } },
      ],
    },
    {
      kind: 'category',
      name: '🔁 Kontrol',
      colour: '#D97706',
      contents: [
        { kind: 'block', type: 'kiko_repeat', fields: { TIMES: 4 } },
        { kind: 'block', type: 'kiko_if_else' },
      ],
    },
    {
      kind: 'category',
      name: '📦 Variabel',
      colour: '#E11D48',
      contents: [
        { kind: 'block', type: 'kiko_set_var' },
        { kind: 'block', type: 'kiko_change_var' },
      ],
    },
  ],
};

function parseWorkspaceJson(raw: string): BlockWorkspaceJson {
  if (!raw || !raw.trim()) return {};
  try {
    return JSON.parse(raw) as BlockWorkspaceJson;
  } catch {
    return {};
  }
}

function getTopChains(ws: BlockWorkspaceJson): {
  chains: BlockNodeJson[];
  hasStartBlock: boolean;
} {
  const topBlocks = ws.blocks?.blocks ?? [];
  const startBlocks = topBlocks.filter((b) => b.type === 'kiko_start');
  if (startBlocks.length > 0) {
    return { chains: startBlocks, hasStartBlock: true };
  }
  return { chains: topBlocks, hasStartBlock: false };
}

function sanitizePyIdent(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9_]/g, '_');
  if (!cleaned || /^\d/.test(cleaned)) return `var_${cleaned || 'x'}`;
  return cleaned;
}

/**
 * Mengonversi susunan blok menjadi kode Python Turtle yang bersih
 * untuk fitur edukatif "Intip Kode Python" di jenjang SD.
 */
export function compileBlocksToPython(workspaceJsonStr: string): string {
  const ws = parseWorkspaceJson(workspaceJsonStr);
  const { chains } = getTopChains(ws);

  const lines: string[] = [
    '# Kode Python hasil terjemahan otomatis dari blok Kiko!',
    'import turtle',
    '',
    'kiko = turtle.Turtle()',
    'kiko.pensize(3)',
    '',
  ];

  function emitChain(node: BlockNodeJson | undefined, indent: string, depth = 0): void {
    let curr = node;
    let guard = 0;
    while (curr && guard < 200) {
      guard += 1;
      const f = curr.fields ?? {};
      switch (curr.type) {
        case 'kiko_start':
          lines.push(`${indent}# Mulai program`);
          break;
        case 'kiko_forward':
          lines.push(`${indent}kiko.forward(${Number(f.DIST ?? 100)})`);
          break;
        case 'kiko_backward':
          lines.push(`${indent}kiko.backward(${Number(f.DIST ?? 50)})`);
          break;
        case 'kiko_turn_right':
          lines.push(`${indent}kiko.right(${Number(f.ANGLE ?? 90)})`);
          break;
        case 'kiko_turn_left':
          lines.push(`${indent}kiko.left(${Number(f.ANGLE ?? 90)})`);
          break;
        case 'kiko_circle':
          lines.push(`${indent}kiko.circle(${Number(f.RADIUS ?? 45)})`);
          break;
        case 'kiko_home':
          lines.push(`${indent}kiko.home()`);
          break;
        case 'kiko_pen_color':
          lines.push(`${indent}kiko.pencolor(${JSON.stringify(String(f.COLOR ?? '#1D4ED8'))})`);
          break;
        case 'kiko_pen_size':
          lines.push(`${indent}kiko.pensize(${Number(f.SIZE ?? 3)})`);
          break;
        case 'kiko_pen_up':
          lines.push(`${indent}kiko.penup()`);
          break;
        case 'kiko_pen_down':
          lines.push(`${indent}kiko.pendown()`);
          break;
        case 'kiko_begin_fill':
          lines.push(`${indent}kiko.fillcolor(${JSON.stringify(String(f.COLOR ?? '#C6F64D'))})`);
          lines.push(`${indent}kiko.begin_fill()`);
          break;
        case 'kiko_end_fill':
          lines.push(`${indent}kiko.end_fill()`);
          break;
        case 'kiko_say':
          lines.push(`${indent}print(${JSON.stringify(String(f.TEXT ?? 'Halo!'))})`);
          break;
        case 'kiko_set_var': {
          const v = sanitizePyIdent(String(f.VAR ?? 'skor'));
          lines.push(`${indent}${v} = ${Number(f.VAL ?? 0)}`);
          break;
        }
        case 'kiko_change_var': {
          const v = sanitizePyIdent(String(f.VAR ?? 'skor'));
          lines.push(`${indent}${v} = ${v} + ${Number(f.DELTA ?? 1)}`);
          break;
        }
        case 'kiko_repeat': {
          const times = Math.max(1, Math.min(100, Number(f.TIMES ?? 4)));
          const loopVar = depth === 0 ? 'i' : `j${depth}`;
          lines.push(`${indent}for ${loopVar} in range(${times}):`);
          const inner = curr.inputs?.DO?.block;
          if (inner) {
            emitChain(inner, `${indent}    `, depth + 1);
          } else {
            lines.push(`${indent}    pass`);
          }
          break;
        }
        case 'kiko_if_else': {
          const v = sanitizePyIdent(String(f.VAR ?? 'skor'));
          const op = String(f.OP ?? '==');
          const val = Number(f.VAL ?? 10);
          lines.push(`${indent}if ${v} ${op} ${val}:`);
          const thenBlock = curr.inputs?.THEN?.block;
          if (thenBlock) {
            emitChain(thenBlock, `${indent}    `, depth + 1);
          } else {
            lines.push(`${indent}    pass`);
          }
          const elseBlock = curr.inputs?.ELSE?.block;
          if (elseBlock) {
            lines.push(`${indent}else:`);
            emitChain(elseBlock, `${indent}    `, depth + 1);
          }
          break;
        }
      }
      curr = curr.next?.block;
    }
  }

  if (chains.length === 0) {
    lines.push('# Kanvas blok masih kosong. Tarik blok dari sebelah kiri!');
  } else {
    chains.forEach((chain) => emitChain(chain, ''));
  }

  return lines.join('\n');
}

/**
 * Mengeksekusi workspace Blockly secara instan (< 5ms) tanpa CDN/WASM,
 * menghasilkan perintah gambar `TurtleCommand[]`, log konsol, dan Python preview.
 */
export function runBlocks(workspaceJsonStr: string): ExecutionResult {
  const start = performance.now();
  const generatedPython = compileBlocksToPython(workspaceJsonStr);
  const ws = parseWorkspaceJson(workspaceJsonStr);
  const topBlocks = ws.blocks?.blocks ?? [];

  if (topBlocks.length === 0) {
    const err = 'Kanvas blok masih kosong! Tarik blok dari daftar di sebelah kiri.';
    return {
      track: 'blocks',
      ok: false,
      stdout: '',
      stderr: err,
      consoleLogs: [
        { id: `blk-empty-${Date.now()}`, level: 'error', text: err, timestamp: Date.now() },
      ],
      turtleCommands: [],
      generatedPython,
      exitCode: 1,
      durationMs: Math.round(performance.now() - start),
      errorRaw: err,
    };
  }

  const { chains, hasStartBlock } = getTopChains(ws);
  if (!hasStartBlock) {
    const err =
      'Belum ada blok "Saat tombol Jalankan ditekan". Pasang blok mulai di paling atas susunanmu!';
    return {
      track: 'blocks',
      ok: false,
      stdout: '',
      stderr: err,
      consoleLogs: [
        { id: `blk-nostart-${Date.now()}`, level: 'error', text: err, timestamp: Date.now() },
      ],
      turtleCommands: [],
      generatedPython,
      exitCode: 1,
      durationMs: Math.round(performance.now() - start),
      errorRaw: err,
    };
  }

  const commands: TurtleCommand[] = [{ type: 'pensize', size: 3 }];
  const logs: ConsoleEntry[] = [];
  const stdoutLines: string[] = [];
  const vars = new Map<string, number>();
  let steps = 0;
  const MAX_STEPS = 2000;

  function evalCompare(lhs: number, op: string, rhs: number): boolean {
    switch (op) {
      case '==':
        return lhs === rhs;
      case '!=':
        return lhs !== rhs;
      case '>':
        return lhs > rhs;
      case '<':
        return lhs < rhs;
      case '>=':
        return lhs >= rhs;
      case '<=':
        return lhs <= rhs;
      default:
        return false;
    }
  }

  function execChain(node: BlockNodeJson | undefined): void {
    let curr = node;
    while (curr) {
      steps += 1;
      if (steps > MAX_STEPS) {
        throw new Error('Perulangan terlalu banyak (maksimal 2000 langkah).');
      }

      const f = curr.fields ?? {};
      switch (curr.type) {
        case 'kiko_start':
          break;
        case 'kiko_forward':
          commands.push({ type: 'move', distance: Number(f.DIST ?? 100) });
          break;
        case 'kiko_backward':
          commands.push({ type: 'move', distance: -Number(f.DIST ?? 50) });
          break;
        case 'kiko_turn_right':
          commands.push({ type: 'turn', angle: -Number(f.ANGLE ?? 90) });
          break;
        case 'kiko_turn_left':
          commands.push({ type: 'turn', angle: Number(f.ANGLE ?? 90) });
          break;
        case 'kiko_circle':
          commands.push({ type: 'circle', radius: Number(f.RADIUS ?? 45), extent: 360 });
          break;
        case 'kiko_home':
          commands.push({ type: 'goto', x: 0, y: 0 });
          commands.push({ type: 'setheading', angle: 0 });
          break;
        case 'kiko_pen_color':
          commands.push({ type: 'color', penColor: String(f.COLOR ?? '#1D4ED8') });
          break;
        case 'kiko_pen_size':
          commands.push({ type: 'pensize', size: Number(f.SIZE ?? 3) });
          break;
        case 'kiko_pen_up':
          commands.push({ type: 'pen', down: false });
          break;
        case 'kiko_pen_down':
          commands.push({ type: 'pen', down: true });
          break;
        case 'kiko_begin_fill':
          commands.push({ type: 'fillcolor', fillColor: String(f.COLOR ?? '#C6F64D') });
          commands.push({ type: 'begin_fill' });
          break;
        case 'kiko_end_fill':
          commands.push({ type: 'end_fill' });
          break;
        case 'kiko_say': {
          const text = String(f.TEXT ?? 'Halo!');
          stdoutLines.push(text);
          logs.push({
            id: `blk-say-${steps}-${Date.now()}`,
            level: 'info',
            text: `Kiko berkata: "${text}"`,
            timestamp: Date.now(),
          });
          break;
        }
        case 'kiko_set_var': {
          const key = String(f.VAR ?? 'skor').trim() || 'skor';
          vars.set(key, Number(f.VAL ?? 0));
          break;
        }
        case 'kiko_change_var': {
          const key = String(f.VAR ?? 'skor').trim() || 'skor';
          vars.set(key, (vars.get(key) ?? 0) + Number(f.DELTA ?? 1));
          break;
        }
        case 'kiko_repeat': {
          const times = Math.max(0, Math.min(100, Math.floor(Number(f.TIMES ?? 4))));
          const body = curr.inputs?.DO?.block;
          for (let i = 0; i < times; i += 1) {
            execChain(body);
          }
          break;
        }
        case 'kiko_if_else': {
          const key = String(f.VAR ?? 'skor').trim() || 'skor';
          const lhs = vars.get(key) ?? 0;
          const op = String(f.OP ?? '==');
          const rhs = Number(f.VAL ?? 10);
          if (evalCompare(lhs, op, rhs)) {
            execChain(curr.inputs?.THEN?.block);
          } else {
            execChain(curr.inputs?.ELSE?.block);
          }
          break;
        }
      }

      curr = curr.next?.block;
    }
  }

  try {
    chains.forEach((chain) => execChain(chain));
    return {
      track: 'blocks',
      ok: true,
      stdout: stdoutLines.join('\n'),
      stderr: '',
      consoleLogs: logs,
      turtleCommands: commands,
      generatedPython,
      exitCode: 0,
      durationMs: Math.max(1, Math.round(performance.now() - start)),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      track: 'blocks',
      ok: false,
      stdout: stdoutLines.join('\n'),
      stderr: msg,
      consoleLogs: [
        ...logs,
        { id: `blk-err-${Date.now()}`, level: 'error', text: msg, timestamp: Date.now() },
      ],
      turtleCommands: commands,
      generatedPython,
      exitCode: 1,
      durationMs: Math.round(performance.now() - start),
      errorRaw: msg,
    };
  }
}
