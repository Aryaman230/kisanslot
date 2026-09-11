import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Info, MapPin, Droplets, CheckCircle2, ChevronRight } from 'lucide-react';
import { ICAR_SOIL_DATA } from '../../data/mockData';
import { IcarSoilZoneData } from '../../types';

export const IcarSoilChart: React.FC = () => {
  const [hoveredZone, setHoveredZone] = useState<IcarSoilZoneData | null>(null);
  const [selectedZone, setSelectedZone] = useState<IcarSoilZoneData>(ICAR_SOIL_DATA[0]);

  // SVG Doughnut Calculation parameters
  const size = 220;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativeAngle = 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-gov text-sm font-bold text-slate-900">
                ICAR Soil & Geo Yield Analytics
              </h3>
              <p className="text-[11px] text-slate-500">
                Indian Council of Agricultural Research • Agro-Ecological Zones
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
            Govt Standard
          </span>
        </div>

        {/* Doughnut Chart & Central Stat */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-4">
          <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />

              {/* Data Slices (Analogous Blue / Teal Color Palette) */}
              {ICAR_SOIL_DATA.map((item) => {
                const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
                const rotation = cumulativeAngle * 3.6; // 360 * (angle / 100)
                cumulativeAngle += item.percentage;

                const isHovered = (hoveredZone && hoveredZone.id === item.id) || selectedZone.id === item.id;

                return (
                  <motion.circle
                    key={item.id}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(${rotation} ${center} ${center})`}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredZone(item)}
                    onMouseLeave={() => setHoveredZone(null)}
                    onClick={() => setSelectedZone(item)}
                  />
                );
              })}
            </svg>

            {/* Central Badge */}
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Yield Analyzed
              </span>
              <span className="font-serif-gov text-xl font-black text-slate-900 leading-none my-0.5">
                8,420
              </span>
              <span className="text-[10px] font-bold text-[#2563EB]">
                Quintals Today
              </span>
            </div>
          </div>

          {/* Interactive Legend with Analogous Blue / Teal Tones */}
          <div className="space-y-1.5 w-full sm:w-auto">
            {ICAR_SOIL_DATA.map((item) => {
              const isActive = (hoveredZone && hoveredZone.id === item.id) || selectedZone.id === item.id;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredZone(item)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => setSelectedZone(item)}
                  className={`p-2 rounded-xl text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-blue-50/90 border border-blue-200 ring-1 ring-blue-300'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block text-[11px]">
                        {item.zoneName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {item.soilType}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-serif-gov text-xs font-bold text-slate-900 block">
                      {item.percentage}%
                    </span>
                    <span className="text-[10px] text-[#2563EB] font-mono">
                      {item.yieldQtl} Qtl
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected ICAR Soil Deep-Dive Box */}
      <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-serif-gov font-bold text-slate-900 flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: selectedZone.color }}
            />
            {selectedZone.zoneName}
          </span>
          <span className="text-[10px] bg-white text-blue-800 font-semibold px-2 py-0.5 rounded border border-blue-200">
            pH: {selectedZone.phRange}
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {selectedZone.description}
        </p>
        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-[#0284C7]" />
            Avg Moisture: <strong className="text-slate-800">{selectedZone.avgMoisture}</strong>
          </span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Standard Grade Assayed
          </span>
        </div>
      </div>
    </div>
  );
};
