/* @jsxRuntime classic */
// React is provided by the runtime, but this project does not currently ship its type declarations.
// @ts-ignore TS7016: react is intentionally resolved from the runtime package.
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Maximize2,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Building2,
  Copy,
  Check,
  Sun,
  Volume2,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { FarmerRecord } from '../../types';
import { TokenQRCode } from '../common/TokenQRCode';

interface FullScreenQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerData: FarmerRecord;
  onOpenBookingModal?: () => void;
}

export const FullScreenQRModal = ({
  isOpen,
  onClose,
  farmerData,
  onOpenBookingModal,
}: FullScreenQRModalProps) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [simulatedScan, setSimulatedScan] = useState<boolean>(false);
  const [brightnessBoost, setBrightnessBoost] = useState<boolean>(true);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyDetails = () => {
    const passText = `APMC MADHUBANI GATE PASS\nToken: ${farmerData.token}\nFarmer: ${farmerData.farmerName}\nProduce: ${farmerData.crop} (${farmerData.yieldQtl} Qtl)\nGate: ${farmerData.assignedGate}\nVehicle: ${farmerData.vehicleNumber}\nSlot: ${farmerData.slotTime}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(passText).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    // Play an authentic scanner beep via Web Audio API
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // High C
        osc.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.08); // High E
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Audio context might be restricted before user interaction
    }

    setSimulatedScan(true);
    setTimeout(() => setSimulatedScan(false), 3500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col border transition-all ${
            brightnessBoost ? 'bg-white border-blue-400' : 'bg-slate-900 border-slate-700 text-white'
          }`}
        >
          {/* Institutional Top Header */}
          <div className="bg-[#1E3A8A] text-white px-5 py-3.5 flex items-center justify-between border-b border-blue-900">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-900 font-serif font-black text-xs flex items-center justify-center shadow-xs">
                GOI
              </div>
              <div>
                <div className="font-serif-gov text-sm font-bold tracking-tight flex items-center gap-1.5">
                  <span>Mandi Gate Scanner Mode</span>
                  <span className="text-[10px] bg-blue-700 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-300/30">
                    FULLSCREEN
                  </span>
                </div>
                <div className="text-[11px] text-blue-200">
                  APMC Madhubani • e-NAM Optical Gate Pass
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              id="btn-close-fullscreen-qr"
              aria-label="Close QR Fullscreen"
              className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800/80 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body with Laser QR Centerpiece */}
          <div className="p-5 sm:p-6 flex flex-col items-center text-center space-y-4">
            {/* Sunlight / Scanner Brightness Hint */}
            <div className="w-full flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-medium">Max contrast for optical gate laser</span>
              </div>
              <button
                onClick={() => setBrightnessBoost(!brightnessBoost)}
                className="text-[11px] font-semibold text-[#2563EB] hover:underline"
              >
                {brightnessBoost ? 'Dark Preview' : 'Sunlight Mode'}
              </button>
            </div>

            {/* Huge QR Code Frame with Animated Scanner Beam */}
            <div className="relative p-4 bg-white rounded-2xl border-2 border-blue-500 shadow-xl flex flex-col items-center">
              {/* Corner scan brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#2563EB]" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#2563EB]" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#2563EB]" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#2563EB]" />

              {/* Dynamic QR Code */}
              <div className="relative overflow-hidden rounded-lg">
                <TokenQRCode
                  token={farmerData.token}
                  size={240}
                  showCenterBadge={true}
                  className="shadow-2xs"
                />

                {/* Animated Horizontal Laser Scan Beam */}
                <motion.div
                  animate={{ y: [0, 230, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#2563EB] to-transparent opacity-90 pointer-events-none shadow-[0_0_12px_#2563EB]"
                />
              </div>

              {/* Token ID Callout */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Gate Token:
                </span>
                <span className="font-serif-gov text-2xl font-black text-[#2563EB] tracking-tight">
                  {farmerData.token}
                </span>
              </div>
            </div>

            {/* Live Scan Status Notification if simulated */}
            {simulatedScan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-emerald-50 border border-emerald-300 text-emerald-800 p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 font-semibold shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Gate 2 Scanner Acknowledged • Weigher Entry Permitted!</span>
              </motion.div>
            )}

            {/* Essential Gate Officer Clearance Details */}
            <div className="w-full bg-slate-50 rounded-2xl p-3 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                    Farmer & ID
                  </span>
                  <span className="font-bold text-slate-900">
                    {farmerData.farmerName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                    Assigned Gate
                  </span>
                  <span className="font-bold text-[#2563EB]">
                    {farmerData.assignedGate}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Crop</span>
                  <span className="font-medium text-slate-800">{farmerData.crop}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Est. Yield</span>
                  <span className="font-medium text-slate-800">{farmerData.yieldQtl} Qtl</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Vehicle</span>
                  <span className="font-mono text-slate-800 font-semibold truncate block">
                    {farmerData.vehicleNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleSimulateScan}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-50 text-[#2563EB] hover:bg-blue-100 font-semibold text-xs border border-blue-200 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>Simulate Gate Beep</span>
              </button>

              <button
                type="button"
                onClick={handleCopyDetails}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold text-xs border transition-colors ${
                  copied
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Pass' : 'Copy Pass Text'}</span>
              </button>
            </div>

            {/* Optional shortcut to modify/re-book */}
            {onOpenBookingModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBookingModal();
                }}
                className="text-xs text-[#2563EB] hover:underline font-medium flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Need to adjust yield or vehicle? Open Booking Form</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
