
import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  ArrowLeft,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Edit2,
  ArrowRight,
  Volume2,
  Check,
  CheckSquare,
  FileText,
  BookOpen,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getStates, getDistricts, getTaluks } from '../data/locationData';
import { getApiUrl } from '../services/apiConfig';

export default function LoginPage({ initialMode = 'login' }) {
  const {
    setCurrentPage,
    language,
    toggleLanguage,
    t,
    setProfile,
    setWizardData,
    loginUser,
    intendedDestination,
    setIntendedDestination,
    speakText,
    stopSpeaking,
    isSpeaking
  } = useApp();

  // Silence speech synthesis immediately if login page unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const [isSignUp, setIsSignUp] = useState(initialMode === 'register');

  useEffect(() => {
    setIsSignUp(initialMode === 'register');
  }, [initialMode]);

  const [isLoading, setIsLoading] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const [userAlreadyExists, setUserAlreadyExists] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState('');
  const [smsDelivered, setSmsDelivered] = useState(false);

  // LOGIN STATE (OTP-based, starts empty without fake data)
  const [loginMobile, setLoginMobile] = useState('');
  const [loginOtpBoxes, setLoginOtpBoxes] = useState(['', '', '', '', '', '']);
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginCountdown, setLoginCountdown] = useState(30);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // SIGN UP / CREATE ACCOUNT STATE (OTP-based, starts empty)
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    mobile: '',
    gender: '',
    dob: '',
    state: 'Karnataka',
    district: '',
    taluk: '',
    category: 'General',
    landHolding: '2.0',
    cropType: 'Ragi & Cereals',
    fruitsId: ''
  });
  const [signupOtpBoxes, setSignupOtpBoxes] = useState(['', '', '', '', '', '']);
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupCountdown, setSignupCountdown] = useState(30);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // OTP input box refs
  const loginInputRefs = useRef([]);
  const signupInputRefs = useRef([]);

  // Countdown timer for Login OTP resend
  useEffect(() => {
    let timer;
    if (loginOtpSent && loginCountdown > 0) {
      timer = setInterval(() => {
        setLoginCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loginOtpSent, loginCountdown]);

  // Countdown timer for Signup OTP resend
  useEffect(() => {
    let timer;
    if (signupOtpSent && signupCountdown > 0) {
      timer = setInterval(() => {
        setSignupCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [signupOtpSent, signupCountdown]);

  // Location Cascade Handlers for Registration
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setSignupForm(prev => ({
      ...prev,
      state: selectedState,
      district: '',
      taluk: ''
    }));
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setSignupForm(prev => ({
      ...prev,
      district: selectedDistrict,
      taluk: ''
    }));
  };

  const handleTalukChange = (e) => {
    setSignupForm(prev => ({
      ...prev,
      taluk: e.target.value
    }));
  };

  // MOBILE INPUT HANDLERS (strictly 10 digits only)
  const handlePhoneKeyDown = (e) => {
    // Allow functional/navigation keys
    if (
      [
        'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End'
      ].includes(e.key) ||
      e.ctrlKey || e.metaKey || e.altKey
    ) {
      return;
    }
    // Block any non-numeric key immediately
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    // If already 10 digits and user hasn't highlighted text to replace, block keystroke
    const input = e.currentTarget;
    const selectedLength = (input.selectionEnd || 0) - (input.selectionStart || 0);
    const rawDigits = (input.value || '').replace(/\D/g, '');
    if (rawDigits.length >= 10 && selectedLength === 0) {
      e.preventDefault();
    }
  };

  const handlePhonePaste = (e, callback) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData)?.getData('text') || '';
    let digits = pastedText.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    const strictlyTen = digits.slice(0, 10);
    callback(strictlyTen);
  };

  const handleLoginMobileChange = (e) => {
    const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setLoginMobile(cleanDigits);
    if (loginError) setLoginError('');
  };

  const handleSignupMobileChange = (e) => {
    const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setSignupForm(prev => ({ ...prev, mobile: cleanDigits }));
    if (signupError) setSignupError('');
  };

  // SEND OTP FOR LOGIN (Verifies mobile presence in database)
  const handleSendLoginOtp = async (e) => {
    e.preventDefault();
    setLoginError('');
    setUserNotFound(false);
    setDevOtpHint('');

    const cleanNum = loginMobile.replace(/\D/g, '');
    if (cleanNum.length !== 10 || !/^[6-9]\d{9}$/.test(cleanNum)) {
      setLoginError(
        language === 'kn'
          ? 'ದಯವಿಟ್ಟು 6-9 ರಿಂದ ಪ್ರಾರಂಭವಾಗುವ 10-ಅಂಕಿಯ ಮಾನ್ಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ'
          : 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)'
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanNum,
          purpose: 'LOGIN_VERIFICATION'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 || data.code === 'USER_NOT_FOUND') {
          // Check if user previously registered on this device (cloud ephemeral restart resilience)
          try {
            const localSaved = localStorage.getItem(`kisan_local_account_${cleanNum}`);
            if (localSaved) {
              const u = JSON.parse(localSaved);
              const restoreRes = await fetch(getApiUrl('/api/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fullName: u.fullName || u.name,
                  phoneNumber: cleanNum,
                  state: u.state || 'Karnataka',
                  district: u.district || 'Dharwad',
                  taluk: u.taluk || '',
                  category: u.category || 'General',
                  gender: u.gender || undefined,
                  dob: u.dob || undefined,
                  landHolding: u.landHolding || '2.0',
                  cropType: u.cropType || 'Ragi & Cereals',
                  fruitsId: u.fruitsId || undefined
                })
              });
              if (restoreRes.ok || restoreRes.status === 409) {
                const retryOtp = await fetch(getApiUrl('/api/auth/send-otp'), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    phoneNumber: cleanNum,
                    purpose: 'LOGIN_VERIFICATION'
                  })
                });
                const retryData = await retryOtp.json();
                if (retryOtp.ok) {
                  setUserNotFound(false);
                  setLoginOtpSent(true);
                  setSmsDelivered(Boolean(retryData.smsDelivered));
                  setLoginCountdown(retryData.resendCooldownSeconds || 30);
                  setLoginOtpBoxes(['', '', '', '', '', '']);
                  if (retryData.devOtp) {
                    setDevOtpHint(String(retryData.devOtp));
                  }
                  setIsLoading(false);
                  return;
                }
              }
            }
          } catch (recoveryErr) {
            console.warn('Auto-recovery check error:', recoveryErr);
          }

          setUserNotFound(true);
          setLoginError(
            language === 'kn' && data.errorKn
              ? data.errorKn
              : (data.error || 'No account found with this mobile number. Please create an account first.')
          );
        } else {
          setLoginError(data.error || 'Failed to send login OTP. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      setUserNotFound(false);
      setLoginOtpSent(true);
      setSmsDelivered(Boolean(data.smsDelivered));
      setLoginCountdown(data.resendCooldownSeconds || 30);
      setLoginOtpBoxes(['', '', '', '', '', '']);
      if (data.devOtp) {
        setDevOtpHint(String(data.devOtp));
      }
    } catch (err) {
      console.error('Login send-otp error:', err);
      setLoginError(
        language === 'kn'
          ? 'ಸರ್ವರ್ ಸಂಪರ್ಕ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.'
          : 'Failed to connect to authentication server. Please check your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // OTP BOX CHANGE HANDLER (Login)
  const handleLoginBoxChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newBoxes = [...loginOtpBoxes];
    newBoxes[index] = digit;
    setLoginOtpBoxes(newBoxes);

    if (digit && index < 5) {
      loginInputRefs.current[index + 1]?.focus();
    }
  };

  const handleLoginBoxKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !loginOtpBoxes[index] && index > 0) {
      loginInputRefs.current[index - 1]?.focus();
    }
  };

  const handleLoginBoxPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    const digits = pastedData.split('');
    const newBoxes = [...loginOtpBoxes];
    digits.forEach((digit, i) => {
      if (i < 6) newBoxes[i] = digit;
    });
    setLoginOtpBoxes(newBoxes);
    const nextIdx = Math.min(digits.length, 5);
    loginInputRefs.current[nextIdx]?.focus();
  };

  // VERIFY OTP FOR LOGIN
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setLoginError('');

    const otpCode = loginOtpBoxes.join('');
    if (otpCode.length < 6) {
      setLoginError(
        language === 'kn'
          ? 'ದಯವಿಟ್ಟು 6-ಅಂಕಿಯ ಪರಿಶೀಲನಾ ಒಟಿಪಿ ನಮೂದಿಸಿ'
          : 'Please enter the complete 6-digit verification code'
      );
      return;
    }

    const cleanNum = loginMobile.replace(/\D/g, '');
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanNum,
          otpCode,
          purpose: 'LOGIN_VERIFICATION'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 || data.code === 'USER_NOT_FOUND') {
          setUserNotFound(true);
          setLoginError(
            language === 'kn' && data.errorKn
              ? data.errorKn
              : (data.error || 'No account found with this mobile number. Please create an account first.')
          );
        } else {
          setLoginError(data.error || 'Invalid OTP code. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // STRICT VALIDATION: Require verified user and token
      if (!data.token || !data.user) {
        setUserNotFound(true);
        setLoginError(
          language === 'kn'
            ? 'ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯ ಯಾವುದೇ ಖಾತೆ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೊದಲು ಹೊಸ ಖಾತೆ ರಚಿಸಿ.'
            : 'No registered account found for this mobile number. Please create an account first.'
        );
        setIsLoading(false);
        return;
      }

      await loginUser(data.user, data.token);

      try {
        const phoneKey = (data.user.phoneNumber || cleanNum).replace(/\D/g, '');
        localStorage.setItem(`kisan_local_account_${phoneKey}`, JSON.stringify(data.user));
      } catch (e) {}

      setLoginSuccess(true);
      setTimeout(() => {
        const destination = intendedDestination && intendedDestination !== 'landing' ? intendedDestination : 'dashboard';
        setIntendedDestination('dashboard');
        setCurrentPage(destination);
      }, 700);
    } catch (err) {
      console.error('Verify login OTP error:', err);
      setLoginError(
        language === 'kn'
          ? 'ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.'
          : 'Verification failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // RESEND LOGIN OTP
  const handleResendLoginOtp = async () => {
    setLoginError('');
    setDevOtpHint('');
    const cleanNum = loginMobile.replace(/\D/g, '');
    try {
      const response = await fetch(getApiUrl('/api/auth/resend-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanNum,
          purpose: 'LOGIN_VERIFICATION'
        })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 404 || data.code === 'USER_NOT_FOUND') {
          setUserNotFound(true);
          setLoginError(
            language === 'kn' && data.errorKn
              ? data.errorKn
              : (data.error || 'No account found with this mobile number. Please create an account first.')
          );
        } else {
          setLoginError(data.error || 'Failed to resend OTP.');
        }
        return;
      }
      setLoginCountdown(data.resendCooldownSeconds || 60);
      setLoginOtpBoxes(['', '', '', '', '', '']);
      if (data.devOtp) setDevOtpHint(String(data.devOtp));
    } catch (err) {
      setLoginError('Network error resending OTP.');
    }
  };

  // SEND OTP FOR SIGN UP / REGISTER
  const handleSendSignupOtp = async (e) => {
    e.preventDefault();
    setSignupError('');
    setUserAlreadyExists(false);
    setDevOtpHint('');

    if (!signupForm.fullName.trim()) {
      setSignupError(language === 'kn' ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ' : 'Please enter your full name');
      return;
    }

    const cleanNum = signupForm.mobile.replace(/\D/g, '');
    if (cleanNum.length !== 10 || !/^[6-9]\d{9}$/.test(cleanNum)) {
      setSignupError(
        language === 'kn'
          ? 'ದಯವಿಟ್ಟು 6-9 ರಿಂದ ಪ್ರಾರಂಭವಾಗುವ 10-ಅಂಕಿಯ ಮಾನ್ಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ'
          : 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)'
      );
      return;
    }

    if (!signupForm.district) {
      setSignupError(language === 'kn' ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Please select your district');
      return;
    }

    if (!signupForm.taluk) {
      setSignupError(language === 'kn' ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ತಾಲೂಕನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Please select your taluk');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: signupForm.fullName.trim(),
          phoneNumber: cleanNum,
          state: signupForm.state || 'Karnataka',
          district: signupForm.district,
          taluk: signupForm.taluk,
          category: signupForm.category || 'General',
          gender: signupForm.gender || undefined,
          dob: signupForm.dob || undefined,
          landHolding: signupForm.landHolding || '2.0',
          cropType: signupForm.cropType || 'Ragi & Cereals',
          fruitsId: signupForm.fruitsId?.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 || data.code === 'USER_ALREADY_EXISTS') {
          setUserAlreadyExists(true);
          setSignupError(
            language === 'kn' && data.errorKn
              ? data.errorKn
              : (data.error || 'An account with this mobile number already exists. Please login.')
          );
        } else {
          setSignupError(data.error || 'Failed to start registration.');
        }
        setIsLoading(false);
        return;
      }

      setUserAlreadyExists(false);
      setSignupOtpSent(true);
      setSmsDelivered(Boolean(data.smsDelivered));
      setSignupCountdown(data.resendCooldownSeconds || 30);
      setSignupOtpBoxes(['', '', '', '', '', '']);
      if (data.devOtp) setDevOtpHint(String(data.devOtp));
    } catch (err) {
      console.error('Registration send-otp error:', err);
      setSignupError(
        language === 'kn'
          ? 'ಸರ್ವರ್ ಸಂಪರ್ಕ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.'
          : 'Failed to connect to authentication server. Please check your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // OTP BOX CHANGE HANDLER (Signup)
  const handleSignupBoxChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newBoxes = [...signupOtpBoxes];
    newBoxes[index] = digit;
    setSignupOtpBoxes(newBoxes);

    if (digit && index < 5) {
      signupInputRefs.current[index + 1]?.focus();
    }
  };

  const handleSignupBoxKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !signupOtpBoxes[index] && index > 0) {
      signupInputRefs.current[index - 1]?.focus();
    }
  };

  const handleSignupBoxPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    const digits = pastedData.split('');
    const newBoxes = [...signupOtpBoxes];
    digits.forEach((digit, i) => {
      if (i < 6) newBoxes[i] = digit;
    });
    setSignupOtpBoxes(newBoxes);
    const nextIdx = Math.min(digits.length, 5);
    signupInputRefs.current[nextIdx]?.focus();
  };

  // VERIFY OTP AND COMPLETE REGISTRATION
  const handleVerifySignupOtp = async (e) => {
    e.preventDefault();
    setSignupError('');

    const otpCode = signupOtpBoxes.join('');
    if (otpCode.length < 6) {
      setSignupError(
        language === 'kn'
          ? 'ದಯವಿಟ್ಟು 6-ಅಂಕಿಯ ಪರಿಶೀಲನಾ ಒಟಿಪಿ ನಮೂದಿಸಿ'
          : 'Please enter the complete 6-digit verification code'
      );
      return;
    }

    const cleanNum = signupForm.mobile.replace(/\D/g, '');
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanNum,
          otpCode,
          purpose: 'REGISTRATION'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setSignupError(data.error || 'Invalid OTP code. Please check and try again.');
        setIsLoading(false);
        return;
      }

      if (!data.token || !data.user) {
        setSignupError(
          language === 'kn'
            ? 'ಖಾತೆ ನೋಂದಣಿ ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
            : 'Account registration verification failed. Please try again.'
        );
        setIsLoading(false);
        return;
      }

      await loginUser(data.user, data.token);

      try {
        const phoneKey = (data.user.phoneNumber || cleanNum).replace(/\D/g, '');
        localStorage.setItem(`kisan_local_account_${phoneKey}`, JSON.stringify(data.user));
      } catch (e) {}

      setSignupSuccess(true);
      setTimeout(() => {
        const destination = intendedDestination && intendedDestination !== 'landing' ? intendedDestination : 'dashboard';
        setIntendedDestination('dashboard');
        setCurrentPage(destination);
      }, 700);
    } catch (err) {
      console.error('Verify registration OTP error:', err);
      setSignupError(
        language === 'kn'
          ? 'ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.'
          : 'Verification failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // RESEND SIGNUP OTP
  const handleResendSignupOtp = async () => {
    setSignupError('');
    setDevOtpHint('');
    const cleanNum = signupForm.mobile.replace(/\D/g, '');
    try {
      const response = await fetch(getApiUrl('/api/auth/resend-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanNum,
          purpose: 'REGISTRATION'
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setSignupError(data.error || 'Failed to resend OTP.');
        return;
      }
      setSignupCountdown(data.resendCooldownSeconds || 60);
      setSignupOtpBoxes(['', '', '', '', '', '']);
      if (data.devOtp) setDevOtpHint(String(data.devOtp));
    } catch (err) {
      setSignupError('Network error resending OTP.');
    }
  };

  // Voice narration helper
  const handleVoiceHelp = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const message = isSignUp
      ? (language === 'kn'
        ? 'ರೈತ ನೋಂದಣಿ: ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ಜಮೀನಿನ ತಾಲೂಕನ್ನು ಆಯ್ಕೆಮಾಡಿ ಒಟಿಪಿ ಪಡೆಯಿರಿ.'
        : 'Farmer Registration: Enter your name, mobile number and taluk, then click send OTP.')
      : (language === 'kn'
        ? 'ರೈತ ಲಾಗಿನ್: ದಯವಿಟ್ಟು ನಿಮ್ಮ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ ಮತ್ತು ಒಟಿಪಿ ಪಡೆಯಿರಿ.'
        : 'Farmer Login: Enter your 10-digit mobile number and get OTP to sign in.');
    speakText(message);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-cream-100 font-sans selection:bg-[#6C151E] selection:text-white">

      {/* ============================================================ */}
      {/* LEFT PANEL: Matches 02_Login_Page.png Design Mockup          */}
      {/* ============================================================ */}
      <div className="relative w-full lg:w-[46%] xl:w-[44%] lg:min-h-screen flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-hidden bg-[#0F3D3A] text-white">

        {/* Top: Home Navigation Button */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage('landing')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200/90 hover:text-white bg-white/10 hover:bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-full border border-emerald-400/20 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.home}</span>
          </button>
        </div>

        {/* Center: Official Brand Logo & Actual Portal Features */}
        <div className="relative z-10 my-auto py-3 lg:py-6 space-y-3 lg:space-y-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/95 p-1.5 sm:p-2 shadow-xl border-2 border-amber-300/60 flex items-center justify-center flex-shrink-0">
              <img
                src="/logo-emblem.png"
                alt="Kisan Scheme Saathi Emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif-heading font-bold text-white tracking-tight leading-tight">
                Kisan Scheme <span className="text-amber-300">Saathi</span>
              </h1>
              <p className="text-emerald-200/90 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-0.5">
                {language === 'kn' ? 'ಸರ್ಕಾರಿ ಕೃಷಿ ಯೋಜನೆಗಳ ಪೋರ್ಟಲ್' : 'Government Agricultural Schemes Portal'}
              </p>
            </div>
          </div>

          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed max-w-md font-normal hidden sm:block">
            {language === 'kn'
              ? 'ಕೇಂದ್ರ ಮತ್ತು ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಕೃಷಿ ಸಬ್ಸಿಡಿಗಳು, ಬೆಳೆ ವಿಮೆ ಮತ್ತು ಧನಸಹಾಯ ಯೋಜನೆಗಳನ್ನು ಸುಲಭವಾಗಿ ಕಂಡುಕೊಳ್ಳಿ.'
              : 'Discover central and Karnataka state agricultural subsidies, crop insurance, and financial benefits tailored to your farm.'}
          </p>

          {/* Genuine Portal Features (visible on desktop) */}
          <div className="space-y-2.5 pt-1 hidden lg:block">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
              {language === 'kn' ? 'ಪೋರ್ಟಲ್‌ನ ಪ್ರಮುಖ ಸೇವೆಗಳು' : 'Key Portal Features'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Feature 1: Eligibility Checker */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-400/20 text-emerald-100 space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <CheckSquare className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <span>{language === 'kn' ? 'ಅರ್ಹತಾ ಪರಿಶೀಲನೆ' : 'Check Eligibility'}</span>
                </div>
                <p className="text-[11px] text-emerald-100/80 leading-snug">
                  {language === 'kn'
                    ? 'ನಿಮ್ಮ ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ ಮತ್ತು ಬೆಳೆಗೆ ಸೂಕ್ತವಾದ ಯೋಜನೆಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ.'
                    : 'Match central and state schemes suited for your land size and crop.'}
                </p>
              </div>

              {/* Feature 2: Document Checklist */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-400/20 text-emerald-100 space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <FileText className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <span>{language === 'kn' ? 'ದಾಖಲೆಗಳ ಪಟ್ಟಿ' : 'Document Checklist'}</span>
                </div>
                <p className="text-[11px] text-emerald-100/80 leading-snug">
                  {language === 'kn'
                    ? 'ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಬೇಕಾದ ದಾಖಲೆಗಳ (ಆಧಾರ್, ಭೂಮಿ RTC, FRUITS ID) ನಿಖರ ವಿವರ.'
                    : 'Know the required documents (Bhoomi RTC, FRUITS FID, Aadhaar) beforehand.'}
                </p>
              </div>

              {/* Feature 3: Official Application Guide */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-400/20 text-emerald-100 space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <BookOpen className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <span>{language === 'kn' ? 'ಅರ್ಜಿ ಮಾರ್ಗದರ್ಶಿ' : 'Application Guide'}</span>
                </div>
                <p className="text-[11px] text-emerald-100/80 leading-snug">
                  {language === 'kn'
                    ? 'ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಹಂತ-ಹಂತದ ವಿಧಾನ.'
                    : 'Step-by-step instructions and direct links to official government portals.'}
                </p>
              </div>

              {/* Feature 4: Bilingual Voice Assistance */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-400/20 text-emerald-100 space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Volume2 className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <span>{language === 'kn' ? 'ಧ್ವನಿ ಓದುವ ಸಹಾಯಕ' : 'Voice Assistance'}</span>
                </div>
                <p className="text-[11px] text-emerald-100/80 leading-snug">
                  {language === 'kn'
                    ? 'ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಯೋಜನೆಗಳ ವಿವರಗಳನ್ನು ಧ್ವನಿಯ ಮೂಲಕ ಆಲಿಸಿ.'
                    : 'Listen to scheme criteria and guidance read aloud in Kannada and English.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* RIGHT AUTH PANEL: Clean, Fast, OTP-Based Authentication     */}
      {/* ============================================================ */}
      <div className="w-full lg:w-[54%] xl:w-[56%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto bg-cream-100">

        {/* Top Controls: Voice Assist & Language Switcher */}
        <div className="flex items-center justify-between pb-6">
          <button
            type="button"
            onClick={handleVoiceHelp}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 text-xs font-bold border border-emerald-300/70 transition-all shadow-xs active:scale-95"
            title="Listen to instructions"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
            <span>{language === 'kn' ? 'ಧ್ವನಿ ಸೂಚನೆ ಕೇಳಿ' : 'Listen Instructions'}</span>
          </button>

          {/* Bilingual Switcher Pill */}
          <div className="flex items-center p-1 bg-stone-200/80 rounded-full border border-stone-300 shadow-inner">
            <button
              onClick={() => toggleLanguage('kn')}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${language === 'kn' ? 'bg-[#0F3D3A] text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
                }`}
            >
              ಕನ್ನಡ
            </button>
            <button
              onClick={() => toggleLanguage('en')}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-[#0F3D3A] text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
                }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Central Auth Container */}
        <div className="max-w-md w-full mx-auto my-auto py-4">

          {/* Mobile Branded Header (visible on mobile only) */}
          <div className="lg:hidden flex flex-col items-center justify-center pb-5 text-center">
            <img
              src="/logo.png"
              alt="Kisan Scheme Saathi"
              className="h-12 w-auto object-contain drop-shadow-xs"
            />
          </div>

          {/* Title Header (Matching 02_Login_Page.png) */}
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl md:text-4xl font-bold font-serif-heading text-stone-900 mb-2">
              {isSignUp
                ? (language === 'kn' ? 'ಹೊಸ ಖಾತೆ ರಚಿಸಿ' : 'Create Account')
                : (language === 'kn' ? 'ಮರಳಿ ಸ್ವಾಗತ' : 'Welcome Back')}
            </h2>
            <p className="text-stone-600 text-sm md:text-base">
              {isSignUp
                ? (language === 'kn' ? 'ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಸುಲಭವಾಗಿ ನೋಂದಾಯಿಸಿ' : 'Register for Kisan Scheme Saathi with your mobile')
                : (language === 'kn' ? 'ನಿಮ್ಮ ಕಿಸಾನ್ ಸ್ಕೀಮ್ ಸಾಥಿ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ' : 'Login to your Kisan Scheme Saathi account')}
            </p>
          </div>

          {/* Status Notifications */}
          {(loginError || signupError) && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold space-y-2.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span className="leading-snug">{loginError || signupError}</span>
              </div>
              {userNotFound && (
                <div className="pt-2 border-t border-red-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-[11px] text-red-800 font-normal">
                    {language === 'kn' ? 'ಖಾತೆ ಇಲ್ಲವೇ? ಈಗಲೇ ಹೊಸ ರೈತ ಖಾತೆ ತೆರೆಯಿರಿ:' : 'No account registered? Create one now:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setSignupForm(prev => ({ ...prev, mobile: loginMobile.replace(/\D/g, '') }));
                      setLoginError('');
                      setUserNotFound(false);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#6C151E] hover:bg-[#521016] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <span>{language === 'kn' ? 'ಹೊಸ ಖಾತೆ ರಚಿಸಿ' : 'Create Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {userAlreadyExists && (
                <div className="pt-2 border-t border-red-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-[11px] text-red-800 font-normal">
                    {language === 'kn' ? 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್ ಮಾಡಿ:' : 'Account already exists? Login now:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setLoginMobile(signupForm.mobile.replace(/\D/g, ''));
                      setSignupError('');
                      setUserAlreadyExists(false);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0F3D3A] hover:bg-[#072d1f] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <span>{language === 'kn' ? 'ಲಾಗಿನ್ ಮಾಡಿ' : 'Login'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {(loginSuccess || signupSuccess) && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                {language === 'kn'
                  ? 'ಒಟಿಪಿ ಯಶಸ್ವಿಯಾಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ! ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ತೆರಳಲಾಗುತ್ತಿದೆ...'
                  : 'OTP verified successfully! Loading your personalized dashboard...'}
              </span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: LOGIN (100% OTP-BASED, NO PASSWORDS)              */}
          {/* ======================================================== */}
          {!isSignUp ? (
            <div>
              {!loginOtpSent ? (
                /* Step 1: Enter Mobile Number & Request OTP */
                <form onSubmit={handleSendLoginOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      {t.mobileNumber} <span className="text-[#6C151E]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-700 font-bold text-sm">
                        +91
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        value={loginMobile}
                        onKeyDown={handlePhoneKeyDown}
                        onPaste={(e) => handlePhonePaste(e, (val) => {
                          setLoginMobile(val);
                          if (loginError) setLoginError('');
                        })}
                        onInput={(e) => {
                          const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                          if (e.target.value !== clean) {
                            e.target.value = clean;
                          }
                        }}
                        onChange={handleLoginMobileChange}
                        placeholder={language === 'kn' ? '10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : 'Enter 10-digit mobile number'}
                        className="w-full pl-14 pr-20 py-3.5 bg-white border border-stone-300 rounded-2xl text-stone-900 font-bold placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F3D3A] transition-all shadow-xs text-base tracking-wider"
                        required
                        autoFocus
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-1.5 pointer-events-none">
                        <span className={`text-[11px] font-bold ${loginMobile.length === 10 ? 'text-emerald-700' : 'text-stone-400'}`}>
                          {loginMobile.length}/10
                        </span>
                        {loginMobile.length === 10 && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-4 rounded-2xl bg-[#6C151E] hover:bg-[#521016] disabled:bg-stone-400 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === 'kn' ? 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Checking Number...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{language === 'kn' ? 'ಒಟಿಪಿ ಪಡೆಯಿರಿ' : 'Get OTP'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-4 text-center text-sm text-stone-600">
                    <span>{language === 'kn' ? 'ಖಾತೆ ಇಲ್ಲವೇ?' : "Don't have an account?"} </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setLoginError('');
                        setSignupError('');
                      }}
                      className="font-bold text-[#6C151E] underline hover:text-[#5a1322] transition-colors ml-1"
                    >
                      {language === 'kn' ? 'ಹೊಸ ಖಾತೆ ರಚಿಸಿ' : 'Create Account'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Interactive 6-Box OTP Verification */
                <form onSubmit={handleVerifyLoginOtp} className="space-y-5">
                  {/* Mobile confirmation strip */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold">
                        <Check className="w-4 h-4 text-emerald-800" />
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px] uppercase font-bold tracking-wider">
                          {smsDelivered
                            ? (language === 'kn' ? 'ಎಸ್‌ಎಂಎಸ್ ಕಳುಹಿಸಲಾಗಿದೆ' : 'SMS Dispatched to Phone')
                            : (language === 'kn' ? 'ಪರೀಕ್ಷಾ ಮೋಡ್ • ಕೆಳಗಿನ ಒಟಿಪಿ ಬಳಸಿ' : 'Test Mode • Use On-Screen OTP')}
                        </span>
                        <span className="font-bold text-emerald-950 text-sm">+91 {loginMobile.replace(/\D/g, '')}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setLoginOtpSent(false); setLoginError(''); setDevOtpHint(''); }}
                      className="text-xs font-bold text-[#0F3D3A] hover:text-[#6C151E] flex items-center gap-1 underline"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{t.changeMobile}</span>
                    </button>
                  </div>

                  {/* Dev / Test OTP Banner if available */}
                  {devOtpHint && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{language === 'kn' ? 'ನಿಮ್ಮ ಪರಿಶೀಲನಾ ಒಟಿಪಿ ಕೋಡ್:' : 'Your 6-Digit OTP Code:'}</span>
                        </span>
                        <span className="font-mono font-black text-base text-amber-950 bg-white px-2.5 py-0.5 rounded-lg border border-amber-300 tracking-widest">
                          {devOtpHint}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-[11px] text-amber-800">
                        <span>{language === 'kn' ? 'ರಿಯಲ್ ಎಸ್‌ಎಂಎಸ್ ಗೇಟ್‌ವೇ ಇಲ್ಲದಿದ್ದರೂ ತಕ್ಷಣ ಲಾಗಿನ್ ಆಗಬಹುದು (ಅಥವಾ 123456).' : 'Fast2SMS uncharged: Use this code or standard 123456 to sign in.'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const digits = (devOtpHint || '123456').slice(0, 6).split('');
                            setLoginOtpBoxes(digits);
                          }}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex-shrink-0 ml-2"
                        >
                          {language === 'kn' ? 'ಸ್ವಯಂ ಭರ್ತಿ' : 'Auto Fill'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 6 Individual Interactive OTP Boxes */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        {t.enterOtp} <span className="text-[#6C151E]">*</span>
                      </label>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {language === 'kn' ? '6-ಅಂಕಿಯ ಒಟಿಪಿ ಕೋಡ್' : '6-digit SMS verification code'}
                      </span>
                    </div>

                    <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5">
                      {loginOtpBoxes.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => loginInputRefs.current[idx] = el}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleLoginBoxChange(idx, e.target.value)}
                          onKeyDown={(e) => handleLoginBoxKeyDown(idx, e)}
                          onPaste={handleLoginBoxPaste}
                          className="w-full h-11 sm:h-14 text-center font-mono font-bold text-lg sm:text-2xl bg-white border-2 border-stone-300 focus:border-[#0F3D3A] rounded-lg sm:rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]/20 transition-all shadow-xs p-0"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend Countdown Strip */}
                  <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                    <span>
                      {loginCountdown > 0 ? (
                        <span>
                          {language === 'kn' ? 'ಮರುಕಳುಹಿಸಿ:' : 'Resend OTP in'}{' '}
                          <strong className="text-stone-900 font-mono font-bold">{loginCountdown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendLoginOtp}
                          className="font-bold text-[#6C151E] hover:text-[#521016] flex items-center gap-1 transition-colors underline"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t.resendOtp}</span>
                        </button>
                      )}
                    </span>
                  </div>

                  {/* Verify & Login CTA */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-4 rounded-2xl bg-[#6C151E] hover:bg-[#521016] disabled:bg-stone-400 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === 'kn' ? 'ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...' : 'Verifying & Logging In...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{t.verifyAndLogin}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ======================================================== */
            /* TAB 2: CREATE ACCOUNT (100% OTP-BASED, NO PASSWORDS)     */
            /* ======================================================== */
            <div>
              {!signupOtpSent ? (
                /* Step 1: Farmer Registration Form */
                <form onSubmit={handleSendSignupOtp} className="space-y-4">

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      {t.fullName} <span className="text-[#6C151E]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={signupForm.fullName}
                        onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                        placeholder={language === 'kn' ? 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು' : 'Your full name'}
                        className="w-full pl-10 pr-3.5 py-3 bg-white border border-stone-300 rounded-xl text-stone-900 font-medium placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F3D3A] transition-all shadow-xs text-sm"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      {t.mobileNumber} <span className="text-[#6C151E]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-700 font-bold text-sm">
                        +91
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        value={signupForm.mobile}
                        onKeyDown={handlePhoneKeyDown}
                        onPaste={(e) => handlePhonePaste(e, (val) => {
                          setSignupForm(prev => ({ ...prev, mobile: val }));
                          if (signupError) setSignupError('');
                        })}
                        onInput={(e) => {
                          const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                          if (e.target.value !== clean) {
                            e.target.value = clean;
                          }
                        }}
                        onChange={handleSignupMobileChange}
                        placeholder={language === 'kn' ? '10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : 'Enter 10-digit mobile number'}
                        className="w-full pl-14 pr-20 py-3 bg-white border border-stone-300 rounded-xl text-stone-900 font-medium placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F3D3A] transition-all shadow-xs text-sm"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-1.5 pointer-events-none">
                        <span className={`text-[11px] font-bold ${signupForm.mobile.length === 10 ? 'text-emerald-700' : 'text-stone-400'}`}>
                          {signupForm.mobile.length}/10
                        </span>
                        {signupForm.mobile.length === 10 && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gender and DOB (Optional) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        {t.gender || (language === 'kn' ? 'ಲಿಂಗ' : 'Gender')}
                      </label>
                      <select
                        value={signupForm.gender}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-medium text-xs focus:ring-2 focus:ring-[#0F3D3A] focus:outline-none cursor-pointer shadow-xs"
                      >
                        <option value="">{language === 'kn' ? '-- ಲಿಂಗ (ಐಚ್ಛಿಕ) --' : '-- Gender (Optional) --'}</option>
                        <option value="Male">{language === 'kn' ? 'ಪುರುಷ (Male)' : 'Male'}</option>
                        <option value="Female">{language === 'kn' ? 'ಮಹಿಳೆ (Female)' : 'Female'}</option>
                        <option value="Other">{language === 'kn' ? 'ಇತರೆ (Other)' : 'Other'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        {t.dateOfBirth || (language === 'kn' ? 'ಹುಟ್ಟಿದ ದಿನಾಂಕ' : 'Date of Birth')}
                      </label>
                      <input
                        type="date"
                        value={signupForm.dob}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, dob: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-medium text-xs focus:ring-2 focus:ring-[#0F3D3A] focus:outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Cascading Location Section: State -> District -> Taluk */}
                  <div className="p-4 rounded-2xl bg-white border border-stone-300 space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{language === 'kn' ? 'ಸ್ಥಳ ವಿವರಗಳು' : 'Location Details'}</span>
                      </span>
                    </div>

                    {/* State Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1">
                        {t.state || (language === 'kn' ? 'ರಾಜ್ಯ' : 'State')} <span className="text-[#6C151E]">*</span>
                      </label>
                      <select
                        value={signupForm.state}
                        onChange={handleStateChange}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium text-xs focus:ring-2 focus:ring-[#0F3D3A] focus:outline-none cursor-pointer"
                      >
                        {getStates().map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    {/* District & Taluk in 2 columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* District Dropdown */}
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">
                          {t.district || (language === 'kn' ? 'ಜಿಲ್ಲೆ' : 'District')} <span className="text-[#6C151E]">*</span>
                        </label>
                        <select
                          value={signupForm.district}
                          onChange={handleDistrictChange}
                          className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-medium text-xs focus:ring-2 focus:ring-[#0F3D3A] focus:outline-none cursor-pointer"
                          required
                        >
                          <option value="">{language === 'kn' ? '-- ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ --' : '-- Select District --'}</option>
                          {getDistricts(signupForm.state).map((dist) => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                      </div>

                      {/* Taluk Dropdown */}
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">
                          {t.taluk || (language === 'kn' ? 'ತಾಲೂಕು' : 'Taluk')} <span className="text-[#6C151E]">*</span>
                        </label>
                        <select
                          value={signupForm.taluk}
                          onChange={handleTalukChange}
                          disabled={!signupForm.district}
                          className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-medium text-xs focus:ring-2 focus:ring-[#0F3D3A] focus:outline-none cursor-pointer disabled:bg-stone-100 disabled:text-stone-400"
                          required
                        >
                          <option value="">{language === 'kn' ? '-- ತಾಲೂಕು ಆಯ್ಕೆಮಾಡಿ --' : '-- Select Taluk --'}</option>
                          {signupForm.district && getTaluks(signupForm.state, signupForm.district).map((taluk) => (
                            <option key={taluk} value={taluk}>{taluk}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Farm Details Card (Personalizes Schemes Immediately) */}
                  <div className="p-4 rounded-2xl bg-white border border-stone-300 space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{language === 'kn' ? 'ಕೃಷಿ ವಿವರಗಳು (ವೈಯಕ್ತಿಕ ಯೋಜನೆಗಳು)' : 'Farm Details (For Personalized Schemes)'}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Category */}
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">
                          {language === 'kn' ? 'ವರ್ಗ' : 'Category'}
                        </label>
                        <select
                          value={signupForm.category}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium text-xs focus:ring-2 focus:ring-[#0F3D3A] focus:outline-none cursor-pointer"
                        >
                          <option value="General">General</option>
                          <option value="OBC">OBC</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                        </select>
                      </div>

                      {/* Land Holding */}
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">
                          {language === 'kn' ? 'ಜಮೀನು (ಎಕರೆ)' : 'Land Holding'}
                        </label>
                        <select
                          value={signupForm.landHolding}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, landHolding: e.target.value }))}
                          className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium text-xs focus:ring-2 focus:ring-[#0F3D3A] focus:outline-none cursor-pointer"
                        >
                          <option value="1.0">1.0 Acre (Marginal)</option>
                          <option value="2.0">2.0 Acres (Small)</option>
                          <option value="3.5">3.5 Acres (Small)</option>
                          <option value="5.0">5.0 Acres (Medium)</option>
                          <option value="7.5">7.5 Acres (Large)</option>
                          <option value="10.0">10.0+ Acres (Large)</option>
                        </select>
                      </div>

                      {/* Primary Crop */}
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">
                          {language === 'kn' ? 'ಮುಖ್ಯ ಬೆಳೆ' : 'Primary Crop'}
                        </label>
                        <select
                          value={signupForm.cropType}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, cropType: e.target.value }))}
                          className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium text-xs focus:ring-2 focus:ring-[#0F3D3A] focus:outline-none cursor-pointer"
                        >
                          <option value="Ragi & Cereals">Ragi / Millets</option>
                          <option value="Paddy & Rice">Paddy / Rice</option>
                          <option value="Sugarcane & Commercial">Sugarcane / Commercial</option>
                          <option value="Vegetables & Fruits">Vegetables / Fruits</option>
                          <option value="Pulses & Oilseeds">Pulses / Oilseeds</option>
                        </select>
                      </div>
                    </div>

                    {/* Optional Authentic FRUITS ID */}
                    <div className="pt-2 border-t border-stone-200/70">
                      <label className="block text-xs font-bold text-stone-600 mb-1">
                        {language === 'kn' ? 'ಕರ್ನಾಟಕ FRUITS ಐಡಿ (FID - ಐಚ್ಛಿಕ)' : 'Karnataka FRUITS ID (FID - Optional)'}
                      </label>
                      <input
                        type="text"
                        value={signupForm.fruitsId || ''}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, fruitsId: e.target.value.trim() }))}
                        placeholder={language === 'kn' ? 'ಉದಾ: 10048291 (ಇದ್ದಲ್ಲಿ ಮಾತ್ರ ನಮೂದಿಸಿ)' : 'e.g. 10048291 (enter only if already registered)'}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium text-xs focus:ring-2 focus:ring-[#0F3D3A] focus:outline-none font-mono"
                      />
                      <span className="text-[10px] text-stone-500 mt-1 block">
                        {language === 'kn'
                          ? 'ನಿಮ್ಮ ಬಳಿ FRUITS ID ಇಲ್ಲದಿದ್ದರೆ ಖಾಲಿ ಬಿಡಿ. ಯಾವುದೇ ನಕಲಿ ಐಡಿ ಸೃಷ್ಟಿಯಾಗುವುದಿಲ್ಲ.'
                          : 'Leave blank if not registered on fruits.karnataka.gov.in. No fake ID will be generated.'}
                      </span>
                    </div>
                  </div>

                  {/* Send OTP & Register CTA Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-4 rounded-2xl bg-[#6C151E] hover:bg-[#521016] disabled:bg-stone-400 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === 'kn' ? 'ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆ...' : 'Registering...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{language === 'kn' ? 'ಒಟಿಪಿ ಪಡೆಯಿರಿ' : 'Get OTP & Register'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Back to Login */}
                  <div className="pt-4 text-center text-sm text-stone-600">
                    <span>{language === 'kn' ? 'ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?' : 'Already have an account?'} </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setSignupError('');
                        setLoginError('');
                      }}
                      className="font-bold text-[#6C151E] underline hover:text-[#5a1322] transition-colors ml-1"
                    >
                      {language === 'kn' ? 'ಲಾಗಿನ್ ಮಾಡಿ' : 'Login'}
                    </button>
                  </div>

                </form>
              ) : (
                /* Step 2: Interactive 6-Box OTP for Registration */
                <form onSubmit={handleVerifySignupOtp} className="space-y-5">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                      <div>
                        <span className="font-bold text-stone-900 text-sm block">{signupForm.fullName}</span>
                        <span className="text-[11px] text-stone-600">+91 {signupForm.mobile.replace(/\D/g, '')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSignupOtpSent(false); setSignupError(''); setDevOtpHint(''); }}
                        className="text-xs font-bold text-[#0F3D3A] hover:text-[#6C151E] flex items-center gap-1 underline"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{language === 'kn' ? 'ತಿದ್ದುಪಡಿ' : 'Edit'}</span>
                      </button>
                    </div>
                    <div className="text-stone-600 text-[11px] space-y-0.5">
                      <p>📍 {signupForm.taluk}, {signupForm.district}, {signupForm.state}</p>
                      <p className="text-emerald-900 font-semibold">🌾 {signupForm.landHolding} Acres • {signupForm.category} • {signupForm.cropType}</p>
                    </div>
                  </div>

                  {/* Dev / Test OTP Banner if available */}
                  {devOtpHint && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{language === 'kn' ? 'ನಿಮ್ಮ ಪರಿಶೀಲನಾ ಒಟಿಪಿ ಕೋಡ್:' : 'Your 6-Digit OTP Code:'}</span>
                        </span>
                        <span className="font-mono font-black text-base text-amber-950 bg-white px-2.5 py-0.5 rounded-lg border border-amber-300 tracking-widest">
                          {devOtpHint}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-[11px] text-amber-800">
                        <span>{language === 'kn' ? 'ರಿಯಲ್ ಎಸ್‌ಎಂಎಸ್ ಗೇಟ್‌ವೇ ಇಲ್ಲದಿದ್ದರೂ ತಕ್ಷಣ ನೋಂದಾಯಿಸಬಹುದು (ಅಥವಾ 123456).' : 'Fast2SMS uncharged: Use this code or standard 123456 to register.'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const digits = (devOtpHint || '123456').slice(0, 6).split('');
                            setSignupOtpBoxes(digits);
                          }}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex-shrink-0 ml-2"
                        >
                          {language === 'kn' ? 'ಸ್ವಯಂ ಭರ್ತಿ' : 'Auto Fill'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 6 Individual Interactive OTP Boxes */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        {t.enterOtp} <span className="text-[#6C151E]">*</span>
                      </label>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {language === 'kn' ? '6-ಅಂಕಿಯ ಒಟಿಪಿ ಕೋಡ್' : '6-digit SMS verification code'}
                      </span>
                    </div>

                    <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5">
                      {signupOtpBoxes.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => signupInputRefs.current[idx] = el}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleSignupBoxChange(idx, e.target.value)}
                          onKeyDown={(e) => handleSignupBoxKeyDown(idx, e)}
                          onPaste={handleSignupBoxPaste}
                          className="w-full h-11 sm:h-14 text-center font-mono font-bold text-lg sm:text-2xl bg-white border-2 border-stone-300 focus:border-[#0F3D3A] rounded-lg sm:rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]/20 transition-all shadow-xs p-0"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend Countdown */}
                  <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                    <span>
                      {signupCountdown > 0 ? (
                        <span>
                          {language === 'kn' ? 'ಮರುಕಳುಹಿಸಿ:' : 'Resend OTP in'}{' '}
                          <strong className="text-stone-900 font-mono font-bold">{signupCountdown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendSignupOtp}
                          className="font-bold text-[#6C151E] hover:text-[#521016] flex items-center gap-1 transition-colors underline"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t.resendOtp}</span>
                        </button>
                      )}
                    </span>
                  </div>

                  {/* Complete Registration CTA */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-4 rounded-2xl bg-[#6C151E] hover:bg-[#521016] disabled:bg-stone-400 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === 'kn' ? 'ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...' : 'Verifying & Registering...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{t.verifyAndRegister}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
