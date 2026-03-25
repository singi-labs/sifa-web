/**
 * build-stats-data.ts
 *
 * Processes PLC crawl CSVs into a static JSON file consumed by the stats page.
 *
 * Inputs:
 *   data/plc-count-by-pds.csv       - per-PDS totals with reachability
 *   data/plc-count-by-pds-daily.csv - daily per-PDS creates
 *
 * Output:
 *   public/data/plc-stats.json
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PdsRow {
  pds: string;
  creates: number;
  percentage: number;
  samplesReachable: number | null;
  samplesTested: number | null;
  reachablePct: number | null;
}

interface DailyRow {
  date: string; // YYYY-MM-DD
  pds: string;
  creates: number;
}

interface Group {
  id: string;
  label: string;
  totalCreates: number;
  reachablePct: number | null;
}

interface MonthlyPoint {
  month: string;
  [groupId: string]: string | number;
}

interface DailyPoint {
  date: string;
  [groupId: string]: string | number;
}

interface PdsTableRow {
  pds: string;
  creates: number;
  pct: number;
  reachablePct: number | null;
}

interface StatsOutput {
  generated: string;
  summary: {
    totalDids: number;
    reachableDids: number;
    totalPdsHosts: number;
    dataThrough: string;
  };
  groups: Group[];
  monthly: MonthlyPoint[];
  daily: DailyPoint[];
  pdsTable: PdsTableRow[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

/** Naive but sufficient CSV parser that handles quoted fields. */
function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const fields: string[] = [];
    let inQuote = false;
    let cur = '';
    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        fields.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    fields.push(cur);
    rows.push(fields);
  }
  return rows;
}

function slugify(pds: string): string {
  return pds
    .replace(/^https?:\/\//, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function isBluesky(pds: string): boolean {
  return pds.endsWith('.bsky.network') || pds === 'https://bsky.social';
}

/**
 * Returns true for PDS entries that are clearly junk, test, or local entries
 * which should not appear as named groups in charts.
 */
function isJunkPds(pds: string): boolean {
  if (!pds.startsWith('https://') && !pds.startsWith('http://')) return true;
  const host = pds.replace(/^https?:\/\//, '').split('/')[0] ?? '';
  // Loopback / private IPs
  if (/^127\.|^10\.|^192\.168\.|^localhost(:\d+)?$/.test(host)) return true;
  // Known test/placeholder domains
  const junkHosts = new Set([
    'example.test',
    'example.com',
    'test.test',
    'plc.surge.sh', // not a real PDS — a PLC directory mirror/artifact
  ]);
  const hostWithoutPort = host.split(':')[0] ?? host;
  if (junkHosts.has(hostWithoutPort)) return true;
  // Tunnel/ngrok/dev-proxy domains
  if (/\bngrok\b|\bngrok-free\b|\bserveo\b|\blocalhost\b/.test(host)) return true;
  // Hosts with no dot (e.g. "uwu") — not real FQDN
  if (!hostWithoutPort.includes('.')) return true;
  // URLs containing path segments that make them not a real PDS root
  // (e.g. https://plc.surge.sh/gallery)
  const afterScheme = pds.replace(/^https?:\/\/[^/]+/, '');
  if (afterScheme.length > 1) return true; // has a path beyond /
  return false;
}

// ---------------------------------------------------------------------------
// Parse CSVs
// ---------------------------------------------------------------------------

function parsePdsTotals(filePath: string): PdsRow[] {
  const content = readFileSync(filePath, 'utf-8');
  const [_header, ...dataRows] = parseCsv(content);
  const results: PdsRow[] = [];

  for (const row of dataRows) {
    const pds = row[0]?.trim();
    const createsRaw = row[1]?.trim();
    const percentageRaw = row[2]?.trim();
    const samplesTestedRaw = row[3]?.trim();
    const samplesReachableRaw = row[4]?.trim();
    const reachablePctRaw = row[5]?.trim();

    if (!pds || !createsRaw) continue;

    const creates = parseInt(createsRaw, 10);
    if (isNaN(creates)) continue;

    const percentage = parseFloat(percentageRaw ?? '0');
    const samplesTested = samplesTestedRaw ? parseInt(samplesTestedRaw, 10) : null;
    const samplesReachable = samplesReachableRaw ? parseInt(samplesReachableRaw, 10) : null;
    const reachablePct =
      reachablePctRaw !== undefined && reachablePctRaw !== '' ? parseFloat(reachablePctRaw) : null;

    results.push({
      pds,
      creates,
      percentage,
      samplesTested,
      samplesReachable,
      reachablePct,
    });
  }

  return results;
}

function parseDailyData(filePath: string): DailyRow[] {
  const content = readFileSync(filePath, 'utf-8');
  const [_header, ...dataRows] = parseCsv(content);
  const results: DailyRow[] = [];

  for (const row of dataRows) {
    const date = row[0]?.trim();
    const pds = row[1]?.trim();
    const createsRaw = row[2]?.trim();

    if (!date || !pds || !createsRaw) continue;

    const creates = parseInt(createsRaw, 10);
    if (isNaN(creates)) continue;

    results.push({ date, pds, creates });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Build groups
// ---------------------------------------------------------------------------

function buildGroups(
  pdsRows: PdsRow[],
  topN: number = 8,
): { groups: Group[]; groupForPds: (pds: string) => string } {
  // Identify non-Bluesky, non-junk PDS hosts sorted by creates descending
  const nonBluesky = pdsRows
    .filter((r) => !isBluesky(r.pds) && !isJunkPds(r.pds))
    .sort((a, b) => b.creates - a.creates);

  const topPds = nonBluesky.slice(0, topN).map((r) => r.pds);
  const topPdsSet = new Set(topPds);

  // Aggregate Bluesky totals
  const blueskyRows = pdsRows.filter((r) => isBluesky(r.pds));
  const blueskyCreates = blueskyRows.reduce((s, r) => s + r.creates, 0);

  // Weighted average reachable pct for Bluesky
  let blueskyReachableCreates = 0;
  let blueskyTestedCreates = 0;
  for (const r of blueskyRows) {
    if (
      r.reachablePct !== null &&
      r.samplesReachable !== null &&
      r.samplesTested !== null &&
      r.samplesTested > 0
    ) {
      blueskyReachableCreates += r.samplesReachable;
      blueskyTestedCreates += r.samplesTested;
    }
  }
  const blueskyReachablePct =
    blueskyTestedCreates > 0
      ? Math.round((blueskyReachableCreates / blueskyTestedCreates) * 100)
      : null;

  const groups: Group[] = [
    {
      id: 'bluesky',
      label: 'Bluesky',
      totalCreates: blueskyCreates,
      reachablePct: blueskyReachablePct,
    },
  ];

  // Top N non-Bluesky
  for (const r of nonBluesky.slice(0, topN)) {
    groups.push({
      id: slugify(r.pds),
      label: r.pds.replace(/^https?:\/\//, ''),
      totalCreates: r.creates,
      reachablePct: r.reachablePct,
    });
  }

  // "other" group: aggregate all non-top, non-Bluesky
  const otherRows = nonBluesky.slice(topN);
  const otherCreates = otherRows.reduce((s, r) => s + r.creates, 0);
  if (otherCreates > 0) {
    groups.push({
      id: 'other',
      label: 'Other',
      totalCreates: otherCreates,
      reachablePct: null,
    });
  }

  const groupForPds = (pds: string): string => {
    if (isBluesky(pds)) return 'bluesky';
    if (isJunkPds(pds)) return 'other';
    if (topPdsSet.has(pds)) return slugify(pds);
    return 'other';
  };

  return { groups, groupForPds };
}

// ---------------------------------------------------------------------------
// Build monthly cumulative time-series
// ---------------------------------------------------------------------------

function buildMonthly(
  dailyRows: DailyRow[],
  groupForPds: (pds: string) => string,
  groupIds: string[],
): MonthlyPoint[] {
  // Accumulate monthly raw totals
  const monthlyRaw = new Map<string, Map<string, number>>();

  for (const row of dailyRows) {
    const month = row.date.slice(0, 7); // YYYY-MM
    const groupId = groupForPds(row.pds);

    if (!monthlyRaw.has(month)) {
      monthlyRaw.set(month, new Map());
    }
    const monthMap = monthlyRaw.get(month)!;
    monthMap.set(groupId, (monthMap.get(groupId) ?? 0) + row.creates);
  }

  // Sort months
  const sortedMonths = Array.from(monthlyRaw.keys()).sort();

  // Compute cumulative values
  const cumulative = new Map<string, number>();
  for (const id of groupIds) {
    cumulative.set(id, 0);
  }

  const result: MonthlyPoint[] = [];
  for (const month of sortedMonths) {
    const monthMap = monthlyRaw.get(month)!;
    for (const id of groupIds) {
      cumulative.set(id, (cumulative.get(id) ?? 0) + (monthMap.get(id) ?? 0));
    }
    const point: MonthlyPoint = { month };
    for (const id of groupIds) {
      point[id] = cumulative.get(id) ?? 0;
    }
    result.push(point);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Build last-90-days daily data
// ---------------------------------------------------------------------------

function buildDaily90(
  dailyRows: DailyRow[],
  groupForPds: (pds: string) => string,
  groupIds: string[],
  dataThrough: string,
): DailyPoint[] {
  // Determine cutoff: 90 days before dataThrough
  const throughDate = new Date(dataThrough + 'T00:00:00Z');
  const cutoff = new Date(throughDate);
  cutoff.setUTCDate(cutoff.getUTCDate() - 89); // inclusive: 90 days total
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  // Filter and aggregate by date
  const byDate = new Map<string, Map<string, number>>();

  for (const row of dailyRows) {
    if (row.date < cutoffStr) continue;
    if (!byDate.has(row.date)) {
      byDate.set(row.date, new Map());
    }
    const dateMap = byDate.get(row.date)!;
    const groupId = groupForPds(row.pds);
    dateMap.set(groupId, (dateMap.get(groupId) ?? 0) + row.creates);
  }

  const sortedDates = Array.from(byDate.keys()).sort();
  return sortedDates.map((date) => {
    const dateMap = byDate.get(date)!;
    const point: DailyPoint = { date };
    for (const id of groupIds) {
      point[id] = dateMap.get(id) ?? 0;
    }
    return point;
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const pdsTotalsPath = resolve(ROOT, 'data/plc-count-by-pds.csv');
  const dailyPath = resolve(ROOT, 'data/plc-count-by-pds-daily.csv');
  const outputPath = resolve(ROOT, 'public/data/plc-stats.json');

  console.log('Reading CSV files...');
  const pdsRows = parsePdsTotals(pdsTotalsPath);
  const dailyRows = parseDailyData(dailyPath);

  console.log(`  PDS totals: ${pdsRows.length} rows`);
  console.log(`  Daily rows: ${dailyRows.length} rows`);

  // Summary totals
  const totalDids = pdsRows.reduce((s, r) => s + r.creates, 0);
  let reachableDids = 0;
  for (const r of pdsRows) {
    if (r.reachablePct !== null && r.samplesTested !== null && r.samplesTested > 0) {
      reachableDids += Math.round(r.creates * (r.reachablePct / 100));
    }
  }
  const totalPdsHosts = pdsRows.length;

  // Latest date in daily data
  const allDates = dailyRows.map((r) => r.date).sort();
  const dataThrough = allDates[allDates.length - 1] ?? '';

  // Build groups
  const { groups, groupForPds } = buildGroups(pdsRows, 8);
  const groupIds = groups.map((g) => g.id);

  console.log(`  Groups: ${groupIds.join(', ')}`);

  // Build time-series
  const monthly = buildMonthly(dailyRows, groupForPds, groupIds);
  const daily = buildDaily90(dailyRows, groupForPds, groupIds, dataThrough);

  // Build PDS table (top 200 by creates for reasonable page size)
  const pdsTable: PdsTableRow[] = pdsRows
    .sort((a, b) => b.creates - a.creates)
    .slice(0, 200)
    .map((r) => ({
      pds: r.pds,
      creates: r.creates,
      pct: r.percentage,
      reachablePct: r.reachablePct,
    }));

  const output: StatsOutput = {
    generated: new Date().toISOString(),
    summary: {
      totalDids,
      reachableDids,
      totalPdsHosts,
      dataThrough,
    },
    groups,
    monthly,
    daily,
    pdsTable,
  };

  mkdirSync(resolve(ROOT, 'public/data'), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  const fileSizeKb = Math.round(Buffer.byteLength(JSON.stringify(output)) / 1024);
  console.log(`\nOutput written to public/data/plc-stats.json`);
  console.log(`  Summary: ${totalDids.toLocaleString()} total DIDs`);
  console.log(`  Monthly points: ${monthly.length}`);
  console.log(`  Daily points (last 90d): ${daily.length}`);
  console.log(`  PDS table rows: ${pdsTable.length}`);
  console.log(`  File size: ~${fileSizeKb} KB`);
}

main();
