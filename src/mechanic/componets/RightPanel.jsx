import React, { useState, useEffect } from 'react';
import {
  Phone, MapPin, XCircle, CheckCircle, Clock, Map, TrendingUp,
  Calendar, Award, Info, Search
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

import StatusSwitch from './StatusSwitch';
import { useWebSocket } from '@/context/WebSocketContext';
import JobNotificationPopup from '@/components/JobNotificationPopup';

// Mocked Dashboard Data (assuming this is for demonstration)
const mockDashboardData = {
  today: {
    earnings: 634.64,
    trips: 17,
    timeOnOrders: '07:11 hrs',
    gigs: 4,
  },
  partnerStatus: {
    level: 'BLUE PARTNER',
    period: 'for week 02 Dec - 08 Dec',
    message: 'Learn more on how you can improve your performance and get Bronze medal',
  },
  jobHistory: [
    { id: 1001, earning: 60.50, timestamp: '10 mins ago', status: 'Completed' },
    { id: 1002, earning: 75.00, timestamp: '25 mins ago', status: 'Completed' },
    { id: 1003, earning: 52.25, timestamp: '45 mins ago', status: 'Cancelled' },
  ],
};

// Reusable Components
const EarningsDashboard = ({ today }) => (
  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Today's progress</h3>
        <Badge variant="outline" className="bg-white/60">Today</Badge>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="bg-white/70 rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-green-600" />
            <span className="text-2xl font-bold text-gray-800">{today.earnings.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Earnings</span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600">→</Button>
          </div>
        </div>
        <div className="bg-white/70 rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={16} className="text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">{today.trips}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Trips</span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600">→</Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/70 rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-orange-600" />
            <span className="text-lg font-bold text-gray-800">{today.timeOnOrders}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Time on orders</span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600">→</Button>
          </div>
        </div>
        <div className="bg-white/70 rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Award size={16} className="text-purple-600" />
            <span className="text-lg font-bold text-gray-800">{today.gigs} Gigs</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">History</span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600">→</Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const PartnerStatusCard = ({ partnerStatus }) => (
  <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-0 shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-sm font-semibold text-blue-900">{partnerStatus.level}</span>
        </div>
        <Info size={16} className="text-blue-700" />
      </div>
      <p className="text-xs text-blue-800 mb-2">{partnerStatus.period}</p>
      <p className="text-xs text-blue-700 mb-3">{partnerStatus.message}</p>
      <Button variant="outline" size="sm" className="w-full bg-white/50 text-blue-800 border-blue-300 text-xs">
        View Performance Details
      </Button>
    </CardContent>
  </Card>
);

const JobHistory = ({ history = [] }) => (
  <Card className="mt-4">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      {history.length > 0 ? (
        <div className="space-y-2">
          {history.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs">
              <div>
                <p className="font-medium">Delivery #{job.id}</p>
                <p className="text-muted-foreground">₹{job.earning.toFixed(2)} • {job.timestamp}</p>
              </div>
              <Badge variant={job.status === 'Completed' ? 'secondary' : 'destructive'}>{job.status}</Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No recent activity to show.</p>
        </div>
      )}
    </CardContent>
  </Card>
);

const PartnerDashboard = ({ data }) => (
  <div className="space-y-4">
    <EarningsDashboard today={data.today} />
    <PartnerStatusCard partnerStatus={data.partnerStatus} />
    <JobHistory history={data.jobHistory} />
  </div>
);

const SearchingForOrders = () => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-4">
      <Search className="text-blue-500" size={32} />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">Searching for orders...</h3>
    <p className="text-gray-500 mb-6">Explore your zone 😊</p>
    <div className="w-16 h-1 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full"></div>
  </div>
);

const PickupCard = ({ order, onCall, onMap, onAccept, onReject, showStatus }) => (
  <Card className="shadow-md rounded-xl border-0 mb-4">
    {showStatus && (
      <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-2 flex items-center justify-between rounded-t-xl border-b">
        <span className="text-xs font-semibold text-amber-800">{order.accepted ? 'Accepted Order' : 'New Request'}</span>
        <Badge variant="secondary">{order.pickupDistance}</Badge>
      </div>
    )}
    <CardHeader className="px-4 pb-2 pt-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
          <MapPin className="text-amber-700" size={20} />
        </div>
        <div className="flex-1">
          <CardTitle className="text-sm font-semibold mb-0">{order.placeName}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{order.address}</p>
        </div>
      </div>
    </CardHeader>
    <CardContent className="px-4 pt-2 pb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground">Expected earnings</p>
          <p className="text-lg font-bold">₹{order.payout}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Drop Distance</p>
          <p className="font-medium">{order.dropDistance}</p>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-2 mt-3">
        <Button variant="outline" className="flex items-center gap-2 justify-center py-2" onClick={onCall}>
          <Phone size={16} />Call
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 justify-center py-2" onClick={onMap}>
          <Map size={16} />Map
        </Button>
      </div>
      <div className="flex gap-2 mt-3">
        <Button variant="destructive" className="flex-1 py-2" onClick={onReject}>
          <XCircle size={16} />Reject
        </Button>
        <Button className="flex-1 py-2" onClick={onAccept}>
          <CheckCircle size={16} />Accept
        </Button>
      </div>
    </CardContent>
  </Card>
);

// FIXED: The component now correctly accepts `basicNeeds` as a prop.
const MobileOnlineStatus = ({ basicNeeds }) => (
  <div className="flex items-center justify-between px-2 py-1">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center relative">
        <Search className="animate-ping absolute text-blue-500" size={20} />
        <Search className="text-blue-500" size={20} />
      </div>
      <div className="flex flex-col">
        {/* FIXED: It can now safely access the passed-in prop. */}
        <span className="text-sm font-medium text-gray-800">Hi, {basicNeeds?.first_name || 'Partner'}! Searching...</span>
        <span className="text-xs text-gray-500">Explore your zone 😊</span>
      </div>
    </div>
    <div className="flex items-center gap-2 text-blue-600 font-medium animate-pulse">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
      </span>
      <span className="text-xs">Live</span>
    </div>
  </div>
);

const RightPanel = ({ shopName }) => {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { isOnline, basicNeeds } = useWebSocket(); // Removed unused variables

  const shouldShowDashboard = !currentOrder && !isSearching;

  // Simulate search/loading animation
  useEffect(() => {
    let timer;
    if (isOnline && !currentOrder) {
      setIsSearching(true);
      timer = setTimeout(() => setIsSearching(false), 3000);
    } else {
      setIsSearching(false);
    }
    return () => clearTimeout(timer);
  }, [isOnline, currentOrder]);


  const handleAccept = () => setCurrentOrder((o) => ({ ...o, accepted: true }));
  const handleReject = () => setCurrentOrder(null);
  const handleCall = () => window.open(`tel:${currentOrder.phone}`);
  const handleMap = () => console.log('Map open');

  // Render content based on order status
  const renderDesktopContent = () => {
    if (currentOrder) {
      return (
        <PickupCard
          order={currentOrder}
          onCall={handleCall}
          onMap={handleMap}
          onAccept={handleAccept}
          onReject={handleReject}
          showStatus
        />
      );
    }
    return <PartnerDashboard data={mockDashboardData} />;
  };

  return (
    <>
      {/* Desktop View */}
      {/* FIXED: Corrected non-standard Tailwind class `top-19` to `top-20` */}
      <div className="hidden sm:flex fixed right-4 top-20 bottom-4 w-96 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-y-scroll flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Header: Shop Info & Online Status */}
            <div className="sticky top-0 p-3 bg-white/70 rounded-xl shadow-sm mb-4 z-10">
              <div className="font-medium text-sm mb-1">{shopName || basicNeeds?.shop_name || 'Your Workshop'}</div>
              <StatusSwitch />
            </div>

            {/* Searching Indicator + Sim Button */}
            {isOnline && shouldShowDashboard && (
              <>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 mb-5">
                  <CardContent className="p-6">
                    <SearchingForOrders />
                  </CardContent>
                </Card>
                <JobNotificationPopup />
              </>
            )}

            {/* Dashboard or Order Card */}
            {renderDesktopContent()}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile View - Fixed */}
      <div className="sm:hidden">
        {currentOrder ? (
          <div className="fixed inset-0 z-50 bg-black/20">
            <Sheet open={true} onOpenChange={() => setCurrentOrder(null)}>
              <SheetContent
                side="bottom"
                className="max-h-[92vh] p-0 bg-white border-t rounded-t-2xl"
                onInteractOutside={(e) => e.preventDefault()}
              >
                <div className="p-4 pb-6">
                  <PickupCard
                    order={currentOrder}
                    onCall={handleCall}
                    onMap={handleMap}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    showStatus
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="fixed inset-x-4 bottom-4 z-40">
            {isOnline && basicNeeds?.status === "ONLINE" &&
              <div className="sticky top-0 p-3 bg-white/90 rounded-xl shadow-sm mb-2 z-10">
                {/* FIXED: Passed the required `basicNeeds` object as a prop */}

                <MobileOnlineStatus basicNeeds={basicNeeds} />
              </div>
            }
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-3 shadow-lg border border-gray-200 flex flex-col gap-3">
              <div className="flex justify-between items-center font-medium text-xl mb-1">
                {shopName || basicNeeds?.shop_name || 'Your Workshop'}
                <StatusSwitch />
              </div>
              <div className="grid ">
                <Sheet open={detailsSheetOpen} onOpenChange={setDetailsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="default" size="sm">View Details</Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="max-h-[92vh] p-0 bg-white border-t rounded-t-2xl">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Dashboard</h2>
                        <Button variant="ghost" size="sm" onClick={() => setDetailsSheetOpen(false)}>
                          Close
                        </Button>
                      </div>
                      <ScrollArea className="h-[80vh]">
                        <PartnerDashboard data={mockDashboardData} />
                      </ScrollArea>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RightPanel;