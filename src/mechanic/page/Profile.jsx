import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Lock, DollarSign, History, Car, Bell, Home,
  ChevronRight, Wrench, ArrowLeft, Mail, Phone, MapPin, Calendar,
  CheckCircle, AlertCircle, Download, Eye, EyeOff, Menu, X
} from 'lucide-react';

// Shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Profile = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomeOverview />;
      case 'personalInfo':
        return <PersonalInfo />;
      case 'security':
        return <Security />;
      case 'privacyData':
        return <PrivacyData />;
      case 'earnings':
        return <Earnings />;
      case 'jobHistory':
        return <JobHistory />;
      case 'vehicleInfo':
        return <VehicleInfo />;
      case 'notifications':
        return <Notifications />;
      default:
        return <HomeOverview />;
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
              <NavItem icon={<Shield size={18} />} label="Security" section="security" activeSection={activeSection} setActiveSection={handleSectionChange} />
              <NavItem icon={<Lock size={18} />} label="Privacy & Data" section="privacyData" activeSection={activeSection} setActiveSection={handleSectionChange} />
              <NavItem icon={<DollarSign size={18} />} label="Earnings" section="earnings" activeSection={activeSection} setActiveSection={handleSectionChange} />
              <NavItem icon={<History size={18} />} label="Job History" section="jobHistory" activeSection={activeSection} setActiveSection={handleSectionChange} />
              <NavItem icon={<Car size={18} />} label="Vehicle Info" section="vehicleInfo" activeSection={activeSection} setActiveSection={handleSectionChange} />
              <NavItem icon={<Bell size={18} />} label="Notifications" section="notifications" activeSection={activeSection} setActiveSection={handleSectionChange} />
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

// Mobile Navigation Component
const MobileNavigation = ({ activeSection, onSectionChange }) => (
  <div className="p-4 space-y-1 h-full">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold">Navigation</h2>
    </div>
    <NavItem icon={<Home size={18} />} label="Overview" section="home" activeSection={activeSection} setActiveSection={onSectionChange} />
    <NavItem icon={<User size={18} />} label="Personal Info" section="personalInfo" activeSection={activeSection} setActiveSection={onSectionChange} />
    <NavItem icon={<Shield size={18} />} label="Security" section="security" activeSection={activeSection} setActiveSection={onSectionChange} />
    <NavItem icon={<Lock size={18} />} label="Privacy & Data" section="privacyData" activeSection={activeSection} setActiveSection={onSectionChange} />
    <NavItem icon={<DollarSign size={18} />} label="Earnings" section="earnings" activeSection={activeSection} setActiveSection={onSectionChange} />
    <NavItem icon={<History size={18} />} label="Job History" section="jobHistory" activeSection={activeSection} setActiveSection={onSectionChange} />
    <NavItem icon={<Car size={18} />} label="Vehicle Info" section="vehicleInfo" activeSection={activeSection} setActiveSection={onSectionChange} />
    <NavItem icon={<Bell size={18} />} label="Notifications" section="notifications" activeSection={activeSection} setActiveSection={onSectionChange} />
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

const HomeOverview = () => (
  <div className="space-y-4 md:space-y-6">
    {/* Profile Header */}
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-primary/20">
            <AvatarFallback className="text-xl md:text-2xl bg-primary/10 text-primary">
              <User size={28} />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl md:text-3xl font-bold">Man</h2>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Mail size={14} className="flex-shrink-0" />
                <span className="text-sm">mannavlakha002@gmail.com</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                Verified
              </Badge>
            </div>
            <div className="mt-4">
              <Progress value={75} className="w-full max-w-xs mx-auto sm:mx-0" />
              <p className="text-sm text-muted-foreground mt-2">Profile completeness: 75%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Quick Action Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <QuickActionCard 
        icon={<User className="text-blue-600" size={18} />} 
        title="Personal Info" 
        description="Update your details" 
        progress={85}
      />
      <QuickActionCard 
        icon={<Shield className="text-green-600" size={18} />} 
        title="Security" 
        description="Manage password & 2FA" 
        progress={100}
      />
      <QuickActionCard 
        icon={<DollarSign className="text-yellow-600" size={18} />} 
        title="Earnings" 
        description="View payments & statements" 
        progress={60}
      />
      <QuickActionCard 
        icon={<History className="text-purple-600" size={18} />} 
        title="Job History" 
        description="Review past work" 
        progress={45}
      />
    </div>

    {/* Suggestions */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <Wrench size={40} className="text-blue-600 flex-shrink-0 mx-auto sm:mx-0" />
            <div className="text-center sm:text-left">
              <h4 className="text-lg md:text-xl font-semibold mb-2">Complete your mechanic profile</h4>
              <p className="text-muted-foreground mb-4 text-sm">
                Complete your profile to unlock more features and improve your visibility to customers.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                Begin checkup <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <Car size={40} className="text-yellow-600 flex-shrink-0 mx-auto sm:mx-0" />
            <div className="text-center sm:text-left">
              <h4 className="text-lg md:text-xl font-semibold mb-2">Add your vehicle details</h4>
              <p className="text-muted-foreground mb-4 text-sm">
                Customers need to know what vehicle you use. Add your vehicle's details.
              </p>
              <Button variant="outline" className="border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white w-full sm:w-auto">
                Add Vehicle <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const QuickActionCard = ({ icon, title, description, progress }) => (
  <Card className="hover:shadow-md transition-shadow cursor-pointer">
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

const PersonalInfo = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card>
      <CardHeader className="px-4 md:px-6 py-4 md:py-6">
        <CardTitle className="text-lg md:text-xl">Personal Information</CardTitle>
        <CardDescription className="text-sm md:text-base">Update your personal details and contact information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 md:px-6 pb-4 md:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Full Name</Label>
            <Input id="name" defaultValue="Man" disabled={!isEditing} className="text-sm md:text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email Address</Label>
            <Input id="email" defaultValue="mannavlakha002@gmail.com" disabled className="text-sm md:text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm">Phone Number</Label>
            <Input id="phone" defaultValue="+91 9876543210" disabled={!isEditing} className="text-sm md:text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm">Address</Label>
            <Input id="address" defaultValue="Ahmedabad, Gujarat" disabled={!isEditing} className="text-sm md:text-base" />
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

const Security = () => (
  <Card>
    <CardHeader className="px-4 md:px-6 py-4 md:py-6">
      <CardTitle className="text-lg md:text-xl">Security Settings</CardTitle>
      <CardDescription className="text-sm md:text-base">Manage your account security preferences</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4 px-4 md:px-6 pb-4 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 md:p-4 border rounded-lg gap-3 sm:gap-0">
        <div className="flex-1">
          <h4 className="font-semibold text-sm md:text-base">Change Password</h4>
          <p className="text-xs md:text-sm text-muted-foreground">Update your password regularly</p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          Change <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 md:p-4 border rounded-lg gap-3 sm:gap-0">
        <div className="flex-1">
          <h4 className="font-semibold text-sm md:text-base">Two-Factor Authentication</h4>
          <p className="text-xs md:text-sm text-muted-foreground">Extra security for your account</p>
        </div>
        <div className="flex items-center justify-between sm:justify-end space-x-2 w-full sm:w-auto">
          <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
            <CheckCircle size={12} className="mr-1" />
            Enabled
          </Badge>
          <Button variant="outline" size="sm" className="flex-shrink-0">
            Manage
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 md:p-4 border rounded-lg gap-3 sm:gap-0">
        <div className="flex-1">
          <h4 className="font-semibold text-sm md:text-base">Recent Activity Log</h4>
          <p className="text-xs md:text-sm text-muted-foreground">View your account activity</p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          View <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const PrivacyData = () => (
  <Card>
    <CardHeader className="px-4 md:px-6 py-4 md:py-6">
      <CardTitle className="text-lg md:text-xl">Privacy & Data</CardTitle>
      <CardDescription className="text-sm md:text-base">Control your data and privacy settings</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4 px-4 md:px-6 pb-4 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 md:p-4 border rounded-lg gap-3 sm:gap-0">
        <div className="flex-1">
          <h4 className="font-semibold text-sm md:text-base">Download your data</h4>
          <p className="text-xs md:text-sm text-muted-foreground">Export your personal data</p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Download size={16} className="mr-2" />
          Download
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 md:p-4 border rounded-lg gap-3 sm:gap-0">
        <div className="flex-1">
          <h4 className="font-semibold text-sm md:text-base">Marketing Communications</h4>
          <p className="text-xs md:text-sm text-muted-foreground">Receive promotional emails</p>
        </div>
        <Switch defaultChecked />
      </div>
    </CardContent>
  </Card>
);

const Earnings = () => (
  <Card>
    <CardHeader className="px-4 md:px-6 py-4 md:py-6">
      <CardTitle className="text-lg md:text-xl">Earnings Overview</CardTitle>
      <CardDescription className="text-sm md:text-base">View your earnings and financial summary</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6 px-4 md:px-6 pb-4 md:pb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3 md:p-4 text-center">
            <DollarSign className="mx-auto text-green-600 mb-2" size={20} />
            <p className="text-xl md:text-2xl font-bold text-green-800">₹15,250</p>
            <p className="text-xs md:text-sm text-green-700">Total Earnings</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 md:p-4 text-center">
            <Calendar className="mx-auto text-blue-600 mb-2" size={20} />
            <p className="text-xl md:text-2xl font-bold text-blue-800">24</p>
            <p className="text-xs md:text-sm text-blue-700">Jobs This Month</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-3 md:p-4 text-center">
            <History className="mx-auto text-purple-600 mb-2" size={20} />
            <p className="text-xl md:text-2xl font-bold text-purple-800">127</p>
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

const JobHistory = () => (
  <Card>
    <CardHeader className="px-4 md:px-6 py-4 md:py-6">
      <CardTitle className="text-lg md:text-xl">Job History</CardTitle>
      <CardDescription className="text-sm md:text-base">Review your completed jobs and earnings</CardDescription>
    </CardHeader>
    <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
      <div className="space-y-3">
        {[
          { service: "Flat Tire Change", customer: "Customer A", amount: "₹500", date: new Date().toLocaleDateString() },
          { service: "Battery Jumpstart", customer: "Customer B", amount: "₹700", date: new Date().toLocaleDateString() },
          { service: "Brake Inspection", customer: "Customer C", amount: "₹1200", date: new Date().toLocaleDateString() }
        ].map((job, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm md:text-base">{job.service}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">{job.customer} • {job.date}</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs md:text-sm w-fit sm:w-auto">
                  {job.amount}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);

const VehicleInfo = () => (
  <Card>
    <CardHeader className="px-4 md:px-6 py-4 md:py-6">
      <CardTitle className="text-lg md:text-xl">Vehicle Information</CardTitle>
      <CardDescription className="text-sm md:text-base">Manage your service vehicle details</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4 px-4 md:px-6 pb-4 md:pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-2">
          <Label htmlFor="make" className="text-sm">Make</Label>
          <Input id="make" defaultValue="Toyota" className="text-sm md:text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model" className="text-sm">Model</Label>
          <Input id="model" defaultValue="Camry" className="text-sm md:text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year" className="text-sm">Year</Label>
          <Input id="year" defaultValue="2020" className="text-sm md:text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="license" className="text-sm">License Plate</Label>
          <Input id="license" defaultValue="ABC 1234" className="text-sm md:text-base" />
        </div>
      </div>
      <Button className="w-full sm:w-auto">Save Vehicle Info</Button>
    </CardContent>
  </Card>
);

const Notifications = () => (
  <Card>
    <CardHeader className="px-4 md:px-6 py-4 md:py-6">
      <CardTitle className="text-lg md:text-xl">Notification Settings</CardTitle>
      <CardDescription className="text-sm md:text-base">Customize how you receive notifications</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4 px-4 md:px-6 pb-4 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 md:p-4 border rounded-lg gap-3 sm:gap-0">
        <div className="flex-1">
          <h4 className="font-semibold text-sm md:text-base">New Job Alerts</h4>
          <p className="text-xs md:text-sm text-muted-foreground">Get notified about new job requests</p>
        </div>
        <Switch defaultChecked />
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 md:p-4 border rounded-lg gap-3 sm:gap-0">
        <div className="flex-1">
          <h4 className="font-semibold text-sm md:text-base">Payment Confirmations</h4>
          <p className="text-xs md:text-sm text-muted-foreground">Receive payment status updates</p>
        </div>
        <Switch defaultChecked />
      </div>
    </CardContent>
  </Card>
);

export default Profile;