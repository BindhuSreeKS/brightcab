import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["CUSTOMER", "DRIVER", "ADMIN", "SUPER_ADMIN"],
    required: true,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
    default: "ACTIVE",
  },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", UserSchema);

const RideSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pickupLocation: { type: String, required: true },
  dropLocation: { type: String, required: true },
  fare: { type: Number, required: true },
  status: {
    type: String,
    enum: ["REQUESTED", "ACCEPTED", "ON_RIDE", "COMPLETED", "CANCELLED"],
    default: "REQUESTED",
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export const Ride = mongoose.model("Ride", RideSchema);

const SystemLogSchema = new mongoose.Schema({
  level: { type: String, enum: ["INFO", "WARNING", "ERROR"], default: "INFO" },
  message: { type: String, required: true },
  service: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const SystemLog = mongoose.model("SystemLog", SystemLogSchema);
