/** @jsxRuntime classic */
/** @jsx React.createElement */
// @ts-expect-error React type declarations are unavailable in this project.
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ShieldAlert, X, Radio, Bell, ArrowRight, ShieldCheck } from 'lucide-react';

interface HaltOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmHalt: (reason: string) => void;
}

const HALT_REASONS = [
  'Weighbridge Sensor Recalibration & Zero-Point Error Check',
  'Severe Weather Alert / Heavy Rain in APMC Yard',
  'Grain Silo Intake Buffer Over-Capacity (Immediate Hold)',
  'e-NAM National Server Scheduled Synchronization Pause',
];

export const HaltOperationsModal: React.FC<HaltOperationsModalProps> = ({
  isOpen,
  onClose,
  onConfirmHalt,
}: HaltOperationsModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string>(HALT_REASONS[0]);
  const [broadcastSms, setBroadcastSms] = useState<boolean>(true);
  const [confirmInput, setConfirmInput] = useState<string>('');

  if (!isOpen) return null;

  // @ts-ignore React JSX runtime declarations are unavailable in this project.
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border-2 border-red-500 overflow-hidden flex flex-col"
        >
          {/* Top Red Hazard Banner */}
          <div className="bg-red-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-700 flex items-center justify-center text-white border border-red-400">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif-gov text-base font-bold text-white tracking-tight">
                  HALT OPERATIONS (Mandi Kill Switch)
                </h3>
                <p className="text-xs text-red-100">
                  APMC Madhubani Command Emergency Interlock
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-red-100 hover:text-white hover:bg-red-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-4 text-xs text-slate-700">
            <div className="bg-red-50 p-3.5 rounded-xl border border-red-200 text-red-900">
              <p className="font-semibold text-xs leading-relaxed">
                <strong>CRITICAL WARNING:</strong> Activating this emergency protocol will immediately freeze gate Entry barriers, suspend automated weighbridge weighing, and hold 184 registered incoming vehicles at perimeter buffers.
              </p>
            </div>

            {/* Select Reason */}
            <div>
              <label className="font-bold text-slate-800 uppercase tracking-wider block mb-2">
                1. Select Official Reason for Halt:
              </label>
              <div className="space-y-2">
                {HALT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      selectedReason === reason
                        ? 'border-red-500 bg-red-50/70 text-slate-900 font-medium'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="haltReason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="mt-0.5 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Farmer PWA Broadcast Option */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">Broadcast Alert to Farmer PWAs</span>
                  <span className="text-[11px] text-slate-500">Send instant holding instructions to all 184 active farmer tokens</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={broadcastSms}
                onChange={(e: { target: { checked: boolean } }) => setBroadcastSms(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              id="confirm-kill-switch-btn"
              onClick={() => onConfirmHalt(selectedReason)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>ENGAGE KILL SWITCH & PAUSE MANDI</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
