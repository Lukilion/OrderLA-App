import React, { useState, useRef } from 'react';
import { OrderLaLogo } from './OrderLaLogo';
import { 
  X, 
  Download, 
  Upload, 
  RefreshCw, 
  Database, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Monitor, 
  Globe, 
  Layers
} from 'lucide-react';
import { WholesaleItem, Language } from '../types';
import { getStoredUsers } from '../utils/authManager';

interface BackupUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  items: WholesaleItem[];
  onRestoreItems: (newItems: WholesaleItem[]) => void;
  onMergeItems: (mergedItems: WholesaleItem[]) => void;
  onToast: (msg: string) => void;
}

export const BackupUpdateModal: React.FC<BackupUpdateModalProps> = ({
  isOpen,
  onClose,
  language,
  items,
  onRestoreItems,
  onMergeItems,
  onToast
}) => {
  const isUrdu = language === 'ur';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'platforms'>('export');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<{ count: number; date?: string } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  if (!isOpen) return null;

  // 1. Export Complete Backup JSON
  const handleExportBackup = () => {
    try {
      const backupData = {
        version: '1.2.0',
        exportedAt: new Date().toISOString(),
        appName: 'OrderLA Wholesale BOS',
        itemCount: items.length,
        items: items,
        users: getStoredUsers().map(u => ({ ...u, password: '***' }))
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `OrderLA_Wholesale_Backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onToast(isUrdu ? 'بیک اپ فائل کامیابی کے ساتھ ڈاؤن لوڈ ہو گئی!' : 'Backup file downloaded successfully!');
    } catch {
      onToast(isUrdu ? 'بیک اپ ڈاؤن لوڈ کرنے میں غلطی ہوئی!' : 'Failed to export backup!');
    }
  };

  // 2. Handle File Selection for Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        
        let loadedItems: WholesaleItem[] = [];
        if (Array.isArray(parsed)) {
          loadedItems = parsed;
        } else if (parsed && Array.isArray(parsed.items)) {
          loadedItems = parsed.items;
        } else {
          throw new Error('Invalid backup format: items array not found');
        }

        setFilePreview({
          count: loadedItems.length,
          date: parsed.exportedAt || undefined
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid JSON file';
        setParseError(message);
        setFilePreview(null);
      }
    };
    reader.readAsText(file);
  };

  // 3. Process Import (Merge or Replace)
  const handleProcessImport = (mode: 'merge' | 'replace') => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        let loadedItems: WholesaleItem[] = [];

        if (Array.isArray(parsed)) {
          loadedItems = parsed;
        } else if (parsed && Array.isArray(parsed.items)) {
          loadedItems = parsed.items;
        }

        if (!loadedItems.length) {
          setParseError(isUrdu ? 'فائل میں کوئی کارآمد آئٹمز موجود نہیں ہیں!' : 'No valid items found in file!');
          return;
        }

        if (mode === 'replace') {
          onRestoreItems(loadedItems);
          onToast(isUrdu ? `${loadedItems.length} آئٹمز کی مکمل بحالی مکمل ہو گئی!` : `Full restore completed with ${loadedItems.length} items!`);
        } else {
          onMergeItems(loadedItems);
          onToast(isUrdu ? 'نئے ریٹس اور آئٹمز کو شیٹ میں کامیابی سے اپ ڈیٹ کر دیا گیا!' : 'Catalog rates and items merged successfully!');
        }
        onClose();
      } catch {
        setParseError(isUrdu ? 'فائل پروسیسنگ میں غلطی ہوئی!' : 'Failed to parse JSON file!');
      }
    };
    reader.readAsText(selectedFile);
  };

  // 4. Force Service Worker / Cache Update
  const handleClearCacheAndSync = async () => {
    setIsRefreshing(true);
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.update();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      onToast(isUrdu ? 'کیشے صاف کر دیا گیا۔ اپ ڈیٹ چیک مکمل!' : 'Cache cleared and checked for updates!');
    } catch {
      onToast(isUrdu ? 'اپ ڈیٹ چیک مکمل!' : 'Update check finished!');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl neu-raised-lg rounded-3xl p-4 sm:p-6 text-right max-h-[90vh] flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/5 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <OrderLaLogo variant="icon" size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[var(--text-main)] urdu-title">
                  {isUrdu ? 'بیک اپ اور ڈیٹا اپ ڈیٹ سینٹر' : 'Backup & Data Update Center'}
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]">
                  OrderLa BOS
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                {isUrdu 
                  ? 'بیک اپ ڈاؤن لوڈ کریں، نیا کیٹلاگ درآمد کریں یا اینڈرائیڈ و ڈیسک ٹاپ کے لیے ڈیٹا اپ ڈیٹ کریں۔' 
                  : 'Export backups, update wholesale catalog rates, and sync multi-platform data.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[var(--text-secondary)] hover:text-rose-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 py-3 border-b border-black/5 dark:border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'export'
                ? 'neu-btn active text-[var(--accent-blue)]'
                : 'neu-btn text-[var(--text-main)]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'بیک اپ ڈاؤن لوڈ' : 'Export Backup'}</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'import'
                ? 'neu-btn active text-emerald-500'
                : 'neu-btn text-[var(--text-main)]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'ڈیٹا درآمد و اپ ڈیٹ' : 'Import & Update'}</span>
          </button>

          <button
            onClick={() => setActiveTab('platforms')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'platforms'
                ? 'neu-btn active text-purple-500'
                : 'neu-btn text-[var(--text-main)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'پلیٹ فارمز و ورژنز' : 'Platforms & Build'}</span>
          </button>
        </div>

        {/* Tab 1: Export */}
        {activeTab === 'export' && (
          <div className="flex-1 py-4 space-y-4 overflow-y-auto">
            <div className="p-4 rounded-2xl neu-inset-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[var(--text-main)]">
                  {isUrdu ? 'موجودہ ڈیٹا بیس کی حالت:' : 'Current Database State:'}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]">
                  {items.length} {isUrdu ? 'آئٹمز محفوظ ہیں' : 'Items Stored'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isUrdu
                  ? 'مکمل بیک اپ فائل میں تمام آئٹمز، کیٹیگریز، ریٹس، اسٹاک، ڈیمانڈز اور صارفین کے اختیارات کی تفصیلات شامل ہوں گی۔ اسے ڈاؤن لوڈ کر کے آپ بعد میں کسی بھی وقت دوبارہ اپ ڈیٹ یا بحال کر سکتے ہیں۔'
                  : 'A complete JSON snapshot containing all wholesale products, rates, demand figures, and user configuration.'}
              </p>
            </div>

            <div className="text-center py-3">
              <button
                onClick={handleExportBackup}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl neu-btn-accent text-xs font-black cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition"
              >
                <Download className="w-4 h-4" />
                <span>{isUrdu ? 'مکمل بیک اپ فائل ڈاؤن لوڈ کریں (.JSON)' : 'Download Full Backup (.JSON)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Import / Update */}
        {activeTab === 'import' && (
          <div className="flex-1 py-4 space-y-4 overflow-y-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-2xl neu-inset-sm border-2 border-dashed border-black/10 dark:border-white/10 hover:border-[var(--accent-blue)] transition text-center cursor-pointer space-y-2"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl neu-raised flex items-center justify-center text-[var(--accent-blue)]">
                <FileJson className="w-6 h-6" />
              </div>
              <div className="text-xs font-extrabold text-[var(--text-main)]">
                {selectedFile ? selectedFile.name : (isUrdu ? 'بیک اپ یا اپ ڈیٹ فائل (.json) منتخب کرنے کے لیے یہاں کلک کریں' : 'Click to select JSON backup file')}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {isUrdu ? 'سپورٹ شدہ فارمیٹ: JSON (OrderLA Backup یا Items List)' : 'Supported format: JSON (OrderLA Backup or Items Array)'}
              </p>
            </div>

            {parseError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {filePreview && (
              <div className="p-3.5 rounded-2xl neu-raised space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-500 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isUrdu ? 'فائل کامیابی سے ریڈ ہو گئی!' : 'File read successfully!'}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>{isUrdu ? 'تعداد آئٹمز:' : 'Total Items:'}</span>
                  <span className="font-mono font-bold text-[var(--text-main)]">{filePreview.count}</span>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    onClick={() => handleProcessImport('merge')}
                    className="w-full sm:flex-1 py-2.5 px-3 rounded-2xl neu-btn text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
                    title="Update rates of existing items & add new ones"
                  >
                    {isUrdu ? '🔄 ریٹس اپ ڈیٹ کریں اور ضم کریں (Merge)' : '🔄 Merge & Update Rates'}
                  </button>

                  <button
                    onClick={() => handleProcessImport('replace')}
                    className="w-full sm:flex-1 py-2.5 px-3 rounded-2xl neu-raised text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
                    title="Replace entire catalog"
                  >
                    {isUrdu ? '⚠️ مکمل بحالی (Replace All)' : '⚠️ Full Restore (Replace)'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Multi-Platform Readiness & Cache Sync */}
        {activeTab === 'platforms' && (
          <div className="flex-1 py-3 space-y-3 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl neu-raised text-center space-y-1">
                <Smartphone className="w-5 h-5 mx-auto text-emerald-500" />
                <div className="text-xs font-black text-[var(--text-main)]">Android App</div>
                <div className="text-[10px] text-[var(--text-secondary)]">
                  {isUrdu ? 'Capacitor اندرون /android موجود ہے' : 'Ready in /android folder'}
                </div>
              </div>

              <div className="p-3 rounded-2xl neu-raised text-center space-y-1">
                <Monitor className="w-5 h-5 mx-auto text-[var(--accent-blue)]" />
                <div className="text-xs font-black text-[var(--text-main)]">Desktop App</div>
                <div className="text-[10px] text-[var(--text-secondary)]">
                  {isUrdu ? 'PWA انسٹال یا Electron سپورٹ' : 'Direct PWA or Electron'}
                </div>
              </div>

              <div className="p-3 rounded-2xl neu-raised text-center space-y-1">
                <Globe className="w-5 h-5 mx-auto text-purple-500" />
                <div className="text-xs font-black text-[var(--text-main)]">Web App</div>
                <div className="text-[10px] text-[var(--text-secondary)]">
                  {isUrdu ? 'Vite + React پروڈکشن ریڈی' : 'Vite Production Ready'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl neu-inset-sm space-y-1.5 text-xs text-[var(--text-secondary)]">
              <div className="font-bold text-[var(--text-main)]">
                {isUrdu ? 'ورژن اور سافٹ ویئر کیشے اپ ڈیٹ:' : 'Version & Software Cache:'}
              </div>
              <p className="text-[11px]">
                {isUrdu
                  ? 'اگر آپ نے کوڈ یا سروس ورکر میں تبدیلیاں کی ہیں تو تازہ ترین کوڈ کو حاصل کرنے کے لیے کیشے ریفریش کریں۔'
                  : 'Clear active service worker cache and fetch the latest build assets.'}
              </p>
              <div className="pt-1">
                <button
                  onClick={handleClearCacheAndSync}
                  disabled={isRefreshing}
                  className="px-3.5 py-1.5 rounded-xl neu-btn text-xs font-bold text-[var(--accent-blue)] flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isUrdu ? 'کیشے صاف کریں اور اپ ڈیٹ چیک کریں' : 'Clear Cache & Check Updates'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] text-[var(--text-secondary)] shrink-0">
          <span className="font-mono">OrderLA v1.2.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl neu-btn text-xs font-bold text-[var(--text-main)] cursor-pointer"
          >
            {isUrdu ? 'بند کریں' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
