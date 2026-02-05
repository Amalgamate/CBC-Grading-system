import React, { useState, useRef, useEffect } from 'react';
import { Mail, AlertCircle, RefreshCw, CheckCircle, Smartphone, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

export default function EmailVerificationForm({ email, phone, onVerifySuccess, brandingSettings }) {
  const [verificationMethod, setVerificationMethod] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const inputRefs = useRef([]);

  // Auto-approve code for development: 123456
  const DEV_AUTO_APPROVE_CODE = '123456';

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    const otpValue = newOtp.join('');
    if (otpValue.length === 6) {
      setTimeout(() => handleVerify(otpValue), 300);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp.slice(0, 6));

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Auto-submit pasted code
    if (pastedData.length === 6) {
      setTimeout(() => handleVerify(pastedData), 300);
    }
  };

  const handleVerify = async (otpValue) => {
    const code = otpValue || otp.join('');

    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);

      // Auto-approve for development (accepts any 6-digit code or 123456)
      if (code === DEV_AUTO_APPROVE_CODE || code.length === 6) {
        setShowSuccess(true);
        setTimeout(() => {
          onVerifySuccess();
        }, 1500);
      } else {
        setError('Invalid verification code. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleVerify();
  };

  const handleMethodSelect = async (method) => {
    if (isTriggering) return;

    setVerificationMethod(method);
    setIsTriggering(true);
    setError('');

    try {
      // Simulate/Trigger API call
      if (method === 'whatsapp') {
        const response = await fetch(`${API_BASE_URL}/auth/send-whatsapp-verification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phone,
            code: DEV_AUTO_APPROVE_CODE
          })
        });

        if (response.ok) {
          showSuccessToast('Verification code sent via WhatsApp!');
        } else {
          // Fallback or error
          throw new Error('Failed to send WhatsApp message.');
        }
      } else if (method === 'sms') {
        // Here we would call the actual SMS OTP endpoint if we had one
        // For now, simulate success
        showSuccessToast('Verification code sent via SMS!');
      } else {
        // Email
        showSuccessToast('Verification code sent to your email!');
      }

      setIsOtpSent(true);
      setResendTimer(60);
      setCanResend(false);

      // Focus first input after animation
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 500);

    } catch (error) {
      console.error('Error triggering verification:', error);
      showErrorToast('Failed to send verification code. Please try again.');
      setVerificationMethod(null);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleResend = () => {
    if (!canResend || !verificationMethod) return;
    handleMethodSelect(verificationMethod);
  };

  const showSuccessToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in';
    toast.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const showErrorToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in';
    toast.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const getVerificationIcon = () => {
    switch (verificationMethod) {
      case 'whatsapp': return <MessageSquare className="text-white" size={32} />;
      case 'sms': return <Smartphone className="text-white" size={32} />;
      default: return <Mail className="text-white" size={32} />;
    }
  };

  const getVerificationDestination = () => {
    switch (verificationMethod) {
      case 'whatsapp': return phone || '+254713612141';
      case 'sms': return phone || '+254713612141';
      default: return email || 'your@email.com';
    }
  };

  if (showSuccess) {
    return (
      <div className="w-full h-screen overflow-hidden">
        <div className="bg-white h-full flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6 animate-bounce">
              <CheckCircle className="text-white" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Verification Successful!</h1>
            <p className="text-gray-600 text-lg">Your account has been verified. Redirecting you to the dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      {/* Two Column Layout - Full Screen */}
      <div className="bg-white h-full flex flex-col lg:flex-row">

        {/* Left Column - Branding Area */}
        <div
          className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between items-center text-white relative overflow-hidden bg-[#875A7B]"
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-white rounded-full -translate-y-1/2"></div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="max-w-md text-center space-y-8">
              {/* Logo */}
              <div className="mb-12">
                <img
                  src={brandingSettings?.logoUrl || '/logo-new.png'}
                  alt="Elimcrown Logo"
                  className="w-48 h-48 object-contain mx-auto drop-shadow-2xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/logo-new.png';
                  }}
                />
              </div>

              {/* Verification Message */}
              <div className="space-y-6">
                <h2 className="text-4xl font-bold drop-shadow-md">
                  {isOtpSent ? 'Almost There!' : 'Secure Your Account'}
                </h2>
                <p className="text-white/80 text-lg leading-relaxed">
                  {isOtpSent
                    ? "We've sent you a verification code to confirm your identity. Enter the code to complete your registration."
                    : "To complete your registration, please choose how you'd like to receive your 6-digit verification code."}
                </p>

                {/* Security Features */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-3 text-left">
                    <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mt-0.5">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Secure Verification</h4>
                      <p className="text-white/70 text-sm">Your code is valid for 10 minutes</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-left">
                    <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mt-0.5">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Multiple Options</h4>
                      <p className="text-white/70 text-sm">Receive code via Email, SMS, or WhatsApp</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-left">
                    <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mt-0.5">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Instant Access</h4>
                      <p className="text-[#f4f0f2] text-sm">Get started immediately after verification</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="relative z-10 text-center">
            <p className="text-white/60 text-sm">
              © 2026 {brandingSettings?.schoolName || 'ElimCrown'}. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Column - Verification Form */}
        <div className="w-full lg:w-1/2 p-6 lg:p-16 flex flex-col justify-center overflow-y-auto bg-[#F9FAFB]">
          <div className="max-w-md mx-auto w-full">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#875A7B] rounded-2xl mb-4 shadow-lg">
                {getVerificationIcon()}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isOtpSent ? 'Verify Your Account' : 'Choose Verification'}
              </h1>
              <p className="text-gray-600 mb-1">
                {isOtpSent ? "We've sent a 6-digit code to" : "Select your preferred method below"}
              </p>
              {isOtpSent && (
                <p className="text-[#875A7B] font-semibold text-lg">{getVerificationDestination()}</p>
              )}
            </div>

            {/* Verification Method Selector */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Verification Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  disabled={isTriggering}
                  onClick={() => handleMethodSelect('email')}
                  className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${verificationMethod === 'email'
                    ? 'border-[#875A7B] bg-[#f4f0f2] text-[#875A7B]'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    } ${isTriggering && verificationMethod === 'email' ? 'animate-pulse' : ''}`}
                >
                  <Mail size={24} />
                  <span className="text-xs font-semibold">Email</span>
                </button>

                <button
                  type="button"
                  disabled={isTriggering}
                  onClick={() => handleMethodSelect('sms')}
                  className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${verificationMethod === 'sms'
                    ? 'border-[#875A7B] bg-[#f4f0f2] text-[#875A7B]'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    } ${isTriggering && verificationMethod === 'sms' ? 'animate-pulse' : ''}`}
                >
                  <Smartphone size={24} />
                  <span className="text-xs font-semibold">SMS</span>
                </button>

                <button
                  type="button"
                  disabled={isTriggering}
                  onClick={() => handleMethodSelect('whatsapp')}
                  className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${verificationMethod === 'whatsapp'
                    ? 'border-[#875A7B] bg-[#f4f0f2] text-[#875A7B]'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    } ${isTriggering && verificationMethod === 'whatsapp' ? 'animate-pulse' : ''}`}
                >
                  <MessageSquare size={24} />
                  <span className="text-xs font-semibold">WhatsApp</span>
                </button>
              </div>
            </div>

            {isOtpSent ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                      Enter Verification Code
                    </label>
                    <div className="flex justify-center gap-2 mb-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={handlePaste}
                          className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-[#875A7B] focus:border-transparent transition ${error ? 'border-red-500' : 'border-gray-300'
                            }`}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-center text-gray-500 mb-3">
                      💡 Dev mode: Any 6-digit code will work (or use 123456)
                    </p>
                    {error && (
                      <div className="flex items-center justify-center gap-1 mt-3 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.join('').length !== 6}
                    className="w-full bg-[#875A7B] text-white py-3 rounded-lg font-semibold hover:bg-[#714B67] focus:ring-4 focus:ring-[#875A7B]/20 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      'Verify Account'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend || isTriggering}
                    className={`inline-flex items-center gap-2 font-semibold transition ${canResend && !isTriggering
                      ? 'text-[#875A7B] hover:text-[#714B67]'
                      : 'text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <RefreshCw size={16} className={isTriggering ? 'animate-spin' : ''} />
                    {canResend ? (
                      'Resend Code'
                    ) : (
                      `Resend in ${resendTimer}s`
                    )}
                  </button>
                </div>

                <div className="mt-6 p-4 bg-[#875A7B]/5 border border-[#875A7B]/10 rounded-lg">
                  <p className="text-sm text-gray-700 text-center">
                    💡 <strong>Tip:</strong> Check your spam folder if using email verification
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <RefreshCw className="text-[#14B8A6] animate-pulse" size={32} />
                </div>
                <p className="text-gray-600">Choose a method above to receive your verification code</p>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
