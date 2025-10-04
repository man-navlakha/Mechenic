import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, User, Settings, Lock, LogOut, ChevronDown, Menu, BadgeCheck  } from 'lucide-react';
import { useLock } from '../../context/LockContext';

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

const Navbar = ({ mechanicName = "Man Navlakha" , isOnline, isVerified ,setIsOnline }) => {
  const { lockScreen } = useLock();
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("User logged out");
    navigate('/login');
  };

  return (
    <nav className="bg-background border-b border-border shadow-sm z-30 relative">
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
                <MobileMenu
                  mechanicName={mechanicName}
                  lockScreen={lockScreen}
                  handleLogout={handleLogout}
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
              <Button variant="ghost" asChild>
                <Link to="/jobs" className="text-sm font-medium">
                  Jobs
                </Link>
              </Button>
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
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {isVerified && (
  <Badge variant="success" className="text-xs text-green-500 bg-green-300/30 ml-1"><BadgeCheck className="h-4 w-4 text-green-500"  /> Verified</Badge>
)}



            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {mechanicName.charAt(0).toUpperCase()}
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
      Professional Mechanic
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
const MobileMenu = ({ mechanicName, lockScreen, handleLogout }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {mechanicName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{mechanicName}</p>
          <p className="text-sm text-muted-foreground">Mechanic</p>
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
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/jobs">
              <Wrench className="mr-2 h-4 w-4" />
              Jobs
            </Link>
          </Button>
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
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
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