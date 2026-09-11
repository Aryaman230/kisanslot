/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
/** @jsxRuntime classic */
// @ts-expect-error React types are unavailable in the current project configuration.
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Mail,
  ShieldCheck,
  Smartphone,
  Fingerprint
} from 'lucide-react';
import { AppInterface, FarmerRecord, MandiCapacity, QueueStatus } from './types';
import { INITIAL_FARMERS_TABLE } from './data/mockData';
import { TopBar } from './components/TopBar';
import { FarmerApp } from './components/farmer/FarmerApp';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HaltOperationsModal } from './components/admin/HaltOperationsModal';
import { AadhaarKYCModal } from './components/farmer/AadhaarKYCModal'; // Aadhaar Modal Import

interface AadhaarVerificationData {
  aadhaarMasked: string;
  mobile: string;
  name: string;
}

export default function App() {
  const [currentInterface, setCurrentInterface] = useState<AppInterface>('farmer');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<'farmer' | 'officer'>('farmer');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [govtEmail, setGovtEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isHalted, setIsHalted] = useState<boolean>(false);
  const [haltReason, setHaltReason] = useState<string>('');
  const [isHaltModalOpen, setIsHaltModalOpen] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [mobileViewMode, setMobileViewMode] = useState<'phone' | 'full'>('phone');

  // Real-time Mandi Capacity state
  const [mandiCapacity, setMandiCapacity] = useState<MandiCapacity>({
    totalDailySlots: 200,
    bookedSlots: 142,
    availableSlots: 58,
    occupancyPercent: 71,
    status: 'Available',
    currentSlotWindow: '10:00 AM - 11:30 AM',
    lastUpdated: 'Live',
  });

  // State for Aadhaar KYC Modal
  const [isKycOpen, setIsKycOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setKycData] = useState<AadhaarVerificationData | null>(null);

  // Active records in Mandi
  const [farmerRecords, setFarmerRecords] = useState<FarmerRecord[]>(INITIAL_FARMERS_TABLE);

  // Ramesh Yadav's active token is A127
  const rameshRecord = farmerRecords.find((r: FarmerRecord) => r.token === 'A127') || farmerRecords[0];

  // Live Queue sequence simulation: Currently Serving: A119 -> Up Next: A120 -> Your Token: A127
  const queueSequence = ['A119', 'A120', 'A121', 'A122', 'A125', 'A127'];
  const [queueIndex, setQueueIndex] = useState<number>(0);

  const servingToken = queueSequence[queueIndex] || 'A119';
  const nextToken = queueSequence[Math.min(queueIndex + 1, queueSequence.length - 1)] || 'A120';

  const handleAdvanceQueue = () => {
    setQueueIndex((prev: number) => (prev + 1) % queueSequence.length);
  };

  const handleUpdateFarmerData = (updated: Partial<FarmerRecord>) => {
    setFarmerRecords((prev: FarmerRecord[]) =>
      prev.map((item: FarmerRecord) => (item.token === 'A115' ? { ...item, ...updated } : item))
    );

    // If a new slot was scheduled/updated, dynamically update real-time capacity in app state
    if (updated.slotTime) {
      setMandiCapacity((prev: MandiCapacity) => {
        const newBooked = Math.min(prev.totalDailySlots, prev.bookedSlots + 1);
        const newAvailable = Math.max(0, prev.totalDailySlots - newBooked);
        const occupancy = Math.round((newBooked / prev.totalDailySlots) * 100);
        return {
          ...prev,
          bookedSlots: newBooked,
          availableSlots: newAvailable,
          occupancyPercent: occupancy,
          status: newAvailable > 15 ? 'Available' : newAvailable > 0 ? 'Fast Filling' : 'Full',
          lastUpdated: 'Just now',
        };
      });
    }
  };

  const liveCapacity: MandiCapacity = {
    ...mandiCapacity,
    status: isHalted
      ? 'Suspended'
      : mandiCapacity.availableSlots > 15
      ? 'Available'
      : mandiCapacity.availableSlots > 0
      ? 'Fast Filling'
      : 'Full',
    availableSlots: isHalted ? 0 : mandiCapacity.availableSlots,
  };

  const handleUpdateRecordStatus = (token: string, newStatus: QueueStatus) => {
    setFarmerRecords((prev: FarmerRecord[]) =>
      prev.map((item) => (item.token === token ? { ...item, status: newStatus } : item))
    );
  };

  const handleConfirmHalt = (reason: string) => {
    setHaltReason(reason);
    setIsHalted(true);
  };

  const handleResumeOperations = () => {
    setIsHalted(false);
    setHaltReason('');
  };

  // --- Handlers for old mobile/otp flow (kept for fallback/reference) ---
  const handleGetOtp = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (/^\d{10}$/.test(mobileNumber)) {
      setOtpSent(true);
      setOtp('');
    }
  };

  const handleVerifyOtp = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (!/^\d{4}$/.test(otp)) return;

    setIsVerifying(true);
    window.setTimeout(() => {
      setIsVerifying(false);
      setIsAuthenticated(true);
      setCurrentInterface('farmer');
    }, 2000);
  };

  const handleOfficerLogin = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (govtEmail && password) {
      setCurrentInterface('admin');
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans-ui flex items-center justify-center px-4 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#DBEAFE_0,_transparent_38%),linear-gradient(135deg,_#F8FAFC_0%,_#EFF6FF_100%)]" />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full max-w-md"
        >
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1E3A8A] text-white shadow-lg shadow-blue-900/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563EB]">KisanSlot</p>
              <p className="text-sm font-semibold text-[#475569]">Government Mandi Services</p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-900/10 sm:p-8">
            <AnimatePresence mode="wait">
              {loginMode === 'farmer' ? (
                <motion.div
                  key="farmer-login"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-7">
                    <p className="mb-2 text-sm font-bold text-[#2563EB]">FARMER ACCESS</p>
                    <h1 className="font-serif-gov text-2xl font-bold text-[#0F172A] sm:text-3xl">Govt e-KYC Login</h1>
                    <p className="mt-3 text-sm leading-6 text-[#64748B]">Securely access your mandi appointments, token status, and payment updates.</p>
                  </div>

                  {/* 
                      Aadhaar Based Login Integration
                      Replaced standard OTP form with Aadhaar Verification CTA
                  */}
                  <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
                      <Fingerprint className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Mandatory Identity Check</h4>
                        <p className="text-xs text-emerald-700/80 leading-relaxed">
                          To prevent fraud and enable Direct Benefit Transfer (DBT), UIDAI Aadhaar verification is required for login and registration.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsKycOpen(true)}
                      className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      Verify Identity via Aadhaar
                    </button>
                    
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-slate-200"></div>
                      <span className="shrink-0 mx-4 text-xs text-slate-400 font-medium uppercase">Or use mobile</span>
                      <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    {!otpSent ? (
                      <form onSubmit={handleGetOtp} className="space-y-4">
                        <label className="block text-xs font-semibold text-[#334155]">
                          Fallback: 10-digit Mobile Number
                          <div className="mt-1.5 flex items-center rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 transition focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-blue-100">
                            <Smartphone className="h-4 w-4 text-[#64748B]" />
                            <input
                              required
                              inputMode="numeric"
                              pattern="[0-9]{10}"
                              maxLength={10}
                              value={mobileNumber}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setMobileNumber(event.target.value.replace(/\D/g, ''))}
                              placeholder="Enter mobile number"
                              className="w-full bg-transparent px-2.5 py-2.5 text-sm outline-none placeholder:text-[#94A3B8]"
                            />
                          </div>
                        </label>
                        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 px-4 py-2.5 text-xs font-bold transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50" disabled={mobileNumber.length !== 10}>
                          Get OTP <ArrowRight className="h-3 w-3" />
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        {isVerifying ? (
                          <div className="flex min-h-32 flex-col items-center justify-center rounded-xl bg-[#EFF6FF] text-center">
                            <LoaderCircle className="mb-3 h-6 w-6 animate-spin text-[#2563EB]" />
                            <p className="text-sm font-bold text-[#1E3A8A]">Verifying Identity...</p>
                          </div>
                        ) : (
                          <>
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
                              OTP sent securely.
                            </div>
                            <label className="block text-xs font-semibold text-[#334155]">
                              4-digit OTP
                              <div className="mt-1.5 flex items-center rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 transition focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-blue-100">
                                <KeyRound className="h-4 w-4 text-[#64748B]" />
                                <input
                                  required
                                  inputMode="numeric"
                                  pattern="[0-9]{4}"
                                  maxLength={4}
                                  value={otp}
                                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setOtp(event.target.value.replace(/\D/g, ''))}
                                  placeholder="Enter OTP"
                                  className="w-full bg-transparent px-3 py-2.5 text-sm tracking-[0.35em] outline-none placeholder:tracking-normal placeholder:text-[#94A3B8]"
                                />
                              </div>
                            </label>
                            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 text-white px-4 py-2.5 text-xs font-bold transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50" disabled={otp.length !== 4}>
                              Verify <CheckCircle2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </form>
                    )}
                  </div>

                  <div className="mt-7 border-t border-[#E2E8F0] pt-5 text-center">
                    <button type="button" onClick={() => setLoginMode('officer')} className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E3A8A] hover:text-[#2563EB]">
                      <Building2 className="h-4 w-4" /> Mandi Officer Login
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="officer-login"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-7">
                    <p className="mb-2 text-sm font-bold text-[#2563EB]">OFFICIAL ACCESS</p>
                    <h1 className="font-serif-gov text-2xl font-bold text-[#0F172A]">Mandi Officer Login</h1>
                    <p className="mt-3 text-sm leading-6 text-[#64748B]">Use your government credentials to access mandi operations.</p>
                  </div>
                  <form onSubmit={handleOfficerLogin} className="space-y-5">
                    <label className="block text-sm font-semibold text-[#334155]">
                      Govt Email
                      <div className="mt-2 flex items-center rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-blue-100">
                        <Mail className="h-5 w-5 text-[#64748B]" />
                        <input required type="email" value={govtEmail} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setGovtEmail(event.target.value)} placeholder="name@gov.in" className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-[#94A3B8]" />
                      </div>
                    </label>
                    <label className="block text-sm font-semibold text-[#334155]">
                      Password
                      <div className="mt-2 flex items-center rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-blue-100">
                        <KeyRound className="h-5 w-5 text-[#64748B]" />
                        <input required type="password" value={password} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)} placeholder="Enter password" className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-[#94A3B8]" />
                      </div>
                    </label>
                    <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-900/20 transition hover:bg-[#172554]">
                      Continue to Dashboard <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                  <div className="mt-7 border-t border-[#E2E8F0] pt-5 text-center">
                    <button type="button" onClick={() => setLoginMode('farmer')} className="text-sm font-semibold text-[#1E3A8A] hover:text-[#2563EB]">Back to Farmer Login</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="mt-5 text-center text-xs text-[#64748B]">Your identity is verified through secure Aadhaar e-KYC.</p>
        </motion.div>

        {/* Aadhaar KYC Modal */}
        <AadhaarKYCModal
          isOpen={isKycOpen}
          onClose={() => setIsKycOpen(false)}
          onVerificationSuccess={(data: AadhaarVerificationData) => {
            setKycData(data);
            setIsAuthenticated(true);
            setCurrentInterface('farmer');
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans-ui flex flex-col ${
        highContrast ? 'sunlight-high-contrast' : ''
      }`}
    >
      {/* Universal Top Header with Interface Switcher */}
      <TopBar
        currentInterface={currentInterface}
        onInterfaceChange={setCurrentInterface}
        isHalted={isHalted}
        onOpenHaltModal={() => setIsHaltModalOpen(true)}
        onResumeOperations={handleResumeOperations}
        highContrast={highContrast}
        onToggleContrast={() => setHighContrast(!highContrast)}
        mobileViewMode={mobileViewMode}
        onToggleMobileViewMode={() =>
          setMobileViewMode(mobileViewMode === 'phone' ? 'full' : 'phone')
        }
        activeToken={rameshRecord.token}
      />

      {/* Main View Area with Framer Motion Smooth Transitions */}
      <main className="flex-1 w-full">
        <AnimatePresence mode="wait">
          {currentInterface === 'farmer' ? (
            <motion.div
              key="farmer-interface"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full"
            >
              <FarmerApp
                farmerData={rameshRecord}
                onUpdateFarmerData={handleUpdateFarmerData}
                mobileViewMode={mobileViewMode}
                queueServingToken={servingToken}
                queueNextToken={nextToken}
                onAdvanceQueue={handleAdvanceQueue}
                isHalted={isHalted}
                mandiCapacity={liveCapacity}
              />
            </motion.div>
          ) : (
            <motion.div
              key="admin-interface"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full"
            >
              <AdminDashboard
                isHalted={isHalted}
                onResumeOperations={handleResumeOperations}
                onConfirmHalt={handleConfirmHalt}
                farmerRecords={farmerRecords}
                onUpdateRecordStatus={handleUpdateRecordStatus}
                onSwitchToFarmerView={() => setCurrentInterface('farmer')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Emergency Kill Switch Modal accessible from anywhere */}
      <HaltOperationsModal
        isOpen={isHaltModalOpen}
        onClose={() => setIsHaltModalOpen(false)}
        onConfirmHalt={(reason: string) => {
          handleConfirmHalt(reason);
          setIsHaltModalOpen(false);
        }}
      />
    </div>
  );
}