'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function inspectProcess(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) throw new Error('Invalid worker PID');
  if (process.platform === 'win32') {
    // kill(pid, 0) also fails with EPERM when Windows has reused an old PID
    // for a system service. Check the executable and its creation time instead.
    const script = `$ErrorActionPreference = 'Stop'; $p = Get-CimInstance Win32_Process -Filter 'ProcessId = ${pid}'; if ($p) { @{ name = $p.Name; command = $p.CommandLine; startedAt = $p.CreationDate.ToUniversalTime().ToString('o') } | ConvertTo-Json -Compress }`;
    const result = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8', windowsHide: true, timeout: 15000 }).trim();
    return result ? JSON.parse(result) : null;
  }
  try { process.kill(pid, 0); return { command: null, startedAt: null }; }
  catch (error) {
    if (error.code === 'ESRCH') return null;
    if (error.code === 'EPERM') return { command: null, startedAt: null };
    throw error;
  }
}

function acquireProcessLock(file, role, { inspect = inspectProcess, pid = process.pid, platform = process.platform } = {}) {
  let previous;
  try { previous = fs.readFileSync(file, 'utf8'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (previous !== undefined) {
    const record = JSON.parse(previous);
    const ownerPid = typeof record === 'number' ? record : record.pid;
    const owner = inspect(ownerPid);
    const sameStart = !record.startedAt || !owner?.startedAt || record.startedAt === owner.startedAt;
    // Legacy numeric locks have no start time; verify the worker script name.
    const sameRole = !!record.startedAt || platform !== 'win32' || !owner?.command || new RegExp('(?:^|[\\\\/\\s"\'])' + role.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:["\'\\s]|$)', 'i').test(owner.command);
    const unrelatedExecutable = platform === 'win32' && owner?.name && !/^node(?:\.exe)?$/i.test(owner.name);
    if (owner && sameStart && sameRole && !unrelatedExecutable) return null;
    // No other claimant may replace this lock between inspection and removal.
    if (fs.readFileSync(file, 'utf8') !== previous) return null;
    fs.unlinkSync(file);
  }
  const own = inspect(pid);
  const contents = JSON.stringify({ pid, startedAt: own?.startedAt || null, role, token: require('node:crypto').randomUUID() });
  fs.mkdirSync(path.dirname(file), { recursive: true });
  try { fs.writeFileSync(file, contents, { flag: 'wx' }); }
  catch (error) { if (error.code === 'EEXIST') return null; throw error; }
  return () => {
    try { if (fs.readFileSync(file, 'utf8') === contents) fs.unlinkSync(file); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  };
}
module.exports = { acquireProcessLock, inspectProcess };
