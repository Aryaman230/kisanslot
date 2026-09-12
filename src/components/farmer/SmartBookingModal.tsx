// @ts-nocheck
// React types are provided by the project environment, but JSX runtime typings
// are not installed in this project.
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Truck, Calendar, MapPin, CheckCircle2, ChevronRight, Info, Sliders, ShieldCheck } from 'lucide-react';
import { CropSeason, CropInfo } from '../../types';
import { CROPS_DATA, getVehicleEstimate } from '../../data/mockData';

interface SmartBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed: (booking: {
    crop: string;
    yieldQtl: number;
    season: CropSeason;
    gate: string;
    slotTime: string;
  }) => void;
}

export const SmartBookingModal = ({
  isOpen,
  onClose,
  onBookingConfirmed,
}: SmartBookingModalProps) => {
  const [selectedSeason, setSelectedSeason] = useState<CropSeason>('Rabi');
  const [selectedCrop, setSelectedCrop] = useState<CropInfo>(CROPS_DATA[0]); // Wheat
  const [yieldQtl, setYieldQtl] = useState<number>(45);
  const [selectedGate, setSelectedGate] = useState<string>('Gate 02');
  const [selectedSlot, setSelectedSlot] = useState<string>('08:30 AM - 10:00 AM (Morning Batch)');

  if (!isOpen) return null;

  const filteredCrops = CROPS_DATA.filter((c) => c.season === selectedSeason);
  const vehicleEstimate = getVehicleEstimate(yieldQtl);
  const totalMspValue = yieldQtl * selectedCrop.mspPerQuintal;

  const handleSeasonChange = (season: CropSeason) => {
    setSelectedSeason(season);
    const firstCrop = CROPS_DATA.find((c) => c.season === season);
    if (firstCrop) setSelectedCrop(firstCrop);
  };

  const handleConfirm = () => {
    onBookingConfirmed({
      crop: selectedCrop.nameEn,
      yieldQtl,
      season: selectedSeason,
      gate: selectedGate,
      slotTime: selectedSlot,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Mobile Drag Handle */}
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 sm:hidden" />

          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div>
              <h2 className="font-serif-gov text-lg font-bold text-slate-900">
                Smart Slot Booking
              </h2>
              <p className="text-xs text-slate-500">
                Direct APMC Madhubani Influx Reservation • e-NAM Linked
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="p-5 space-y-5 overflow-y-auto">
            {/* Season Tabs: Kharif / Rabi / Zaid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  1. Crop Season (फसल चक्र)
                </label>
                <span className="text-[11px] text-blue-700 font-medium">
                  Current: Rabi 2026-27
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                {(['Rabi', 'Kharif', 'Zaid'] as CropSeason[]).map((season) => (
                  <button
                    key={season}
                    type="button"
                    onClick={() => handleSeasonChange(season)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                      selectedSeason === season
                        ? 'bg-[#2563EB] text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {season === 'Rabi' && 'Rabi (रबी)'}
                    {season === 'Kharif' && 'Kharif (खरीफ)'}
                    {season === 'Zaid' && 'Zaid (जायद)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Crop Selection Grid */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block">
                2. Select Produce & MSP (उपज व न्यूनतम समर्थन मूल्य)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                {filteredCrops.map((crop) => {
                  const isSelected = selectedCrop.id === crop.id;
                  return (
                    <div
                      key={crop.id}
                      onClick={() => setSelectedCrop(crop)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#2563EB] bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xl">{crop.icon}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                        )}
                      </div>
                      <div className="font-serif-gov text-sm font-bold text-slate-900">
                        {crop.nameEn}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {crop.nameHi}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                        <span className="text-slate-500 text-[10px]">MSP / Qtl:</span>
                        <span className="font-serif-gov font-bold text-[#2563EB]">
                          ₹{crop.mspPerQuintal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Yield Interactive Slider (5 to 150 Quintals) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#2563EB]" />
                  3. Declared Yield (अनुमानित उपज)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setYieldQtl(Math.max(5, yieldQtl - 5))}
                    className="w-6 h-6 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-sm shadow-2xs"
                  >
                    -
                  </button>
                  <span className="font-serif-gov text-lg font-extrabold text-[#2563EB] px-2 min-w-[70px] text-center">
                    {yieldQtl} Qtl
                  </span>
                  <button
                    type="button"
                    onClick={() => setYieldQtl(Math.min(150, yieldQtl + 5))}
                    className="w-6 h-6 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-sm shadow-2xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Slider Component */}
              <input
                id="yield-slider"
                type="range"
                min="5"
                max="150"
                step="1"
                value={yieldQtl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYieldQtl(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB] my-3"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>5 Qtl (Small)</span>
                <span>50 Qtl (Pick-up)</span>
                <span>100 Qtl (Tractor)</span>
                <span>150 Qtl (Heavy)</span>
              </div>

              {/* Quick Presets */}
              <div className="flex gap-2 mt-3 pt-2.5 border-t border-slate-200/80 text-xs">
                <span className="text-[11px] text-slate-500 self-center">Presets:</span>
                {[15, 45, 75, 120].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setYieldQtl(preset)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      yieldQtl === preset
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset} Qtl
                  </button>
                ))}
              </div>
            </div>

            {/* DYNAMIC VEHICLE ESTIMATE CARD (Based on Slider value) */}
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#2563EB]" />
                  Dynamic Logistics & Vehicle Allocation
                </span>
                <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                  AI Auto-Matched
                </span>
              </div>

              <div className="flex items-start gap-3 bg-white/90 p-3 rounded-xl border border-blue-200 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-serif-gov text-sm font-bold text-slate-900 leading-snug">
                    {vehicleEstimate.type}
                  </div>
                  <div className="text-xs text-blue-700 font-medium mt-0.5">
                    {vehicleEstimate.hindiName} • {vehicleEstimate.capacityRange}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {vehicleEstimate.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Mandatory Mandi Gate & Time Slot */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                4. Select Arrival Gate & Time Window
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 mb-1 block">Mandi Weighbridge Gate:</span>
                  <select
                    value={selectedGate}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setSelectedGate(e.target.value)
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#2563EB] outline-hidden"
                  >
                    <option value="Gate 02">Gate 02 (Medium LCV & Bolero)</option>
                    <option value="Gate 01">Gate 01 (Heavy Tractors & Silo)</option>
                    <option value="Gate 03">Gate 03 (Oilseeds & Pulses Express)</option>
                    <option value="Gate 04">Gate 04 (Small Cargo & 2T Pickups)</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 mb-1 block">Slot Batch:</span>
                  <select
                    value={selectedSlot}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setSelectedSlot(e.target.value)
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#2563EB] outline-hidden"
                  >
                    <option value="08:30 AM - 10:00 AM (Morning Batch)">08:30 AM - 10:00 AM (Morning Batch)</option>
                    <option value="10:30 AM - 12:00 PM (Midday Batch)">10:30 AM - 12:00 PM (Midday Batch)</option>
                    <option value="01:00 PM - 02:30 PM (Afternoon Batch)">01:00 PM - 02:30 PM (Afternoon Batch)</option>
                    <option value="03:00 PM - 04:30 PM (Evening Batch)">03:00 PM - 04:30 PM (Evening Batch)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Summary & Direct e-NAM Bank Guarantee */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Estimated e-NAM Remittance:</span>
                <span className="font-serif-gov text-base font-bold text-slate-900">
                  ₹{totalMspValue.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  ({yieldQtl} Qtl × ₹{selectedCrop.mspPerQuintal}/Qtl MSP)
                </span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> DBT Guaranteed
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Direct to Bank of India A/c</span>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-booking-button"
              onClick={handleConfirm}
              className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>Confirm & Generate Token A127</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
