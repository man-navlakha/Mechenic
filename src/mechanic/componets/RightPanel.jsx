import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Car, Route, DollarSign, Clock, Phone, MapPin, User, Wrench
} from 'lucide-react';

// Shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

import StatusSwitch from './StatusSwitch';

// New Job Request Component
const NewJobRequest = ({ onReject, onAccept }) => {
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 p-2 rounded-full">
            <Car className="text-red-600" size={24} />
          </div>
          <div>
            <CardTitle className="text-lg">Car Assistance</CardTitle>
            <CardDescription>Customer needs help with puncture repair</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center p-3">
            <Route className="text-blue-500 mx-auto mb-2" size={20} />
            <p className="font-semibold text-lg">1.5 km</p>
            <p className="text-xs text-muted-foreground">Distance</p>
          </Card>
          <Card className="text-center p-3">
            <DollarSign className="text-green-500 mx-auto mb-2" size={20} />
            <p className="font-semibold text-lg">₹165</p>
            <p className="text-xs text-muted-foreground">Earnings</p>
          </Card>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Request ID:</span>
            <Badge variant="secondary">#1575775795880</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Vehicle Type:</span>
            <span className="font-medium">Car</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Requested:</span>
            <span className="font-medium">3:32:38 PM</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Estimated Time:</span>
            <Badge variant="outline">5 mins</Badge>
          </div>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-start space-x-2">
              <User className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <h4 className="font-semibold text-sm">Customer Details</h4>
                <p className="text-xs text-muted-foreground">
                  After accepting, you'll get customer contact details
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-start space-x-2">
              <MapPin className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <h4 className="font-semibold text-sm">Location</h4>
                <p className="text-xs text-muted-foreground">
                  Near City Center, Ahmedabad
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>

      <div className="p-4 border-t bg-muted/20">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={onReject}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            Reject
          </Button>
          <Button
            onClick={onAccept}
            className="bg-green-600 hover:bg-green-700"
          >
            Accept Job
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Earnings Summary Component
const EarningsSummary = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="text-green-500" size={20} />
          Earnings Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Today</span>
            <span className="font-semibold">₹1,250</span>
          </div>
          <Progress value={65} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>This Week</span>
            <span className="font-semibold">₹8,750</span>
          </div>
          <Progress value={85} className="h-2" />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-green-600">₹42K</p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-blue-600">127</p>
            <p className="text-xs text-muted-foreground">Total Jobs</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Available Requests Component
const AvailableRequests = ({ isOnline }) => {
  const requests = [
    { id: 1, service: "Battery Jumpstart", distance: "2.1km", payout: "₹700", time: "5 min ago" },
    { id: 2, service: "Flat Tire Repair", distance: "1.8km", payout: "₹500", time: "8 min ago" },
    { id: 3, service: "Engine Check", distance: "3.2km", payout: "₹1200", time: "12 min ago" },
  ];

  if (!isOnline) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Wrench className="mx-auto text-muted-foreground mb-2" size={32} />
          <p className="text-muted-foreground">Go online to see available requests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <Card key={request.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold">{request.service}</h4>
              <Badge variant="secondary">{request.payout}</Badge>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Route size={14} />
                {request.distance}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {request.time}
              </span>
            </div>
            <Button size="sm" className="w-full mt-3">
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Fixed Responsive Panel Component
const ResponsivePanel = ({ isOnline, setIsOnline, isVerified }) => {
  const [newRequest, setNewRequest] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(false);
  const [drawerPosition, setDrawerPosition] = useState('down');
  const [isDragging, setIsDragging] = useState(false);

  const drawerRef = useRef(null);
  const startYRef = useRef(0);
  const startPositionRef = useRef(0);

  // Check screen size - FIXED
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleAcceptJob = () => {
    console.log("Job accepted!");
    setNewRequest(false);
  };

  // Simple drag handlers - FIXED
  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    startYRef.current = clientY;
    startPositionRef.current = drawerPosition;
    e.preventDefault();
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;

    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    const deltaY = startYRef.current - clientY;

    // Simple position switching
    if (deltaY > 100) {
      // Dragging up
      if (startPositionRef.current === 'down') setDrawerPosition('middle');
      else if (startPositionRef.current === 'middle') setDrawerPosition('up');
    } else if (deltaY < -100) {
      // Dragging down
      if (startPositionRef.current === 'up') setDrawerPosition('middle');
      else if (startPositionRef.current === 'middle') setDrawerPosition('down');
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Event listeners - FIXED
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => handleDragMove(e);
    const handleTouchMove = (e) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  // Position styles - FIXED
  const getDrawerStyles = () => {
    switch (drawerPosition) {
      case 'up':
        return 'top-4 h-[calc(100vh-2rem)]';
      case 'middle':
        return 'top-1/3 h-2/3';
      case 'down':
      default:
        return 'top-[calc(100vh-120px)] h-28';
    }
  };

  // Main content - FIXED scroll issues
  const renderPanelContent = (isCompact = false) => {
    if (newRequest) {
      return (
        <div className="h-full">
          <NewJobRequest
            onReject={() => setNewRequest(false)}
            onAccept={handleAcceptJob}
          />
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        {!isCompact && (
          <>
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Mechanic Dashboard</CardTitle>
                <div className="flex items-center space-x-2">

                  <StatusSwitch
                    initialStatus={isOnline ? 'ONLINE' : 'OFFLINE'}
                    isVerified={isVerified}
                  />



                </div>
              </div>
              <CardDescription>
                {isOnline ? 'Ready to accept jobs' : 'Currently offline'}
              </CardDescription>
            </CardHeader>
            <Separator />
          </>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0 mx-4 mt-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 overflow-hidden">
            <TabsContent value="overview" className="h-full p-4 space-y-4 m-0">
              <ScrollArea className="h-full">
                <div className="space-y-4 pb-4">
                  <Card className={isOnline ? "bg-green-50 border-green-200" : "bg-gray-50"}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${isOnline ? 'bg-green-100' : 'bg-gray-100'} mb-2`}>
                          <Wrench className={isOnline ? "text-green-600" : "text-gray-400"} size={24} />
                        </div>
                        <h3 className={`font-semibold ${isOnline ? 'text-green-700' : 'text-gray-600'}`}>
                          {isOnline ? 'Active and Available' : 'Offline Mode'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isOnline ? 'Receiving job requests' : 'Go online to start working'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={() => setNewRequest(true)}
                    variant="outline"
                    className="w-full border-dashed"
                    disabled={!isOnline}
                  >
                    Simulate New Job Request
                  </Button>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Route size={16} />
                      Available Requests
                    </h4>
                    <AvailableRequests isOnline={isOnline} />
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="earnings" className="h-full p-4 m-0">
              <ScrollArea className="h-full">
                <EarningsSummary />
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  };

  // Mobile compact header
  const renderMobileCompactHeader = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 pb-2">
        <div>
          <CardTitle className="text-lg">Mechanic Dashboard</CardTitle>
          <CardDescription className="text-xs">
            {isOnline ? 'Ready to accept jobs' : 'Currently offline'}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={isOnline}
            onCheckedChange={setIsOnline}
            id="online-status"
            size="sm"
          />
          <Label htmlFor="online-status" className="text-xs">
            {isOnline ? 'Online' : 'Offline'}
          </Label>
        </div>
      </div>

      <div className="flex-1 p-4 pt-0">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="font-bold text-green-600">₹1,250</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          <div>
            <p className="font-bold text-blue-600">5</p>
            <p className="text-xs text-muted-foreground">Jobs</p>
          </div>
          <div>
            <Badge variant={isOnline ? "default" : "secondary"} className="text-xs">
              {isOnline ? 'Active' : 'Offline'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile drawer - FIXED positioning
  if (isMobile) {
    if (newRequest) {
      return (
        <div className="fixed inset-4 z-50">
          <NewJobRequest
            onReject={() => setNewRequest(false)}
            onAccept={handleAcceptJob}
          />
        </div>
      );
    }

    return (
      <>
        {(drawerPosition === 'middle' || drawerPosition === 'up') && (
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setDrawerPosition('down')}
          />
        )}

        <div
          ref={drawerRef}
          className={`
            fixed left-4 right-4 z-50
            bg-background rounded-t-2xl rounded-b-2xl shadow-2xl border
            transition-all duration-300 ease-out overflow-hidden
            ${getDrawerStyles()}
          `}
        >
          <div
            className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full"></div>
          </div>

          <div className="h-[calc(100%-44px)]">
            {drawerPosition === 'down' ? renderMobileCompactHeader() : renderPanelContent()}
          </div>
        </div>
      </>
    );
  }

  // Desktop panel - FIXED scroll
  return (
    <div className="absolute top-4 right-4 w-80 h-[calc(100vh-8rem)] z-10">
      <Card className="h-full shadow-xl border-0 flex flex-col">
        {renderPanelContent()}
      </Card>
    </div>
  );
};

export default ResponsivePanel;