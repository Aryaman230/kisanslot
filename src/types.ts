export type AppInterface = 'farmer' | 'admin';

export type CropSeason = 'Kharif' | 'Rabi' | 'Zaid';

export interface CropInfo {
  id: string;
  nameEn: string;
  nameHi: string;
  season: CropSeason;
  mspPerQuintal: number;
  icarSuitability: string;
  icon: string;
}

export interface VehicleEstimate {
  type: string;
  hindiName: string;
  capacityRange: string;
  recommendedTonnage: string;
  imageHint: string;
  description: string;
}

export type QueueStatus = 'Scheduled' | 'En Route' | 'Gate Entered' | 'Quality Checking' | 'DBT Processing' | 'Cleared';

export interface FarmerRecord {
  token: string;
  farmerName: string;
  farmerNameHi?: string;
  phone: string;
  crop: string;
  icarSoilZone: string;
  yieldQtl: number;
  vehicleType: string;
  vehicleNumber: string;
  assignedGate: string;
  status: QueueStatus;
  slotTime: string;
  gateEntryTime?: string;
  moisturePercent?: number;
  purityPercent?: number;
  dbtAmount?: number;
  paymentRef?: string;
}

export interface IcarSoilZoneData {
  id: string;
  zoneName: string;
  soilType: string;
  percentage: number;
  yieldQtl: number;
  color: string;
  description: string;
  avgMoisture: string;
  phRange: string;
}

export interface MandiKpiData {
  totalLoadTodayQtl: number;
  activeFarmers: number;
  avgWaitTimeMins: number;
  paymentsClearedCr: number;
}

export interface MandiCapacity {
  totalDailySlots: number;
  bookedSlots: number;
  availableSlots: number;
  occupancyPercent: number;
  status: 'Available' | 'Fast Filling' | 'Full' | 'Suspended';
  currentSlotWindow?: string;
  lastUpdated?: string;
}
