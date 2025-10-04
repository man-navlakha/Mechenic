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
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import {
  User, MapPin, Phone, Mail, Navigation, Building,
  ArrowLeft, Save, Loader2, Store, Image
} from 'lucide-react';
import api from '@/utils/api';
import PlacePickerGujarat from '@/components/PlacePickerGujarat';
import WebcamCapture from '@/components/WebcamCapture';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs'; // Make sure you have Tabs component in your UI library


const MechanicForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    profile_pic: '',
    adhar_card: '',
    shop_name: '',
    shop_address: '',
    shop_latitude: '',
    shop_longitude: ''
  });



  // Auto-detect location state
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Progress tracking
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

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
          shop_latitude: latitude.toString(),
          shop_longitude: longitude.toString()
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
        setFormData(prev => ({ ...prev, shop_address: data.display_name }));
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };
  const validateForm = () => {
    const requiredFields = ['first_name', 'last_name', 'email', 'adhar_card', 'mobile_number', 'shop_name', 'profile_pic', 'shop_address'];

    for (let field of requiredFields) {
      if (!formData[field] || String(formData[field]).trim() === '') {
        setError(`Please fill in the ${field.replace(/_/g, ' ')}`);
        return false;
      }
    }

    if (!(formData.profile_pic instanceof File)) {
      setError('Please upload a profile picture');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    const aadharRegex = /^\d{12}$/; // 12 digits only
    if (!aadharRegex.test(formData.adhar_card)) {
      setError('Please enter a valid 12-digit Aadhar number');
      return false;
    }

    // Phone number validation

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
      const submissionData = new FormData();
submissionData.append('first_name', formData.first_name);
submissionData.append('last_name', formData.last_name);
submissionData.append('adhar_card', formData.adhar_card);
submissionData.append('email', formData.email);
submissionData.append('mobile_number', formData.mobile_number);
submissionData.append('shop_name', formData.shop_name);
submissionData.append('shop_address', formData.shop_address);
submissionData.append('shop_latitude', formData.shop_latitude || '');
submissionData.append('shop_longitude', formData.shop_longitude || '');
submissionData.append('profile_pic', formData.profile_pic); // file or captured blob


      await api.post('/users/SetMechanicDetail/', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Profile created successfully! Redirecting...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Form submission error:', err);
      const apiErrors = err?.response?.data;

      if (apiErrors) {
        const formattedErrors = Object.entries(apiErrors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join('\n');
        setError(formattedErrors);
      } else {
        setError('Failed to create profile. Please try again.');
      }
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
      case 1: // Personal Details
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Profile Picture *
              </Label>

              <Tabs defaultValue="upload" className="w-full">
                <TabsList>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="capture">Capture</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                  <Input
                    id="profile_pic"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleInputChange('profile_pic', e.target.files[0])}
                    required
                  />
                </TabsContent>

                <TabsContent value="capture">
                  <WebcamCapture onCapture={(file) => handleInputChange('profile_pic', file)} />
                </TabsContent>
              </Tabs>

              {/* Preview selected/captured image */}
              {formData.profile_pic && (
                <img
                  src={
                    formData.profile_pic instanceof File
                      ? URL.createObjectURL(formData.profile_pic)
                      : formData.profile_pic
                  }
                  alt="Preview"
                  className="w-24 h-24 mt-2 object-cover rounded-md border"
                />
              )}
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  First Name *
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Last Name *
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adhar_card" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Aadhar Number *
                </Label>
                <Input
                  id="adhar_card"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{12}"
                  maxLength={12}
                  value={formData.adhar_card}
                  onChange={(e) => handleInputChange('adhar_card', e.target.value)}
                  placeholder="Enter your 12-digit Aadhar number"
                  required
                />
              </div>

            </div>
          </div>
        );

      case 2: // Shop Details
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop_name" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Shop Name *
              </Label>
              <Input
                id="shop_name"
                type="text"
                value={formData.shop_name}
                onChange={(e) => handleInputChange('shop_name', e.target.value)}
                placeholder="Enter your Shop name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop_name" className="flex items-center gap-2">
                 <MapPin className="h-5 w-5 text-primary" />
                          Shop Location *
              </Label>
            

            <PlacePickerGujarat
              value={{
                address: formData.shop_address,
                latitude: formData.shop_latitude,
                longitude: formData.shop_longitude
              }}
              onChange={({ address, latitude, longitude }) => {
                handleInputChange('shop_address', address);
                handleInputChange('shop_latitude', latitude);
                handleInputChange('shop_longitude', longitude);
              }}
            />
            
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop_address">Shop Address *</Label>
              <Textarea
                id="shop_address"
                value={formData.shop_address || ''}
                onChange={(e) => handleInputChange('shop_address', e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
        );

      case 3: // Contact Details
        return (
          <div className="space-y-4">
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
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile_number" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number *
              </Label>
              <PhoneInput
                id="mobile_number"
                placeholder="Enter phone number"
                defaultCountry="IN"
                value={formData.mobile_number}
                onChange={(value) => handleInputChange('mobile_number', value)}
                international
                className="phone-input-custom" // Optional: use your own class for styling
              />

            </div>
          </div>
        );

      case 4: // Review
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
                <span className="font-medium">{formData.first_name} {formData.last_name}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aadhar Number:</span>
                <span className="font-medium">{formData.adhar_card}</span>
              </div>
              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">Shop Name:</span>
                <span className="font-medium">{formData.shop_name}</span>
              </div>
              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{formData.mobile_number}</span>
              </div>
              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{formData.email}</span>
              </div>
              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">Shop Address:</span>
                <span className="font-medium text-right max-w-[200px] truncate">{formData.shop_address}</span>
              </div>

              {(formData.shop_latitude || formData.shop_longitude) && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coordinates:</span>
                    <span className="font-medium">
                      {formData.shop_latitude}, {formData.shop_longitude}
                    </span>
                  </div>
                </>
              )}

              {formData.profile_pic instanceof File && (
                <>
                  <Separator />
                  <div className="flex flex-col items-start space-y-2">
                    <span className="text-muted-foreground">Profile Picture:</span>
                    <img
                      src={URL.createObjectURL(formData.profile_pic)}
                      alt="Profile preview"
                      className="w-24 h-24 object-cover rounded-md border"
                    />
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
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "KYC Details";
      case 2: return "Shop Details";
      case 3: return "Contact Details";
      case 4: return "Review & Submit";
      default: return "Enter Your Details";
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

            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {getStepTitle()}
            </CardTitle>

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