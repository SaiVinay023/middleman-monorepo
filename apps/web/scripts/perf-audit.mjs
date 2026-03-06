#!/usr/bin/env node

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const isWin = process.platform === 'win32';
const npxBin = isWin ? 'npx.cmd' : 'npx';
const nextBin = isWin ? 'next.cmd' : 'next';

const webRoot = process.cwd();
const outputDir = path.join(webRoot, 'performance', 'lighthouse');
const quickMode = process.argv.includes('--quick');
const port = process.env.LH_PORT ?? '4311';
const baseUrl = `http://127.0.0.1:${port}`;

const routes = quickMode
  ? ['/', '/company']
  : ['/', '/login', '/freelancer', '/freelancer/gigs', '/freelancer/my-gigs', '/company'];

const budgets = {
  performance: 95,
  lcpMs: 2500,
  tbtMs: 200,
  cls: 0.1,
};

const run = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...options,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} failed with code ${code}`));
      }
    });
  });

const waitForServer = async (url, retries = 60) => {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok || res.status === 404) {
        return;
      }
    } catch {
      // Keep retrying until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for server at ${url}`);
};

const routeFileName = (route) => (route === '/' ? 'home' : route.slice(1).replaceAll('/', '_'));

const parseMetrics = async (filePath) => {
  const raw = await fs.readFile(filePath, 'utf8');
  const report = JSON.parse(raw);

  const performance = Math.round((report.categories.performance.score ?? 0) * 100);
  const lcpMs = Math.round(report.audits['largest-contentful-paint']?.numericValue ?? 0);
  const tbtMs = Math.round(report.audits['total-blocking-time']?.numericValue ?? 0);
  const cls = Number(report.audits['cumulative-layout-shift']?.numericValue ?? 0);

  return { performance, lcpMs, tbtMs, cls };
};

const desktopArgs = (url, outFile) => [
  'lighthouse',
  url,
  '--preset=desktop',
  '--only-categories=performance',
  '--output=json',
  `--output-path=${outFile}`,
  '--quiet',
  '--chrome-flags=--headless=new --no-sandbox',
];

const mobileArgs = (url, outFile) => [
  'lighthouse',
  url,
  '--preset=perf',
  '--form-factor=mobile',
  '--throttling-method=simulate',
  '--only-categories=performance',
  '--output=json',
  `--output-path=${outFile}`,
  '--quiet',
  '--chrome-flags=--headless=new --no-sandbox',
];

const metricPass = (m) =>
  m.performance >= budgets.performance &&
  m.lcpMs <= budgets.lcpMs &&
  m.tbtMs <= budgets.tbtMs &&
  m.cls <= budgets.cls;

const formatMs = (value) => `${value}ms`;

const main = async () => {
  await fs.mkdir(outputDir, { recursive: true });

  console.log(`\n[perf] Building web app for static export...`);
  await run(nextBin, ['build'], { cwd: webRoot });

  console.log(`[perf] Serving ./out on ${baseUrl}...`);
  const server = spawn(npxBin, ['serve', 'out', '-l', port, '-n'], {
    cwd: webRoot,
    stdio: 'inherit',
    shell: false,
  });

  try {
    await waitForServer(baseUrl);

    const summary = [];

    for (const route of routes) {
      const name = routeFileName(route);
      const url = `${baseUrl}${route}`;
      const desktopOut = path.join(outputDir, `desktop_${name}.json`);
      const mobileOut = path.join(outputDir, `mobile_${name}.json`);

      console.log(`\n[perf] Auditing ${route} (desktop)...`);
      await run(npxBin, desktopArgs(url, desktopOut), { cwd: webRoot });

      console.log(`[perf] Auditing ${route} (mobile)...`);
      await run(npxBin, mobileArgs(url, mobileOut), { cwd: webRoot });

      const desktop = await parseMetrics(desktopOut);
      const mobile = await parseMetrics(mobileOut);

      summary.push({ route, profile: 'desktop', ...desktop, pass: metricPass(desktop) });
      summary.push({ route, profile: 'mobile', ...mobile, pass: metricPass(mobile) });
    }

    console.log('\n[perf] Summary (targets: score>=95, LCP<=2500ms, TBT<=200ms, CLS<=0.1)');
    for (const row of summary) {
      const status = row.pass ? 'PASS' : 'FAIL';
      console.log(
        `${status} ${row.profile.padEnd(7)} ${row.route.padEnd(22)} score=${row.performance} lcp=${formatMs(
          row.lcpMs
        )} tbt=${formatMs(row.tbtMs)} cls=${row.cls}`
      );
    }

    const failures = summary.filter((row) => !row.pass);
    if (failures.length > 0) {
      console.error(`\n[perf] Failed: ${failures.length} route/profile audits are below budget.`);
      process.exitCode = 1;
    } else {
      console.log('\n[perf] All route/profile audits passed.');
    }
  } finally {
    if (!server.killed) {
      server.kill('SIGTERM');
    }
  }
};

main().catch((error) => {
  console.error(`\n[perf] ${error.message}`);
  process.exit(1);
});
