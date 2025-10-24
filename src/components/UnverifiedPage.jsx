// src/components/UnverifiedPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Loader } from 'lucide-react';
import api from '@/utils/api';
import Navbar from '@/mechanic/componets/Navbar';

const UnverifiedPage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/Profile/MechanicProfile/');
        setProfileData(res.data);
      } catch (error) {
        console.error("❌ Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const hasKyc = profileData?.KYC_document;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin w-6 h-6" />
          <span>Loading profile...</span>
        </div>
      );
    }

    const isVerified = hasKyc;

    return (
      <>
        <BadgeCheck className={`w-16 h-16 mb-4 ${isVerified ? 'text-green-500' : 'text-red-500'}`} />
        <h1 className={`text-2xl font-semibold mb-2 ${isVerified ? 'text-green-600' : 'text-red-600'}`}>
          {isVerified ? 'Account is Verified' : 'Account Not Verified'}
        </h1>
        <p className="text-gray-700 mb-6">
          {isVerified
            ? 'Your account has been successfully verified.'
            : 'Your account is not verified yet. Please complete your KYC or contact support.'}
        </p>

        <button
          onClick={() => navigate(isVerified ? '/' : '/form')}
          className={`${
            isVerified
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-yellow-500 hover:bg-yellow-600'
          } text-white px-4 py-2 rounded-md transition`}
        >
          {isVerified ? 'Go to Home' : 'Complete Your KYC'}
        </button>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <Navbar />

      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center flex flex-col items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default UnverifiedPage;
