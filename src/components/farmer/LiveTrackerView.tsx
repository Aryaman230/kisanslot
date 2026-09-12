// @ts-nocheck
/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
// React typings are not available in the current project configuration.
// @ts-ignore — keep this component buildable until @types/react is installed.
import React, { useState } from 'react';
import {
  ArrowLeft,
  QrCode,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  Share2,
  Download,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { FarmerRecord } from '../../types';

interface LiveTrackerViewProps {
  farmerData: FarmerRecord;
  onBack: () => void;
  onAdvanceQueue?: () => void;
  queueServingToken?: string;
  queueNextToken?: string;
  isHalted?: boolean;
}

export const LiveTrackerView = ({
  farmerData,
  onBack,
  onAdvanceQueue,
  queueServingToken = 'A119',
  queueNextToken = 'A120',
  isHalted = false,
}: LiveTrackerViewProps) => {
  // Stepper state for interactive demonstration: 1 = Gate Entry Completed, 2 = Quality Check Pulsing Amber, 3 = DBT Cleared
  const [stepperStage, setStepperStage] = useState<number>(2);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const advanceWorkflow = () => {
    if (stepperStage === 1) setStepperStage(2);
    else if (stepperStage === 2) setStepperStage(3);
    else setStepperStage(1);
  };

  const handleShare = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping" />
            Live Gate Pass
          </span>
          <button
            onClick={advanceWorkflow}
            title="Simulate advancing e-NAM workflow stages"
            className="flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded border border-slate-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-[#2563EB]" />
            <span className="hidden sm:inline">Simulate Stage</span>
          </button>
        </div>
      </div>

      {/* Emergency Halt Banner if triggered */}
      {isHalted && (
        <div className="p-3 bg-amber-500 text-white rounded-xl text-xs flex items-center justify-between font-bold animate-pulse shadow-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>APMC Gate Notice: Mandi intake is paused temporarily. Hold vehicle at Buffer Zone B.</span>
          </div>
        </div>
      )}

      {/* 1. DIGITAL QR GATE PASS (OFFICIAL E-PARCHI) */}
      <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-md overflow-hidden relative">
        {/* Official Header Strip */}
        <div className="bg-[#1E3A8A] text-white px-4 py-2.5 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-400 text-slate-900 font-serif font-black text-xs flex items-center justify-center shadow-xs">
              GOI
            </div>
            <div>
              <div className="font-serif-gov text-xs font-bold tracking-tight">
                APMC Madhubani • e-NAM Digital Parchi
              </div>
              <div className="text-[10px] text-blue-200">
                Govt of India Electronic Gate Pass
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold bg-blue-950/70 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded">
            Aadhar VERIFIED
          </span>
        </div>

        {/* Pass Details */}
        <div className="p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Token Number
              </span>
              <div className="font-serif-gov text-3xl font-black text-[#2563EB] tracking-tight">
                {farmerData.token}
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5">
                {farmerData.farmerName} ({farmerData.farmerNameHi})
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Vehicle: {farmerData.vehicleNumber}
              </div>
            </div>

            {/* Official QR Code & Barcode Canvas */}
            <div className="flex flex-col items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="w-24 h-24 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center relative shadow-inner">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                  <rect x="5" y="5" width="26" height="26" rx="3" fill="#0F172A" />
                  <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
                  <rect x="13" y="13" width="10" height="10" rx="1" fill="#2563EB" />
                  <rect x="69" y="5" width="26" height="26" rx="3" fill="#0F172A" />
                  <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
                  <rect x="77" y="13" width="10" height="10" rx="1" fill="#2563EB" />
                  <rect x="5" y="69" width="26" height="26" rx="3" fill="#0F172A" />
                  <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
                  <rect x="13" y="77" width="10" height="10" rx="1" fill="#2563EB" />
                  <rect x="36" y="8" width="6" height="6" fill="#0F172A" />
                  <rect x="46" y="8" width="6" height="6" fill="#2563EB" />
                  <rect x="56" y="8" width="6" height="6" fill="#0F172A" />
                  <rect x="36" y="20" width="6" height="6" fill="#0F172A" />
                  <rect x="46" y="24" width="6" height="6" fill="#0F172A" />
                  <rect x="56" y="18" width="6" height="6" fill="#2563EB" />
                  <rect x="12" y="38" width="8" height="8" fill="#0F172A" />
                  <rect x="26" y="42" width="6" height="6" fill="#2563EB" />
                  <rect x="36" y="36" width="10" height="6" fill="#0F172A" />
                  <rect x="52" y="38" width="8" height="8" fill="#0F172A" />
                  <rect x="66" y="36" width="6" height="10" fill="#2563EB" />
                  <rect x="78" y="40" width="8" height="6" fill="#0F172A" />
                  <rect x="10" y="52" width="6" height="8" fill="#2563EB" />
                  <rect x="22" y="56" width="8" height="6" fill="#0F172A" />
                  <rect x="36" y="50" width="12" height="6" fill="#0F172A" />
                  <rect x="54" y="54" width="6" height="8" fill="#2563EB" />
                  <rect x="68" y="52" width="10" height="6" fill="#0F172A" />
                  <rect x="84" y="52" width="6" height="10" fill="#0F172A" />
                  <rect x="36" y="68" width="6" height="8" fill="#2563EB" />
                  <rect x="48" y="72" width="10" height="6" fill="#0F172A" />
                  <rect x="64" y="68" width="8" height="8" fill="#2563EB" />
                  <rect x="78" y="74" width="8" height="6" fill="#0F172A" />
                  <rect x="36" y="82" width="10" height="6" fill="#0F172A" />
                  <rect x="52" y="84" width="8" height="6" fill="#2563EB" />
                  <rect x="68" y="82" width="6" height="8" fill="#0F172A" />
                  <rect x="80" y="84" width="10" height="6" fill="#0F172A" />
                </svg>
              </div>
              <span className="text-[9px] font-mono text-slate-400 mt-1">SCAN AT WEIGHBRIDGE</span>
            </div>
          </div>

          {/* Key Parchi Specs */}
          <div className="grid grid-cols-3 gap-2 bg-[#F8FAFC] p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Produce</span>
              <span className="font-serif-gov font-bold text-slate-800">
                {farmerData.crop}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Est. Yield</span>
              <span className="font-serif-gov font-bold text-[#2563EB]">
                {farmerData.yieldQtl} Qtl
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Mandi Gate</span>
              <span className="font-serif-gov font-bold text-slate-800">
                {farmerData.assignedGate}
              </span>
            </div>
          </div>

          {/* Print / Share Buttons */}
          <div className="flex gap-2 pt-1 text-xs">
            <button
              onClick={handleShare}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedNotification ? 'Link Copied!' : 'Share Pass'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CRUCIAL: LIVE QUEUE VISUALIZATION */}
      <div className="bg-linear-to-b from-slate-900 to-[#0F172A] text-white rounded-2xl p-4 shadow-lg border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-serif-gov text-xs font-bold text-amber-300 uppercase tracking-wider">
              Live Mandi Queue Movement
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Gate 02 Active Dock
          </span>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
          <div className="grid grid-cols-3 gap-2 items-center text-center">
            {/* 1. Currently Serving */}
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-emerald-500/40 relative">
              <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 block mb-0.5">
                Currently Serving
              </span>
              <div className="font-serif-gov text-xl font-black text-white">
                {queueServingToken}
              </div>
              <span className="text-[9px] text-slate-400 block truncate">
                At Weighbridge
              </span>
            </div>

            {/* Transition Arrow 1 */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-[9px] text-slate-400 font-mono mt-0.5">Next</span>
            </div>

            {/* 2. Up Next */}
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-amber-500/50 relative">
              <span className="text-[9px] uppercase font-bold tracking-wider text-amber-400 block mb-0.5">
                Up Next
              </span>
              <div className="font-serif-gov text-xl font-black text-white">
                {queueNextToken}
              </div>
              <span className="text-[9px] text-amber-200 block truncate">
                Dock Approach
              </span>
            </div>
          </div>

          {/* Large Highlighted 'Your Token' Section */}
          <div className="mt-3 pt-3 border-t border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-serif text-white font-bold text-xs shadow-xs">
                YOU
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Your Slot Token
                </span>
                <span className="font-serif-gov text-base font-black text-amber-400">
                  {farmerData.token}
                </span>
              </div>
            </div>

            {/* ---> MAGIC HAPPENS HERE: Dynamic Queue Logic <--- */}
            <div className="text-right">
              {(() => {
                const currentTokenNum = parseInt(queueServingToken.replace(/\D/g, '')) || 0;
                const myTokenNum = parseInt(farmerData.token.replace(/\D/g, '')) || 0;
                const aheadCount = Math.max(0, myTokenNum - currentTokenNum - 1);
                
                const minWait = Math.floor(aheadCount * 2.5);
                const maxWait = Math.ceil(aheadCount * 3.1);

                return (
                  <>
                    <span className="text-xs font-bold text-emerald-400 block">
                      {aheadCount > 0 ? `~${aheadCount} Vehicles Ahead` : 'Your Turn Next!'}
                    </span>
                    <span className="text-[10px] text-slate-300">
                      {aheadCount > 0 ? `Est. Wait: ${minWait} - ${maxWait} mins` : 'Please approach dock'}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Live Queue Progress Ticker & Advance Simulator */}
        <div className="mt-3 flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Dock Bay 04 Unloading at Standard Pace</span>
          </div>

          {onAdvanceQueue && (
            <button
              onClick={onAdvanceQueue}
              className="text-[11px] font-semibold text-[#60A5FA] hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded border border-slate-700 transition-colors"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Simulate Next Turn</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. VERTICAL E-NAM STEPPER */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-serif-gov text-sm font-bold text-slate-900 flex items-center gap-2">
              e-NAM Gateway Progression
              <span className="text-[10px] font-sans font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Step {stepperStage} of 3
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              National Agriculture Market Automated Clearing System
            </p>
          </div>
          <ShieldCheck className="w-5 h-5 text-blue-600" />
        </div>

        <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {/* STEP 1: Gate Entry Completed */}
          <div className="relative flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif-gov text-xs font-bold text-slate-900">
                  1. Gate Entry Completed
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  08:14 AM
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Aadhar scanned at Gate 02. Gross vehicle weighbridge weight recorded: 3,420 kg.
              </p>
            </div>
          </div>

          {/* STEP 2: e-NAM Quality Check */}
          <div className="relative flex items-start gap-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm transition-all ${
                stepperStage >= 2
                  ? 'bg-amber-500 text-white ring-4 ring-amber-200 animate-pulse'
                  : 'bg-slate-300 text-slate-600'
              }`}
            >
              {stepperStage > 2 ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </div>
            <div
              className={`flex-1 p-3 rounded-xl border transition-all ${
                stepperStage >= 2
                  ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif-gov text-xs font-bold text-slate-900">
                    2. e-NAM Quality Check
                  </span>
                  {stepperStage === 2 && (
                    <span className="text-[9px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded animate-pulse">
                      In Assay Lab
                    </span>
                  )}
                  {stepperStage > 2 && (
                    <span className="text-[9px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                      Passed Grade A
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500">
                  Assay Bay 2
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-amber-200/60 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Moisture Sensor</span>
                  <span className="font-bold text-slate-900">
                    {farmerData.moisturePercent || 11.8}% (Max Allowed: 12%)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Grain Purity</span>
                  <span className="font-bold text-emerald-700">
                    {farmerData.purityPercent || 99.2}% (Grade A Export)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Direct Bank Transfer (DBT) */}
          <div className="relative flex items-start gap-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm transition-all ${
                stepperStage >= 3
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-200'
                  : 'bg-slate-200 text-slate-400'
              }`}
            >
              {stepperStage >= 3 ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              )}
            </div>
            <div
              className={`flex-1 p-3 rounded-xl border transition-all ${
                stepperStage >= 3
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif-gov text-xs font-bold text-slate-900">
                  3. Direct Bank Transfer (DBT)
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    stepperStage >= 3
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {stepperStage >= 3 ? 'PAID & CREDITED' : 'Pending Clearance'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Aadhaar Payment Bridge: Payout of{' '}
                <strong className="font-serif-gov text-slate-900">
                  ₹{(farmerData.dbtAmount || 102375).toLocaleString('en-IN')}
                </strong>{' '}
                to Bank of India A/c ending in ••••8841.
              </p>
              {stepperStage >= 3 && (
                <div className="mt-2 text-[10px] font-mono text-emerald-800 bg-white p-1.5 rounded border border-emerald-200">
                  UTR: eNAM-DBT-2026-94829104 • Clearance Timestamp: Today, 08:35 AM
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};