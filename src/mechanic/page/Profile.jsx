import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Lock, DollarSign, History, Car, Bell, Home,
  ChevronRight, Wrench, ArrowLeft, Mail, Phone, MapPin, Calendar,
  CheckCircle, AlertCircle, Download, Eye, EyeOff
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

const Profile = () => {
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Mechanic Profile
            </h1>
            <p className="text-sm text-muted-foreground">Manage your account settings</p>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 bg-background border-r border-border h-[calc(100vh-80px)] overflow-y-auto">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-1">
              <NavItem icon={<Home size={18} />} label="Overview" section="home" activeSection={activeSection} setActiveSection={setActiveSection} />
              <NavItem icon={<User size={18} />} label="Personal Info" section="personalInfo" activeSection={activeSection} setActiveSection={setActiveSection} />
              <NavItem icon={<Shield size={18} />} label="Security" section="security" activeSection={activeSection} setActiveSection={setActiveSection} />
              <NavItem icon={<Lock size={18} />} label="Privacy & Data" section="privacyData" activeSection={activeSection} setActiveSection={setActiveSection} />
              <NavItem icon={<DollarSign size={18} />} label="Earnings" section="earnings" activeSection={activeSection} setActiveSection={setActiveSection} />
              <NavItem icon={<History size={18} />} label="Job History" section="jobHistory" activeSection={activeSection} setActiveSection={setActiveSection} />
              <NavItem icon={<Car size={18} />} label="Vehicle Info" section="vehicleInfo" activeSection={activeSection} setActiveSection={setActiveSection} />
              <NavItem icon={<Bell size={18} />} label="Notifications" section="notifications" activeSection={activeSection} setActiveSection={setActiveSection} />
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// Reusable Nav Item Component
const NavItem = ({ icon, label, section, activeSection, setActiveSection }) => (
  <Button
    variant={activeSection === section ? "secondary" : "ghost"}
    onClick={() => setActiveSection(section)}
    className="w-full justify-start gap-3 h-12"
  >
    {icon}
    <span>{label}</span>
  </Button>
);

// --- Content Components for each section ---

const HomeOverview = () => (
  <div className="space-y-6">
    {/* Profile Header */}
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-6">
          <Avatar className="w-24 h-24 border-4 border-primary/20">
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              <User size={32} />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-3xl font-bold">Man</h2>
            <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Mail size={16} />
                <span>mannavlakha002@gmail.com</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Verified
              </Badge>
            </div>
            <Progress value={75} className="mt-4 w-64" />
            <p className="text-sm text-muted-foreground mt-2">Profile completeness: 75%</p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Quick Action Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <QuickActionCard 
        icon={<User className="text-blue-600" />} 
        title="Personal Info" 
        description="Update your details" 
        progress={85}
      />
      <QuickActionCard 
        icon={<Shield className="text-green-600" />} 
        title="Security" 
        description="Manage password & 2FA" 
        progress={100}
      />
      <QuickActionCard 
        icon={<DollarSign className="text-yellow-600" />} 
        title="Earnings" 
        description="View payments & statements" 
        progress={60}
      />
      <QuickActionCard 
        icon={<History className="text-purple-600" />} 
        title="Job History" 
        description="Review past work" 
        progress={45}
      />
    </div>

    {/* Suggestions */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Wrench size={48} className="text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="text-xl font-semibold mb-2">Complete your mechanic profile</h4>
              <p className="text-muted-foreground mb-4">
                Complete your profile to unlock more features and improve your visibility to customers.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Begin checkup <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Car size={48} className="text-yellow-600 flex-shrink-0" />
            <div>
              <h4 className="text-xl font-semibold mb-2">Add your vehicle details</h4>
              <p className="text-muted-foreground mb-4">
                Customers need to know what vehicle you use. Add your vehicle's details.
              </p>
              <Button variant="outline" className="border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white">
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
    <CardContent className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
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
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details and contact information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue="Man" disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" defaultValue="mannavlakha002@gmail.com" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" defaultValue="+91 9876543210" disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" defaultValue="Ahmedabad, Gujarat" disabled={!isEditing} />
          </div>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Save Changes' : 'Edit Information'}
          </Button>
          {isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
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
    <CardHeader>
      <CardTitle>Security Settings</CardTitle>
      <CardDescription>Manage your account security preferences</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between items-center p-4 border rounded-lg">
        <div>
          <h4 className="font-semibold">Change Password</h4>
          <p className="text-sm text-muted-foreground">Update your password regularly</p>
        </div>
        <Button variant="outline">
          Change <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
      
      <div className="flex justify-between items-center p-4 border rounded-lg">
        <div>
          <h4 className="font-semibold">Two-Factor Authentication</h4>
          <p className="text-sm text-muted-foreground">Extra security for your account</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle size={14} className="mr-1" />
            Enabled
          </Badge>
          <Button variant="outline" size="sm">
            Manage
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center p-4 border rounded-lg">
        <div>
          <h4 className="font-semibold">Recent Activity Log</h4>
          <p className="text-sm text-muted-foreground">View your account activity</p>
        </div>
        <Button variant="outline">
          View <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const PrivacyData = () => (
  <Card>
    <CardHeader>
      <CardTitle>Privacy & Data</CardTitle>
      <CardDescription>Control your data and privacy settings</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between items-center p-4 border rounded-lg">
        <div>
          <h4 className="font-semibold">Download your data</h4>
          <p className="text-sm text-muted-foreground">Export your personal data</p>
        </div>
        <Button variant="outline">
          <Download size={16} className="mr-2" />
          Download
        </Button>
      </div>
      
      <div className="flex justify-between items-center p-4 border rounded-lg">
        <div>
          <h4 className="font-semibold">Marketing Communications</h4>
          <p className="text-sm text-muted-foreground">Receive promotional emails</p>
        </div>
        <Switch defaultChecked />
      </div>
    </CardContent>
  </Card>
);

const Earnings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Earnings Overview</CardTitle>
      <CardDescription>View your earnings and financial summary</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <DollarSign className="mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-800">₹15,250</p>
            <p className="text-sm text-green-700">Total Earnings</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Calendar className="mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-800">24</p>
            <p className="text-sm text-blue-700">Jobs This Month</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <History className="mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-800">127</p>
            <p className="text-sm text-purple-700">Total Jobs</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex space-x-3">
        <Button>View Detailed Statements</Button>
        <Button variant="outline">Payout History</Button>
      </div>
    </CardContent>
  </Card>
);

const JobHistory = () => (
  <Card>
    <CardHeader>
      <CardTitle>Job History</CardTitle>
      <CardDescription>Review your completed jobs and earnings</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[
          { service: "Flat Tire Change", customer: "Customer A", amount: "₹500", date: new Date().toLocaleDateString() },
          { service: "Battery Jumpstart", customer: "Customer B", amount: "₹700", date: new Date().toLocaleDateString() },
          { service: "Brake Inspection", customer: "Customer C", amount: "₹1200", date: new Date().toLocaleDateString() }
        ].map((job, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{job.service}</h4>
                  <p className="text-sm text-muted-foreground">{job.customer} • {job.date}</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
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
    <CardHeader>
      <CardTitle>Vehicle Information</CardTitle>
      <CardDescription>Manage your service vehicle details</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Input id="make" defaultValue="Toyota" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" defaultValue="Camry" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input id="year" defaultValue="2020" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="license">License Plate</Label>
          <Input id="license" defaultValue="ABC 1234" />
        </div>
      </div>
      <Button>Save Vehicle Info</Button>
    </CardContent>
  </Card>
);

const Notifications = () => (
  <Card>
    <CardHeader>
      <CardTitle>Notification Settings</CardTitle>
      <CardDescription>Customize how you receive notifications</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between items-center p-4 border rounded-lg">
        <div>
          <h4 className="font-semibold">New Job Alerts</h4>
          <p className="text-sm text-muted-foreground">Get notified about new job requests</p>
        </div>
        <Switch defaultChecked />
      </div>
      
      <div className="flex justify-between items-center p-4 border rounded-lg">
        <div>
          <h4 className="font-semibold">Payment Confirmations</h4>
          <p className="text-sm text-muted-foreground">Receive payment status updates</p>
        </div>
        <Switch defaultChecked />
      </div>
    </CardContent>
  </Card>
);

export default Profile;