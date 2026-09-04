/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Data Export Utility (CSV & JSON Reports) (Phase 8)
 * 
 * ============================================================================
 * LEARNING RESOURCES & BROWSER BLOB API:
 * ============================================================================
 * 1. MDN Blob API:
 *    https://developer.mozilla.org/en-US/docs/Web/API/Blob
 *    Represents raw data objects in browser memory to trigger instant CSV/JSON file downloads.
 * 
 * 2. URL.createObjectURL():
 *    https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
 *    Creates a DOMString containing a URL representing the downloadable Blob file object.
 * ============================================================================
 */

import type { OmniResource } from '../types';
import { formatINR } from './format';

/**
 * Converts OmniResource objects into downloadable CSV format and triggers browser download.
 */
export function exportResourcesToCSV(resources: OmniResource[], filename: string = 'omnicost-finops-report.csv') {
  if (!resources || resources.length === 0) return;

  const headers = [
    'Resource ID',
    'Resource Name',
    'Category Type',
    'Provider',
    'Cost Center',
    'Status',
    'Hourly Cost (INR)',
    'Total Spend (INR)',
    'Region',
    'Created At'
  ];

  const rows = resources.map((r) => [
    `"${r.id}"`,
    `"${r.name}"`,
    `"${r.type}"`,
    `"${r.provider}"`,
    `"${r.costCenter}"`,
    `"${r.status}"`,
    `"${formatINR(r.hourlyCost)}"`,
    `"${formatINR(r.totalSpend)}"`,
    `"${r.region}"`,
    `"${r.createdAt}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Converts resources to JSON report and triggers download.
 */
export function exportResourcesToJSON(resources: OmniResource[], filename: string = 'omnicost-finops-report.json') {
  if (!resources || resources.length === 0) return;

  const jsonContent = JSON.stringify(resources, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
