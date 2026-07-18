import React, { useMemo } from 'react';
import { Table, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface SpreadsheetPreviewProps {
  content: string;
  fileName?: string;
  type: 'csv' | 'tsv' | 'json' | 'xlsx' | 'xls' | 'xlsm';
}

export const SpreadsheetPreview: React.FC<SpreadsheetPreviewProps> = ({
  content,
  fileName,
  type,
}) => {
  const parsedData = useMemo(() => {
    if (type === 'xlsx' || type === 'xls' || type === 'xlsm') {
      try {
        const base64 = content.includes(',') ? content.split(',')[1] : content;
        const workbook = XLSX.read(base64, { type: 'base64' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' }) as any[][];
        const headers = (rows[0] || []).map((h, i) => String(h || `Column ${i + 1}`));
        return { headers, rows: rows.slice(1).map((row) => row.map((cell) => String(cell ?? ''))) };
      } catch (err: any) {
        return { headers: ['Error'], rows: [[err.message || 'Unable to parse spreadsheet']] };
      }
    }

    if (type === 'json') {
      try {
        const json = JSON.parse(content);
        if (Array.isArray(json)) {
          const headers = Object.keys(json[0] || {});
          const rows = json.map((obj) => headers.map((h) => String(obj[h] ?? '')));
          return { headers, rows };
        }
        return { headers: ['Key', 'Value'], rows: Object.entries(json).map(([k, v]) => [k, String(v)]) };
      } catch {
        return { headers: ['Error'], rows: [['Invalid JSON']] };
      }
    }

    const delimiter = type === 'tsv' ? '\t' : ',';
    const lines = content.split('\n').filter((line) => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map((line) => {
      // Handle quoted values with commas
      const cells: string[] = [];
      let cell = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          cells.push(cell.trim().replace(/^"|"$/g, ''));
          cell = '';
        } else {
          cell += char;
        }
      }
      cells.push(cell.trim().replace(/^"|"$/g, ''));
      return cells;
    });

    return { headers, rows };
  }, [content, type]);

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `data.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#11111b] border-l border-slate-800/80 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#181825]">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-semibold text-slate-300">
            {type.toUpperCase()} Preview
          </span>
          <span className="text-[10px] text-slate-500">
            ({parsedData.rows.length} rows)
          </span>
        </div>
        <button
          onClick={handleDownload}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 bg-[#1e1e2e] z-10">
            <tr>
              <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-400 border-b border-slate-700 bg-[#1e1e2e] w-10">
                #
              </th>
              {parsedData.headers.map((header, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-left text-[10px] font-bold text-slate-300 border-b border-slate-700 bg-[#1e1e2e] min-w-[100px]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsedData.rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-800/30 transition">
                <td className="px-3 py-1.5 text-[10px] text-slate-500 font-mono border-b border-slate-800/50">
                  {rowIdx + 1}
                </td>
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="px-3 py-1.5 text-slate-300 border-b border-slate-800/50 max-w-[300px] truncate"
                    title={cell}
                  >
                    {cell}
                  </td>
                ))}
                {/* Fill empty cells if row is shorter than headers */}
                {row.length < parsedData.headers.length &&
                  Array.from({ length: parsedData.headers.length - row.length }).map((_, i) => (
                    <td key={`empty-${i}`} className="px-3 py-1.5 border-b border-slate-800/50" />
                  ))}
              </tr>
            ))}
          </tbody>
        </table>

        {parsedData.rows.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500">
            <Table className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs">No data to display</span>
          </div>
        )}
      </div>
    </div>
  );
};
