// In-memory OTP storage
// TODO: For production, use Redis or a database table for OTP storage
const otpStore = new Map();
const resendCooldown = new Map(); // Track resend cooldown (1 minute)

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check if resend is allowed (1 minute cooldown)
export const canResendOTP = (email) => {
  const lastSent = resendCooldown.get(email);
  if (!lastSent) return true;
  
  const oneMinuteAgo = Date.now() - 60 * 1000; // 1 minute in milliseconds
  return lastSent < oneMinuteAgo;
};

// Store OTP with expiration (10 minutes)
export const storeOTP = (email, otp) => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email, {
    otp,
    expiresAt,
    verified: false,
  });
  
  // Update resend cooldown
  resendCooldown.set(email, Date.now());
  
  // Clean up expired OTPs periodically
  setTimeout(() => {
    if (otpStore.has(email) && otpStore.get(email).expiresAt < Date.now()) {
      otpStore.delete(email);
    }
  }, 10 * 60 * 1000);
};

// Verify OTP
export const verifyOTP = (email, otp) => {
  const stored = otpStore.get(email);
  
  if (!stored) {
    return { valid: false, message: "OTP not found or expired" };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return { valid: false, message: "OTP has expired" };
  }
  
  if (stored.otp !== otp) {
    return { valid: false, message: "Invalid OTP" };
  }
  
  // Mark as verified
  stored.verified = true;
  return { valid: true, message: "OTP verified successfully" };
};

// Check if OTP is verified
export const isOTPVerified = (email) => {
  const stored = otpStore.get(email);
  return stored && stored.verified && Date.now() <= stored.expiresAt;
};

// Remove OTP after use
export const removeOTP = (email) => {
  otpStore.delete(email);
};

