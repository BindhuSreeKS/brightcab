import { Driver } from '../../../types';

export interface DriverApplication extends Omit<Driver, 'verificationStatus'> {
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'AWAITING_VERIFICATION';
  email: string;
  panNumber: string;
  rcNumber: string;
  insuranceNumber: string;
  pollutionNumber: string;
  vehicleModel: string;
  vehicleBrand: string;
  vehicleColor: string;
  manufacturingYear: number;
  city: string;
  zone: string;
  rejectionReason?: string;
  verificationProgress: number; // 0-100
  documents: {
    aadhaarFront: string;
    aadhaarBack: string;
    drivingLicense: string;
    panCard: string;
    rcBook: string;
    insurance: string;
    pollution: string;
    vehicleFront: string;
    vehicleBack: string;
    vehicleSide: string;
    driverSelfie: string;
  };
  backgroundCheckStatus: 'PENDING' | 'CLEARED' | 'FLAGGED' | 'REJECTED';
  riskScore: number;
  fraudAlerts: string[];
}

export const ONBOARDING_STATS = {
  totalRequests: 1250,
  pendingVerification: 145,
  approvedDrivers: 980,
  rejectedApplications: 125,
  expiredDocuments: 24,
  pendingVehicleVerification: 56,
  awaitingActivation: 38,
};

export const MOCK_APPLICATIONS: DriverApplication[] = [
  {
    id: 'APP001',
    name: 'Amit Sharma',
    phone: '+91 98765 43210',
    email: 'amit.sharma@example.com',
    vehicleType: 'Sedan',
    vehicleNumber: 'KA-01-MG-1234',
    licenseNumber: 'DL1234567890',
    aadhaarNumber: '1234 5678 9012',
    panNumber: 'ABCDE1234F',
    rcNumber: 'RC12345678',
    insuranceNumber: 'INS12345678',
    pollutionNumber: 'PUC12345678',
    vehicleModel: 'Dzire',
    vehicleBrand: 'Maruti Suzuki',
    vehicleColor: 'White',
    manufacturingYear: 2021,
    city: 'Bengaluru',
    zone: 'Koramangala',
    rating: 0,
    earnings: 0,
    rideCount: 0,
    status: 'OFFLINE',
    verificationStatus: 'PENDING',
    verificationProgress: 65,
    joinedAt: '2024-05-10',
    documents: {
      aadhaarFront: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      aadhaarBack: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      drivingLicense: 'https://images.unsplash.com/photo-1554224155-1696413565d3?w=400',
      panCard: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      rcBook: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      insurance: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      pollution: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      vehicleFront: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400',
      vehicleBack: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400',
      vehicleSide: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400',
      driverSelfie: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    },
    backgroundCheckStatus: 'PENDING',
    riskScore: 15,
    fraudAlerts: [],
  },
  {
    id: 'APP002',
    name: 'Priya Singh',
    phone: '+91 87654 32109',
    email: 'priya.singh@example.com',
    vehicleType: 'Mini',
    vehicleNumber: 'KA-03-MT-5678',
    licenseNumber: 'DL9876543210',
    aadhaarNumber: '9876 5432 1098',
    panNumber: 'FGHIJ5678K',
    rcNumber: 'RC87654321',
    insuranceNumber: 'INS87654321',
    pollutionNumber: 'PUC87654321',
    vehicleModel: 'WagonR',
    vehicleBrand: 'Maruti Suzuki',
    vehicleColor: 'Silver',
    manufacturingYear: 2022,
    city: 'Bengaluru',
    zone: 'Indiranagar',
    rating: 0,
    earnings: 0,
    rideCount: 0,
    status: 'OFFLINE',
    verificationStatus: 'UNDER_REVIEW',
    verificationProgress: 85,
    joinedAt: '2024-05-12',
    documents: {
      aadhaarFront: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      aadhaarBack: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      drivingLicense: 'https://images.unsplash.com/photo-1554224155-1696413565d3?w=400',
      panCard: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      rcBook: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      insurance: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      pollution: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      vehicleFront: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
      vehicleBack: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
      vehicleSide: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
      driverSelfie: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    },
    backgroundCheckStatus: 'CLEARED',
    riskScore: 5,
    fraudAlerts: [],
  },
  {
    id: 'APP003',
    name: 'Rahul Verma',
    phone: '+91 76543 21098',
    email: 'rahul.verma@example.com',
    vehicleType: 'SUV',
    vehicleNumber: 'KA-05-MN-9012',
    licenseNumber: 'DL4567890123',
    aadhaarNumber: '4567 8901 2345',
    panNumber: 'KLMNO9012P',
    rcNumber: 'RC90123456',
    insuranceNumber: 'INS90123456',
    pollutionNumber: 'PUC90123456',
    vehicleModel: 'Ertiga',
    vehicleBrand: 'Maruti Suzuki',
    vehicleColor: 'Grey',
    manufacturingYear: 2023,
    city: 'Bengaluru',
    zone: 'HSR Layout',
    rating: 0,
    earnings: 0,
    rideCount: 0,
    status: 'OFFLINE',
    verificationStatus: 'AWAITING_VERIFICATION',
    verificationProgress: 40,
    joinedAt: '2024-05-14',
    documents: {
      aadhaarFront: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      aadhaarBack: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      drivingLicense: 'https://images.unsplash.com/photo-1554224155-1696413565d3?w=400',
      panCard: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      rcBook: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      insurance: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      pollution: 'https://images.unsplash.com/photo-1633113088483-66b746a5c51c?w=400',
      vehicleFront: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=400',
      vehicleBack: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=400',
      vehicleSide: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=400',
      driverSelfie: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    },
    backgroundCheckStatus: 'FLAGGED',
    riskScore: 75,
    fraudAlerts: ['Multiple accounts detected', 'Address mismatch'],
  },
];
