import { Driver, Customer, Ride, Stats } from './types';

export const MOCK_STATS: Stats = {
  totalRides: 12450,
  activeRides: 42,
  completedRides: 11800,
  cancelledRides: 608,
  totalCustomers: 45000,
  activeDrivers: 850,
  onlineDrivers: 320,
  totalRevenue: 2450000,
};

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'D1',
    name: 'Rajesh Kumar',
    phone: '+91 9876543210',
    vehicleType: 'Sedan',
    vehicleNumber: 'KA-01-MJ-1234',
    licenseNumber: 'KA01 20200012345',
    aadhaarNumber: '1234 5678 9012',
    rating: 4.8,
    earnings: 45000,
    rideCount: 156,
    status: 'ONLINE',
    verificationStatus: 'APPROVED',
    joinedAt: '2023-01-15',
  },
  {
    id: 'D2',
    name: 'Suresh Patil',
    phone: '+91 9876543211',
    vehicleType: 'Mini',
    vehicleNumber: 'KA-01-MJ-5678',
    licenseNumber: 'KA01 20200056789',
    aadhaarNumber: '5678 1234 9012',
    rating: 4.2,
    earnings: 28000,
    rideCount: 89,
    status: 'OFFLINE',
    verificationStatus: 'PENDING',
    joinedAt: '2024-02-10',
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'C1',
    name: 'Anjali Sharma',
    phone: '+91 8877665544',
    email: 'anjali@example.com',
    totalRides: 45,
    cancellationRate: 2,
    rating: 4.9,
    walletBalance: 500,
    status: 'ACTIVE',
  },
];

export const MOCK_RIDES: Ride[] = [
  {
    id: 'R1',
    customerId: 'C1',
    customerName: 'Anjali',
    driverId: 'D1',
    driverName: 'Rajesh Kumar',
    pickupLocation: 'Koramangala 5th Block, Bengaluru',
    dropLocation: 'Indiranagar Metro Station, Bengaluru',
    status: 'ONGOING',
    fare: 350,
    paymentType: 'UPI',
    createdAt: new Date().toISOString(),
    distance: '8.5 km',
    duration: '25 mins',
  },
];
