import React, { useState, useEffect } from 'react';
import {
  Phone, MapPin, XCircle, CheckCircle, Clock, Map, TrendingUp,
  Calendar, Award, Info, Search, Loader2
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Assuming 'api' is an Axios instance or similar configured elsewhere
import api from '@/utils/api';

import StatusSwitch from './StatusSwitch';
import { useWebSocket } from '@/context/WebSocketContext';
import JobNotificationPopup from '@/components/JobNotificationPopup';

// Helper function to format date strings into a more readable format
const formatTimestamp = (dateString) => {
  const date = new Date(dateString);
  // Example: "Oct 13, 8:54 PM"
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
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
            <span className="text-2xl font-bold text-gray-800">₹{today.earnings.toFixed(2)}</span>
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
            <span className="text-xs text-gray-600">Jobs</span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600">→</Button>
          </div>
        </div>
      </div>
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
                <p className="font-medium">{job.problem} for {job.vehical_type}</p>
                <p className="text-muted-foreground">
                  {job.earning > 0 ? `₹${job.earning.toFixed(2)}` : 'No Earning'} • {job.timestamp}
                </p>
              </div>
              <Badge variant={job.status.toLowerCase() === 'completed' ? 'secondary' : 'destructive'}>{job.status}</Badge>
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

const MobileOnlineStatus = ({ basicNeeds }) => (
    <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center relative">
                <Search className="animate-ping absolute text-blue-500" size={20} />
                <Search className="text-blue-500" size={20} />
            </div>
            <div className="flex flex-col">
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
  const { isOnline, basicNeeds } = useWebSocket();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This function fetches live data from your API endpoint.
    const fetchMechanicHistory = async () => {
      try {
        const response = await api.get('/Profile/MechanicHistory/');
        const data = response.data;

        if (data && data.statistics && data.job_history) {
            // Transform the raw API data to match the structure expected by child components.
            const formattedData = {
                today: {
                    earnings: data.statistics.today_earnings || 0,
                    trips: data.statistics.today_jobs || 0,
                },
                // Show the most recent jobs for the history.
                jobHistory: data.job_history
                    .filter(job => ['COMPLETED', 'CANCELLED'].includes(job.status))
                    .slice(0, 5) // Limit to the 5 most recent entries
                    .map(job => ({
                        id: job.id,
                        earning: job.price || 0,
                        timestamp: formatTimestamp(job.created_at),
                        status: job.status.charAt(0).toUpperCase() + job.status.slice(1).toLowerCase(),
                        problem: job.problem,
                        vehical_type: job.vehical_type,
                    })),
            };
            setDashboardData(formattedData);
        } else {
            throw new Error("Invalid data structure from API.");
        }
      } catch (err) {
        setError("Failed to load history.");
        console.error("Failed to fetch profile data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMechanicHistory();
  }, []); // Empty dependency array ensures this runs only once on component mount.

  const shouldShowDashboard = !currentOrder && !isSearching;

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

  const renderDesktopContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="animate-spin text-blue-500" size={24} />
        </div>
      );
    }
    if (error) {
      return <div className="text-center text-red-500 p-4">{error}</div>;
    }
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
    if (dashboardData) {
      return <PartnerDashboard data={dashboardData} />;
    }
    return null;
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden sm:flex fixed right-4 top-20 bottom-4 w-96 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-y-scroll flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="sticky top-0 p-3 bg-white/70 rounded-xl shadow-sm mb-4 z-10">
              <div className="font-medium text-sm mb-1">{shopName || basicNeeds?.shop_name || 'Your Workshop'}</div>
              <StatusSwitch />
            </div>

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

            {renderDesktopContent()}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile View */}
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
                        {isLoading && <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" /></div>}
                        {error && <div className="text-center text-red-500 p-4">{error}</div>}
                        {dashboardData && <PartnerDashboard data={dashboardData} />}
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