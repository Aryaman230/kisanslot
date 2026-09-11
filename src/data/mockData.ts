import { CropInfo, FarmerRecord, IcarSoilZoneData, MandiKpiData, VehicleEstimate } from '../types';

export const CROPS_DATA: CropInfo[] = [
  // Rabi
  { id: 'wheat', nameEn: 'Wheat (Sharbati)', nameHi: 'गेहूं (शरबती)', season: 'Rabi', mspPerQuintal: 2275, icarSuitability: 'Zone 4 Alluvial Silt Loam', icon: '🌾' },
  { id: 'mustard', nameEn: 'Mustard (Pusa Bold)', nameHi: 'सरसों (पूसा बोल्ड)', season: 'Rabi', mspPerQuintal: 5650, icarSuitability: 'Zone 2 Calcareous Alluvium', icon: '🌱' },
  { id: 'gram', nameEn: 'Gram / Chana', nameHi: 'चना (देसी)', season: 'Rabi', mspPerQuintal: 5440, icarSuitability: 'Zone 7 Sandy Clay Terai', icon: '🫘' },
  { id: 'barley', nameEn: 'Barley (Jau)', nameHi: 'जौ', season: 'Rabi', mspPerQuintal: 1850, icarSuitability: 'Zone 4 Alluvial Silt Loam', icon: '🌾' },

  // Kharif
  { id: 'paddy', nameEn: 'Paddy (Basmati / Common)', nameHi: 'धान (बासमती / सामान्य)', season: 'Kharif', mspPerQuintal: 2183, icarSuitability: 'Zone 9 Deep Organic Clay', icon: '🌾' },
  { id: 'maize', nameEn: 'Maize (Hybrid Corn)', nameHi: 'मक्का (संकर)', season: 'Kharif', mspPerQuintal: 2090, icarSuitability: 'Zone 4 Alluvial Silt Loam', icon: '🌽' },
  { id: 'soybean', nameEn: 'Soybean (Yellow)', nameHi: 'सोयाबीन', season: 'Kharif', mspPerQuintal: 4600, icarSuitability: 'Zone 2 Calcareous Alluvium', icon: '🌱' },
  { id: 'arhar', nameEn: 'Arhar / Tur Dal', nameHi: 'अरहर / तूर दाल', season: 'Kharif', mspPerQuintal: 7000, icarSuitability: 'Zone 7 Sandy Clay Terai', icon: '🫘' },

  // Zaid
  { id: 'moong', nameEn: 'Green Moong (Summer)', nameHi: 'ग्रीन मूंग (दाल)', season: 'Zaid', mspPerQuintal: 8558, icarSuitability: 'Zone 4 Alluvial Loam', icon: '🌿' },
  { id: 'watermelon', nameEn: 'Melon & Watermelon', nameHi: 'तरबूज व खरबूजा', season: 'Zaid', mspPerQuintal: 1450, icarSuitability: 'Zone 7 Riverbed Sandy Belt', icon: '🍉' },
  { id: 'cucumber', nameEn: 'Summer Vegetables', nameHi: 'सब्जियां व खीरा', season: 'Zaid', mspPerQuintal: 1900, icarSuitability: 'Zone 4 Alluvial Silt Loam', icon: '🥒' },
];

export function getVehicleEstimate(yieldQtl: number): VehicleEstimate {
  if (yieldQtl <= 20) {
    return {
      type: '1 Small Commercial Vehicle (Tata Ace / Chhota Hathi)',
      hindiName: 'छोटा हाथी (टाटा ऐस)',
      capacityRange: '5 - 20 Quintals (Up to 2.0 MT)',
      recommendedTonnage: '1.5 - 2.0 Tonne Payload',
      imageHint: 'truck-small',
      description: 'Ideal for small batches, rapid gate weighbridge clearance & Dock Bay 04.'
    };
  } else if (yieldQtl <= 50) {
    return {
      type: '1 Pick-up Truck (Bolero Maxi / 1.7T LCV)',
      hindiName: 'पिक-अप वाहन (बोलेरो मैक्सी ट्रक)',
      capacityRange: '21 - 50 Quintals (Up to 5.0 MT)',
      recommendedTonnage: '3.0 - 5.0 Tonne Payload',
      imageHint: 'truck-medium',
      description: 'Standard Mandi workhorse. Fast electronic Entry gate entry at Gate 02.'
    };
  } else if (yieldQtl <= 100) {
    return {
      type: '1 Heavy Farm Tractor Trolley (Standard Dual-Axle)',
      hindiName: 'स्टैंडर्ड ट्रैक्टर ट्रॉली',
      capacityRange: '51 - 100 Quintals (Up to 10.0 MT)',
      recommendedTonnage: '7.5 - 10.0 Tonne Payload',
      imageHint: 'tractor',
      description: 'Designated for Heavy Unloading Bays 02 & 03 with automated grain augers.'
    };
  } else {
    return {
      type: '2 Tractor Trolleys or 1 Multi-Axle Heavy Hauler',
      hindiName: 'मल्टी-एक्सल भारी वाहन / 2 ट्रॉली',
      capacityRange: '101 - 150 Quintals (Up to 15.0 MT)',
      recommendedTonnage: '12.0 - 15.0 Tonne Payload',
      imageHint: 'truck-heavy',
      description: 'Requires advance weighbridge reservation at Gate 01 & Bulk Grain Silo Bay.'
    };
  }
}

export const INITIAL_FARMERS_TABLE: FarmerRecord[] = [
  {
    token: 'A127',
    farmerName: 'Ramesh Yadav',
    farmerNameHi: 'रमेश यादव',
    phone: '+91 98351 44921',
    crop: 'Wheat (Sharbati)',
    icarSoilZone: 'Zone 4 (Alluvial Silt Loam)',
    yieldQtl: 45,
    vehicleType: 'Bolero Maxi Pick-up',
    vehicleNumber: 'BR-32-JA-4491',
    assignedGate: 'Gate 02',
    status: 'Quality Checking',
    slotTime: '08:30 AM - 10:00 AM',
    gateEntryTime: '08:14 AM (Aadhar Verified)',
    moisturePercent: 11.8,
    purityPercent: 99.2,
    dbtAmount: 102375,
    paymentRef: 'eNAM-DBT-94829104',
  },
  {
    token: 'A119',
    farmerName: 'Suresh Prasad Mandal',
    farmerNameHi: 'सुरेश प्रसाद मंडल',
    phone: '+91 94312 88219',
    crop: 'Wheat (PBW-343)',
    icarSoilZone: 'Zone 4 (Alluvial Silt Loam)',
    yieldQtl: 62,
    vehicleType: 'Tractor Trolley',
    vehicleNumber: 'BR-32-B-1102',
    assignedGate: 'Gate 01',
    status: 'DBT Processing',
    slotTime: '07:30 AM - 09:00 AM',
    gateEntryTime: '07:42 AM',
    moisturePercent: 11.4,
    purityPercent: 99.0,
    dbtAmount: 141050,
    paymentRef: 'eNAM-DBT-83210941',
  },
  {
    token: 'A120',
    farmerName: 'Ramvilas Paswan',
    farmerNameHi: 'रामविलास पासवान',
    phone: '+91 97715 33018',
    crop: 'Mustard (Pusa Bold)',
    icarSoilZone: 'Zone 2 (Calcareous Alluvium)',
    yieldQtl: 38,
    vehicleType: 'Bolero Camper LCV',
    vehicleNumber: 'BR-32-E-9042',
    assignedGate: 'Gate 03',
    status: 'Quality Checking',
    slotTime: '08:00 AM - 09:30 AM',
    gateEntryTime: '08:02 AM',
    moisturePercent: 8.2,
    purityPercent: 98.6,
    dbtAmount: 214700,
    paymentRef: 'eNAM-DBT-83211024',
  },
  {
    token: 'A121',
    farmerName: 'Baidyanath Jha',
    farmerNameHi: 'बैद्यनाथ झा',
    phone: '+91 98350 71234',
    crop: 'Maize (Hybrid Ganga-5)',
    icarSoilZone: 'Zone 7 (Sandy Clay Terai)',
    yieldQtl: 85,
    vehicleType: 'Dual-Axle Tractor',
    vehicleNumber: 'BR-32-T-6651',
    assignedGate: 'Gate 01',
    status: 'Gate Entered',
    slotTime: '08:30 AM - 10:00 AM',
    gateEntryTime: '08:28 AM',
    moisturePercent: 13.1,
    purityPercent: 97.9,
    dbtAmount: 177650,
  },
  {
    token: 'A122',
    farmerName: 'Anandi Devi',
    farmerNameHi: 'आनंदी देवी',
    phone: '+91 91223 45678',
    crop: 'Green Moong (Summer)',
    icarSoilZone: 'Zone 4 (Alluvial Silt Loam)',
    yieldQtl: 25,
    vehicleType: 'Tata Ace (Chhota Hathi)',
    vehicleNumber: 'BR-32-H-3129',
    assignedGate: 'Gate 04',
    status: 'En Route',
    slotTime: '09:00 AM - 10:30 AM',
  },
  {
    token: 'A125',
    farmerName: 'Md. Farooq Alam',
    farmerNameHi: 'मोहम्मद फारूक',
    phone: '+91 94702 99810',
    crop: 'Gram / Chana',
    icarSoilZone: 'Zone 7 (Sandy Clay Terai)',
    yieldQtl: 110,
    vehicleType: 'Heavy Tractor Trolley',
    vehicleNumber: 'BR-32-K-7718',
    assignedGate: 'Gate 01',
    status: 'Gate Entered',
    slotTime: '08:45 AM - 10:15 AM',
    gateEntryTime: '08:36 AM',
    moisturePercent: 10.5,
    purityPercent: 98.8,
  },
  {
    token: 'A116',
    farmerName: 'Dharmendra Singh',
    farmerNameHi: 'धर्मेन्द्र सिंह',
    phone: '+91 93344 55122',
    crop: 'Wheat (HD-2967)',
    icarSoilZone: 'Zone 9 (Organic Clay)',
    yieldQtl: 50,
    vehicleType: 'Mahindra Bolero',
    vehicleNumber: 'BR-32-C-8812',
    assignedGate: 'Gate 02',
    status: 'Cleared',
    slotTime: '07:00 AM - 08:30 AM',
    gateEntryTime: '07:10 AM',
    moisturePercent: 11.2,
    purityPercent: 99.4,
    dbtAmount: 113750,
    paymentRef: 'eNAM-DBT-83209115',
  },
  {
    token: 'A128',
    farmerName: 'Kameshwar Mishra',
    farmerNameHi: 'कामेश्वर मिश्रा',
    phone: '+91 98012 34991',
    crop: 'Mustard (Pusa Bold)',
    icarSoilZone: 'Zone 2 (Calcareous Alluvium)',
    yieldQtl: 42,
    vehicleType: 'Tractor Trolley',
    vehicleNumber: 'BR-32-D-4412',
    assignedGate: 'Gate 03',
    status: 'En Route',
    slotTime: '09:15 AM - 10:45 AM',
  },
];

export const ICAR_SOIL_DATA: IcarSoilZoneData[] = [
  {
    id: 'zone-4',
    zoneName: 'Zone 4: Gangetic Silt Loam',
    soilType: 'Deep Alluvial Silt Loam',
    percentage: 38,
    yieldQtl: 3200,
    color: '#1E3A8A', // Deep Navy / Royal Blue Dark
    description: 'High fertility alluvial soil, optimal for Sharbati Wheat, Maize & Mustard.',
    avgMoisture: '11.6%',
    phRange: '7.2 - 7.6',
  },
  {
    id: 'zone-7',
    zoneName: 'Zone 7: Terai Sandy Clay',
    soilType: 'Sub-Himalayan Sandy Clay',
    percentage: 27,
    yieldQtl: 2273,
    color: '#2563EB', // Tech Royal Blue
    description: 'Permeable sub-Himalayan sediment belt, high phosphorus retention.',
    avgMoisture: '12.4%',
    phRange: '6.8 - 7.1',
  },
  {
    id: 'zone-2',
    zoneName: 'Zone 2: Calcareous Alluvium',
    soilType: 'Carbonate-Rich Sandy Loam',
    percentage: 21,
    yieldQtl: 1768,
    color: '#0284C7', // Ocean Blue / Cyan
    description: 'Lime-bearing alluvial deposits with excellent drainage and micro-nutrients.',
    avgMoisture: '10.9%',
    phRange: '7.8 - 8.2',
  },
  {
    id: 'zone-9',
    zoneName: 'Zone 9: Organic Wetland Clay',
    soilType: 'Heavy Organic Clay / Chaurs',
    percentage: 14,
    yieldQtl: 1179,
    color: '#38BDF8', // Light Teal / Sky Blue
    description: 'High water-table depression pockets with rich organic humus.',
    avgMoisture: '13.8%',
    phRange: '6.4 - 6.9',
  },
];

export const INITIAL_KPI_DATA: MandiKpiData = {
  totalLoadTodayQtl: 8420,
  activeFarmers: 184,
  avgWaitTimeMins: 22,
  paymentsClearedCr: 1.84,
};
