import React, { useState, useRef, useEffect } from 'react';
import {
  Car, Route, DollarSign, Clock, MapPin, User, Wrench, ChevronUp
} from 'lucide-react';

// Shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// Improved Mobile Panel Component
const RightPanel = ({ shopName, isOnline, setIsOnline, isVerified, statusFromAPI, setStatusFromAPI }) => {
  const [newRequest, setNewRequest] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentHeight, setCurrentHeight] = useState(140);

  const panelRef = useRef(null);
  const isDraggingRef = useRef(false);

  const COLLAPSED_HEIGHT = 140;
  const EXPANDED_HEIGHT = window.innerHeight * 0.85;

  // Check screen size
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

  // Improved drag handling
  const handleTouchStart = (e) => {
    isDraggingRef.current = true;
    setDragStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = dragStartY - currentY;
    const startHeight = isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;
    let newHeight = startHeight + deltaY;
    
    // Constrain height
    newHeight = Math.max(COLLAPSED_HEIGHT, Math.min(EXPANDED_HEIGHT, newHeight));
    setCurrentHeight(newHeight);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    
    // Snap to nearest state
    const threshold = (EXPANDED_HEIGHT + COLLAPSED_HEIGHT) / 2;
    if (currentHeight > threshold) {
      setIsExpanded(true);
      setCurrentHeight(EXPANDED_HEIGHT);
    } else {
      setIsExpanded(false);
      setCurrentHeight(COLLAPSED_HEIGHT);
    }
  };

  // Toggle expand/collapse
  const toggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    setCurrentHeight(newExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT);
  };

  // Desktop content
  const renderDesktopContent = () => {
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
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{shopName || "Loading..."}</CardTitle>
            <StatusSwitch
              statusFromAPI={statusFromAPI}
              setStatusFromAPI={setStatusFromAPI}
              setIsOnline={setIsOnline}
              isVerified={isVerified}
            />
          </div>
          <CardDescription>
            {isOnline ? 'Ready to accept jobs' : 'Currently offline'}
          </CardDescription>
        </CardHeader>
        <Separator />

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

  // Mobile drawer content
  const renderMobileContent = () => {
    if (newRequest) {
      return (
        <div className="h-full p-4">
          <NewJobRequest
            onReject={() => setNewRequest(false)}
            onAccept={handleAcceptJob}
          />
        </div>
      );
    }

    if (!isExpanded) {
      // Collapsed view - rich preview
      return (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base">{shopName || "Loading..."}</h3>
                <Badge variant={isOnline ? "default" : "secondary"} className="text-xs">
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {isOnline ? 'Ready to accept jobs' : 'Tap to go online'}
              </p>
            </div>
            <StatusSwitch
              statusFromAPI={statusFromAPI}
              setStatusFromAPI={setStatusFromAPI}
              setIsOnline={setIsOnline}
              isVerified={isVerified}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <p className="font-bold text-green-600">₹1.2K</p>
              <p className="text-[10px] text-muted-foreground">Today</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <p className="font-bold text-blue-600">5</p>
              <p className="text-[10px] text-muted-foreground">Jobs</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-2 text-center">
              <p className="font-bold text-purple-600">3</p>
              <p className="text-[10px] text-muted-foreground">Requests</p>
            </div>
          </div>
        </div>
      );
    }

    // Expanded view - full content
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{shopName || "Loading..."}</h3>
            <StatusSwitch
              statusFromAPI={statusFromAPI}
              setStatusFromAPI={setStatusFromAPI}
              setIsOnline={setIsOnline}
              isVerified={isVerified}
            />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {isOnline ? 'Ready to accept jobs' : 'Currently offline'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mx-4 mb-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="overview" className="p-4 pt-2 m-0">
              <div className="space-y-3">
                <Card className={isOnline ? "bg-green-50 border-green-200" : "bg-gray-50"}>
                  <CardContent className="p-3">
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${isOnline ? 'bg-green-100' : 'bg-gray-100'} mb-2`}>
                        <Wrench className={isOnline ? "text-green-600" : "text-gray-400"} size={20} />
                      </div>
                      <h3 className={`font-semibold text-sm ${isOnline ? 'text-green-700' : 'text-gray-600'}`}>
                        {isOnline ? 'Active & Available' : 'Offline Mode'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isOnline ? 'Receiving requests' : 'Go online to work'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={() => setNewRequest(true)}
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed"
                  disabled={!isOnline}
                >
                  Simulate Job Request
                </Button>

                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Route size={14} />
                    Available Requests
                  </h4>
                  <AvailableRequests isOnline={isOnline} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="earnings" className="p-4 pt-2 m-0">
              <EarningsSummary />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    );
  };

  // Mobile drawer
  if (isMobile) {
    return (
      <>
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={toggleExpand}
          />
        )}

        <div
          ref={panelRef}
          className="fixed left-0 right-0 bottom-0 z-50 bg-background rounded-t-3xl shadow-2xl border-t overflow-hidden"
          style={{
            height: `${currentHeight}px`,
            transition: isDraggingRef.current ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Enhanced drag handle */}
          <div
            className="flex flex-col items-center pt-2 pb-1 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={toggleExpand}
          >
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mb-1"></div>
            <ChevronUp
              size={16}
              className={`text-muted-foreground/50 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>

          <div className="h-[calc(100%-40px)] overflow-hidden">
            {renderMobileContent()}
          </div>
        </div>
      </>
    );
  }

  // Desktop panel
  return (
    <div className="absolute top-4 right-4 w-80 h-[calc(100vh-8rem)] z-10">
      <Card className="h-full shadow-xl border-0 flex flex-col">
        {renderDesktopContent()}
      </Card>
    </div>
  );
};

export default RightPanel;