import type {
  ConsoleEntry,
  ExecutionResult,
  NetworkInterfaceState,
  NetworkPingResult,
  NetworkSimResult,
} from '../types/lab';

type IosMode = 'user' | 'priv' | 'config' | 'config-if';

const PC_IP = '192.168.1.10';
const PC_MASK = '255.255.255.0';
const SERVER_IP = '10.0.0.10';

function parseIpv4(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let num = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const oct = Number(p);
    if (oct < 0 || oct > 255) return null;
    num = (num << 8) | oct;
  }
  return num >>> 0;
}

function isValidSubnetMask(mask: string): boolean {
  const m = parseIpv4(mask);
  if (m === null || m === 0) return false;
  const inv = (~m) >>> 0;
  return ((inv + 1) & inv) === 0;
}

function sameSubnet(ipA: string, ipB: string, maskStr: string): boolean {
  const a = parseIpv4(ipA);
  const b = parseIpv4(ipB);
  const m = parseIpv4(maskStr);
  if (a === null || b === null || m === null) return false;
  return (a & m) === (b & m);
}

function normalizeInterface(token: string): 'g0/0' | 'g0/1' | null {
  const low = token.toLowerCase().trim();
  if (low === 'g0/0' || low === 'gi0/0' || low === 'gig0/0' || low === 'gigabitethernet0/0') {
    return 'g0/0';
  }
  if (low === 'g0/1' || low === 'gi0/1' || low === 'gig0/1' || low === 'gigabitethernet0/1') {
    return 'g0/1';
  }
  return null;
}

function formatPrompt(hostname: string, mode: IosMode): string {
  switch (mode) {
    case 'user':
      return `${hostname}>`;
    case 'priv':
      return `${hostname}#`;
    case 'config':
      return `${hostname}(config)#`;
    case 'config-if':
      return `${hostname}(config-if)#`;
  }
}

/**
 * Simulator Cisco IOS CLI + Topologi Jaringan 100% client-side.
 * Topologi: PC-Siswa (192.168.1.10) <-> SW1 <-> Router [g0/0 | g0/1] <-> Server-Kodie (10.0.0.10)
 */
export function runNetworkCode(code: string): ExecutionResult {
  const start = performance.now();
  const lines = code.split(/\r?\n/);

  let hostname = 'Router';
  let mode: IosMode = 'user';
  let activeIf: 'g0/0' | 'g0/1' | null = null;

  const interfaces: Record<'g0/0' | 'g0/1', NetworkInterfaceState> = {
    'g0/0': {
      name: 'GigabitEthernet0/0',
      shortName: 'g0/0',
      ip: null,
      mask: null,
      adminUp: false,
      linkUp: false,
    },
    'g0/1': {
      name: 'GigabitEthernet0/1',
      shortName: 'g0/1',
      ip: null,
      mask: null,
      adminUp: false,
      linkUp: false,
    },
  };

  const cliTranscript: string[] = [];
  const pings: NetworkPingResult[] = [];
  const warnings: string[] = [];
  let fatalError: string | null = null;

  const updateLinkStates = () => {
    const g0 = interfaces['g0/0'];
    const g1 = interfaces['g0/1'];
    g0.linkUp = Boolean(
      g0.adminUp && g0.ip && g0.mask && sameSubnet(g0.ip, PC_IP, g0.mask)
    );
    g1.linkUp = Boolean(
      g1.adminUp && g1.ip && g1.mask && sameSubnet(g1.ip, SERVER_IP, g1.mask)
    );
  };

  for (let idx = 0; idx < lines.length; idx += 1) {
    const rawLine = lines[idx].trim();
    if (!rawLine || rawLine.startsWith('!') || rawLine.startsWith('#')) {
      continue;
    }

    const promptBefore = formatPrompt(hostname, mode);
    cliTranscript.push(`${promptBefore} ${rawLine}`);

    const tokens = rawLine.split(/\s+/);
    const cmd = tokens[0].toLowerCase();
    const rest = tokens.slice(1).join(' ').toLowerCase();

    if (cmd === 'enable' || cmd === 'en') {
      if (mode === 'user') mode = 'priv';
      continue;
    }

    if (cmd === 'disable') {
      mode = 'user';
      activeIf = null;
      continue;
    }

    if (
      (cmd === 'configure' && (tokens[1]?.toLowerCase() === 'terminal' || tokens[1]?.toLowerCase() === 't')) ||
      cmd === 'conf'
    ) {
      if (mode === 'user') {
        fatalError = `Baris ${idx + 1}: Perintah "${rawLine}" membutuhkan mode privileged (ketik "enable" dulu).`;
        cliTranscript.push('% Invalid input: ketik enable terlebih dahulu.');
        break;
      }
      mode = 'config';
      activeIf = null;
      continue;
    }

    if (cmd === 'exit') {
      if (mode === 'config-if') {
        mode = 'config';
        activeIf = null;
      } else if (mode === 'config') {
        mode = 'priv';
      } else if (mode === 'priv') {
        mode = 'user';
      }
      continue;
    }

    if (cmd === 'end') {
      if (mode === 'config' || mode === 'config-if') {
        mode = 'priv';
        activeIf = null;
      }
      continue;
    }

    if (cmd === 'hostname') {
      if (mode !== 'config' && mode !== 'config-if') {
        fatalError = `Baris ${idx + 1}: "hostname" harus dijalankan di dalam global config (configure terminal).`;
        cliTranscript.push('% Belum masuk mode configure terminal.');
        break;
      }
      const nextHost = tokens[1]?.trim();
      if (!nextHost) {
        fatalError = `Baris ${idx + 1}: Nama hostname belum diisi (contoh: hostname R1-Kodie).`;
        break;
      }
      hostname = nextHost;
      continue;
    }

    if (cmd === 'interface' || cmd === 'int') {
      if (mode !== 'config' && mode !== 'config-if') {
        fatalError = `Baris ${idx + 1}: "interface" harus dijalankan setelah "configure terminal".`;
        cliTranscript.push('% Belum masuk mode configure terminal.');
        break;
      }
      const targetIf = normalizeInterface(tokens[1] ?? '');
      if (!targetIf) {
        fatalError = `Baris ${idx + 1}: Interface "${tokens[1] ?? ''}" tidak tersedia. Gunakan g0/0 atau g0/1.`;
        cliTranscript.push('% Invalid interface type and number.');
        break;
      }
      activeIf = targetIf;
      mode = 'config-if';
      continue;
    }

    if (cmd === 'ip' && (tokens[1]?.toLowerCase() === 'address' || tokens[1]?.toLowerCase() === 'add')) {
      if (mode !== 'config-if' || !activeIf) {
        fatalError = `Baris ${idx + 1}: "ip address" harus berada di dalam "interface g0/0" atau "interface g0/1".`;
        break;
      }
      const ip = tokens[2];
      const mask = tokens[3];
      if (!ip || !mask || parseIpv4(ip) === null || !isValidSubnetMask(mask)) {
        fatalError = `Baris ${idx + 1}: Format IP address atau subnet mask tidak valid (contoh: ip address 192.168.1.1 255.255.255.0).`;
        cliTranscript.push('% Bad IP address or subnet mask.');
        break;
      }
      interfaces[activeIf].ip = ip;
      interfaces[activeIf].mask = mask;
      updateLinkStates();
      continue;
    }

    if ((cmd === 'no' && (tokens[1]?.toLowerCase() === 'shutdown' || tokens[1]?.toLowerCase() === 'sh')) || rest === 'shutdown') {
      if (mode !== 'config-if' || !activeIf) {
        fatalError = `Baris ${idx + 1}: "no shutdown" hanya berlaku di dalam mode interface (config-if).`;
        break;
      }
      interfaces[activeIf].adminUp = true;
      updateLinkStates();
      cliTranscript.push(`%LINK-3-UPDOWN: Interface ${interfaces[activeIf].name}, changed state to up`);
      continue;
    }

    if (cmd === 'shutdown' || cmd === 'sh') {
      // Catatan: "sh ip int br" ditangani di bawah jika ada argumen tambahan
      if (tokens.length === 1) {
        if (mode !== 'config-if' || !activeIf) {
          fatalError = `Baris ${idx + 1}: "shutdown" harus di dalam mode interface.`;
          break;
        }
        interfaces[activeIf].adminUp = false;
        updateLinkStates();
        cliTranscript.push(`%LINK-5-CHANGED: Interface ${interfaces[activeIf].name}, changed state to administratively down`);
        continue;
      }
    }

    if ((cmd === 'show' || cmd === 'sh') && /ip\s+int/i.test(rest)) {
      updateLinkStates();
      cliTranscript.push(
        'Interface              IP-Address      OK? Method Status                Protocol'
      );
      (['g0/0', 'g0/1'] as const).forEach((k) => {
        const itf = interfaces[k];
        const ipCol = (itf.ip ?? 'unassigned').padEnd(15, ' ');
        const okCol = itf.ip ? 'YES' : 'NO ';
        const statusCol = (itf.adminUp ? 'up' : 'administratively down').padEnd(21, ' ');
        const protoCol = itf.adminUp ? 'up' : 'down';
        cliTranscript.push(
          `${itf.name.padEnd(22, ' ')} ${ipCol} ${okCol} manual ${statusCol} ${protoCol}`
        );
      });
      continue;
    }

    if ((cmd === 'show' || cmd === 'sh') && /run/i.test(rest)) {
      cliTranscript.push('Current configuration:');
      cliTranscript.push(`hostname ${hostname}`);
      (['g0/0', 'g0/1'] as const).forEach((k) => {
        const itf = interfaces[k];
        cliTranscript.push(`interface ${itf.name}`);
        if (itf.ip && itf.mask) {
          cliTranscript.push(` ip address ${itf.ip} ${itf.mask}`);
        } else {
          cliTranscript.push(' no ip address');
        }
        cliTranscript.push(itf.adminUp ? ' no shutdown' : ' shutdown');
      });
      continue;
    }

    if (cmd === 'ping') {
      const targetIp = tokens[1];
      if (!targetIp || parseIpv4(targetIp) === null) {
        fatalError = `Baris ${idx + 1}: Alamat IP target ping tidak valid (contoh: ping 192.168.1.10).`;
        break;
      }
      updateLinkStates();

      const g0 = interfaces['g0/0'];
      const g1 = interfaces['g0/1'];
      const pcToRouterUp = Boolean(
        g0.adminUp && g0.ip && g0.mask && sameSubnet(g0.ip, PC_IP, g0.mask)
      );
      const routerToServerUp = Boolean(
        g1.adminUp && g1.ip && g1.mask && sameSubnet(g1.ip, SERVER_IP, g1.mask)
      );

      let pingResult: NetworkPingResult;

      if (targetIp === PC_IP) {
        if (pcToRouterUp) {
          pingResult = {
            targetIp,
            success: true,
            hops: ['router', 'sw', 'pc'],
            rttMs: 4,
            packetLossPct: 0,
            reason: `Balasan diterima dari PC-Siswa (${PC_IP}) melalui g0/0!`,
          };
        } else {
          pingResult = {
            targetIp,
            success: false,
            hops: ['router'],
            rttMs: 0,
            packetLossPct: 100,
            reason: !g0.adminUp
              ? 'Interface g0/0 masih shutdown (tambahkan "no shutdown").'
              : `IP g0/0 (${g0.ip ?? 'kosong'}) belum satu subnet dengan PC (${PC_IP}/${PC_MASK}).`,
          };
        }
      } else if (targetIp === SERVER_IP) {
        if (pcToRouterUp && routerToServerUp) {
          pingResult = {
            targetIp,
            success: true,
            hops: ['pc', 'sw', 'router', 'server'],
            rttMs: 11,
            packetLossPct: 0,
            reason: `Routing end-to-end sukses dari PC-Siswa (${PC_IP}) ke Server-Kodie (${SERVER_IP})!`,
          };
        } else {
          const reasonParts: string[] = [];
          if (!pcToRouterUp) {
            reasonParts.push('Jalur LAN (g0/0 -> 192.168.1.x) belum aktif/sejajar.');
          }
          if (!routerToServerUp) {
            reasonParts.push('Jalur WAN (g0/1 -> 10.0.0.x) belum aktif/sejajar.');
          }
          pingResult = {
            targetIp,
            success: false,
            hops: pcToRouterUp ? ['pc', 'sw', 'router'] : ['pc'],
            rttMs: 0,
            packetLossPct: 100,
            reason: reasonParts.join(' '),
          };
        }
      } else if (targetIp === g0.ip && g0.adminUp) {
        pingResult = {
          targetIp,
          success: true,
          hops: ['pc', 'sw', 'router'],
          rttMs: 2,
          packetLossPct: 0,
          reason: `Gateway ${targetIp} (g0/0) aktif dan merespons!`,
        };
      } else if (targetIp === g1.ip && g1.adminUp) {
        pingResult = {
          targetIp,
          success: true,
          hops: ['router'],
          rttMs: 1,
          packetLossPct: 0,
          reason: `Interface ${targetIp} (g0/1) aktif!`,
        };
      } else {
        pingResult = {
          targetIp,
          success: false,
          hops: ['router'],
          rttMs: 0,
          packetLossPct: 100,
          reason: `Host ${targetIp} tidak terjangkau di topologi.`,
        };
      }

      pings.push(pingResult);
      cliTranscript.push(`Sending 4, 100-byte ICMP Echos to ${targetIp}, timeout is 2 seconds:`);
      if (pingResult.success) {
        cliTranscript.push('!!!!');
        cliTranscript.push(
          `Success rate is 100 percent (4/4), round-trip min/avg/max = 1/${pingResult.rttMs}/14 ms`
        );
      } else {
        cliTranscript.push('....');
        cliTranscript.push(`Success rate is 0 percent (0/4) — ${pingResult.reason}`);
        warnings.push(pingResult.reason);
      }
      continue;
    }

    fatalError = `Baris ${idx + 1}: Perintah "${rawLine}" tidak dikenal di Cisco IOS Lab.`;
    cliTranscript.push(`% Unknown command "${rawLine}"`);
    break;
  }

  updateLinkStates();
  const g0 = interfaces['g0/0'];
  const g1 = interfaces['g0/1'];
  const pcToRouterUp = Boolean(
    g0.adminUp && g0.ip && g0.mask && sameSubnet(g0.ip, PC_IP, g0.mask)
  );
  const routerToServerUp = Boolean(
    g1.adminUp && g1.ip && g1.mask && sameSubnet(g1.ip, SERVER_IP, g1.mask)
  );

  const networkResult: NetworkSimResult = {
    hostname,
    interfaces,
    pcToRouterUp,
    routerToServerUp,
    cliTranscript,
    pings,
    warnings,
  };

  const stdout = cliTranscript.join('\n');
  const durationMs = Math.max(1, Math.round(performance.now() - start));
  const ok = !fatalError;

  const consoleLogs: ConsoleEntry[] = [
    {
      id: `net-${Date.now()}`,
      level: ok ? 'info' : 'error',
      text: fatalError ?? stdout,
      timestamp: Date.now(),
    },
  ];

  return {
    track: 'network',
    ok,
    stdout,
    stderr: fatalError ?? '',
    consoleLogs,
    networkResult,
    exitCode: ok ? 0 : 1,
    durationMs,
    errorRaw: fatalError ?? undefined,
  };
}
