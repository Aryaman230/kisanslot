/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
/** @jsxRuntime classic */

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// React types are provided by the project's eventual type dependencies.
// Suppress the module-declaration diagnostic until those dependencies are installed.
// @ts-ignore TS7016: React has no declaration file in this environment.
import React, { useState, useEffect } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}

import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Languages,
  ChevronRight,
  AlertCircle,
  Truck,
  Volume2,
  CheckCircle,
  Copy,
  Check,
  Maximize2,
  QrCode,
  Bell,
  BellRing,
  BellOff,
  X,
} from 'lucide-react';
import { FarmerRecord, MandiCapacity } from '../../types';
import { SmartBookingModal } from './SmartBookingModal';
import { BhashiniVoiceModal } from './BhashiniVoiceModal';
import { LiveTrackerView } from './LiveTrackerView';
import { TokenQRCode } from '../common/TokenQRCode';
import { FullScreenQRModal } from './FullScreenQRModal';

interface FarmerAppProps {
  farmerData: FarmerRecord;
  onUpdateFarmerData: (updated: Partial<FarmerRecord>) => void;
  mobileViewMode: 'phone' | 'full';
  queueServingToken: string;
  queueNextToken: string;
  onAdvanceQueue: () => void;
  isHalted: boolean;
  mandiCapacity?: MandiCapacity;
}

interface NotificationAlert {
  id: string;
  title: string;
  body: string;
  time: string;
  isUrgent?: boolean;
}

interface BookingDetails {
  crop: string;
  yieldQtl: number;
  gate: string;
  slotTime: string;
}

interface EstimatedWaitInfo {
  label: string;
  detail: string;
  badgeClass: string;
  vehiclesAhead: number;
}

interface AudioContextWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export const FarmerApp: React.FC<FarmerAppProps> = ({
  farmerData,
  onUpdateFarmerData,
  mobileViewMode,
  queueServingToken,
  queueNextToken,
  onAdvanceQueue,
  isHalted,
  mandiCapacity,
}: FarmerAppProps) => {
  const [currentTab, setCurrentTab] = useState<'home' | 'tracker'>('home');
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isFullScreenQROpen, setIsFullScreenQROpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [copiedBooking, setCopiedBooking] = useState<boolean>(false);
  const [notifyGateReady, setNotifyGateReady] = useState<boolean>(false);
  const [activeNotificationAlert, setActiveNotificationAlert] = useState<{
    id: string;
    title: string;
    body: string;
    time: string;
    isUrgent?: boolean;
  } | null>(null);

  const getNumericToken = (tok: string): number => {
    const digits = tok.replace(/\D/g, '');
    return digits ? parseInt(digits, 10) : 0;
  };

  const playAlertChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.setValueAtTime(987.77, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {}
  };

  const triggerGateReadyAlert = (bodyText?: string, isUrgent = false) => {
    playAlertChime();
    triggerHaptic([35, 50, 35]);

    const title = `APMC Madhubani • Gate ${farmerData.assignedGate || '2'} Ready`;
    const body =
      bodyText ||
      `Token ${farmerData.token} is now approaching the front of the queue! Vehicle ${farmerData.vehicleNumber} may now proceed to weighbridge.`;

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, { body, icon: '/favicon.ico' });
        } catch {}
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission()
          .then((perm) => {
            if (perm === 'granted') {
              try {
                new Notification(title, { body });
              } catch {}
            }
          })
          .catch(() => {});
      }
    }

    setActiveNotificationAlert({
      id: Date.now().toString(),
      title,
      body,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUrgent,
    });
  };

  useEffect(() => {
    if (!notifyGateReady) return;

    const servingNum = getNumericToken(queueServingToken);
    const farmerNum = getNumericToken(farmerData.token);
    const remaining = farmerNum - servingNum;

    if (remaining <= 3 && remaining >= 0) {
      triggerGateReadyAlert(
        `Token ${farmerData.token} is ${
          remaining === 0 ? 'NOW BEING CALLED' : `only ${remaining} vehicle away`
        } at ${farmerData.assignedGate}! Prepare vehicle ${farmerData.vehicleNumber}.`,
        true
      );
    }
  }, [queueServingToken, notifyGateReady]);

  useEffect(() => {
    if (!activeNotificationAlert) return;
    const timer = setTimeout(() => {
      setActiveNotificationAlert(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [activeNotificationAlert]);

  const handleToggleNotifyGateReady = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(25);

    const nextState = !notifyGateReady;
    setNotifyGateReady(nextState);

    if (nextState) {
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'default'
      ) {
        Notification.requestPermission().catch(() => {});
      }

      const servingNum = getNumericToken(queueServingToken);
      const farmerNum = getNumericToken(farmerData.token);
      const remaining = farmerNum - servingNum;

      if (remaining <= 8 && remaining >= 0) {
        triggerGateReadyAlert(
          `Gate Alert Armed: Token ${farmerData.token} is near the front (${remaining} vehicles ahead). You'll receive live browser alerts for Gate 2.`,
          remaining <= 3
        );
      } else {
        triggerGateReadyAlert(
          `Gate Alert Armed: Browser Notification active! You will be alerted as soon as Token ${farmerData.token} nears the front of the queue.`
        );
      }
    } else {
      setActiveNotificationAlert(null);
    }
  };

  const defaultCapacity: MandiCapacity = {
    totalDailySlots: 200,
    bookedSlots: 142,
    availableSlots: 58,
    occupancyPercent: 71,
    status: 'Available',
    currentSlotWindow: '10:00 AM - 11:30 AM',
  };

  const effectiveCapacity = mandiCapacity || defaultCapacity;

  const getEstimatedWaitInfo = () => {
    if (isHalted) {
      return {
        label: 'Paused',
        detail: 'Operations halted',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        vehiclesAhead: 0,
      };
    }

    const servingNum = getNumericToken(queueServingToken);
    const farmerNum = getNumericToken(farmerData.token);
    const diff = farmerNum - servingNum;

    if (diff <= 0) {
      return {
        label: 'Ready for Gate',
        detail: 'Token is being called now',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs',
        vehiclesAhead: 0,
      };
    }

    const minMins = Math.max(1, Math.round(diff * 2.2));
    const maxMins = Math.max(minMins + 2, Math.round(diff * 2.8));

    return {
      label: `${minMins} - ${maxMins} mins`,
      detail: `${diff} vehicle${diff > 1 ? 's' : ''} ahead`,
      badgeClass:
        diff <= 3
          ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-2xs'
          : 'bg-blue-50/90 text-[#2563EB] border-blue-200/90 shadow-2xs',
      vehiclesAhead: diff,
    };
  };

  const estimatedWaitInfo = getEstimatedWaitInfo();

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch {}
  };

  const triggerHaptic = (pattern: number | number[] = 28) => {
    if (
      typeof window !== 'undefined' &&
      'navigator' in window &&
      typeof navigator.vibrate === 'function'
    ) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  };

  const handleCopyBookingDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `KISANSLOT MANDI PASS\nToken ID: ${farmerData.token}\nFarmer: ${farmerData.farmerName} (FID-BR-MD782)\nCrop: ${farmerData.crop} (${farmerData.yieldQtl} Qtl)\nMandi: APMC Madhubani\nVehicle: ${farmerData.vehicleType} [${farmerData.vehicleNumber}]\nAssigned Gate: ${farmerData.assignedGate}\nSlot Time: ${farmerData.slotTime}\nStatus: ${farmerData.status}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {
        fallbackCopyText(textToCopy);
      });
    } else {
      fallbackCopyText(textToCopy);
    }
    setCopiedBooking(true);
    setTimeout(() => {
      setCopiedBooking(false);
    }, 2500);
  };

  const handleBookingConfirmed = async (booking: {
    crop: string;
    yieldQtl: number;
    gate: string;
    slotTime: string;
  }) => {
    try {
      await addDoc(collection(db, "slots"), {
        token: 'A127',
        farmerName: 'Ramesh Yadav',
        farmerId: 'FID-BR-MD782',
        crop: booking.crop,
        yieldQtl: booking.yieldQtl,
        assignedGate: booking.gate,
        slotTime: booking.slotTime,
        status: 'Scheduled',
        icarSoilZone: 'Gangetic Alluvial Tract',
        vehicleNumber: 'BR-06-G-4921',
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error saving booking to Firebase: ", e);
    }

    onUpdateFarmerData({
      crop: booking.crop,
      yieldQtl: booking.yieldQtl,
      assignedGate: booking.gate,
      slotTime: booking.slotTime,
      token: 'A127',
      status: 'Scheduled',
    });
    setIsBookingOpen(false);
    setCurrentTab('tracker');
  };

  const handleVoiceBookingConfirmed = async (booking: {
    crop: string;
    yieldQtl: number;
    gate: string;
    slotTime: string;
  }) => {
    try {
      await addDoc(collection(db, "slots"), {
        token: 'A127',
        farmerName: 'Ramesh Yadav',
        farmerId: 'FID-BR-MD782',
        crop: booking.crop,
        yieldQtl: booking.yieldQtl,
        assignedGate: booking.gate,
        slotTime: booking.slotTime,
        status: 'Quality Checking',
        icarSoilZone: 'Gangetic Alluvial Tract',
        vehicleNumber: 'BR-06-G-4921',
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error saving voice booking to Firebase: ", e);
    }

    onUpdateFarmerData({
      crop: booking.crop,
      yieldQtl: booking.yieldQtl,
      assignedGate: booking.gate,
      slotTime: booking.slotTime,
      token: 'A127',
      status: 'Quality Checking',
    });
    setIsVoiceModalOpen(false);
    setCurrentTab('tracker');
  };

  const appContent = (
    <div className="flex flex-col min-h-full bg-[#F8FAFC] text-[#0F172A]">
      <div className="bg-[#1E3A8A] text-white px-4 pt-3.5 pb-4 border-b border-blue-900 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-amber-400 border border-white/20">
              <span className="font-serif">KS</span>
            </div>
            <div>
              <div className="font-serif-gov text-sm font-bold flex items-center gap-1.5">
                <span>KisanSlot</span>
                <span className="text-[11px] font-sans font-normal text-blue-200">
                  (किसान स्लॉट)
                </span>
              </div>
              <p className="text-[10px] text-blue-200 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" /> APMC Madhubani, Bihar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
              className="flex items-center gap-1 text-[11px] font-bold bg-white/10 hover:bg-white/20 px-2 py-1 rounded border border-white/20 transition-colors"
            >
              <Languages className="w-3 h-3 text-amber-400" />
              <span>{language === 'hi' ? 'हिन्दी' : 'ENG'}</span>
            </button>
          </div>
        </div>
      </div>

      {isHalted && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Mandi Influx Temporarily Paused by Secretary</span>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        {currentTab === 'tracker' ? (
          <LiveTrackerView
            farmerData={farmerData}
            onBack={() => setCurrentTab('home')}
            onAdvanceQueue={onAdvanceQueue}
            queueServingToken={queueServingToken}
            queueNextToken={queueNextToken}
            isHalted={isHalted}
          />
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    {language === 'hi' ? 'स्वागत है' : 'Welcome'}
                  </span>
                  <h1 className="font-serif-gov text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Hello, Ramesh Yadav
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    नमस्ते, रमेश यादव • <span className="font-mono text-slate-500">FID-BR-MD782</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <ShieldCheck className="w-3 h-3" /> Aadhaar KYC
                  </span>
                </div>
              </div>

              <div
                onClick={() => setCurrentTab('tracker')}
                className="mt-3.5 bg-blue-50/90 border border-blue-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-blue-100/70 transition-all shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-serif font-black text-xs shadow-xs">
                    {farmerData.token}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block">
                      Active Slot Token: {farmerData.token}
                    </span>
                    <span className="font-serif-gov text-xs font-bold text-slate-900">
                      {farmerData.crop} • {farmerData.yieldQtl} Qtl
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#2563EB]">
                  <span>Track Live</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="bg-slate-100/90 rounded-xl p-2.5 border border-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                <TrendingUp className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Today's Mandi MSP:</span>
              </div>
              <div className="flex gap-2 text-[11px] font-mono">
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold">
                  Wheat: <strong className="text-blue-700">₹2,275</strong>
                </span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold">
                  Mustard: <strong className="text-blue-700">₹5,650</strong>
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md text-center flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-radial from-blue-50/60 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-flex items-center gap-1 mb-2">
                  <Sparkles className="w-3 h-3 text-[#2563EB]" /> भाषिणी वॉइस बुकिंग • Multi-Lingual AI
                </span>
                <h2 className="font-serif-gov text-lg sm:text-xl font-black text-slate-900 mb-1 flex items-center justify-center gap-2">
                  <span>Bhashini Voice AI Booking</span>
                  <Volume2 className="w-5 h-5 text-[#2563EB]" />
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
                  {language === 'hi'
                    ? 'बोलकर तुरंत स्लॉट बुक करें (हिंदी, मैथिली या भोजपुरी में)'
                    : 'Tap microphone and speak in your native dialect to book slot instantly'}
                </p>
              </div>

              <div className="relative my-2 z-10 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.4, 1.7], opacity: [0.5, 0.25, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-32 h-32 rounded-full bg-[#2563EB]/40 pointer-events-none"
                />
                <motion.button
                  id="bhashini-voice-mic-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-linear-to-b from-[#2563EB] to-[#1E3A8A] text-white flex flex-col items-center justify-center shadow-xl shadow-blue-500/30 border-4 border-white cursor-pointer group transition-all"
                >
                  <Mic className="w-12 h-12 sm:w-14 sm:h-14 transition-transform group-hover:scale-110" />
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-1 text-blue-100">
                    TAP & SPEAK
                  </span>
                </motion.button>
              </div>

              <div className="mt-6 z-10 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <span className="text-slate-400">Try saying:</span>
                <span
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 font-medium"
                >
                  "45 क्विंटल गेहूं कल सुबह"
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.div
                id="card-book-slot"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic(28);
                  setIsFullScreenQROpen(true);
                }}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-xl hover:shadow-blue-600/15 cursor-pointer transition-all duration-200 flex flex-col justify-between group relative"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-all shadow-2xs">
                    <Calendar className="w-5 h-5" />
                  </div>

                  <button
                    type="button"
                    id="btn-copy-booking-details"
                    onClick={handleCopyBookingDetails}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all z-10 ${
                      copiedBooking
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-50 hover:bg-blue-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {copiedBooking ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Token {farmerData.token}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 mb-2">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                      <Truck className="w-3 h-3" /> Slot Available
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 font-medium">
                      Serving {queueServingToken}
                    </span>
                  </div>

                  <div className="inline-flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg text-[10px] border bg-blue-50/90 text-[#2563EB] border-blue-200/90">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="font-semibold text-slate-700">Wait time:</span>
                    </div>
                    <span className="font-bold font-serif-gov text-[11px]">
                      {estimatedWaitInfo.label}
                    </span>
                  </div>
                </div>

                <div
                  id="qr-token-placeholder"
                  className="my-1.5 p-2 bg-gradient-to-br from-blue-50/80 to-slate-50 rounded-xl border border-blue-100 group-hover:border-blue-300 group-hover:bg-blue-50/50 transition-all flex items-center gap-2.5 shadow-2xs"
                >
                  <div className="relative shrink-0 bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
                    <TokenQRCode token={farmerData.token} size={46} />
                    <div className="absolute -bottom-1 -right-1 bg-[#2563EB] text-white p-0.5 rounded shadow-xs">
                      <Maximize2 className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono font-bold tracking-wider text-[#2563EB] bg-blue-100/70 px-1 py-0.2 rounded">
                        {farmerData.token}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium truncate">Mandi Gate QR</span>
                    </div>
                    <p className="text-[10px] text-slate-700 font-bold truncate mt-0.5">
                      Tap to expand
                    </p>
                    <span className="text-[9px] text-[#2563EB] font-medium flex items-center gap-0.5">
                      <QrCode className="w-2.5 h-2.5" />
                      Gate Scanner Ready
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif-gov text-base font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                    Book Slot
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Yield slider & Vehicle estimate
                  </p>
                </div>

                <div
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                  className="my-2 pt-2 border-t border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5 text-left min-w-0 pr-1">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${notifyGateReady ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                      {notifyGateReady ? <BellRing className="w-3.5 h-3.5 animate-pulse" /> : <BellOff className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0 flex items-center gap-1">
                      <Bell className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-800">Gate Alert Push</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleNotifyGateReady}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${notifyGateReady ? 'bg-[#2563EB]' : 'bg-slate-300'}`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition ${notifyGateReady ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#2563EB]">
                  <div className="flex items-center gap-1 text-slate-700 group-hover:text-[#2563EB] transition-colors">
                    <Maximize2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span className="text-[11px]">Expand Gate QR</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setIsBookingOpen(true);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 hover:bg-[#2563EB] hover:text-white border border-blue-200 transition-colors text-[10px] font-bold"
                  >
                    <span>Book / Edit</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentTab('tracker')}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-gov text-base font-bold text-slate-900 group-hover:text-amber-700">
                    Live Digital Parchi
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Token {farmerData.token} Flow</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700">
                  <span>View Pass</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      <SmartBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onBookingConfirmed={handleBookingConfirmed}
      />

      <BhashiniVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onConfirmVoiceBooking={handleVoiceBookingConfirmed}
      />

      <FullScreenQRModal
        isOpen={isFullScreenQROpen}
        onClose={() => setIsFullScreenQROpen(false)}
        farmerData={farmerData}
        onOpenBookingModal={() => setIsBookingOpen(true)}
      />

      <AnimatePresence>
        {activeNotificationAlert && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-300 overflow-hidden text-slate-900"
          >
            <div className="bg-slate-100/90 px-3.5 py-1.5 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5 font-medium">
                <div className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[9px] font-bold">G</div>
                <span>Browser Notification</span>
              </div>
              <button onClick={() => setActiveNotificationAlert(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-3.5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h4 className="font-serif-gov text-xs font-bold text-slate-900">{activeNotificationAlert.title}</h4>
                <p className="text-xs text-slate-600 mt-1">{activeNotificationAlert.body}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFullScreenQROpen(true);
                      setActiveNotificationAlert(null);
                    }}
                    className="text-[11px] font-bold text-white bg-[#2563EB] hover:bg-blue-700 px-2.5 py-1 rounded-lg transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Show Gate QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveNotificationAlert(null)}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (mobileViewMode === 'phone') {
    return (
      <div className="py-6 px-3 flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="w-full max-w-[410px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 relative">
          <div className="w-36 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-8 h-1 rounded-full bg-slate-700" />
          </div>
          <div className="rounded-[32px] overflow-hidden bg-[#F8FAFC] shadow-inner max-h-[780px] overflow-y-auto">
            {appContent}
          </div>
          <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mt-2.5" />
        </div>
      </div>
    );
  }

  return <div className="w-full max-w-xl mx-auto min-h-[calc(100vh-60px)] py-4 px-2">{appContent}</div>;
};