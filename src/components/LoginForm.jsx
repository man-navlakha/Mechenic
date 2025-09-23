import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Shield, ArrowRight } from 'lucide-react';

import api from '@/utils/api';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        if (!window.location.pathname.includes("/login")) return;

        const res = await api.get("core/me/");
        if (res.data.username) {
          window.location.href = '/';
        }
      } catch (err) {
        console.log("Not logged in");
      }
    };
    checkLogin();
  }, []);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email) {
      setError('Please enter your email.');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/users/Login_SignUp/', { email: email });
      navigate("/verify", { 
        state: { 
          key: res.data.key, 
          id: res.data.id, 
          status: res.data.status,
          email: email
        } 
      });
    } catch (err) {
      console.error("Login failed:", err);
      setError(err?.response?.data?.error || 'Login failed. Please check your email or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setError('');
    if (!credentialResponse?.credential) {
      setError("Google credential was not received. Please try again.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post("/users/google/", { 
        token: credentialResponse.credential 
      });

      console.log("Backend response:", res.data);
      if (res.data.status === 'New User') {
        navigate('/form', { state: { status: "Google" } });
      } else {
        navigate('/'); 
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError(err?.response?.data?.detail || "Google login failed on our server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-accent/20 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
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
          
          {/* Welcome Badge */}
          <Badge variant="secondary" className="px-3 py-1 text-sm mx-auto">
            Welcome Back
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="animate-in fade-in-0">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

           {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                setError('Google login failed. Please try again.');
              }}
              shape="rectangular"
              size="large"
              text="signin_with"
              theme="filled_blue"
              logo_alignment="center"
            />
          </div>


            {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">Or continue with</span>
            </div>
          </div>


          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-lg font-semibold">
                Enter Your Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 pr-4 py-3 text-base"
                />
              </div>
              <CardDescription>
                We'll send you a verification code to sign in
              </CardDescription>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading || !email}
              className="w-full py-3 text-lg font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Sending Code...
                </>
              ) : (
                <>
                  Continue with Email
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

        
         

          {/* Additional Information */}
          <div className="text-center space-y-3">
            <Separator />


            <p className="text-sm text-muted-foreground">
              By continuing, you agree to our{' '}
              <Button variant="link" className="p-0 h-auto text-primary font-semibold">
                Terms of Service
              </Button>{' '}
              and{' '}
              <Button variant="link" className="p-0 h-auto text-primary font-semibold">
                Privacy Policy
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-xs text-muted-foreground">
        <p>© 2024 Mechanic Setu. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LoginForm;