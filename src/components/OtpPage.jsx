import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/utils/api';

// Shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const OtpPage = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const verifyButtonRef = useRef(null);
  const navigate = useNavigate();
  const { state } = useLocation();

  // State for timer functionality
  const [timer, setTimer] = useState(120);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  const initialCtx = state || JSON.parse(sessionStorage.getItem('otp_ctx') || '{}');
  const [ctx, setCtx] = useState({
    key: initialCtx?.key || null,
    id: initialCtx?.id || null,
    status: initialCtx?.status || null,
    email: initialCtx?.email || null,
  });

  useEffect(() => {
    sessionStorage.setItem('otp_ctx', JSON.stringify(ctx));
  }, [ctx]);

  useEffect(() => {
    let interval;
    if (isResendDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [isResendDisabled, timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move to next sibling if a value is entered
    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && index === 5) {
      verifyButtonRef.current?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowLeft' && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedDigits = pastedText.replace(/\D/g, '').slice(0, 6);

    if (pastedDigits) {
      const newOtp = new Array(6).fill('');
      pastedDigits.split('').forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);

      const nextFocusIndex = pastedDigits.length;
      if (nextFocusIndex < 6) {
        inputRefs.current[nextFocusIndex]?.focus();
      } else {
        verifyButtonRef.current?.focus();
      }
    }
  };

  const verifyOtp = async () => {
    setError('');
    const code = otp.join('').trim();
    
    if (code.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = { key: ctx.key, id: ctx.id, otp: code };
      await api.post('/users/otp-verify/', payload, { withCredentials: true });
      
      if (ctx.status === 'New User') {
        navigate('/form', { state: { status: 'Manual' } });
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('OTP verify failed:', err);
      setError(err?.response?.data?.error || 'Verification failed. Please try again.');
      
      // Clear OTP on error
      setOtp(new Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (isResendDisabled) return;
    setError('');
    
    try {
      const res = await api.post(
        '/users/resend-otp/',
        { key: ctx.key, id: ctx.id },
        { withCredentials: true }
      );
      
      const newKey = res?.data?.key;
      const newid = res?.data?.id;
      if (newid) setCtx((prev) => ({ ...prev, id: newid }));
      if (newKey) setCtx((prev) => ({ ...prev, key: newKey }));
      
      setIsResendDisabled(true);
      setTimer(120);
      setOtp(new Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error('Resend failed:', err);
      setError(err?.response?.data?.error || 'Could not resend code. Please try again later.');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const progressValue = (timer / 120) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-accent/20 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <img 
                src="/ms.png" 
                alt="Mechanic Setu Logo" 
                className="w-16 h-16 rounded-full border-2 border-primary/20"
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              MECHANIC SETU
            </CardTitle>
            <CardDescription className="text-lg italic text-muted-foreground">
              Always at emergency
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email Badge */}
          {ctx.email && (
            <div className="text-center">
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                Code sent to: {ctx.email}
              </Badge>
            </div>
          )}

          <Separator />

          {/* OTP Input Section */}
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Label htmlFor="otp-0" className="text-lg font-semibold">
                Enter Verification Code
              </Label>
              <CardDescription>
                Enter the 6-digit code sent to your email
              </CardDescription>
            </div>

            {/* OTP Inputs */}
            <div className="flex justify-center space-x-2">
              {otp.map((val, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={val}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-xl font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Timer Progress */}
            {isResendDisabled && (
              <div className="space-y-2">
                <Progress value={progressValue} className="h-1" />
                <p className="text-center text-sm text-muted-foreground">
                  Resend available in {formatTime(timer)}
                </p>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="animate-in fade-in-0">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Verify Button */}
            <Button
              ref={verifyButtonRef}
              onClick={verifyOtp}
              disabled={isLoading || otp.some(digit => digit === '')}
              className="w-full py-3 text-lg font-semibold"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            {/* Resend Section */}
            <div className="text-center">
              <Button
                variant="link"
                onClick={resendOtp}
                disabled={isResendDisabled || isLoading}
                className="text-muted-foreground hover:text-primary"
              >
                {isResendDisabled ? `Resend code ` : 'Resend code'}
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Having trouble receiving the code?</p>
            <p>Check your spam folder or try again in a few minutes.</p>
          </div>
        </CardContent>
      </Card>

      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
      </div>
    </div>
  );
};

export default OtpPage;