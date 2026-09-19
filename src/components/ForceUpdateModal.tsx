import React, { useState } from 'react';
import { AppUpdateRelease, Language } from '../types';
import { OrderLaLogo } from './OrderLaLogo';
import { 
  DownloadCloud, 
  ShieldCheck, 
  Sparkles, 
  AlertOctagon, 
  CheckCircle2, 
  ExternalLink,
  Smartphone,
  Monitor,
  Globe,
  Loader2
} from 'lucide-react';
import { 
  APP_CLIENT_VERSION, 
  getPlatformName, 
  pullAndApplyUpdate 
} from '../utils/updateManager';

interface ForceUpdateModalProps {
  isOpen: boolean;
  release: AppUpdateRelease;
  isMandatory: boolean;
  language: Language;
  onToast: (msg: string) => void;
  onDismissOptional?: () => void;
}

export const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({
  isOpen,
  release,
  isMandatory,
  language,
  onToast,
  onDismissOptional
}) => {
  const isUrdu = language === 'ur';
  const platform = getPlatformName();

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [updateFinished, setUpdateFinished] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStartUpdate = async () => {
    setIsUpdating(true);
    setProgressPercent(10);
    setProgressStatus(isUrdu ? 'سرور سے رابطہ ہو رہا ہے...' : 'Connecting to OrderLa servers...');

    try {
      const result = await pullAndApplyUpdate(release, (percent, statusText) => {
        setProgressPercent(percent);
        setProgressStatus(statusText);
      });

      if (result.requiresNativeInstall) {
        setUpdateFinished(true);
        onToast(isUrdu ? 'ڈاؤن لوڈ شروع ہو چکا ہے، نیا ورژن انسٹال کریں!' : 'Download started, please install new version!');
      } else {
        onToast(isUrdu ? 'اپ ڈیٹ مکمل! ایپ ری لوڈ ہو رہی ہے...' : 'Update completed, restarting app...');
      }
    } catch (err) {
      console.error('[Update Gatekeeper] Update failed:', err);
      setIsUpdating(false);
      onToast(isUrdu ? 'اپ ڈیٹ میں خرابی پیش آئی، براہِ کرم دستی لنک آزمائیں۔' : 'Update error, please use manual download link.');
    }
  };

  const getPlatformIcon = () => {
    if (platform === 'android') return <Smartphone className="w-4 h-4 text-emerald-500" />;
    if (platform === 'desktop') return <Monitor className="w-4 h-4 text-[var(--accent-blue)]" />;
    return <Globe className="w-4 h-4 text-purple-500" />;
  };

  const getPlatformLabel = () => {
    if (platform === 'android') return isUrdu ? 'اینڈرائیڈ (Android APK)' : 'Android Application';
    if (platform === 'desktop') return isUrdu ? 'ڈیسک ٹاپ (Windows EXE)' : 'Windows Desktop Executable';
    return isUrdu ? 'ویب براؤزر (Web App)' : 'Web Application';
  };

  return (
    <div 
      id="orderla-force-update-overlay"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div 
        id="orderla-force-update-card"
        className="w-full max-w-lg neu-raised-lg rounded-3xl p-5 sm:p-7 text-right flex flex-col gap-4 overflow-hidden border-2 border-[var(--accent-blue)]/40 shadow-2xl animate-in zoom-in-95 duration-200 bg-[#EDEBF8]"
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <div className="flex items-center gap-3">
            <OrderLaLogo variant="icon" size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] flex items-center gap-1">
                  {getPlatformIcon()}
                  <span>{getPlatformLabel()}</span>
                </span>
                {isMandatory && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" />
                    <span>{isUrdu ? 'لازمی اپ ڈیٹ' : 'Mandatory Update'}</span>
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-black text-[var(--text-main)] urdu-title mt-0.5">
                {isUrdu ? (release.titleUrdu || 'آرڈر لا کی نئی اپ ڈیٹ دستیاب ہے!') : (release.titleEn || 'OrderLa New Update Available!')}
              </h1>
            </div>
          </div>
        </div>

        {/* Version Badge Box */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl neu-inset-sm text-center">
            <div className="text-[10px] font-bold text-[var(--text-secondary)]">
              {isUrdu ? 'آپ کا موجودہ ورژن:' : 'Your Current Version:'}
            </div>
            <div className="text-sm font-mono font-black text-[var(--text-secondary)] mt-0.5">
              v{APP_CLIENT_VERSION}
            </div>
          </div>

          <div className="p-3 rounded-2xl neu-raised text-center border border-[var(--accent-blue)]/30">
            <div className="text-[10px] font-bold text-[var(--accent-blue)] flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{isUrdu ? 'نیا آن لائن ورژن:' : 'Latest Online Version:'}</span>
            </div>
            <div className="text-sm font-mono font-black text-[var(--accent-blue)] mt-0.5">
              v{release.version}
            </div>
          </div>
        </div>

        {/* Release Notes */}
        <div className="p-3.5 rounded-2xl neu-inset-sm space-y-1.5 text-xs text-[var(--text-main)]">
          <div className="font-extrabold text-[var(--text-main)] flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-[var(--text-secondary)]">
              {isUrdu ? 'اس اپ ڈیٹ میں کیا نیا ہے؟' : "What's in this release?"}
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono">
              {release.publishedAt ? new Date(release.publishedAt).toLocaleDateString() : 'Live'}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
            {isUrdu ? release.notesUrdu : release.notesEn}
          </p>
        </div>

        {/* DATA SAFETY GUARANTEE BADGE */}
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-semibold flex items-start gap-2.5 text-right">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-snug">
            <div className="font-black text-emerald-700">
              {isUrdu ? 'ڈیٹا کے مکمل تحفظ کی ضمانت:' : 'Data Protection Guarantee:'}
            </div>
            <div className="text-[11px] text-emerald-800/90 font-medium">
              {isUrdu 
                ? 'اپ ڈیٹ کے دوران آپ کے تمام شامل کردہ آئٹمز، نئے ریٹس، محفوظ شدہ آرڈرز اور زیرِ کار ڈیمانڈ شیٹ 100% محفوظ رہیں گے۔ کوئی ڈیٹا ڈیلیٹ نہیں ہوگا۔'
                : 'All custom items, wholesale catalog rates, saved orders, and active draft demand forms are fully preserved. Nothing will be lost.'}
            </div>
          </div>
        </div>

        {/* Progress Display */}
        {isUpdating && (
          <div className="p-3.5 rounded-2xl neu-inset-sm space-y-2 text-right">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-main)]">
              <span className="font-mono text-[var(--accent-blue)]">{progressPercent}%</span>
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-blue)]" />
                <span>{progressStatus}</span>
              </span>
            </div>
            <div className="w-full h-3 bg-black/10 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-[var(--accent-blue)] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Update Finished Notice (If Native APK/EXE Download was opened) */}
        {updateFinished && (
          <div className="p-3 rounded-2xl bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/30 text-[var(--accent-blue)] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {isUrdu 
                ? 'ڈاؤن لوڈ پیج براؤزر میں کھول دیا گیا ہے۔ فائل مکمل ہوتے ہی انسٹال کریں!' 
                : 'Download link opened. Run the new installer over your existing app to finish updating.'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          {!updateFinished ? (
            <button
              id="btn-pull-and-apply-update"
              onClick={handleStartUpdate}
              disabled={isUpdating}
              className="w-full py-3.5 px-4 rounded-2xl neu-btn-accent text-xs font-black cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2 text-white bg-[var(--accent-blue)]"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isUrdu ? 'اپ ڈیٹ لاگو ہو رہی ہے...' : 'Applying Update...'}</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4" />
                  <span>
                    {isUrdu ? 'اپ ڈیٹ حاصل کریں اور ابھی لگائیں (Update Now)' : 'Get & Pull Online Update Now'}
                  </span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 rounded-2xl neu-btn-accent text-xs font-black cursor-pointer shadow flex items-center justify-center gap-2 text-white bg-emerald-600"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isUrdu ? 'ایپ کو دوبارہ شروع کریں (Restart App)' : 'Restart Application'}</span>
            </button>
          )}

          {/* Direct Installer Download Link (Secondary Option) */}
          <div className="flex items-center justify-center gap-3 pt-1">
            {platform === 'android' && release.apkDownloadUrl && (
              <a
                href={release.apkDownloadUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-[var(--accent-blue)] hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>{isUrdu ? 'براہِ راست نیا APK ڈاؤن لوڈ کریں' : 'Download Latest APK File'}</span>
              </a>
            )}

            {platform === 'desktop' && release.exeDownloadUrl && (
              <a
                href={release.exeDownloadUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-[var(--accent-blue)] hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>{isUrdu ? 'نیا Windows EXE انسٹالر ڈاؤن لوڈ کریں' : 'Download Latest Windows EXE'}</span>
              </a>
            )}

            {!isMandatory && onDismissOptional && !isUpdating && (
              <button
                onClick={onDismissOptional}
                className="text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer"
              >
                {isUrdu ? 'بعد میں یاد دلائیں' : 'Remind me later'}
              </button>
            )}
          </div>
        </div>

        {/* Blocking Security Footer */}
        {isMandatory && (
          <div className="text-center text-[10px] text-rose-500/80 font-bold border-t border-black/5 pt-2">
            {isUrdu 
              ? 'سیکیورٹی اور ڈیٹا مطابقت کے لیے اس اپ ڈیٹ کو مکمل کرنا لازمی ہے۔' 
              : 'This update is mandatory for security and database synchronization.'}
          </div>
        )}
      </div>
    </div>
  );
};
