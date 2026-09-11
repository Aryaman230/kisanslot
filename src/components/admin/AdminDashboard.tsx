/** @jsxRuntime classic */
// @ts-expect-error React typings are provided by the project's global type setup.
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  TrendingUp,
  AlertTriangle,
  Users,
  Scale,
  CreditCard,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Zap,
  MapPin,
  Building,
  Eye,
  Fingerprint,
  Landmark,
  FileCheck,
  Loader2,
  Bell,
  X
} from 'lucide-react';
import { FarmerRecord, MandiKpiData, QueueStatus } from '../../types';
import { IcarSoilChart } from './IcarSoilChart';
import { HaltOperationsModal } from './HaltOperationsModal';

interface AdminDashboardProps {
  isHalted: boolean;
  onResumeOperations: () => void;
  onConfirmHalt: (reason: string) => void;
  farmerRecords: FarmerRecord[];
  onUpdateRecordStatus: (token: string, newStatus: QueueStatus) => void;
  onSwitchToFarmerView: () => void;
}

interface FirebaseSlotData {
  token?: string;
  farmerName?: string;
  farmerNameHi?: string;
  farmerId?: string;
  phone?: string;
  crop?: string;
  yieldQtl?: number;
  season?: string;
  assignedGate?: string;
  slotTime?: string;
  status?: QueueStatus;
  icarSoilZone?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  moisturePercent?: number;
  purityPercent?: number;
  dbtAmount?: number;
}

type StatusFilter = 'ALL' | 'IN_QUEUE' | 'EN_ROUTE' | 'CLEARED';

interface StatusFilterOption {
  id: StatusFilter;
  label: string;
}

export const AdminDashboard = ({
  isHalted,
  onResumeOperations,
  onConfirmHalt,
  farmerRecords,
  onUpdateRecordStatus,
  onSwitchToFarmerView,
}: AdminDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerRecord | null>(null);
  const [isHaltModalOpen, setIsHaltModalOpen] = useState<boolean>(false);

  // --- INSPECTION MODAL STATE SIMULATION ---
  const [inspectionStep, setInspectionStep] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // --- FIREBASE REAL-TIME LISTENER (ONSNAPSHOT) ---
  const [liveSlots, setLiveSlots] = useState<FarmerRecord[]>(farmerRecords);

  useEffect(() => {
    const q = query(collection(db, "slots"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cloudSlots: FarmerRecord[] = snapshot.docs.map((doc): FarmerRecord => {
        const data = doc.data() as FirebaseSlotData;
        return {
          token: data.token || 'A127',
          farmerName: data.farmerName || 'Ramesh Yadav',
          farmerNameHi: data.farmerNameHi || 'रमेश यादव',
          phone: data.phone || '9876543210',
          crop: data.crop || 'Wheat (Sharbati)',
          yieldQtl: data.yieldQtl || 45,
          assignedGate: data.assignedGate || 'Gate 02',
          slotTime: data.slotTime || '08:30 AM - 10:00 AM',
          status: data.status || 'Scheduled',
          icarSoilZone: data.icarSoilZone || 'Gangetic Alluvial Tract',
          vehicleNumber: data.vehicleNumber || 'BR-06-G-4921',
          vehicleType: data.vehicleType || 'Medium Pickup (Bolero)',
          moisturePercent: data.moisturePercent || 11.8,
          purityPercent: data.purityPercent || 99.2,
          dbtAmount: data.dbtAmount || 102375,
        };
      });

      if (cloudSlots.length > 0) {
        setLiveSlots(cloudSlots);
      }
    }, (error) => {
      console.error("Error fetching live slots from Firebase: ", error);
    });

    return () => unsubscribe();
  }, []);

  const filteredFarmers = liveSlots.filter((farmer: FarmerRecord): boolean => {
    const matchesSearch =
      farmer.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.icarSoilZone.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'IN_QUEUE')
      return farmer.status === 'Gate Entered' || farmer.status === 'Quality Checking';
    if (statusFilter === 'EN_ROUTE') return farmer.status === 'En Route' || farmer.status === 'Scheduled';
    if (statusFilter === 'CLEARED') return farmer.status === 'Cleared' || farmer.status === 'DBT Processing';

    return true;
  });

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case 'Cleared':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Cleared & Paid
          </span>
        );
      case 'Quality Checking':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" /> Quality Testing
          </span>
        );
      case 'Gate Entered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Scale className="w-3 h-3 text-blue-600" /> Gate In / Weighbridge
          </span>
        );
      case 'DBT Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-900 border border-purple-300">
            <CreditCard className="w-3 h-3 text-purple-600" /> DBT Processing
          </span>
        );
      case 'En Route':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <Truck className="w-3 h-3 text-slate-500" /> En Route
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            {status}
          </span>
        );
    }
  };

  const dashboardKpis = {
    totalLoadQtl: 8420,
    activeFarmers: 184,
    avgWaitTimeMins: 22,
    paymentsClearedCr: 1.84,
  };

  // --- INSPECTION & PROCUREMENT WORKFLOW ACTIONS ---
  const handleVerifyAadhaar = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setInspectionStep(1); // Aadhaar Verified
    }, 1200);
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setInspectionStep(2); // Payment Done & Receipt Generated
    }, 2000);
  };

  const handleFinalizeAndNotify = () => {
    if (selectedFarmer) {
      onUpdateRecordStatus(selectedFarmer.token, 'Cleared');
      setSelectedFarmer(null);
      setInspectionStep(0); // Reset for next inspection
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
      {/* 1. OFFICIAL MANDI HEADER */}
      <header className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-lg shadow-sm border border-blue-900 shrink-0">
            <Building className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-gov text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                KisanSlot Admin - Madhubani Command Center
              </h1>
              <span className="bg-blue-100 text-blue-900 text-[11px] font-bold px-2 py-0.5 rounded border border-blue-300 uppercase tracking-wide hidden sm:inline-block">
                APMC Hub
              </span>
            </div>
            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
              <span>Mandi Secretary: <strong>Dr. A. K. Verma</strong></span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> 4/4 Weighbridges Calibrated
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="font-mono text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> e-NAM Code: BR-MD-091
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {isHalted ? (
            <button
              onClick={onResumeOperations}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all animate-bounce"
            >
              <RefreshCw className="w-4 h-4" />
              <span>RESUME MANDI OPERATIONS</span>
            </button>
          ) : (
            <button
              id="admin-kill-switch-btn"
              onClick={() => setIsHaltModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 px-5 sm:px-6 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all border-2 border-red-700 active:scale-95"
            >
              <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
              <span>HALT OPERATIONS (Kill Switch)</span>
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {isHalted && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-red-600 text-white p-4 rounded-2xl shadow-lg border-2 border-red-700 flex flex-col sm:flex-row items-center justify-between gap-3 my-2">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-white shrink-0 animate-pulse" />
                <div>
                  <h4 className="font-serif-gov text-sm font-bold">
                    MANDI OPERATIONS CURRENTLY HALTED
                  </h4>
                  <p className="text-xs text-red-100">
                    Incoming gates RFID barriers closed. Buffer holding instructions broadcasted to 184 registered farmers.
                  </p>
                </div>
              </div>
              <button
                onClick={onResumeOperations}
                className="bg-white text-red-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 shadow-md shrink-0"
              >
                Lift Suspension & Resume Flow
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Load Today (Qtl)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center"><Scale className="w-4 h-4" /></div>
          </div>
          <div className="my-2">
            <div className="font-serif-gov text-3xl font-black text-slate-900 tracking-tight">{dashboardKpis.totalLoadQtl?.toLocaleString('en-IN')} <span className="text-sm font-sans font-medium text-slate-500">Qtl</span></div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1"><TrendingUp className="w-3.5 h-3.5" /><span>+12.4% vs 7-day avg</span></div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Farmers</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"><Users className="w-4 h-4" /></div>
          </div>
          <div className="my-2">
            <div className="font-serif-gov text-3xl font-black text-slate-900 tracking-tight">{dashboardKpis.activeFarmers} <span className="text-sm font-sans font-medium text-slate-500">Farmers</span></div>
            <div className="flex items-center gap-1 text-xs text-blue-700 font-semibold mt-1"><Truck className="w-3.5 h-3.5" /><span>42 On-Site • 142 In Transit</span></div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Wait Time</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"><Clock className="w-4 h-4" /></div>
          </div>
          <div className="my-2">
            <div className="font-serif-gov text-3xl font-black text-slate-900 tracking-tight">{dashboardKpis.avgWaitTimeMins} <span className="text-sm font-sans font-medium text-slate-500">Mins</span></div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1"><TrendingUp className="w-3.5 h-3.5" /><span>-35% vs non-slot manual entry</span></div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payments Cleared (₹ Cr)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><CreditCard className="w-4 h-4" /></div>
          </div>
          <div className="my-2">
            <div className="font-serif-gov text-3xl font-black text-[#2563EB] tracking-tight">₹ {dashboardKpis.paymentsClearedCr} <span className="text-sm font-sans font-medium text-slate-500">Cr</span></div>
            <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold mt-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>98.4% auto-cleared via DBT</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif-gov text-base font-bold text-slate-900 flex items-center gap-2">
                  Incoming Farmers Live Queue
                  <span className="text-xs font-sans font-semibold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                    {filteredFarmers.length} Vehicles
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Real-time electronic weighbridge telemetry & grading</p>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
                <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold self-stretch sm:self-auto overflow-x-auto">
                  {([{ id: 'ALL', label: 'All' }, { id: 'IN_QUEUE', label: 'In Queue' }, { id: 'EN_ROUTE', label: 'En Route' }, { id: 'CLEARED', label: 'Cleared' }] satisfies StatusFilterOption[]).map((f: StatusFilterOption) => (
                    <button
                      key={f.id}
                      onClick={() => setStatusFilter(f.id)}
                      className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${statusFilter === f.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search token, farmer name, crop, zone..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB] outline-hidden text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Prototype Synergy:</span>
                <button
                  onClick={() => onUpdateRecordStatus('A127', 'Cleared')}
                  className="bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Advance Token A127 (Ramesh Yadav) to Cleared</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Token</th>
                    <th className="py-3 px-4">Farmer Name</th>
                    <th className="py-3 px-4">Crop & ICAR Soil Zone</th>
                    <th className="py-3 px-4">Est. Yield</th>
                    <th className="py-3 px-4">Gate & Vehicle</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFarmers.map((farmer: FarmerRecord): React.ReactElement => {
                    const isRameshYadav: boolean = farmer.token === 'A127';
                    return (
                      <tr key={farmer.token} className={`transition-colors hover:bg-slate-50/90 ${isRameshYadav ? 'bg-blue-50/50 border-l-4 border-l-[#2563EB]' : ''}`}>
                        <td className="py-3.5 px-4 font-serif-gov text-sm font-black text-[#2563EB]">
                          <div className="flex items-center gap-1.5">
                            <span>{farmer.token}</span>
                            {isRameshYadav && <span className="text-[9px] bg-[#2563EB] text-white px-1.5 py-0.5 rounded font-sans font-bold uppercase tracking-wider">YOU / PWA</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div>{farmer.farmerName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{farmer.phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-serif-gov font-bold text-slate-800">{farmer.crop}</div>
                          <div className="text-[10px] text-blue-700 font-medium">{farmer.icarSoilZone}</div>
                        </td>
                        <td className="py-3.5 px-4 font-serif-gov text-sm font-bold text-slate-900">
                          {farmer.yieldQtl} Qtl
                          <span className="text-[10px] text-slate-400 font-sans block font-normal">~{(farmer.yieldQtl * 0.1).toFixed(1)} MT</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <div className="font-semibold">{farmer.assignedGate}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{farmer.vehicleNumber}</div>
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(farmer.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isRameshYadav && (
                              <button onClick={onSwitchToFarmerView} title="View in Farmer Mobile PWA" className="p-1.5 rounded-lg bg-blue-100 text-[#2563EB] hover:bg-blue-200 transition-colors">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                setSelectedFarmer(farmer);
                                setInspectionStep(0);
                                setIsProcessing(false);
                              }}
                              className="px-2 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-[#2563EB] font-medium transition-colors flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" /> Inspect <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <IcarSoilChart />
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-serif-gov font-bold text-slate-900 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-500" /> Command Dispatch Logs</h4>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">Today, 08:42 AM</span>
            </div>
            <div className="space-y-2.5">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5 font-mono"><span>08:14 AM</span><span className="text-emerald-700 font-bold">RFID Verified</span></div>
                Token <strong>A127 (Ramesh Yadav)</strong> cleared RFID Gate 02 weighbridge.
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5 font-mono"><span>07:42 AM</span><span className="text-emerald-700 font-bold">DBT Cleared</span></div>
                Payment of ₹1,41,050 settled for Token <strong>A119</strong> via Aadhaar Payment Bridge.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- NEW SIMPLIFIED PROCUREMENT & PAYMENT MODAL FOR SIH26032 --- */}
      <AnimatePresence>
        {selectedFarmer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-[#0F172A] p-5 flex items-start justify-between relative overflow-hidden">
                <div className="relative z-10 text-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Procurement & DBT Clearance Panel
                  </span>
                  <h3 className="font-serif-gov text-xl font-bold flex items-center gap-2">
                    {selectedFarmer.farmerName} 
                    <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-mono">
                      {selectedFarmer.token}
                    </span>
                  </h3>
                </div>
                <button onClick={() => setSelectedFarmer(null)} className="text-slate-400 hover:text-white relative z-10 transition-colors bg-white/10 p-1.5 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Info Summary */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Commodity Declared</span>
                    <span className="font-bold text-slate-900">{selectedFarmer.crop}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Yield & Quality</span>
                    <span className="font-bold text-[#2563EB]">{selectedFarmer.yieldQtl} Qtl (Grade A)</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-slate-500">Estimated Payout</span>
                    <span className="font-serif-gov text-lg font-black text-emerald-600">₹{(selectedFarmer.yieldQtl * 2275).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* STEP 1: Aadhaar Verification */}
                <div className="relative border-l-2 border-slate-200 pl-5 pb-6">
                  <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${inspectionStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {inspectionStep >= 1 ? <CheckCircle2 className="w-4 h-4" /> : <Fingerprint className="w-4 h-4" />}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">1. Verify Identity (Aadhaar KYC)</h4>
                  <p className="text-xs text-slate-500 mb-3">Admin verifies farmer physically matches the linked Aadhaar.</p>
                  
                  {inspectionStep === 0 ? (
                    <button 
                      onClick={handleVerifyAadhaar} 
                      disabled={isProcessing}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-70"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                      Mark Aadhaar as Verified
                    </button>
                  ) : (
                    <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold py-2 px-3 rounded-lg border border-emerald-200 inline-flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Aadhaar Verified Successfully ([Aadhaar Redacted])
                    </div>
                  )}
                </div>

                {/* STEP 2: Simplified Bank Transfer & Receipt */}
                <div className="relative border-l-2 border-transparent pl-5">
                  <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${inspectionStep >= 2 ? 'bg-emerald-500 text-white' : (inspectionStep === 1 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400')}`}>
                    {inspectionStep >= 2 ? <FileCheck className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">2. Process DBT Payment & Generate Receipt</h4>
                  <p className="text-xs text-slate-500 mb-3">Fetch Aadhaar-linked bank account, send payment, and upload receipt.</p>
                  
                  {inspectionStep < 1 && (
                    <div className="text-xs text-slate-400 font-medium italic">Complete Step 1 to unlock payment processing.</div>
                  )}

                  {inspectionStep === 1 && (
                    <button 
                      onClick={handleProcessPayment} 
                      disabled={isProcessing}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-md disabled:opacity-70"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                      {isProcessing ? 'Fetching NPCI & Transferring Funds...' : 'Fetch Bank & Send Payment'}
                    </button>
                  )}

                  {inspectionStep === 2 && (
                    <div className="space-y-2">
                      <div className="bg-emerald-50 text-emerald-800 text-xs font-medium py-2.5 px-3 rounded-lg border border-emerald-200 flex flex-col gap-1">
                        <span className="font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Payment Transferred via DBT</span>
                        <span className="text-emerald-700/80">Credited to: Bank of India (ending in 8841)</span>
                      </div>
                      <div className="bg-slate-50 text-slate-700 text-[10px] font-mono py-1.5 px-3 rounded border border-slate-200 flex justify-between items-center">
                        <span>Receipt: RCPT-{Date.now().toString().slice(-6)}</span>
                        <span className="text-[#2563EB] font-bold cursor-pointer hover:underline">Uploaded to Profile</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer / Final Action */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button
                  onClick={handleFinalizeAndNotify}
                  disabled={inspectionStep !== 2}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-2.5 px-5 rounded-xl text-sm flex items-center gap-2 shadow-md transition-all"
                >
                  <Bell className="w-4 h-4" />
                  Send Notification & Mark Cleared
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* KILL SWITCH CONFIRMATION MODAL */}
      <HaltOperationsModal
        isOpen={isHaltModalOpen}
        onClose={() => setIsHaltModalOpen(false)}
        onConfirmHalt={(reason: string) => {
          onConfirmHalt(reason);
          setIsHaltModalOpen(false);
        }}
      />
    </div>
  );
};