import React, { useState, useEffect, useCallback } from 'react';
import { useLock } from '../../context/LockContext';
import { Delete, Lock, Shield, KeyRound } from 'lucide-react';

// Shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

// Define a key for localStorage
const PIN_STORAGE_KEY = 'app_lock_pin';

const LockScreen = () => {
  const { unlockScreen } = useLock();

  // State for the current mode: 'unlock', 'setup_enter', or 'setup_confirm'
  const [mode, setMode] = useState('unlock');
  const [correctPin, setCorrectPin] = useState('');

  // State for the PIN input
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // State for the setup process
  const [firstPin, setFirstPin] = useState('');

  // State for confirmation dialog
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // On component mount, check for a saved PIN in localStorage
  useEffect(() => {
    const savedPin = localStorage.getItem(PIN_STORAGE_KEY);
    if (savedPin) {
      setCorrectPin(savedPin);
      setMode('unlock');
    } else {
      setMode('setup_enter');
    }
  }, []);

  // Function to handle number inputs
  const handleNumberClick = useCallback((num) => {
    setError('');
    if (pin.length < 4) {
      setPin((prevPin) => prevPin + num);
    }
  }, [pin]);

  // Function to handle delete/backspace
  const handleDelete = useCallback(() => {
    setPin((prevPin) => prevPin.slice(0, -1));
  }, []);

  // Handle PIN verification and setup logic
  useEffect(() => {
    if (pin.length !== 4) return;

    if (mode === 'unlock') {
      if (pin === correctPin) {
        setShowSuccessDialog(true);
        setTimeout(() => {
          unlockScreen();
        }, 1000);
      } else {
        setError('Incorrect PIN. Please try again.');
        setTimeout(() => {
          setPin('');
          setError('');
        }, 1000);
      }
    }

    if (mode === 'setup_enter') {
      setFirstPin(pin);
      setPin('');
      setMode('setup_confirm');
    }

    if (mode === 'setup_confirm') {
      if (pin === firstPin) {
        localStorage.setItem(PIN_STORAGE_KEY, pin);
        setCorrectPin(pin);
        setShowSuccessDialog(true);
        setTimeout(() => {
          unlockScreen();
        }, 1000);
      } else {
        setError('PINs do not match. Please start over.');
        setTimeout(() => {
          setPin('');
          setFirstPin('');
          setError('');
          setMode('setup_enter');
        }, 1500);
      }
    }
  }, [pin, mode, correctPin, firstPin, unlockScreen]);

  // Add keyboard support for PIN entry
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key >= '0' && event.key <= '9') {
        handleNumberClick(event.key);
      } else if (event.key === 'Backspace') {
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNumberClick, handleDelete]);

  // Handler for the "Forgot PIN" option
  const handleForgotPin = () => {
    setShowResetDialog(true);
  };

  const confirmResetPin = () => {
    localStorage.removeItem(PIN_STORAGE_KEY);
    setShowResetDialog(false);
    setMode('setup_enter');
    setPin('');
    setFirstPin('');
    setError('');
  };

  // Dynamic UI Text based on the current mode
  const getUIText = () => {
    switch (mode) {
      case 'setup_enter':
        return {
          title: 'Set Up Your PIN',
          subtitle: 'Create a 4-digit PIN to secure your screen',
          icon: <KeyRound className="h-8 w-8" />
        };
      case 'setup_confirm':
        return {
          title: 'Confirm Your PIN',
          subtitle: 'Re-enter your 4-digit PIN to confirm',
          icon: <Shield className="h-8 w-8" />
        };
      default:
        return {
          title: 'Screen Locked',
          subtitle: 'Enter your 4-digit PIN to continue',
          icon: <Lock className="h-8 w-8" />
        };
    }
  };

  const { title, subtitle, icon } = getUIText();

  const PinDots = () => (
    <div className="flex justify-center space-x-6 my-8">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${pin.length > i
              ? 'bg-primary border-primary'
              : 'bg-muted border-border'
            } ${error ? 'animate-pulse border-destructive' : ''}`}
        />
      ))}
    </div>
  );

  const NumberPad = () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
      <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
        {numbers.map((num) => (
          <Button
            key={num}
            variant="outline"
            size="lg"
            onClick={() => handleNumberClick(num.toString())}
            className="h-14 w-14 text-lg font-semibold hover:bg-primary/10"
          >
            {num}
          </Button>
        ))}

        <Button
          variant="ghost"
          onClick={handleForgotPin}
          className="h-14 w-14 text-xs text-muted-foreground hover:text-destructive"
        >
          Forgot PIN
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => handleNumberClick('0')}
          className="h-14 w-14 text-lg font-semibold hover:bg-primary/10"
        >
          0
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleDelete}
          className="h-14 w-14 hover:bg-destructive/10 hover:text-destructive"
        >
          <Delete className="h-5 w-5" />
        </Button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">
              Success!
            </DialogTitle>
            <DialogDescription className="text-center">
              {mode === 'unlock' ? 'Screen unlocked successfully!' : 'PIN set up successfully!'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="w-24">
              <Progress value={100} className="h-2" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset PIN?</DialogTitle>
            <DialogDescription>
              This will remove your current PIN. You'll need to set up a new PIN next time you lock the screen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmResetPin}>
              Reset PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Lock Screen */}
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              {icon}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-base">{subtitle}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* PIN Progress */}
          <div className="px-4">
            <Progress value={(pin.length / 4) * 100} className="h-1" />
          </div>

          {/* PIN Dots */}
          <PinDots />

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="animate-in fade-in-0">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Number Pad */}
          <NumberPad />

          {/* Additional Actions */}
          <div className="flex justify-center space-x-4 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={unlockScreen}
              className="text-xs text-muted-foreground"
            >
              Emergency Bypass
            </Button>
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

export default LockScreen;