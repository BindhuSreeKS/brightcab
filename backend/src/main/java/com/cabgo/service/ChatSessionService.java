package com.cabgo.service;

import com.cabgo.enums.*;
import com.cabgo.model.*;
import com.cabgo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatSessionService {

    private final ChatSessionRepository chatSessionRepository;
    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final RideRepository rideRepository;
    private final DriverMatchingService driverMatchingService;
    private final WhatsAppService whatsAppService;
    private final GoogleMapsService mapsService;
    private final GeminiService geminiService;
    private final com.cabgo.repository.SOSAlertRepository sosAlertRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Value("${cab.fare.base:50.0}")
    private double baseFare;

    @Value("${cab.fare.per-km:12.0}")
    private double perKm;

    @Value("${cab.fare.per-minute:1.0}")
    private double perMinute;

    /**
     * Normalizes the incoming phone number to 91XXXXXXXXXX format.
     */
    public String normalizePhone(String phone) {
        if (phone == null) return "";
        String clean = phone.replaceAll("[^0-9]", "");
        if (clean.length() == 10) {
            return "91" + clean;
        }
        return clean;
    }

    /**
     * Entry point — called for every incoming WhatsApp message.
     */
    public void handleMessage(String fromPhone, String messageType, String textBody,
                               Double locationLat, Double locationLng, String locationName,
                               String interactiveReplyId) {
        // First check if the sender is a registered Driver
        String normalizedPhone = normalizePhone(fromPhone);
        Optional<Driver> driverOpt = driverRepository.findByWhatsappPhone(fromPhone)
            .or(() -> driverRepository.findByPhone(normalizedPhone));

        if (driverOpt.isPresent()) {
            handleDriverMessage(fromPhone, textBody, interactiveReplyId);
            return;
        }

        // Handle Customer Message
        ChatSession session = chatSessionRepository.findByWhatsappPhone(fromPhone)
            .orElseGet(() -> {
                ChatSession s = ChatSession.builder()
                    .whatsappPhone(fromPhone)
                    .state(ConversationState.IDLE)
                    .build();
                return chatSessionRepository.save(s);
            });

        session.setLastMessageAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());

        // Normalize input
        String text = textBody != null ? textBody.trim().toLowerCase() : "";
        String replyId = interactiveReplyId != null ? interactiveReplyId : "";

        // Global commands
        if (text.equals("hi") || text.equals("hello") || text.equals("start") || text.equals("menu")) {
            sendMainMenu(session);
            chatSessionRepository.save(session);
            return;
        }

        if (text.equals("sos")) {
            handleSOSAlert(session, false, fromPhone);
            return;
        }

        if (text.equals("track")) {
            handleTrackRide(session);
            return;
        }

        if (text.equals("fare") || text.contains("fare estimate")) {
            startFareEstimation(session);
            chatSessionRepository.save(session);
            return;
        }

        if (text.equals("cancel") && session.getState() != ConversationState.AWAITING_CANCEL_CONFIRM) {
            if (session.getActiveRideId() != null) {
                session.setState(ConversationState.AWAITING_CANCEL_CONFIRM);
                whatsAppService.sendText(fromPhone, "⚠️ *Cancel Ride Request*\n\nAre you sure you want to cancel your current booking?\n\n1️⃣ Yes, Cancel\n2️⃣ No, Keep Ride");
            } else {
                whatsAppService.sendText(fromPhone, "You don't have any active booking to cancel. Type *menu* to start.");
            }
            chatSessionRepository.save(session);
            return;
        }

        switch (session.getState()) {
            case IDLE, MAIN_MENU -> handleMainMenu(session, text, replyId);
            case AWAITING_PICKUP -> handlePickup(session, messageType, text, locationLat, locationLng, locationName);
            case AWAITING_DROP -> handleDrop(session, messageType, text, locationLat, locationLng, locationName);
            case AWAITING_VEHICLE_SELECTION -> handleVehicleSelection(session, text, replyId);
            case AWAITING_CONFIRMATION -> handleConfirmation(session, text, replyId);
            case RIDE_ACTIVE -> handleRideActive(session, text, replyId);
            case AWAITING_CANCEL_CONFIRM -> handleCancelConfirm(session, text, replyId);
            case AWAITING_PAYMENT_METHOD -> handlePaymentMethod(session, text, replyId);
            case AWAITING_RATING -> handleRating(session, text);
            
            // Driver registration steps
            case DRIVER_REG_NAME -> handleDriverRegName(session, text);
            case DRIVER_REG_EMAIL -> handleDriverRegEmail(session, text);
            case DRIVER_REG_CITY -> handleDriverRegCity(session, text);
            case DRIVER_REG_VEHICLE_CATEGORY -> handleDriverRegVehicleCategory(session, text, replyId);
            case DRIVER_REG_VEHICLE_MODEL -> handleDriverRegVehicleModel(session, text);
            case DRIVER_REG_VEHICLE_NUMBER -> handleDriverRegVehicleNumber(session, text);
            case DRIVER_REG_VEHICLE_COLOR -> handleDriverRegVehicleColor(session, text);
            case DRIVER_REG_AADHAAR -> handleDriverRegAadhaar(session, text);
            case DRIVER_REG_LICENSE -> handleDriverRegLicense(session, text);
            case DRIVER_REG_DOC_SELFIE -> handleDriverDocSelfie(session, messageType, text);
            case DRIVER_REG_DOC_AADHAAR -> handleDriverDocAadhaar(session, messageType, text);
            case DRIVER_REG_DOC_LICENSE -> handleDriverDocLicense(session, messageType, text);
            case DRIVER_REG_DOC_RC -> handleDriverDocRc(session, messageType, text);
            case DRIVER_REG_DOC_VEHICLE -> handleDriverDocVehicle(session, messageType, text);
            
            // Fare estimation steps
            case FARE_EST_PICKUP -> handleFareEstPickup(session, messageType, text, locationLat, locationLng, locationName);
            case FARE_EST_DROP -> handleFareEstDrop(session, messageType, text, locationLat, locationLng, locationName);
            case FARE_EST_VEHICLE -> handleFareEstVehicle(session, text, replyId);
            
            default -> {
                // Unknown state — ask Gemini to reply naturally, then show menu hint
                log.info("Unknown state {} for phone {}, delegating to Gemini", session.getState(), fromPhone);
                String geminiReply = geminiService.getReply(text.isEmpty() ? (interactiveReplyId != null ? interactiveReplyId : "") : text);
                whatsAppService.sendText(fromPhone, geminiReply + "\n\nType *menu* to see all options.");
            }
        }
        chatSessionRepository.save(session);
    }

    // =================== DRIVER INCOMING MESSAGE ===================
    /**
     * Handle messages sent BY A DRIVER (from their WhatsApp).
     */
    public void handleDriverMessage(String driverPhone, String text, String replyId) {
        String input = text != null ? text.trim().toLowerCase() : "";
        String cleanReply = replyId != null ? replyId.trim().toUpperCase() : "";

        if (input.equalsIgnoreCase("sos")) {
            handleSOSAlert(null, true, driverPhone);
            return;
        }

        if (input.startsWith("start ")) {
            String otp = input.substring(6).trim();
            driverStartRide(driverPhone, otp);
            return;
        }

        if (input.equals("1") || input.equals("accept") || cleanReply.equals("ACCEPT_RIDE")) {
            driverAcceptRide(driverPhone);
        } else if (input.equals("2") || input.equals("reject") || cleanReply.equals("REJECT_RIDE")) {
            driverRejectRide(driverPhone);
        } else if (input.equals("start") || cleanReply.equals("START_RIDE")) {
            driverStartRide(driverPhone, "");
        } else if (input.contains("complete") || input.contains("finish") || cleanReply.equals("COMPLETE_RIDE")) {
            driverCompleteRide(driverPhone);
        } else if (input.replaceAll("[^0-9]", "").length() == 4) {
            String otp = input.replaceAll("[^0-9]", "");
            driverStartRide(driverPhone, otp);
        } else {
            whatsAppService.sendText(driverPhone, 
                "📱 *Vazraa Driver Console*\n\n" +
                "Available commands:\n" +
                "• *1* or *accept* - Accept incoming request\n" +
                "• *2* or *reject* - Reject request\n" +
                "• *start <OTP>* - Start trip with passenger boarding OTP\n" +
                "• *complete* - Complete current trip\n" +
                "• *sos* - Trigger emergency SOS alert");
        }
    }

    // =================== STATE HANDLERS ===================

    private void sendMainMenu(ChatSession session) {
        session.setState(ConversationState.MAIN_MENU);
        String menuMsg = "Welcome to *Vazraa Cab Booking*! 🚖\n\n" +
            "How can we help you today?\n" +
            "1️⃣ *Book a Ride*\n" +
            "2️⃣ *View Ride History*\n" +
            "3️⃣ *Cancel Ride*\n" +
            "4️⃣ *Support / Help*\n" +
            "5️⃣ *Register as Driver*\n\n" +
            "Reply with the number of your choice (e.g. 1) to proceed.";
        whatsAppService.sendText(session.getWhatsappPhone(), menuMsg);
    }

    private void handleMainMenu(ChatSession session, String text, String replyId) {
        String input = replyId.isEmpty() ? text : replyId.toLowerCase();
        switch (input) {
            case "1", "book", "book_ride", "book a ride" -> startBooking(session);
            case "2", "my_rides", "rides", "my rides" -> showMyRides(session);
            case "3", "cancel", "cancel_ride", "cancel ride" -> {
                if (session.getActiveRideId() != null) {
                    session.setState(ConversationState.AWAITING_CANCEL_CONFIRM);
                    whatsAppService.sendText(session.getWhatsappPhone(), "⚠️ *Cancel Ride Request*\n\nAre you sure you want to cancel your current booking?\n\n1️⃣ Yes, Cancel\n2️⃣ No, Keep Ride");
                } else {
                    whatsAppService.sendText(session.getWhatsappPhone(), "You don't have any active booking to cancel. Type *menu* to start.");
                }
            }
            case "4", "support", "help" -> {
                session.setState(ConversationState.SUPPORT);
                whatsAppService.sendText(session.getWhatsappPhone(),
                    "🆘 *Vazraa Support*\n\nFor urgent help call: *+91-1800-VAZRAA*\nEmail: support@vazraamobility.com\n\nType *menu* to go back.");
            }
            case "5", "register", "driver" -> startDriverRegistration(session);
            default -> {
                // Unrecognised menu input — let Gemini handle it naturally
                log.info("Unrecognised main menu input '{}', delegating to Gemini", input);
                String geminiReply = geminiService.getReply(text.isEmpty() ? input : text);
                whatsAppService.sendText(session.getWhatsappPhone(), geminiReply + "\n\nType *menu* to see all options.");
            }
        }
    }

    private void startBooking(ChatSession session) {
        session.setState(ConversationState.AWAITING_PICKUP);
        session.setTempPickupAddress(null);
        session.setTempPickupLat(null);
        session.setTempPickupLng(null);
        session.setTempDropAddress(null);
        session.setTempDropLat(null);
        session.setTempDropLng(null);
        session.setTempFare(null);
        session.setTempDistance(null);
        session.setTempDuration(null);
        session.setRejectedDriverIds(new ArrayList<>());

        whatsAppService.sendText(session.getWhatsappPhone(),
            "📍 *Share your Pickup Location*\n\nYou can:\n• Send your live location 📌\n• Or type your address");
    }

    private void handlePickup(ChatSession session, String messageType, String text,
                               Double lat, Double lng, String locationName) {
        if ("location".equals(messageType) && lat != null && lng != null) {
            String address = locationName != null && !locationName.isEmpty() ? locationName
                : String.format("%.4f, %.4f", lat, lng);
            GoogleMapsService.GeocodingResult geo = mapsService.geocode(address);
            if (geo != null) {
                session.setTempPickupLat(geo.lat());
                session.setTempPickupLng(geo.lng());
                session.setTempPickupAddress(geo.formattedAddress());
            } else {
                session.setTempPickupLat(lat);
                session.setTempPickupLng(lng);
                session.setTempPickupAddress(address);
            }
        } else if (!text.isEmpty()) {
            GoogleMapsService.GeocodingResult geo = mapsService.geocode(text);
            if (geo != null) {
                session.setTempPickupLat(geo.lat());
                session.setTempPickupLng(geo.lng());
                session.setTempPickupAddress(geo.formattedAddress());
            } else {
                whatsAppService.sendText(session.getWhatsappPhone(),
                    "❌ Sorry, I couldn't find that location. Please try again or share your live location.");
                return;
            }
        } else {
            whatsAppService.sendText(session.getWhatsappPhone(), "Please share your pickup location.");
            return;
        }

        session.setState(ConversationState.AWAITING_DROP);
        whatsAppService.sendText(session.getWhatsappPhone(),
            "✅ *Pickup Set:* " + session.getTempPickupAddress() + "\n\n🎯 Now share your *Drop Location*:\n• Send location 📌\n• Or type address");
    }

    private void handleDrop(ChatSession session, String messageType, String text,
                             Double lat, Double lng, String locationName) {
        if ("location".equals(messageType) && lat != null && lng != null) {
            String address = locationName != null && !locationName.isEmpty() ? locationName
                : String.format("%.4f, %.4f", lat, lng);
            GoogleMapsService.GeocodingResult geo = mapsService.geocode(address);
            if (geo != null) {
                session.setTempDropLat(geo.lat());
                session.setTempDropLng(geo.lng());
                session.setTempDropAddress(geo.formattedAddress());
            } else {
                session.setTempDropLat(lat);
                session.setTempDropLng(lng);
                session.setTempDropAddress(address);
            }
        } else if (!text.isEmpty()) {
            GoogleMapsService.GeocodingResult geo = mapsService.geocode(text);
            if (geo != null) {
                session.setTempDropLat(geo.lat());
                session.setTempDropLng(geo.lng());
                session.setTempDropAddress(geo.formattedAddress());
            } else {
                whatsAppService.sendText(session.getWhatsappPhone(),
                    "❌ Couldn't find that location. Please try again.");
                return;
            }
        } else {
            whatsAppService.sendText(session.getWhatsappPhone(), "Please share your drop location.");
            return;
        }

        // Calculate distance and fare
        GoogleMapsService.DistanceResult result = mapsService.getDistance(
            session.getTempPickupLat(), session.getTempPickupLng(),
            session.getTempDropLat(), session.getTempDropLng()
        );
        double fare = baseFare + (result.distanceKm() * perKm) + (result.durationMinutes() * perMinute);
        fare = Math.round(fare * 100.0) / 100.0;

        session.setTempDistance(result.distanceKm());
        session.setTempDuration(result.durationMinutes());
        session.setTempFare(fare);

        // Ask customer to pick a car type before showing final fare
        session.setState(ConversationState.AWAITING_VEHICLE_SELECTION);
        String vehicleMsg =
            "🚗 *Choose Your Ride Type*\n\n" +
            "1️⃣ Mini (4 people) — budget-friendly\n" +
            "2️⃣ Hatchback (4 people) — easy city ride\n" +
            "3️⃣ Sedan (4 people) — everyday comfort\n" +
            "4️⃣ SUV (6 people) — spacious family ride\n" +
            "5️⃣ Luxury (4 people) — premium experience\n\n" +
            "Reply with the number of your choice (1–5).";
        whatsAppService.sendText(session.getWhatsappPhone(), vehicleMsg);
    }

    // ─── Vehicle Selection Step (car-only, with people count) ─────────────────
    private void handleVehicleSelection(ChatSession session, String text, String replyId) {
        String input = replyId.isEmpty() ? text.trim() : replyId.trim();
        VehicleCategory chosen;
        String chosenLabel;
        switch (input) {
            case "1", "mini"      -> { chosen = VehicleCategory.MINI;      chosenLabel = "Mini (4 people)"; }
            case "2", "hatchback" -> { chosen = VehicleCategory.HATCHBACK; chosenLabel = "Hatchback (4 people)"; }
            case "3", "sedan"     -> { chosen = VehicleCategory.SEDAN;     chosenLabel = "Sedan (4 people)"; }
            case "4", "suv"       -> { chosen = VehicleCategory.SUV;       chosenLabel = "SUV (6 people)"; }
            case "5", "luxury"    -> { chosen = VehicleCategory.LUXURY;    chosenLabel = "Luxury (4 people)"; }
            default -> {
                whatsAppService.sendText(session.getWhatsappPhone(),
                    "❌ Invalid choice. Please reply 1, 2, 3, 4, or 5 to select your ride type.");
                return;
            }
        }
        session.setTempVehicleCategory(chosen.name());

        // Now show fare confirmation with the chosen vehicle
        double fare = session.getTempFare() != null ? session.getTempFare() : 0.0;
        session.setState(ConversationState.AWAITING_CONFIRMATION);

        String fareMsg = String.format(
            "🚖 *Ride Summary*\n\n" +
            "📍 Pickup: %s\n" +
            "🎯 Drop: %s\n" +
            "🚗 Ride Type: *%s*\n\n" +
            "📏 Distance: %.1f km\n" +
            "⏱ Duration: %.0f mins\n\n" +
            "💰 *Estimated Fare: ₹%.0f*\n\n" +
            "Confirm booking?\n1️⃣ Confirm ✅\n2️⃣ Cancel ❌",
            session.getTempPickupAddress(), session.getTempDropAddress(), chosenLabel,
            session.getTempDistance() != null ? session.getTempDistance() : 0.0,
            session.getTempDuration() != null ? session.getTempDuration() : 0.0,
            fare
        );
        whatsAppService.sendText(session.getWhatsappPhone(), fareMsg);
    }

    private void handleConfirmation(ChatSession session, String text, String replyId) {
        String input = replyId.isEmpty() ? text : replyId.toLowerCase();
        if (input.equals("1") || input.equals("confirm") || input.contains("yes")) {
            createRideAndFindDriver(session);
        } else if (input.equals("2") || input.equals("cancel") || input.contains("no")) {
            session.setState(ConversationState.MAIN_MENU);
            whatsAppService.sendText(session.getWhatsappPhone(), "Booking cancelled. Type *menu* to start again.");
        } else {
            whatsAppService.sendText(session.getWhatsappPhone(), "Please reply 1 to Confirm or 2 to Cancel.");
        }
    }

    private void createRideAndFindDriver(ChatSession session) {
        // Look up or auto-register customer by phone
        String phoneSuffix = normalizePhone(session.getWhatsappPhone());
        Customer customer = customerRepository.findByPhone(phoneSuffix)
            .orElseGet(() -> {
                Customer newCust = Customer.builder()
                    .name("WhatsApp User")
                    .phone(phoneSuffix)
                    .email("wa_" + session.getWhatsappPhone() + "@vazraa.com")
                    .password("")
                    .status(CustomerStatus.ACTIVE)
                    .build();
                return customerRepository.save(newCust);
            });

        session.setCustomerId(customer.getId());
        session.setCustomerName(customer.getName());

        Ride ride = Ride.builder()
            .customerId(customer.getId())
            .customerName(customer.getName())
            .customerWhatsappPhone(session.getWhatsappPhone())
            .pickupLocation(session.getTempPickupAddress())
            .pickupLatitude(session.getTempPickupLat())
            .pickupLongitude(session.getTempPickupLng())
            .dropLocation(session.getTempDropAddress())
            .dropLatitude(session.getTempDropLat())
            .dropLongitude(session.getTempDropLng())
            .vehicleCategory(session.getTempVehicleCategory() != null
                    ? VehicleCategory.valueOf(session.getTempVehicleCategory())
                    : VehicleCategory.SEDAN)
            .status(RideStatus.SEARCHING)
            .estimatedFare(session.getTempFare())
            .fare(session.getTempFare())
            .distance(session.getTempDistance())
            .duration(session.getTempDuration())
            .paymentMethod(PaymentMethod.CASH)
            .paymentStatus("PENDING")
            .otp(String.format("%04d", new Random().nextInt(10000)))
            .bookingTime(LocalDateTime.now())
            .requestedAt(LocalDateTime.now())
            .build();

        ride = rideRepository.save(ride);
        session.setActiveRideId(ride.getId());
        session.setState(ConversationState.RIDE_ACTIVE);
        chatSessionRepository.save(session);

        whatsAppService.sendText(session.getWhatsappPhone(),
            "✅ *Ride Confirmed!*\n\n🔍 Searching for nearby drivers...\n\nRide ID: #" + ride.getId().substring(ride.getId().length() - 6).toUpperCase() + "\nOTP: *" + ride.getOtp() + "*\n\nYou'll be notified when a driver accepts.");

        // Trigger matching
        findAndAssignNextDriver(session, ride);
    }

    private void findAndAssignNextDriver(ChatSession session, Ride ride) {
        Optional<Driver> nearestDriver = driverMatchingService.findNearestDriver(
            session.getTempPickupLat(), session.getTempPickupLng(), session.getRejectedDriverIds());

        if (nearestDriver.isPresent()) {
            Driver driver = nearestDriver.get();
            String driverPhone = driver.getWhatsappPhone() != null ? driver.getWhatsappPhone() : driver.getPhone();
            // Normalize driver phone
            if (driverPhone != null && driverPhone.startsWith("0")) driverPhone = "91" + driverPhone.substring(1);
            else if (driverPhone != null && !driverPhone.startsWith("91")) driverPhone = "91" + driverPhone;

            // Update ride with driver info temporarily (pending acceptance)
            ride.setDriverId(driver.getId());
            ride.setDriverName(driver.getName());
            ride.setDriverPhone(driverPhone);
            ride.setDriverVehicleNumber(driver.getVehicleNumber());
            rideRepository.save(ride);

            // Notify driver via WhatsApp
            String driverMsg = String.format(
                "🚖 *New Ride Request!*\n\n" +
                "📍 Pickup: %s\n" +
                "🎯 Drop: %s\n" +
                "💰 Fare: ₹%.0f\n" +
                "📏 Distance: %.1f km\n\n" +
                "Reply:\n1️⃣ Accept\n2️⃣ Reject",
                session.getTempPickupAddress(), session.getTempDropAddress(),
                session.getTempFare(), session.getTempDistance()
            );
            whatsAppService.sendText(driverPhone, driverMsg);
        } else {
            // No driver found
            ride.setStatus(RideStatus.CANCELLED);
            ride.setCancellationReason("No drivers available");
            rideRepository.save(ride);

            session.setState(ConversationState.MAIN_MENU);
            session.setActiveRideId(null);
            chatSessionRepository.save(session);

            whatsAppService.sendText(session.getWhatsappPhone(),
                "❌ Sorry, no drivers are available in your area at the moment. Your request has been cancelled. Type *menu* to restart.");
        }
    }

    private void handleRideActive(ChatSession session, String text, String replyId) {
        whatsAppService.sendText(session.getWhatsappPhone(), 
            "🚖 Your booking is currently active.\n\n• Type *track* to get updates.\n• Type *cancel* to cancel booking.");
    }

    private void handleTrackRide(ChatSession session) {
        if (session.getActiveRideId() == null) {
            whatsAppService.sendText(session.getWhatsappPhone(), "You don't have any active ride. Type *menu* to start.");
            return;
        }

        Optional<Ride> rideOpt = rideRepository.findById(session.getActiveRideId());
        if (rideOpt.isEmpty()) {
            whatsAppService.sendText(session.getWhatsappPhone(), "Ride details not found.");
            return;
        }

        Ride ride = rideOpt.get();
        if (ride.getStatus() == RideStatus.COMPLETED || ride.getStatus() == RideStatus.CANCELLED) {
            whatsAppService.sendText(session.getWhatsappPhone(), "Your last ride is finished. Type *menu* to book a new one.");
            return;
        }

        String statusMsg = "🚖 *Ride Status:* " + ride.getStatus() + "\n";
        if (ride.getDriverName() != null) {
            statusMsg += "👨‍✈️ Driver: " + ride.getDriverName() + "\n" +
                "🚗 Vehicle: " + ride.getDriverVehicleNumber() + "\n" +
                "📌 OTP: " + ride.getOtp() + "\n";
        } else {
            statusMsg += "🔍 Searching for driver...\n";
        }
        
        statusMsg += "\n📍 Pickup: " + ride.getPickupLocation() + "\n" +
            "🎯 Drop: " + ride.getDropLocation() + "\n" +
            "💰 Fare: ₹" + ride.getFare();
        
        whatsAppService.sendText(session.getWhatsappPhone(), statusMsg);
    }

    private void handleCancelConfirm(ChatSession session, String text, String replyId) {
        String input = replyId.isEmpty() ? text : replyId.toLowerCase();
        if (input.equals("1") || input.contains("yes") || input.contains("cancel")) {
            cancelActiveRide(session);
        } else {
            session.setState(ConversationState.RIDE_ACTIVE);
            whatsAppService.sendText(session.getWhatsappPhone(), "Ride kept active. We will continue your booking.");
        }
    }

    private void cancelActiveRide(ChatSession session) {
        if (session.getActiveRideId() == null) {
            session.setState(ConversationState.MAIN_MENU);
            whatsAppService.sendText(session.getWhatsappPhone(), "No active ride to cancel. Returning to menu.");
            return;
        }

        Optional<Ride> rideOpt = rideRepository.findById(session.getActiveRideId());
        if (rideOpt.isPresent()) {
            Ride ride = rideOpt.get();
            if (ride.getStatus() == RideStatus.ONGOING) {
                whatsAppService.sendText(session.getWhatsappPhone(), "❌ Cannot cancel a ride that has already started.");
                session.setState(ConversationState.RIDE_ACTIVE);
                return;
            }

            ride.setStatus(RideStatus.CANCELLED);
            ride.setCancelledBy("CUSTOMER");
            ride.setCancelledAt(LocalDateTime.now());
            ride.setCancellationReason("Cancelled via WhatsApp");
            rideRepository.save(ride);

            // If driver was assigned, notify driver and free driver
            if (ride.getDriverId() != null) {
                Optional<Driver> driverOpt = driverRepository.findById(ride.getDriverId());
                if (driverOpt.isPresent()) {
                    Driver driver = driverOpt.get();
                    driver.setAvailableForRide(true);
                    driver.setStatus(DriverStatus.ONLINE);
                    driverRepository.save(driver);

                    String driverPhone = driver.getWhatsappPhone() != null ? driver.getWhatsappPhone() : driver.getPhone();
                    whatsAppService.sendText(driverPhone, "⚠️ Ride request #" + ride.getId().substring(ride.getId().length() - 6).toUpperCase() + " has been cancelled by the customer.");
                }
            }
        }

        session.setState(ConversationState.MAIN_MENU);
        session.setActiveRideId(null);
        whatsAppService.sendText(session.getWhatsappPhone(), "❌ Your booking has been cancelled successfully. Type *menu* to book again.");
    }

    private void handlePaymentMethod(ChatSession session, String text, String replyId) {
        whatsAppService.sendText(session.getWhatsappPhone(), "Please pay the driver cash or scan their UPI QR code. Type *menu* to restart.");
        session.setState(ConversationState.MAIN_MENU);
    }

    private void handleRating(ChatSession session, String text) {
        try {
            int rating = Integer.parseInt(text.trim());
            if (rating < 1 || rating > 5) {
                whatsAppService.sendText(session.getWhatsappPhone(), "Please enter a valid rating between 1 and 5 stars.");
                return;
            }

            if (session.getActiveRideId() != null) {
                Optional<Ride> rideOpt = rideRepository.findById(session.getActiveRideId());
                if (rideOpt.isPresent()) {
                    Ride ride = rideOpt.get();
                    if (ride.getDriverId() != null) {
                        Optional<Driver> driverOpt = driverRepository.findById(ride.getDriverId());
                        if (driverOpt.isPresent()) {
                            Driver driver = driverOpt.get();
                            double currentRating = driver.getRating() != null ? driver.getRating() : 0.0;
                            int totalRides = driver.getTotalRides() != null ? driver.getTotalRides() : 0;
                            double newRating;
                            if (totalRides <= 1) {
                                newRating = (double) rating;
                            } else {
                                newRating = ((currentRating * (totalRides - 1)) + rating) / totalRides;
                            }
                            newRating = Math.round(newRating * 10.0) / 10.0;
                            driver.setRating(newRating);
                            driverRepository.save(driver);
                        }
                    }
                }
            }

            whatsAppService.sendText(session.getWhatsappPhone(), "⭐ Thank you for rating your trip! Your feedback is highly appreciated.\n\nType *menu* to return to the main menu.");
            session.setState(ConversationState.MAIN_MENU);
            session.setActiveRideId(null);
        } catch (NumberFormatException e) {
            whatsAppService.sendText(session.getWhatsappPhone(), "Please reply with a single number from 1 to 5 to rate your driver.");
        }
    }

    private void showMyRides(ChatSession session) {
        List<Ride> rides = rideRepository.findByCustomerWhatsappPhone(session.getWhatsappPhone());
        if (rides == null || rides.isEmpty()) {
            if (session.getCustomerId() != null) {
                rides = rideRepository.findByCustomerIdAndStatus(session.getCustomerId(), RideStatus.COMPLETED);
            }
        }

        if (rides == null || rides.isEmpty()) {
            whatsAppService.sendText(session.getWhatsappPhone(), "You do not have any ride history with Vazraa yet. Type *menu* to start booking!");
            return;
        }

        // Sort by booking time descending and take top 3
        rides.sort((r1, r2) -> {
            LocalDateTime t1 = r1.getBookingTime() != null ? r1.getBookingTime() : LocalDateTime.MIN;
            LocalDateTime t2 = r2.getBookingTime() != null ? r2.getBookingTime() : LocalDateTime.MIN;
            return t2.compareTo(t1);
        });

        StringBuilder history = new StringBuilder("📜 *Your Ride History (Last 3 trips):*\n\n");
        int count = 0;
        for (Ride r : rides) {
            if (count++ >= 3) break;
            history.append(String.format(
                "🚖 *Ride #%s*\n" +
                "📅 Date: %s\n" +
                "📍 From: %s\n" +
                "🎯 To: %s\n" +
                "💰 Fare: ₹%.0f\n" +
                "⚡ Status: %s\n\n",
                r.getId().substring(r.getId().length() - 6).toUpperCase(),
                r.getBookingTime() != null ? r.getBookingTime().toString().substring(0, 10) : "N/A",
                r.getPickupLocation(),
                r.getDropLocation(),
                r.getFare(),
                r.getStatus()
            ));
        }

        history.append("Type *menu* to return to main menu.");
        whatsAppService.sendText(session.getWhatsappPhone(), history.toString());
    }

    // =================== DRIVER STATE TRANSITIONS ===================

    public void driverAcceptRide(String driverPhone) {
        Optional<Driver> driverOpt = driverRepository.findByWhatsappPhone(driverPhone)
            .or(() -> driverRepository.findByPhone(normalizePhone(driverPhone)));
        if (driverOpt.isEmpty()) {
            whatsAppService.sendText(driverPhone, "❌ Driver profile not registered.");
            return;
        }
        Driver driver = driverOpt.get();

        Optional<Ride> rideOpt = rideRepository.findByDriverIdAndStatusIn(driver.getId(), List.of(RideStatus.SEARCHING))
            .stream().findFirst();

        if (rideOpt.isPresent()) {
            Ride ride = rideOpt.get();
            ride.setStatus(RideStatus.ACCEPTED);
            ride.setAcceptedAt(LocalDateTime.now());
            rideRepository.save(ride);

            // Update driver status
            driver.setAvailableForRide(false);
            driver.setStatus(DriverStatus.BUSY);
            driverRepository.save(driver);

            // Notify driver
            whatsAppService.sendText(driverPhone,
                "✅ *Ride Request Accepted!*\n\n" +
                "📌 OTP: *" + ride.getOtp() + "*\n\n" +
                "📍 Pickup: " + ride.getPickupLocation() + "\n" +
                "🎯 Drop: " + ride.getDropLocation() + "\n\n" +
                "Please head to the pickup location. When customer boards and provides the OTP, type *start* to begin the trip.");

            // Notify customer
            Optional<ChatSession> sessionOpt = chatSessionRepository.findByWhatsappPhone(ride.getCustomerWhatsappPhone());
            if (sessionOpt.isPresent()) {
                ChatSession session = sessionOpt.get();
                session.setState(ConversationState.RIDE_ACTIVE);
                chatSessionRepository.save(session);

                String custMsg = String.format(
                    "🎉 *Driver Assigned!*\n\n" +
                    "👨‍✈️ Driver: *%s*\n" +
                    "📱 Phone: %s\n" +
                    "🚗 Vehicle: *%s* (%s)\n" +
                    "📌 OTP: *%s*\n\n" +
                    "Your driver is arriving at your pickup location. Please share the OTP *%s* with the driver to start the trip.",
                    driver.getName(), driver.getPhone(),
                    driver.getVehicleNumber(), driver.getVehicleModel(),
                    ride.getOtp(), ride.getOtp()
                );
                whatsAppService.sendText(session.getWhatsappPhone(), custMsg);
            }
        } else {
            whatsAppService.sendText(driverPhone, "❌ No active ride request found or already accepted/cancelled.");
        }
    }

    public void driverRejectRide(String driverPhone) {
        Optional<Driver> driverOpt = driverRepository.findByWhatsappPhone(driverPhone)
            .or(() -> driverRepository.findByPhone(normalizePhone(driverPhone)));
        if (driverOpt.isEmpty()) return;
        Driver driver = driverOpt.get();

        Optional<Ride> rideOpt = rideRepository.findByDriverIdAndStatusIn(driver.getId(), List.of(RideStatus.SEARCHING))
            .stream().findFirst();

        if (rideOpt.isPresent()) {
            Ride ride = rideOpt.get();
            Optional<ChatSession> sessionOpt = chatSessionRepository.findByWhatsappPhone(ride.getCustomerWhatsappPhone());
            if (sessionOpt.isPresent()) {
                ChatSession session = sessionOpt.get();
                if (session.getRejectedDriverIds() == null) {
                    session.setRejectedDriverIds(new ArrayList<>());
                }
                session.getRejectedDriverIds().add(driver.getId());
                chatSessionRepository.save(session);

                whatsAppService.sendText(driverPhone, "Declined. You will not receive notifications for this trip.");

                // Match next driver
                findAndAssignNextDriver(session, ride);
            }
        } else {
            whatsAppService.sendText(driverPhone, "No pending requests to reject.");
        }
    }

    public void driverStartRide(String driverPhone, String otpCode) {
        Optional<Driver> driverOpt = driverRepository.findByWhatsappPhone(driverPhone)
            .or(() -> driverRepository.findByPhone(normalizePhone(driverPhone)));
        if (driverOpt.isEmpty()) return;
        Driver driver = driverOpt.get();

        Optional<Ride> rideOpt = rideRepository.findByDriverIdAndStatusIn(driver.getId(), List.of(RideStatus.ACCEPTED, RideStatus.DRIVER_ARRIVING, RideStatus.DRIVER_ASSIGNED))
            .stream().findFirst();

        if (rideOpt.isPresent()) {
            Ride ride = rideOpt.get();
            if (otpCode == null || otpCode.trim().isEmpty()) {
                whatsAppService.sendText(driverPhone, "🔑 *Boarding OTP Required*\n\nPlease provide the passenger boarding OTP. Reply with *start <OTP>* (e.g. *start 1234*) or just send the 4-digit OTP.");
                return;
            }

            if (otpCode.trim().equals(ride.getOtp())) {
                ride.setStatus(RideStatus.ONGOING);
                ride.setStartedAt(LocalDateTime.now());
                ride.setStartTime(LocalDateTime.now());
                rideRepository.save(ride);

                whatsAppService.sendText(driverPhone, "🚖 *Trip Started!* Drive safely. Reply *complete* once you reach the destination.");
                whatsAppService.sendText(ride.getCustomerWhatsappPhone(), "🚖 *Your ride has started!* Have a safe and pleasant journey.");
                
                // Broadcast ride status updates via WebSocket
                try {
                    messagingTemplate.convertAndSend("/topic/ride/" + ride.getId() + "/status", ride);
                } catch (Exception wsEx) {
                    log.error("WebSocket broadcast error", wsEx);
                }
            } else {
                whatsAppService.sendText(driverPhone, "❌ Invalid OTP code. Please verify with the passenger and try again using *start <OTP>*.");
            }
        } else {
            whatsAppService.sendText(driverPhone, "❌ No pending ride found to start.");
        }
    }

    public void driverCompleteRide(String driverPhone) {
        Optional<Driver> driverOpt = driverRepository.findByWhatsappPhone(driverPhone)
            .or(() -> driverRepository.findByPhone(normalizePhone(driverPhone)));
        if (driverOpt.isEmpty()) return;
        Driver driver = driverOpt.get();

        Optional<Ride> rideOpt = rideRepository.findByDriverIdAndStatusIn(driver.getId(), List.of(RideStatus.ONGOING))
            .stream().findFirst();

        if (rideOpt.isPresent()) {
            Ride ride = rideOpt.get();
            ride.setStatus(RideStatus.COMPLETED);
            ride.setCompletedAt(LocalDateTime.now());
            ride.setEndTime(LocalDateTime.now());
            ride.setActualFare(ride.getFare());
            ride.setPaymentStatus("PAID");
            rideRepository.save(ride);

            // Reset driver status
            driver.setAvailableForRide(true);
            driver.setStatus(DriverStatus.ONLINE);
            driver.setTotalRides((driver.getTotalRides() != null ? driver.getTotalRides() : 0) + 1);
            driver.setTotalEarnings((driver.getTotalEarnings() != null ? driver.getTotalEarnings() : 0.0) + ride.getFare());
            driverRepository.save(driver);

            whatsAppService.sendText(driverPhone,
                "🏁 *Ride Completed successfully!*\n\n" +
                "💰 Fare: ₹" + ride.getFare() + "\n" +
                "Earnings: ₹" + ride.getFare() + "\n\n" +
                "You are now back online and available for new requests.");

            // Update customer
            Optional<ChatSession> sessionOpt = chatSessionRepository.findByWhatsappPhone(ride.getCustomerWhatsappPhone());
            if (sessionOpt.isPresent()) {
                ChatSession session = sessionOpt.get();
                session.setState(ConversationState.AWAITING_RATING);
                chatSessionRepository.save(session);

                whatsAppService.sendText(session.getWhatsappPhone(),
                    "🏁 *You have arrived!*\n\n" +
                    "💰 Total Fare: *₹" + ride.getFare() + "*\n\n" +
                    "Please pay the driver via Cash or UPI.\n\n" +
                    "⭐ How was your ride? Please rate from 1 to 5 stars (reply with a number).");
            }
        } else {
            whatsAppService.sendText(driverPhone, "❌ No ongoing trip found to complete.");
        }
    }

    // =================== DRIVER REGISTRATION FLOW ===================
    private void startDriverRegistration(ChatSession session) {
        session.setState(ConversationState.DRIVER_REG_NAME);
        whatsAppService.sendText(session.getWhatsappPhone(),
            "🚕 *Become a Vazraa Partner!*\n\n" +
            "Let's get you registered as a driver on our platform.\n" +
            "Please type your *Full Name*:");
    }

    private void handleDriverRegName(ChatSession session, String text) {
        if (text.isEmpty()) {
            whatsAppService.sendText(session.getWhatsappPhone(), "Please enter a valid name.");
            return;
        }
        session.setTempDriverName(text);
        session.setState(ConversationState.DRIVER_REG_EMAIL);
        whatsAppService.sendText(session.getWhatsappPhone(), "Great! Now please enter your *Email Address*:");
    }

    private void handleDriverRegEmail(ChatSession session, String text) {
        if (!text.contains("@") || !text.contains(".")) {
            whatsAppService.sendText(session.getWhatsappPhone(), "❌ Invalid email format. Please enter a valid email address:");
            return;
        }
        session.setTempDriverEmail(text);
        session.setState(ConversationState.DRIVER_REG_CITY);
        whatsAppService.sendText(session.getWhatsappPhone(), "What *City* will you be operating in? (e.g. Bangalore)");
    }

    private void handleDriverRegCity(ChatSession session, String text) {
        if (text.isEmpty()) {
            whatsAppService.sendText(session.getWhatsappPhone(), "Please enter a valid city name.");
            return;
        }
        session.setTempDriverCity(text);
        session.setState(ConversationState.DRIVER_REG_VEHICLE_CATEGORY);
        String catMsg = "Choose your *Vehicle Category*:\n" +
            "1️⃣ MINI\n" +
            "2️⃣ HATCHBACK\n" +
            "3️⃣ SEDAN\n" +
            "4️⃣ SUV\n" +
            "5️⃣ LUXURY\n\n" +
            "Reply with 1-5 or type the category.";
        whatsAppService.sendText(session.getWhatsappPhone(), catMsg);
    }

    private void handleDriverRegVehicleCategory(ChatSession session, String text, String replyId) {
        String input = replyId.isEmpty() ? text.trim() : replyId.trim();
        String cat;
        switch (input) {
            case "1", "mini" -> cat = "MINI";
            case "2", "hatchback" -> cat = "HATCHBACK";
            case "3", "sedan" -> cat = "SEDAN";
            case "4", "suv" -> cat = "SUV";
            case "5", "luxury" -> cat = "LUXURY";
            default -> {
                whatsAppService.sendText(session.getWhatsappPhone(), "❌ Invalid selection. Please reply with 1, 2, 3, 4, or 5.");
                return;
            }
        }
        session.setTempDriverVehicleCategory(cat);
        session.setState(ConversationState.DRIVER_REG_VEHICLE_MODEL);
        whatsAppService.sendText(session.getWhatsappPhone(), "Enter your *Vehicle Model* (e.g. Toyota Etios):");
    }

    private void handleDriverRegVehicleModel(ChatSession session, String text) {
        if (text.isEmpty()) {
            whatsAppService.sendText(session.getWhatsappPhone(), "Please enter a valid vehicle model.");
            return;
        }
        session.setTempDriverVehicleModel(text);
        session.setState(ConversationState.DRIVER_REG_VEHICLE_NUMBER);
        whatsAppService.sendText(session.getWhatsappPhone(), "Enter your *Vehicle License Plate Number* (e.g. KA-01-MJ-1234):");
    }

    private void handleDriverRegVehicleNumber(ChatSession session, String text) {
        if (text.isEmpty()) {
            whatsAppService.sendText(session.getWhatsappPhone(), "Please enter a valid vehicle number.");
            return;
        }
        session.setTempDriverVehicleNumber(text.toUpperCase());
        session.setState(ConversationState.DRIVER_REG_VEHICLE_COLOR);
        whatsAppService.sendText(session.getWhatsappPhone(), "Enter your *Vehicle Color* (e.g. White):");
    }

    private void handleDriverRegVehicleColor(ChatSession session, String text) {
        if (text.isEmpty()) {
            whatsAppService.sendText(session.getWhatsappPhone(), "Please enter a valid vehicle color.");
            return;
        }
        session.setTempDriverVehicleColor(text);
        session.setState(ConversationState.DRIVER_REG_AADHAAR);
        whatsAppService.sendText(session.getWhatsappPhone(), "Enter your 12-digit *Aadhaar Number*:");
    }

    private void handleDriverRegAadhaar(ChatSession session, String text) {
        String clean = text.replaceAll("[^0-9]", "");
        if (clean.length() != 12) {
            whatsAppService.sendText(session.getWhatsappPhone(), "❌ Invalid Aadhaar number. Must be exactly 12 digits. Please try again:");
            return;
        }
        session.setTempDriverAadhaar(clean);
        session.setState(ConversationState.DRIVER_REG_LICENSE);
        whatsAppService.sendText(session.getWhatsappPhone(), "Enter your *Driving License Number*:");
    }

    private void handleDriverRegLicense(ChatSession session, String text) {
        if (text.isEmpty()) {
            whatsAppService.sendText(session.getWhatsappPhone(), "Please enter a valid license number.");
            return;
        }
        session.setTempDriverLicense(text.toUpperCase());
        session.setState(ConversationState.DRIVER_REG_DOC_SELFIE);
        whatsAppService.sendText(session.getWhatsappPhone(), "Now, please upload your documents as photos.\n\n📸 Please upload a *Selfie / Profile Picture* (send as an image attachment):");
    }

    private void handleDriverDocSelfie(ChatSession session, String messageType, String text) {
        if (!"image".equals(messageType) && !text.startsWith("http")) {
            whatsAppService.sendText(session.getWhatsappPhone(), "❌ Please send an image attachment (photo).");
            return;
        }
        session.setTempDriverSelfie(text);
        session.setState(ConversationState.DRIVER_REG_DOC_AADHAAR);
        whatsAppService.sendText(session.getWhatsappPhone(), "✅ Selfie received!\n\n📸 Please upload your *Aadhaar Card Front* photo:");
    }

    private void handleDriverDocAadhaar(ChatSession session, String messageType, String text) {
        if (!"image".equals(messageType) && !text.startsWith("http")) {
            whatsAppService.sendText(session.getWhatsappPhone(), "❌ Please send an image attachment (photo).");
            return;
        }
        session.setTempDriverAadhaarImage(text);
        session.setState(ConversationState.DRIVER_REG_DOC_LICENSE);
        whatsAppService.sendText(session.getWhatsappPhone(), "✅ Aadhaar front received!\n\n📸 Please upload your *Driving License Front* photo:");
    }

    private void handleDriverDocLicense(ChatSession session, String messageType, String text) {
        if (!"image".equals(messageType) && !text.startsWith("http")) {
            whatsAppService.sendText(session.getWhatsappPhone(), "❌ Please send an image attachment (photo).");
            return;
        }
        session.setTempDriverLicenseImage(text);
        session.setState(ConversationState.DRIVER_REG_DOC_RC);
        whatsAppService.sendText(session.getWhatsappPhone(), "✅ License front received!\n\n📸 Please upload your *Vehicle RC (Registration Certificate)* photo:");
    }

    private void handleDriverDocRc(ChatSession session, String messageType, String text) {
        if (!"image".equals(messageType) && !text.startsWith("http")) {
            whatsAppService.sendText(session.getWhatsappPhone(), "❌ Please send an image attachment (photo).");
            return;
        }
        session.setTempDriverRcImage(text);
        session.setState(ConversationState.DRIVER_REG_DOC_VEHICLE);
        whatsAppService.sendText(session.getWhatsappPhone(), "✅ RC received!\n\n📸 Please upload your *Vehicle Front* photo:");
    }

    private void handleDriverDocVehicle(ChatSession session, String messageType, String text) {
        if (!"image".equals(messageType) && !text.startsWith("http")) {
            whatsAppService.sendText(session.getWhatsappPhone(), "❌ Please send an image attachment (photo).");
            return;
        }
        session.setTempDriverVehicleImage(text);

        // Save Driver in database
        String phoneSuffix = normalizePhone(session.getWhatsappPhone());
        Driver driver = Driver.builder()
                .name(session.getTempDriverName())
                .email(session.getTempDriverEmail())
                .phone(phoneSuffix)
                .whatsappPhone(session.getWhatsappPhone())
                .cityId(session.getTempDriverCity())
                .vehicleCategory(VehicleCategory.valueOf(session.getTempDriverVehicleCategory()))
                .vehicleModel(session.getTempDriverVehicleModel())
                .vehicleNumber(session.getTempDriverVehicleNumber())
                .vehicleColor(session.getTempDriverVehicleColor())
                .aadhaarNumber(session.getTempDriverAadhaar())
                .licenseNumber(session.getTempDriverLicense())
                .profileImage(session.getTempDriverSelfie())
                .aadhaarImage(session.getTempDriverAadhaarImage())
                .licenseImage(session.getTempDriverLicenseImage())
                .rcImage(session.getTempDriverRcImage())
                .vehicleImage(session.getTempDriverVehicleImage())
                .verificationStatus(VerificationStatus.PENDING)
                .status(DriverStatus.OFFLINE)
                .availableForRide(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        driverRepository.save(driver);

        session.setState(ConversationState.MAIN_MENU);
        whatsAppService.sendText(session.getWhatsappPhone(),
            "🎉 *Registration Completed!*\n\n" +
            "Your application has been submitted successfully for verification.\n" +
            "We will review your documents and notify you via WhatsApp once approved. Thank you!");
    }

    // =================== FARE ESTIMATION FLOW ===================
    private void startFareEstimation(ChatSession session) {
        session.setState(ConversationState.FARE_EST_PICKUP);
        whatsAppService.sendText(session.getWhatsappPhone(),
            "💰 *Get Fare Estimate*\n\n" +
            "Please share/type your *Pickup Location*:");
    }

    private void handleFareEstPickup(ChatSession session, String messageType, String text, Double lat, Double lng, String locationName) {
        if ("location".equals(messageType) && lat != null && lng != null) {
            String address = locationName != null && !locationName.isEmpty() ? locationName : String.format("%.4f, %.4f", lat, lng);
            GoogleMapsService.GeocodingResult geo = mapsService.geocode(address);
            if (geo != null) {
                session.setTempPickupLat(geo.lat());
                session.setTempPickupLng(geo.lng());
                session.setTempPickupAddress(geo.formattedAddress());
            } else {
                session.setTempPickupLat(lat);
                session.setTempPickupLng(lng);
                session.setTempPickupAddress(address);
            }
        } else if (!text.isEmpty()) {
            GoogleMapsService.GeocodingResult geo = mapsService.geocode(text);
            if (geo != null) {
                session.setTempPickupLat(geo.lat());
                session.setTempPickupLng(geo.lng());
                session.setTempPickupAddress(geo.formattedAddress());
            } else {
                whatsAppService.sendText(session.getWhatsappPhone(), "❌ Couldn't find location. Try again:");
                return;
            }
        } else {
            whatsAppService.sendText(session.getWhatsappPhone(), "Please send pickup location.");
            return;
        }

        session.setState(ConversationState.FARE_EST_DROP);
        whatsAppService.sendText(session.getWhatsappPhone(),
            "📍 *Pickup Address:* " + session.getTempPickupAddress() + "\n\n" +
            "🎯 Now share/type your *Drop Location*:");
    }

    private void handleFareEstDrop(ChatSession session, String messageType, String text, Double lat, Double lng, String locationName) {
        if ("location".equals(messageType) && lat != null && lng != null) {
            String address = locationName != null && !locationName.isEmpty() ? locationName : String.format("%.4f, %.4f", lat, lng);
            GoogleMapsService.GeocodingResult geo = mapsService.geocode(address);
            if (geo != null) {
                session.setTempDropLat(geo.lat());
                session.setTempDropLng(geo.lng());
                session.setTempDropAddress(geo.formattedAddress());
            } else {
                session.setTempDropLat(lat);
                session.setTempDropLng(lng);
                session.setTempDropAddress(address);
            }
        } else if (!text.isEmpty()) {
            GoogleMapsService.GeocodingResult geo = mapsService.geocode(text);
            if (geo != null) {
                session.setTempDropLat(geo.lat());
                session.setTempDropLng(geo.lng());
                session.setTempDropAddress(geo.formattedAddress());
            } else {
                whatsAppService.sendText(session.getWhatsappPhone(), "❌ Couldn't find location. Try again:");
                return;
            }
        } else {
            whatsAppService.sendText(session.getWhatsappPhone(), "Please send drop location.");
            return;
        }

        // Calculate distance & estimated fare
        GoogleMapsService.DistanceResult result = mapsService.getDistance(
            session.getTempPickupLat(), session.getTempPickupLng(),
            session.getTempDropLat(), session.getTempDropLng()
        );
        double estFare = baseFare + (result.distanceKm() * perKm) + (result.durationMinutes() * perMinute);
        estFare = Math.round(estFare * 100.0) / 100.0;

        session.setTempDistance(result.distanceKm());
        session.setTempDuration(result.durationMinutes());
        session.setTempFare(estFare);

        session.setState(ConversationState.FARE_EST_VEHICLE);
        whatsAppService.sendText(session.getWhatsappPhone(),
            "🚗 *Select Vehicle Type for Estimate:*\n" +
            "1️⃣ MINI\n" +
            "2️⃣ HATCHBACK\n" +
            "3️⃣ SEDAN\n" +
            "4️⃣ SUV\n" +
            "5️⃣ LUXURY\n\n" +
            "Reply with 1-5.");
    }

    private void handleFareEstVehicle(ChatSession session, String text, String replyId) {
        String input = replyId.isEmpty() ? text.trim() : replyId.trim();
        VehicleCategory chosen;
        String label;
        switch (input) {
            case "1", "mini" -> { chosen = VehicleCategory.MINI; label = "MINI"; }
            case "2", "hatchback" -> { chosen = VehicleCategory.HATCHBACK; label = "HATCHBACK"; }
            case "3", "sedan" -> { chosen = VehicleCategory.SEDAN; label = "SEDAN"; }
            case "4", "suv" -> { chosen = VehicleCategory.SUV; label = "SUV"; }
            case "5", "luxury" -> { chosen = VehicleCategory.LUXURY; label = "LUXURY"; }
            default -> {
                whatsAppService.sendText(session.getWhatsappPhone(), "❌ Invalid selection. Please reply 1-5.");
                return;
            }
        }

        double rate = switch (chosen) {
            case MINI -> 10.0;
            case HATCHBACK -> 11.0;
            case SEDAN -> 15.0;
            case SUV -> 20.0;
            case LUXURY -> 25.0;
            default -> 12.0;
        };

        double base = switch (chosen) {
            case MINI -> 40.0;
            case HATCHBACK -> 45.0;
            case SEDAN -> 80.0;
            case SUV -> 120.0;
            case LUXURY -> 150.0;
            default -> 50.0;
        };

        double distance = session.getTempDistance() != null ? session.getTempDistance() : 0.0;
        double fare = base + (distance * rate);
        fare = Math.round(fare * 100.0) / 100.0;

        String resultMsg = String.format(
            "💰 *Fare Estimate Result*\n\n" +
            "📍 Pickup: %s\n" +
            "🎯 Drop: %s\n" +
            "🚗 Vehicle: *%s*\n\n" +
            "📏 Distance: %.1f km\n" +
            "⏱ Duration: %.0f mins\n\n" +
            "💵 *Estimated Fare: ₹%.0f*\n\n" +
            "Type *menu* to go back.",
            session.getTempPickupAddress(), session.getTempDropAddress(), label,
            distance, session.getTempDuration() != null ? session.getTempDuration() : 0.0, fare
        );

        session.setState(ConversationState.MAIN_MENU);
        whatsAppService.sendText(session.getWhatsappPhone(), resultMsg);
    }

    // =================== SOS ALERT & EMERGENCY ===================
    public void handleSOSAlert(ChatSession session, boolean isDriver, String phone) {
        String customerId = null;
        String driverId = null;
        String rideId = null;
        Double lat = null;
        Double lng = null;

        if (isDriver) {
            Optional<Driver> driverOpt = driverRepository.findByWhatsappPhone(phone)
                .or(() -> driverRepository.findByPhone(normalizePhone(phone)));
            if (driverOpt.isPresent()) {
                Driver d = driverOpt.get();
                driverId = d.getId();
                lat = d.getLatitude();
                lng = d.getLongitude();
                
                Optional<Ride> ride = rideRepository.findByDriverIdAndStatusIn(d.getId(), List.of(RideStatus.ACCEPTED, RideStatus.DRIVER_ARRIVING, RideStatus.ONGOING))
                    .stream().findFirst();
                if (ride.isPresent()) {
                    rideId = ride.get().getId();
                    customerId = ride.get().getCustomerId();
                }
            }
        } else {
            customerId = session.getCustomerId();
            rideId = session.getActiveRideId();
            lat = session.getTempPickupLat();
            lng = session.getTempPickupLng();
            
            if (rideId != null) {
                Optional<Ride> ride = rideRepository.findById(rideId);
                if (ride.isPresent()) {
                    driverId = ride.get().getDriverId();
                    if (ride.get().getStatus() == RideStatus.ONGOING && driverId != null) {
                        Optional<Driver> d = driverRepository.findById(driverId);
                        if (d.isPresent()) {
                            lat = d.get().getLatitude();
                            lng = d.get().getLongitude();
                        }
                    }
                }
            }
        }

        // Create alert
        SOSAlert alert = SOSAlert.builder()
                .customerId(customerId)
                .driverId(driverId)
                .rideId(rideId)
                .latitude(lat)
                .longitude(lng)
                .message(isDriver ? "Driver triggered SOS via WhatsApp" : "Customer triggered SOS via WhatsApp")
                .status("ACTIVE")
                .timestamp(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();
        
        sosAlertRepository.save(alert);

        // Notify user
        whatsAppService.sendText(phone, "⚠️ *SOS EMERGENCY TRIGGERED!*\n\nWe have logged your emergency, notified our operations team, and dispatched help immediately. Your location coordinates are being sent to authorities. Stay safe!");

        // Broadcast SOS alert via WebSocket to admin
        try {
            messagingTemplate.convertAndSend("/topic/admin/sos", alert);
        } catch (Exception e) {
            log.error("Failed to broadcast SOS alert via WebSocket", e);
        }

        // Notify other party if active ride exists
        if (rideId != null) {
            if (isDriver) {
                Optional<Ride> rOpt = rideRepository.findById(rideId);
                if (rOpt.isPresent() && rOpt.get().getCustomerWhatsappPhone() != null) {
                    whatsAppService.sendText(rOpt.get().getCustomerWhatsappPhone(), "⚠️ *Emergency Notice*\n\nYour driver has triggered an SOS alert. Emergency services have been contacted. Please remain calm and check your surroundings.");
                }
            } else if (driverId != null) {
                Optional<Driver> d = driverRepository.findById(driverId);
                if (d.isPresent()) {
                    String dPhone = d.get().getWhatsappPhone() != null ? d.get().getWhatsappPhone() : d.get().getPhone();
                    whatsAppService.sendText(dPhone, "⚠️ *Emergency Notice*\n\nYour passenger has triggered an SOS alert. Please stop safely and check on the passenger. Help has been dispatched.");
                }
            }
        }
    }
}
