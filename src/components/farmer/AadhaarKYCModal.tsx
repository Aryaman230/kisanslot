// React typings are not installed in the project, including the JSX runtime declarations.
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Smartphone, 
  X, 
  ArrowRight, 
  Fingerprint, 
  CheckCircle2, 
  Loader2, 
  LockKeyhole 
} from 'lucide-react';

interface AadhaarKYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: (data: { aadhaarMasked: string; mobile: string; name: string }) => void;
}

export const AadhaarKYCModal: React.FC<AadhaarKYCModalProps> = ({
  isOpen,
  onClose,
  onVerificationSuccess,
}: AadhaarKYCModalProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState<'aadhaar' | 'mobile'>('aadhaar');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setInputValue('');
      setOtp(['', '', '', '', '', '']);
      setError('');
    }
  }, [isOpen]);

  const handleSendOTP = () => {
    setError('');
    const cleanInput = inputValue.replace(/\D/g, '');
    
    if (inputType === 'aadhaar' && cleanInput.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar Number');
      return;
    }
    if (inputType === 'mobile' && cleanInput.length !== 10) {
      setError('Please enter a valid 10-digit Mobile Number');
      return;
    }

    setIsLoading(true);
    // Simulate API Call to UIDAI / Firebase Auth
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleVerifyOTP = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    // Simulate OTP Verification
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
      
      // Auto close and send data back to parent after 2 seconds
      setTimeout(() => {
        const cleanInput = inputValue.replace(/\D/g, '');
        onVerificationSuccess({
          aadhaarMasked: inputType === 'aadhaar' ? `XXXX-XXXX-${cleanInput.slice(-4)}` : 'XXXX-XXXX-9421',
          mobile: inputType === 'mobile' ? cleanInput : '9876543210',
          name: 'Ramesh Yadav' // Simulated fetched name from Aadhaar database
        });
        onClose();
      }, 2500);
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only 1 digit per box
    if (!/^\d*$/.test(value)) return; // Only numbers
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden relative"
        >
          {/* Header - Sarkari / Trust UI */}
          <div className="bg-linear-to-r from-emerald-700 to-emerald-900 p-5 flex items-start justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
            
            <div className="relative z-10 flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-emerald-50" />
              </div>
              <div>
                <h2 className="font-serif-gov text-lg font-bold tracking-tight">Kisan e-KYC Verification</h2>
                <p className="text-[11px] text-emerald-100/90 flex items-center gap-1 font-mono mt-0.5">
                  <LockKeyhole className="w-3 h-3" /> Secure UIDAI Gateway
                </p>
              </div>
            </div>
            
            {step !== 3 && (
              <button onClick={onClose} className="relative z-10 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-6">
            {/* STEP 1: Input Form */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => { setInputType('aadhaar'); setInputValue(''); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${inputType === 'aadhaar' ? 'bg-white text-emerald-700 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Fingerprint className="w-4 h-4" /> Aadhaar Number
                  </button>
                  <button
                    onClick={() => { setInputType('mobile'); setInputValue(''); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${inputType === 'mobile' ? 'bg-white text-blue-700 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Smartphone className="w-4 h-4" /> Linked Mobile
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {inputType === 'aadhaar' ? 'Enter 12-Digit Aadhaar' : 'Enter 10-Digit Mobile No.'}
                  </label>
                  <input
                    type="text"
                    maxLength={inputType === 'aadhaar' ? 12 : 10}
                    value={inputValue}
                    onChange={(e: any) => setInputValue(e.target.value)}
                    placeholder={inputType === 'aadhaar' ? "XXXX XXXX XXXX" : "98765 43210"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden tracking-widest text-center text-lg placeholder-slate-300 transition-all"
                  />
                  {error && <p className="text-red-500 text-[10px] font-semibold mt-1.5 text-center animate-pulse">{error}</p>}
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800 leading-relaxed">
                    By proceeding, you consent to allow KisanSlot to fetch your KYC details from UIDAI for mandi registration purposes only.
                  </p>
                </div>

                <button
                  onClick={handleSendOTP}
                  disabled={isLoading || inputValue.length < 10}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <span>Generate Secure OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif-gov text-lg font-bold text-slate-900">Enter Verification Code</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    OTP sent to Aadhaar linked mobile number ending in <strong className="text-slate-700">XXXX</strong>
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  {otp.map((digit: string, i: number) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e: any) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e: any) => {
                        if (e.key === 'Backspace' && !digit && i > 0) {
                          document.getElementById(`otp-${i - 1}`)?.focus();
                        }
                      }}
                      className="w-10 h-12 text-center text-xl font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-hidden transition-all"
                    />
                  ))}
                </div>
                {error && <p className="text-red-500 text-[10px] font-semibold mt-1 animate-pulse">{error}</p>}

                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otp.join('').length < 6}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Link Aadhaar'}
                  </button>
                  <button onClick={() => setStep(1)} className="text-[11px] font-semibold text-slate-500 hover:text-slate-800">
                    Entered wrong number? Go back
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Success */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-6 flex flex-col items-center text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </motion.div>
                <div>
                  <h3 className="font-serif-gov text-xl font-black text-slate-900">e-KYC Successful!</h3>
                  <p className="text-xs text-slate-500 mt-1">Identity verified securely via UIDAI</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl w-full flex items-center gap-3 text-left mt-2">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {/* Placeholder Avatar */}
                    <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Farmer Name</span>
                    <span className="font-serif-gov font-bold text-slate-900">Ramesh Yadav</span>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Aadhaar Linked</span>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 block mt-0.5">
                      Verified
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};