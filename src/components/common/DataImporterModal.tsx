/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Dynamic Data Importer Modal (Upload CSV / JSON)
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { parseImportedData } from '../../utils/importData';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Download } from 'lucide-react';

interface DataImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataImporterModal: React.FC<DataImporterModalProps> = ({ isOpen, onClose }) => {
  const setInitialResources = useStore((state) => state.setInitialResources);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseStatus, setParseStatus] = useState<{
    success?: boolean;
    count?: number;
    error?: string;
    previewCount?: number;
  }>({});
  const [rawText, setRawText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      const result = parseImportedData(content, file.name);

      if (result.success) {
        setParseStatus({
          success: true,
          count: result.count,
          previewCount: Math.min(result.count, 5)
        });
      } else {
        setParseStatus({
          success: false,
          error: result.error
        });
      }
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!rawText || !fileName) return;

    const result = parseImportedData(rawText, fileName);
    if (result.success && result.resources.length > 0) {
      setInitialResources(result.resources);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden"
        >
          <div className="flex justify-between items-start pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600/10 border border-indigo-500/30 rounded-xl text-indigo-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg">Dynamic Data Importer</h3>
                <p className="text-xs text-slate-400">
                  Upload custom JSON or CSV billing files to dynamically update all charts and analytics.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-700 bg-slate-950/50 hover:border-slate-600'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <FileText className="w-10 h-10 text-indigo-400 animate-bounce" />

            <div>
              <p className="font-bold text-white text-sm">
                {fileName ? fileName : 'Click to browse or drop file here'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports <span className="text-cyan-400 font-mono">.JSON</span> arrays or <span className="text-cyan-400 font-mono">.CSV</span> with headers (`name`, `provider`, `hourlyCost`, `totalSpend`, `status`, `costCenter`)
              </p>
            </div>
          </div>

          {/* Parse Result Feedback */}
          {parseStatus.success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Parsed {parseStatus.count} valid billing line items successfully!</span>
              </div>
              <span className="text-emerald-400 font-mono font-semibold">Ready to Import</span>
            </div>
          )}

          {parseStatus.success === false && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-2 text-xs text-red-300 font-semibold">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{parseStatus.error}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex justify-end items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              disabled={!parseStatus.success}
              onClick={handleConfirmImport}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                parseStatus.success
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/30 cursor-pointer'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import Dataset ({parseStatus.count || 0} Assets)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
