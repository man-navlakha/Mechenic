import React from 'react'; // Removed unused hooks: useState, useEffect, useRef
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, User, Settings, Lock, LogOut, Menu, BadgeCheck } from 'lucide-react'; // Removed unused ChevronDown
import { useLock } from '../../context/LockContext';
import { useWebSocket } from '@/context/WebSocketContext';

// Shadcn/ui components
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLocation } from "react-router-dom";

const Navbar = () => { // Removed unused {} from props
  // FIXED: The useWebSocket hook is now called inside the component.
  const { isOnline, isVerified, basicNeeds, job } = useWebSocket();
  const { lockScreen } = useLock();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnJobPage =
    location.pathname.startsWith("/job/") ||
    location.pathname.startsWith("/login");



  // A more robust way to construct the name to avoid "undefined undefined"
  const mechanicName = basicNeeds ? `${basicNeeds.first_name || ''} ${basicNeeds.last_name || ''}`.trim() : "";
  const shopName = basicNeeds?.shop_name || "";
  const mechanicStatus = basicNeeds?.status || "OFFLINE";

  let statusLabel = mechanicStatus === "WORKING" ? "Working" : isOnline ? "Online" : "Offline";

  const handleLogout = () => {
    console.log("User logged out");
    navigate('/login');
  };

  return (
    <nav className="bg-background border-b border-border shadow-sm z-30 relative">
      {/* Active Job Banner */}
      {!isOnJobPage && basicNeeds?.status === "WORKING" && job && (
        <div className="w-full bg-blue-600 text-white px-4 py-2 flex items-center justify-between text-sm shadow-inner">
          <div className="truncate">
            <span className="font-semibold">Active Job #{job.id}:</span> {job.problem}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="text-black"
              variant="outline"
              onClick={() => navigate(`/job/${job.id}`)}
            >
              View
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side: Logo and Title */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                {/* FIXED: Passed all the necessary props to MobileMenu */}
                <MobileMenu
                  mechanicName={mechanicName}
                  shopName={shopName}
                  lockScreen={lockScreen}
                  handleLogout={handleLogout}
                  basicNeeds={basicNeeds}
                  job={job}
                />
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center space-x-3">
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Mechanic
                </span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  Setu
                </Badge>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-1">
              <Button variant="ghost" asChild>
                <Link to="/dashboard" className="text-sm font-medium">
                  Dashboard
                </Link>
              </Button>
              {!isOnJobPage && basicNeeds?.status === "WORKING" && job && (
                <Button variant="ghost" asChild>
                  {/* FIXED: Used template literal for dynamic route */}
                  <Link to={`/job/${job.id}`} className="text-sm font-medium">
                    Jobs
                  </Link>
                </Button>
              )}
              <Button variant="ghost" asChild>
                <Link to="/earnings" className="text-sm font-medium">
                  Earnings
                </Link>
              </Button>
            </nav>
          </div>

          {/* Right Side: User Profile Dropdown */}
          <div className="flex items-center space-x-4">
            {/* Online Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
              {statusLabel === 'Online' && (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span>Online</span>
                </div>
              )}
              {statusLabel === 'Offline' && (
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span>Offline</span>
                </div>
              )}
              {statusLabel === 'Working' && (
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                  <span>Working</span>
                </div>
              )}
            </div>

            {isVerified && (
              <Badge variant="success" className="text-xs text-green-500 bg-green-300/30 ml-1">
                <BadgeCheck className="h-4 w-4 text-green-500 mr-1" /> Verified
              </Badge>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden sm:flex relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {mechanicName?.charAt(0)?.toUpperCase() || "M"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium leading-none">{mechanicName}</p>
                      {isVerified && <BadgeCheck className="h-4 w-4 text-green-500" />}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">
                      {shopName && shopName}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={lockScreen}>
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Lock Screen</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Mobile Menu Component
// FIXED: Accepted necessary props: `basicNeeds`, `job`, and `shopName`.
const MobileMenu = ({ mechanicName, shopName, lockScreen, handleLogout, basicNeeds, job }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {mechanicName?.charAt(0)?.toUpperCase() || 'M'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{mechanicName}</p>
          {/* FIXED: Display shop name correctly */}
          <p className="text-sm text-muted-foreground">{shopName}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4">
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/dashboard">
              <Wrench className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          {basicNeeds?.status === "WORKING" && job && (
            <Button variant="ghost" className="w-full justify-start" asChild>
              {/* FIXED: Used template literal for dynamic route */}
              <Link to={`/job/${job.id}`}>
                <Wrench className="mr-2 h-4 w-4" />
                Jobs
              </Link>
            </Button>
          )}
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/earnings">
              <Wrench className="mr-2 h-4 w-4" />
              Earnings
            </Link>
          </Button>
        </nav>

        <Separator className="my-4" />

        {/* User Menu */}
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={lockScreen}>
            <Lock className="mr-2 h-4 w-4" />
            Lock Screen
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full text-destructive border-destructive/20 hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
};

export default Navbar;