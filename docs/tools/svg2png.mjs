// Rasteriza os SVGs dos diagramas em PNG 2x usando Edge headless + CDP.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9336;
const PROFILE = path.join(os.tmpdir(), 'opencode', 'edge-svg');
fs.rmSync(PROFILE, { recursive: true, force: true });
const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 40 && !wsUrl; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    wsUrl = list.find((t) => t.type === 'page')?.webSocketDebuggerUrl;
  } catch {}
  if (!wsUrl) await sleep(250);
}
const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id); pending.delete(m.id);
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
  }
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const i = ++id; pending.set(i, { resolve, reject });
  ws.send(JSON.stringify({ id: i, method, params }));
});
await send('Page.enable');

const dir = path.join(process.cwd(), 'docs', 'diagrams');
const outDir = path.join(dir, 'png');
fs.mkdirSync(outDir, { recursive: true });

for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.svg'))) {
  const svg = fs.readFileSync(path.join(dir, name), 'utf8');
  const m = svg.match(/width="(\d+)"\s+height="(\d+)"/);
  const w = Number(m[1]);
  const h = Number(m[2]);
  await send('Emulation.setDeviceMetricsOverride', {
    width: w, height: h, deviceScaleFactor: 2, mobile: false,
  });
  const url = 'file:///' + path.join(dir, name).replace(/\\/g, '/');
  await send('Page.navigate', { url });
  await sleep(700);
  const { data } = await send('Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: w, height: h, scale: 2 },
  });
  const out = path.join(outDir, name.replace(/\.svg$/, '.png'));
  fs.writeFileSync(out, Buffer.from(data, 'base64'));
  console.log('gerado:', path.basename(out), `${w * 2}x${h * 2}`, fs.statSync(out).size);
}
ws.close(); proc.kill(); process.exit(0);
