-- Query to get admin user's phone and OTP code
SELECT 
    email, 
    phone, 
    "phoneVerificationCode" as otp_code,
    "phoneVerificationSentAt" as sent_at
FROM users 
WHERE email = 'admin@local.test';
