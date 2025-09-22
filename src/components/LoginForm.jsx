import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleLogin } from '@react-oauth/google';

// Assuming you have an api instance set up
import api from '@/utils/api'; // Adjust the import path as needed

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        // Only check login if not on login page
        if (!window.location.pathname.includes("/login")) return;

        const res = await api.get("core/me/"); // proxy-ready
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

    try {
      const res = await api.post('/users/Login_SignUp/', { email: email });
      navigate("/verify", { 
        state: { 
          key: res.data.key, 
          id: res.data.id, 
          status: res.data.status 
        } 
      });
    } catch (err) {
      console.error("Login failed:", err);
      setError('Login failed. Please check your email or try again.');
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your email to sign in or create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Continue with Email"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                setError('Google login failed');
              }}
              shape="rectangular"
              size="large"
              text="signin_with"
            />
          </div>

          {/* Additional Help Text */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;