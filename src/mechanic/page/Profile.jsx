import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, DollarSign, History, Home, ArrowLeft, Mail, Calendar, Menu, Store
} from 'lucide-react';

// Shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import api from '@/utils/api';



const Profile = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileResponse, historyResponse] = await Promise.all([
          api.get('/Profile/MechanicProfile/'),
          api.get('/Profile/MechanicHistory/')
        ]);
        setProfileData(profileResponse.data);
        setHistoryData(historyResponse.data);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const handleGoBack = () => {
    navigate('/');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    switch (activeSection) {
      case 'home':
        return <HomeOverview profile={profileData} onNavigate={handleSectionChange} />;
      case 'personalInfo':
        return <PersonalInfo profile={profileData} onNavigate={handleSectionChange} />;
      case 'shopInfo':
        return <ShopInfo profile={profileData} onNavigate={handleSectionChange} />;
      case 'earnings':
        return <Earnings stats={historyData?.statistics} onNavigate={handleSectionChange} />;
      case 'jobHistory':
        return <JobHistory jobs={historyData?.job_history} onNavigate={handleSectionChange} />;
      default:
        return <HomeOverview profile={profileData} onNavigate={handleSectionChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <nav className="bg-background border-b border-border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              className="hover:bg-accent"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Mechanic Profile
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">Manage your account settings</p>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <MobileNavigation
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
              />
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:block w-64 bg-background border-r border-border h-[calc(100vh-80px)] overflow-y-auto">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-1">
              <NavItem icon={<Home size={18} />} label="Overview" section="home" activeSection={activeSection} setActiveSection={handleSectionChange} />
              <NavItem icon={<User size={18} />} label="Personal Info" section="personalInfo" activeSection={activeSection} setActiveSection={handleSectionChange} />
              <NavItem icon={<Store size={18} />} label="Shop Info" section="shopInfo" activeSection={activeSection} setActiveSection={handleSectionChange} />
              <NavItem icon={<DollarSign size={18} />} label="Earnings" section="earnings" activeSection={activeSection} setActiveSection={handleSectionChange} />
              <NavItem icon={<History size={18} />} label="Job History" section="jobHistory" activeSection={activeSection} setActiveSection={handleSectionChange} />
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};
const QuickActionCard = ({ icon, title, description, progress, onClick }) => (
  <Card
    className="hover:shadow-md transition-shadow cursor-pointer"
    onClick={onClick}
  >
    <CardContent className="p-3 md:p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm md:text-base truncate">{title}</h4>
          <p className="text-xs md:text-sm text-muted-foreground truncate">{description}</p>
          <Progress value={progress} className="mt-2 h-1" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Mobile Navigation Component
const MobileNavigation = ({ activeSection, onSectionChange }) => (
  <div className="p-4 space-y-1 h-full">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold">Navigation</h2>
    </div>
    <NavItem icon={<Home size={18} />} label="Overview" section="home" activeSection={activeSection} setActiveSection={onSectionChange} />
    <NavItem icon={<User size={18} />} label="Personal Info" section="personalInfo" activeSection={activeSection} setActiveSection={onSectionChange} />
    <NavItem icon={<Store size={18} />} label="Shop Info" section="shopInfo" activeSection={activeSection} setActiveSection={onSectionChange} />
    <NavItem icon={<DollarSign size={18} />} label="Earnings" section="earnings" activeSection={activeSection} setActiveSection={onSectionChange} />
    <NavItem icon={<History size={18} />} label="Job History" section="jobHistory" activeSection={activeSection} setActiveSection={onSectionChange} />
  </div>
);

// Reusable Nav Item Component
const NavItem = ({ icon, label, section, activeSection, setActiveSection }) => (
  <Button
    variant={activeSection === section ? "secondary" : "ghost"}
    onClick={() => setActiveSection(section)}
    className="w-full justify-start gap-3 h-12 text-sm md:text-base"
  >
    {icon}
    <span>{label}</span>
  </Button>
);

// --- Content Components for each section ---

const HomeOverview = ({ profile, onNavigate }) => {

  if (!profile) return null;
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-primary/20">
              <AvatarImage src={profile.profile_pic} alt={profile.first_name} />
              <AvatarFallback className="text-xl md:text-2xl bg-primary/10 text-primary">
                <User size={28} />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <div className='flex items-center gap-2 '>

                <h2 className="text-2xl md:text-3xl font-bold">{profile.first_name} {profile.last_name}</h2>  {profile.is_verified && <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  Verified
                </Badge>}
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Mail size={14} className="flex-shrink-0" />
                  <span className="text-sm">{profile.email}</span>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={100} className="w-full max-w-xs mx-auto sm:mx-0" />
                <p className="text-sm text-muted-foreground mt-2">Profile completeness: 100%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Cards */}
      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <QuickActionCard
          icon={<User className="text-blue-600" size={18} />}
          title="Personal Info"
          description="View details"
          progress={100}
          onClick={() => onNavigate('personalInfo')}
        />
        <QuickActionCard
          icon={<Store className="text-green-600" size={18} />}
          title="Shop Information"
          description="View details"
          progress={100}
          onClick={() => onNavigate('shopInfo')}
        />
        <QuickActionCard
          icon={<DollarSign className="text-yellow-600" size={18} />}
          title="Earnings"
          description="View payments & statements"
          progress={60}
          onClick={() => onNavigate('earnings')}
        />
        <QuickActionCard
          icon={<History className="text-purple-600" size={18} />}
          title="Job History"
          description="Review past work"
          progress={45}
          onClick={() => onNavigate('jobHistory')}
        />
      </div>
    </div>
  )
};



const PersonalInfo = ({ profile, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  if (!profile) return null;
  return (
    <Card>
      <CardHeader className="px-4 md:px-6 py-4 md:py-6">
        <div className='flex items-center gap-2 p-2 w-full text-sm  '
          onClick={() => onNavigate('HomeOverview')}
        >
          <ArrowLeft className="text-purple-600 " size={18} /> Go Back
        </div>
        <CardTitle className="text-lg md:text-xl">Personal Information</CardTitle>
        <CardDescription className="text-sm md:text-base">Update your personal details and contact information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 md:px-6 pb-4 md:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Full Name</Label>
            <Input id="name" defaultValue={profile.first_name} disabled={!isEditing} className="text-sm md:text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email Address</Label>
            <Input id="email" defaultValue={profile.email} disabled className="text-sm md:text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm">Phone Number</Label>
            <Input id="phone" defaultValue={profile.mobile_number} disabled={!isEditing} className="text-sm md:text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adhar_card" className="text-sm">Adhar Card</Label>
            <Input id="adhar_card" defaultValue={profile.adhar_card} disabled className="text-sm md:text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kyc_document" className="text-sm">KYC Document</Label>
            <Input id="kyc_document" defaultValue={profile.KYC_document} disabled className="text-sm md:text-base" />

          </div>
          <div className="space-y-2">
            <Label htmlFor="verified" className="text-sm">Verified</Label>
            <Switch id="verified" checked={profile.is_verified} disabled />
          </div>

        </div>
          <div className="space-y-2">
            <Label>KYC Document</Label>
            <div className="border rounded-md overflow-hidden h-[400px]">
              <iframe
                src={profile.KYC_document}
                title="KYC Document"
                width="100%"
                height="100%"
                className="rounded"
              />
            </div>
          </div>

      </CardContent>
    </Card>
  );
};

const ShopInfo = ({ profile, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  if (!profile) return null;
  return (
    <Card>
      <CardHeader className="px-4 md:px-6 py-4 md:py-6">
        <div className='flex items-center gap-2 p-2 w-full text-sm  '
          onClick={() => onNavigate('HomeOverview')}
        >
          <ArrowLeft className="text-purple-600 " size={18} /> Go Back
        </div>
        <CardTitle className="text-lg md:text-xl">Shop Information</CardTitle>
        <CardDescription className="text-sm md:text-base">Update your shop details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 md:px-6 pb-4 md:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-2">
            <Label htmlFor="shop_name" className="text-sm">Shop Name</Label>
            <Input id="shop_name" defaultValue={profile.shop_name} disabled={!isEditing} className="text-sm md:text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop_address" className="text-sm">Shop Address</Label>
            <Input id="shop_address" defaultValue={profile.shop_address} disabled={!isEditing} className="text-sm md:text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop_latitude" className="text-sm">Latitude</Label>
            <Input id="shop_latitude" defaultValue={profile.shop_latitude} disabled={!isEditing} className="text-sm md:text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop_longitude" className="text-sm">Longitude</Label>
            <Input id="shop_longitude" defaultValue={profile.shop_longitude} disabled={!isEditing} className="text-sm md:text-base" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button onClick={() => setIsEditing(!isEditing)} className="w-full sm:w-auto">
            {isEditing ? 'Save Changes' : 'Edit Information'}
          </Button>
          {isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Earnings = ({ stats, onNavigate }) => (
  <Card>
    <CardHeader className="px-4 md:px-6 py-4 md:py-6">
      <div className='flex items-center gap-2 p-2 w-full text-sm  '
        onClick={() => onNavigate('HomeOverview')}
      >
        <ArrowLeft className="text-purple-600 " size={18} /> Go Back
      </div>
      <CardTitle className="text-lg md:text-xl">Earnings Overview</CardTitle>
      <CardDescription className="text-sm md:text-base">View your earnings and financial summary</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6 px-4 md:px-6 pb-4 md:pb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3 md:p-4 text-center">
            <DollarSign className="mx-auto text-green-600 mb-2" size={20} />
            <p className="text-xl md:text-2xl font-bold text-green-800">₹{stats?.total_earnings || '0.00'}</p>
            <p className="text-xs md:text-sm text-green-700">Total Earnings</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 md:p-4 text-center">
            <Calendar className="mx-auto text-blue-600 mb-2" size={20} />
            <p className="text-xl md:text-2xl font-bold text-blue-800">{stats?.jobs_this_month || 0}</p>
            <p className="text-xs md:text-sm text-blue-700">Jobs This Month</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-3 md:p-4 text-center">
            <History className="mx-auto text-purple-600 mb-2" size={20} />
            <p className="text-xl md:text-2xl font-bold text-purple-800">{stats?.total_jobs || 0}</p>
            <p className="text-xs md:text-sm text-purple-700">Total Jobs</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
        <Button className="w-full sm:w-auto">View Detailed Statements</Button>
        <Button variant="outline" className="w-full sm:w-auto">Payout History</Button>
      </div>
    </CardContent>
  </Card>
);

const JobHistory = ({ jobs, onNavigate }) => (
  <Card>
    <CardHeader className="px-4 md:px-6 py-4 md:py-6">
      <div className='flex items-center gap-2 p-2 w-full text-sm  '
        onClick={() => onNavigate('HomeOverview')}
      >
        <ArrowLeft className="text-purple-600 " size={18} /> Go Back
      </div>
      <CardTitle className="text-lg md:text-xl">Job History</CardTitle>
      <CardDescription className="text-sm md:text-base">Review your completed jobs and earnings</CardDescription>
    </CardHeader>
    <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
      <div className="space-y-3">
        {jobs?.map((job, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm md:text-base">{job.problem}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">{job.location} • {new Date(job.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant="secondary" className={`${job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs md:text-sm w-fit sm:w-auto`}>
                  {job.price ? `₹${job.price}` : job.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default Profile;