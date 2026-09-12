// @ts-nocheck React and JSX runtime declarations are unavailable in this environment.
import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  User, 
  Building2, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

export const FarmerLogin = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const [step, setStep] = useState(1);
  const [isLocating, setIsLocating] = useState(false);
  const [locationFound, setLocationFound] = useState(false);
  const [selectedMandi, setSelectedMandi] = useState<string | null>(null);

  // Mock Nearby Mandis based on GPS
  const nearbyMandis = [
    {
      id: 'm1',
      name: 'APMC Madhubani (Main)',
      distance: '2.4 km',
      time: '8 mins',
      queue: 'Moderate (17 Vehicles)',
      status: 'yellow',
      isBest: true
    },
    {
      id: 'm2',
      name: 'APMC Sakri Hub',
      distance: '14.2 km',
      time: '35 mins',
      queue: 'Low (4 Vehicles)',
      status: 'green',
      isBest: false
    }
  ];

  const handleDetectLocation = () => {
    setIsLocating(true);
    // Simulate GPS API delay
    setTimeout(() => {
      setIsLocating(false);
      setLocationFound(true);
      setSelectedMandi('m1'); // Auto-select nearest
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Mobile Frame (Restricting width for PWA feel) */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-[#1E3A8A] pt-10 pb-6 px-6 text-white text-center rounded-b-[2.5rem] shadow-md relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-md mb-4 border border-white/20 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="font-serif-gov text-2xl font-black tracking-tight">KisanSlot PWA</h2>
          <p className="text-blue-200 text-xs mt-1">Smart Agriculture & e-NAM Integration</p>
        </div>

        {/* Content Body */}
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
                    defaultValue="Ramesh Yadav"
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-hidden font-semibold text-slate-700"
                    placeholder="Full Name"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input 
                    type="tel" 
                    defaultValue="9876543210"
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-hidden font-semibold text-slate-700"
                    placeholder="Mobile Number"
                  />
                </div>
                
                {step === 1 && (
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
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
                    <MapPin className="w-4 h-4" /> Location detected: Madhubani District (Bihar)
                  </div>

                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pt-2">Recommended Procurement Centers</p>
                  
                  {nearbyMandis.map((mandi) => (
                    <div 
                      key={mandi.id}
                      onClick={() => setSelectedMandi(mandi.id)}
                      className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer ${selectedMandi === mandi.id ? 'border-[#2563EB] bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                    >
                      {mandi.isBest && (
                        <span className="absolute -top-2.5 right-3 bg-amber-400 text-amber-950 text-[9px] font-black px-2 py-0.5 rounded shadow-sm">NEAREST</span>
                      )}
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-[#2563EB]" /> {mandi.name}
                          </h4>
                          <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-2">
                            <span>{mandi.distance} away</span> • 
                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {mandi.time} drive</span>
                          </div>
                        </div>
                        {selectedMandi === mandi.id && (
                          <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />
                        )}
                      </div>
                      
                      {/* Smart Queue Indicator */}
                      <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Live Traffic Queue:</span>
                        <span className={`font-bold ${mandi.status === 'green' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {mandi.queue}
                        </span>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={onLoginSuccess}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 mt-4"
                  >
                    Select Mandi & Book Slot <ArrowRight className="w-4 h-4" />
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