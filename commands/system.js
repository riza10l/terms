const os = require('os');
const { execSync } = require('child_process');
const chalk = require('chalk').default;
const { getSystemInfo, formatUptime, progressBar } = require('../utils/helpers');

module.exports = [
  {
    name: 'Fetch System Info',
    exec: async (term, ctx) => {
      const { renderDashboard } = require('../utils/dashboard');
      renderDashboard(term, ctx);
    }
  },

  {
    name: 'Device Info',
    exec: async (term, ctx) => {
      const p = ctx.paint;
      const info = getSystemInfo();
      term('\n');
      p.primary('Device Info\n');
      p.secondary('─'.repeat(35) + '\n');
      p.info(`Hostname : ${info.hostname}\n`);
      p.info(`Platform : ${info.platform} (${info.release})\n`);
      p.info(`Arch     : ${info.arch}\n`);
      p.info(`CPU      : ${info.cpuModel}\n`);
      p.info(`Cores    : ${info.cpuCores}\n`);
      p.info(`CPU Load : ${info.cpuPercent}%\n`);
      p.info(`RAM      : ${info.usedGB}GB / ${info.totalGB}GB (${info.memPercent}%)\n`);
      p.info(`Uptime   : ${info.uptime}\n`);

      // OS Health Score
      const cpuHealth = Math.max(0, 100 - parseFloat(info.cpuPercent));
      const memHealth = Math.max(0, 100 - parseFloat(info.memPercent));
      const healthScore = Math.round((cpuHealth + memHealth) / 2);

      term('\n');
      p.primary('OS Health: ');
      if (healthScore > 80) p.success(`${healthScore}/100 ✔ Great\n`);
      else if (healthScore > 50) p.warning(`${healthScore}/100 ⚠ Fair\n`);
      else p.error(`${healthScore}/100 ✗ Poor\n`);

      term('\n');
    }
  },

  {
    name: 'Uptime',
    exec: async (term, ctx) => {
      const info = getSystemInfo();
      ctx.paint.primary(`System Uptime: ${info.uptime}\n`);
      term(`Boot time: ~${formatUptime(info.uptimeSeconds + (Date.now()/1000 - os.uptime()))} ago\n\n`);
    }
  },

  {
    name: 'Process List',
    exec: async (term, ctx) => {
      term(chalk.hex(ctx.theme.warning)('Process monitoring requires elevated permissions.\n'));
      ctx.paint.secondary('Showing simulated process list:\n\n');
      const procs = [
        { pid: 1, name: 'TERMS.exe', cpu: '0.1', mem: '12MB' },
        { pid: 420, name: 'kernel32.dll', cpu: '0.3', mem: '45MB' },
        { pid: 69, name: 'system64.sys', cpu: '1.2', mem: '128MB' },
        { pid: 1337, name: 'h4ck.exe', cpu: '0.0', mem: '4MB' },
        { pid: 8008, name: 'chrome.exe', cpu: '14.5', mem: '1.2GB' },
      ];
      ctx.paint.secondary('PID'.padEnd(8) + 'NAME'.padEnd(20) + 'CPU'.padEnd(8) + 'MEM\n');
      ctx.paint.secondary('─'.repeat(44) + '\n');
      procs.forEach(p => {
        term(String(p.pid).padEnd(8) + p.name.padEnd(20) + p.cpu.padEnd(8) + p.mem + '\n');
      });
      term('\n');
    }
  },

  {
    name: 'Disk Usage',
    exec: async (term, ctx) => {
      ctx.paint.secondary('Disk Usage:\n\n');
      try {
        const drive = process.cwd().split(':')[0] + ':';
        const out = execSync(
          `powershell -NoProfile -Command "Get-CimInstance -ClassName Win32_LogicalDisk -Filter \\"DeviceID='${drive}'\\" | Select-Object -Property Size,FreeSpace | Format-List"`,
          { encoding: 'utf8', timeout: 10000 }
        );
        const sizeMatch = out.match(/Size\s*:\s*(\d+)/);
        const freeMatch = out.match(/FreeSpace\s*:\s*(\d+)/);
        if (sizeMatch && freeMatch) {
          const total = parseInt(sizeMatch[1]) / (1024**3);
          const free = parseInt(freeMatch[1]) / (1024**3);
          const used = total - free;
          const pct = ((used / total) * 100).toFixed(1);
          ctx.paint.primary(`${drive}  `);
          ctx.paint.info(`${used.toFixed(1)}GB / ${total.toFixed(1)}GB (${pct}%)\n`);
          const barW = 25;
          const filled = Math.round((used / total) * barW);
          ctx.paint.warning('█'.repeat(filled));
          ctx.paint.secondary('░'.repeat(barW - filled));
          term(` ${pct}%\n\n`);
        } else {
          ctx.paint.error('Could not parse disk info.\n\n');
        }
      } catch {
        ctx.paint.error('Could not read disk info.\n\n');
      }
    }
  },

  {
    name: 'Ping',
    exec: async (term, ctx, args) => {
      const host = args || 'google.com';
      ctx.paint.primary(`Pinging ${host}...\n\n`);
      try {
        const out = execSync(`ping -n 4 ${host}`, { encoding: 'utf8', timeout: 10000 });
        const lines = out.split('\n').filter(l => l.includes('ms') || l.includes('time='));
        lines.forEach(l => term(l + '\n'));
      } catch {
        ctx.paint.error('Ping failed or timed out.\n');
      }
      term('\n');
    }
  },

  {
    name: 'Network Info',
    exec: async (term, ctx) => {
      const network = os.networkInterfaces();
      ctx.paint.primary('Network Interfaces:\n\n');
      Object.keys(network).forEach(iface => {
        network[iface].forEach(addr => {
          if (addr.family === 'IPv4' && !addr.internal) {
            ctx.paint.secondary(`${iface}: `);
            term(`${addr.address}\n`);
          }
        });
      });
      term('\n');
      try {
        const out = execSync('netsh wlan show interfaces 2>nul | findstr "SSID"', { encoding: 'utf8' });
        if (out.trim()) ctx.paint.info(`WiFi: ${out.trim()}\n`);
      } catch {}
      term('\n');
    }
  },

  {
    name: 'Battery',
    exec: async (term, ctx) => {
      try {
        const out = execSync(
          'powershell -NoProfile -Command "Get-CimInstance -ClassName Win32_Battery | Select-Object -Property EstimatedChargeRemaining,EstimatedRunTime,BatteryStatus | Format-List"',
          { encoding: 'utf8', timeout: 10000 }
        );
        const chargeMatch = out.match(/EstimatedChargeRemaining\s*:\s*(\d+)/);
        const runtimeMatch = out.match(/EstimatedRunTime\s*:\s*(\d+)/);
        const statusMatch = out.match(/BatteryStatus\s*:\s*(\d+)/);

        if (chargeMatch) {
          const pct = parseInt(chargeMatch[1]);
          const runtime = runtimeMatch ? parseInt(runtimeMatch[1]) : NaN;
          const status = statusMatch ? parseInt(statusMatch[1]) : NaN;
          const statusMap = { 1: 'Discharging', 2: 'AC Power', 3: 'Charging' };

          ctx.paint.primary(`Battery: ${isNaN(pct) ? 'N/A' : pct + '%'}\n`);
          if (!isNaN(pct)) {
            const barW = 20;
            const filled = Math.round((pct / 100) * barW);
            const color = pct > 50 ? ctx.theme.success : pct > 20 ? ctx.theme.warning : ctx.theme.error;
            term(chalk.hex(color)('█'.repeat(filled)));
            ctx.paint.secondary('░'.repeat(barW - filled));
            term(` ${pct}%\n`);
          }
          ctx.paint.info(`Status: ${statusMap[status] || 'Unknown'}\n`);
          if (!isNaN(runtime) && runtime > 0) ctx.paint.info(`Remaining: ~${runtime} minutes\n`);
        } else {
          ctx.paint.warning('No battery detected.\n');
        }
      } catch {
        ctx.paint.warning('No battery detected or not available.\n');
      }
      term('\n');
    }
  },

  {
    name: 'Open Ports',
    exec: async (term, ctx) => {
      ctx.paint.warning('Port scanning requires elevated permissions.\n');
      ctx.paint.secondary('Common open ports on this system:\n\n');
      const ports = [
        { port: 135, service: 'RPC', status: 'LISTENING' },
        { port: 445, service: 'SMB', status: 'LISTENING' },
        { port: 5040, service: 'Windows Services', status: 'LISTENING' },
      ];
      ctx.paint.secondary('PORT'.padEnd(8) + 'SERVICE'.padEnd(22) + 'STATUS\n');
      ctx.paint.secondary('─'.repeat(40) + '\n');
      ports.forEach(p => {
        term(String(p.port).padEnd(8) + p.service.padEnd(22) + p.status + '\n');
      });
      term('\n');
    }
  },

  {
    name: 'Weather',
    exec: async (term, ctx, args) => {
      const city = args || 'Jakarta';
      ctx.paint.primary(`Weather for ${city}:\n\n`);
      ctx.paint.secondary('(Simulated — configure API key for live data)\n\n');
      const mock = {
        'jakarta': { temp: '31°C', humidity: '71%', condition: 'Cloudy ☁' },
        'bandung': { temp: '24°C', humidity: '65%', condition: 'Rainy 🌧' },
        'surabaya': { temp: '33°C', humidity: '68%', condition: 'Sunny ☀' },
      };
      const data = mock[city.toLowerCase()] || { temp: '28°C', humidity: '60%', condition: 'Clear' };
      ctx.paint.info(`Temp      : ${data.temp}\n`);
      ctx.paint.info(`Humidity  : ${data.humidity}\n`);
      ctx.paint.info(`Condition : ${data.condition}\n`);
      term('\n');
    }
  }
];
