export type UserRole = 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  aadhaarNumber: string;
  rating: number;
  earnings: number;
  rideCount: number;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  joinedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalRides: number;
  cancellationRate: number;
  rating: number;
  walletBalance: number;
  status: 'ACTIVE' | 'BLOCKED';
}

export type RideStatus = 'REQUESTED' | 'ACCEPTED' | 'ARRIVED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Ride {
  id: string;
  customerId: string;
  customerName: string;
  driverId?: string;
  driverName?: string;
  pickupLocation: string;
  dropLocation: string;
  status: RideStatus;
  fare: number;
  paymentType: 'CASH' | 'UPI' | 'WALLET' | 'CARD';
  createdAt: string;
  distance: string;
  duration: string;
}

export interface Stats {
  totalRides: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
  totalCustomers: number;
  activeDrivers: number;
  onlineDrivers: number;
  totalRevenue: number;
}

export type VehicleCategory = 'MINI' | 'SEDAN' | 'SUV' | 'AUTO' | 'BIKE' | 'HATCHBACK' | 'LUXURY';
