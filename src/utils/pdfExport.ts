/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Client-Side Executive PDF Report Generator (Phase 14)
 * 
 * ============================================================================
 * LEARNING RESOURCES & WINDOW PRINT API:
 * ============================================================================
 * 1. Window.print() & CSS @media print:
 *    https://developer.mozilla.org/en-US/docs/Web/API/Window/print
 *    Opens browser print dialog configured to render clean multi-page executive PDF reports
 *    with page breaks and high-resolution typography.
 * ============================================================================
 */

import type { OmniResource, AuditLog } from '../types';
import { type CurrencyCode, formatCurrency } from './format';

export interface PDFReportData {
  resources: OmniResource[];
  auditLogs: AuditLog[];
  currency: CurrencyCode;
  rates: Record<string, number>;
  userRole: string;
}

export function generateExecutivePDFReport({
  resources,
  auditLogs,
  currency,
  rates,
  userRole
}: PDFReportData) {
  const totalSpendUsd = resources.reduce((sum, r) => sum + r.totalSpend, 0);
  const totalBurnRateUsd = resources.reduce((sum, r) => sum + r.hourlyCost, 0);
  const activeCount = resources.filter((r) => r.status === 'ACTIVE').length;
  const idleCount = resources.filter((r) => r.status === 'IDLE').length;

  const totalAuditSavingsUsd = auditLogs.reduce((sum, log) => sum + log.estimatedMonthlySavings, 0);

  const reportHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>OmniCost Executive FinOps Report</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0F172A; background: #FFF; line-height: 1.5; padding: 10px; }
          .header { border-b: 3px solid #6366F1; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; items: center; }
          .title { font-size: 24px; font-weight: 800; color: #0F172A; }
          .subtitle { font-size: 12px; color: #64748B; margin-top: 4px; }
          .meta { text-align: right; font-size: 11px; color: #64748B; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
          .card { border: 1px solid #E2E8F0; background: #F8FAFC; border-radius: 8px; padding: 12px; }
          .card-title { font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; }
          .card-value { font-size: 18px; font-weight: 800; color: #0F172A; margin-top: 4px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: 700; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 12px; color: #1E293B; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #F1F5F9; font-weight: 700; text-align: left; padding: 8px 10px; border-bottom: 1px solid #CBD5E1; color: #334155; }
          td { padding: 8px 10px; border-bottom: 1px solid #E2E8F0; color: #334155; }
          .badge { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; }
          .badge-terminate { background: #FEE2E2; color: #991B1B; }
          .badge-active { background: #D1FAE5; color: #065F46; }
          .text-right { text-align: right; }
          .text-green { color: #059669; font-weight: 700; }
          .footer { border-top: 1px solid #E2E8F0; padding-top: 10px; font-size: 10px; color: #94A3B8; text-align: center; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">OmniCost Executive FinOps Report</div>
            <div class="subtitle">Cloud & AI API Observability Audit Summary (${currency})</div>
          </div>
          <div class="meta">
            <div>Generated: ${new Date().toLocaleString()}</div>
            <div>Role: ${userRole}</div>
            <div>Currency: ${currency}</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Total Spend</div>
            <div class="card-value">${formatCurrency(totalSpendUsd, currency, 0, rates)}</div>
          </div>
          <div class="card">
            <div class="card-title">Hourly Burn Rate</div>
            <div class="card-value">${formatCurrency(totalBurnRateUsd, currency, 2, rates)}/hr</div>
          </div>
          <div class="card">
            <div class="card-title">Active Assets</div>
            <div class="card-value">${activeCount}</div>
          </div>
          <div class="card">
            <div class="card-title">Idle Waste Assets</div>
            <div class="card-value">${idleCount}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Immutable Remediation Audit Trail Log</div>
          ${
            auditLogs.length === 0
              ? '<p style="font-size: 11px; color: #64748B;">No remediation actions executed yet.</p>'
              : `
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Target Asset</th>
                  <th>Reason Code</th>
                  <th>Executed By</th>
                  <th class="text-right">Est. Monthly Savings</th>
                </tr>
              </thead>
              <tbody>
                ${auditLogs
                  .slice(0, 10)
                  .map(
                    (log) => `
                  <tr>
                    <td>${new Date(log.timestamp).toLocaleString()}</td>
                    <td><span class="badge badge-terminate">${log.action}</span></td>
                    <td><b>${log.resourceName || log.resourceId}</b></td>
                    <td>${log.reasonCode}</td>
                    <td>${log.executedBy}</td>
                    <td class="text-right text-green">+${formatCurrency(log.estimatedMonthlySavings, currency, 2, rates)}/mo</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          `
          }
        </div>

        <div class="footer">
          OmniCost Enterprise FinOps Platform &bull; SOC-2 Compliant Client-Side Executive Report
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(reportHtml);
    printWindow.document.close();
  }
}
