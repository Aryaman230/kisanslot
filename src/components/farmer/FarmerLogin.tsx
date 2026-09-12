/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
/** @jsxRuntime classic */
// React typings are unavailable in the current project configuration.
// @ts-expect-error Allow the component to compile until @types/react is installed.
import React, { useState } from 'react';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase'; // Make sure path matches your setup

import { 
  MapPin, Navigation, Phone, User, Building2, 
  ArrowRight, Loader2, CheckCircle2, Clock, ShieldCheck 
} from 'lucide-react';

interface FarmerLoginProps {
  onLoginSuccess: () => void;
}

interface FarmerDetails {
  farmerName: string;
  phone: string;
}

interface Mandi {
  id: string;
  name: string;
  distance: string;
  time: string;
  queue: string;
  status: 'yellow' | 'green';
  isBest: boolean;
}

interface BookingPayload extends FarmerDetails {
  crop: string;
  yieldQtl: number;
  assignedGate: string;
  status: string;
  token: string;
  createdAt: ReturnType<typeof serverTimestamp>;
}

export const FarmerLogin = ({ onLoginSuccess }: FarmerLoginProps): React.ReactElement => {
  const [step, setStep] = useState<number>(1);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationFound, setLocationFound] = useState<boolean>(false);
  const [selectedMandi, setSelectedMandi] = useState<string | null>(null);
  
  // Real State for Farmer Inputs
  const [farmerName, setFarmerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isBooking, setIsBooking] = useState<boolean>(false);

  const nearbyMandis: Mandi[] = [
    { id: 'm1', name: 'APMC Madhubani (Main)', distance: '2.4 km', time: '8 mins', queue: 'Moderate (17 Vehicles)', status: 'yellow', isBest: true },
    { id: 'm2', name: 'APMC Sakri Hub', distance: '14.2 km', time: '35 mins', queue: 'Low (4 Vehicles)', status: 'green', isBest: false }
  ];

  const handleDetectLocation = (): void => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      setLocationFound(true);
      setSelectedMandi('m1'); 
    }, 1500);
  };

  // The Magic Function: Push Real Data to Firebase!
  const handleBookSlot = async (): Promise<void> => {
    if (!farmerName || !phone) {
      alert("Please enter your name and phone number.");
      return;
    }
    
    setIsBooking(true);
    try {
      // Create a real entry in Firestore
      await addDoc(collection(db, "slots"), {
        farmerName: farmerName,
        phone: phone,
        crop: "Wheat (Sharbati)", // Can be made dynamic later
        yieldQtl: Math.floor(Math.random() * 40) + 20, // Random yield for prototype
        assignedGate: "Gate 01",
        status: "Scheduled",
        token: `TKN-${Math.floor(Math.random() * 900) + 100}`, // E.g., TKN-452
        createdAt: serverTimestamp()
      });
      
      // Success! Move to Dashboard
      onLoginSuccess();
    } catch (error) {
      console.error("Error booking slot: ", error);
      alert("Failed to connect to database.");
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
        
        <div className="bg-[#1E3A8A] pt-10 pb-6 px-6 text-white text-center rounded-b-[2.5rem] shadow-md relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-md mb-4 border border-white/20 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="font-serif-gov text-2xl font-black tracking-tight">KisanSlot PWA</h2>
          <p className="text-blue-200 text-xs mt-1">Smart Agriculture & e-NAM Integration</p>
        </div>

        <div className="px-6 py-8 space-y-6">
          {/* STEP 1: Personal Details */}
          <div className="space-y-4 relative">
            <div className={`transition-all duration-300 ${step > 1 ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
                Farmer Details (किसान विवरण)
              </h3>
              
              <div className="space-y-3">
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input 
                    type="text" 
                    value={farmerName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFarmerName(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-hidden font-semibold text-slate-700"
                    placeholder="Enter Full Name"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-hidden font-semibold text-slate-700"
                    placeholder="Enter Mobile Number"
                  />
                </div>
                
                {step === 1 && (
                  <button 
                    onClick={() => setStep(2)}
                    disabled={!farmerName || !phone}
                    className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Next <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: Geo-Location & Mandi Selection */}
          {step >= 2 && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
                Find Nearby Mandi (मंडी खोजें)
              </h3>

              {!locationFound ? (
                <button 
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="w-full border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors disabled:opacity-70"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Fetching GPS Coordinates...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                        <Navigation className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm">Auto-Detect My Location</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <MapPin className="w-4 h-4" /> Location detected: Madhubani District
                  </div>
                  
                  {nearbyMandis.map((mandi) => (
                    <div 
                      key={mandi.id}
                      onClick={() => setSelectedMandi(mandi.id)}
                      className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer ${selectedMandi === mandi.id ? 'border-[#2563EB] bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-[#2563EB]" /> {mandi.name}
                          </h4>
                        </div>
                        {selectedMandi === mandi.id && <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />}
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={handleBookSlot}
                    disabled={isBooking || !selectedMandi}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 mt-4"
                  >
                    {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm & Send to Admin"} 
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};