import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  User, MapPin, Phone, Mail, Navigation, Building,
  ArrowLeft, Save, Loader2
} from 'lucide-react';
import api from '@/utils/api';
import PlacePickerGujarat from '@/components/PlacePickerGujarat';


const MechanicForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    shopAddress: '',
    shopLatitude: '',
    shopLongitude: ''
  });

  // Auto-detect location state
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Progress tracking
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Get email from navigation state (from login/OTP flow)
  useEffect(() => {
    if (state?.email) {
      setFormData(prev => ({ ...prev, email: state.email }));
    }
  }, [state]);

  // Calculate form completion percentage
  const calculateProgress = () => {
    const filledFields = Object.values(formData).filter(value => String(value).trim() !== '').length;
    return (filledFields / Object.keys(formData).length) * 100;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  // Auto-detect location using browser geolocation
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          shopLatitude: latitude.toString(),
          shopLongitude: longitude.toString()
        }));
        setIsDetectingLocation(false);

        // Reverse geocode to get address (using OpenStreetMap Nominatim)
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        setIsDetectingLocation(false);
        setLocationError('Unable to retrieve your location. Please enter manually.');
        console.error('Geolocation error:', error);
      },
      { timeout: 10000 }
    );
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();

      if (data.display_name) {
        setFormData(prev => ({ ...prev, shopAddress: data.display_name }));
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Validate form
  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'phone', 'email', 'shopAddress'];

    for (let field of requiredFields) {
      if (!formData[field].trim()) {
        setError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation (basic)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const submissionData = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ''), // Clean phone number
        shopLatitude: formData.shopLatitude || null,
        shopLongitude: formData.shopLongitude || null
      };

      // Replace with your actual API endpoint
      const response = await api.post('/mechanics/register/', submissionData);

      setSuccess('Profile created successfully! Redirecting...');

      // Redirect to dashboard after successful submission
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error('Form submission error:', err);
      setError(err?.response?.data?.error || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Navigation between steps
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={!!state?.email} // Disable if coming from login flow
              />
              {state?.email && (
                <p className="text-xs text-muted-foreground">Email from your login</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="10-digit phone number"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">

<PlacePickerGujarat
  value={{
    address: formData.shopAddress,
    latitude: formData.shopLatitude,
    longitude: formData.shopLongitude
  }}
  onChange={({ address, latitude, longitude }) => {
    handleInputChange('shopAddress', address);
    handleInputChange('shopLatitude', latitude);
    handleInputChange('shopLongitude', longitude);
  }}
/>

<Label htmlFor="shopAddress">Shop Address *</Label>
<Textarea
  id="shopAddress"
  value={formData.shopAddress || ''}
  onChange={(e) => handleInputChange('shopAddress', e.target.value)}
  rows={3}
  required
/>

<Input
  id="shopLatitude"
  value={formData.shopLatitude?.toString() || ''}
  onChange={(e) => handleInputChange('shopLatitude', e.target.value)}
  type="number"
  step="any"
/>

<Input
  id="shopLongitude"
  value={formData.shopLongitude?.toString() || ''}
  onChange={(e) => handleInputChange('shopLongitude', e.target.value)}
  type="number"
  step="any"
/>

            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Please review your information before submitting. You can go back to make changes.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{formData.firstName} {formData.lastName}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{formData.email}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{formData.phone}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shop Address:</span>
                <span className="font-medium text-right max-w-[200px] truncate">{formData.shopAddress}</span>
              </div>
              {(formData.shopLatitude || formData.shopLongitude) && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coordinates:</span>
                    <span className="font-medium">
                      {formData.shopLatitude}, {formData.shopLongitude}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-accent/20 p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="md:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1 text-center">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-lg">
                Step {currentStep} of {totalSteps}
              </CardDescription>
            </div>

            <div className="w-8"></div> {/* Spacer for mobile */}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={calculateProgress()} className="h-2" />
            <Badge variant="secondary" className="px-3 py-1">
              {Math.round(calculateProgress())}% Complete
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <Alert variant="destructive" className="animate-in fade-in-0">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="animate-in fade-in-0 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Complete Registration
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
      </div>
    </div>
  );
};

export default MechanicForm;