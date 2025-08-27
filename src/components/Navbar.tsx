import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Home, Image, Calendar, Menu } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/gallery", label: "Gallery", icon: Image },
    { path: "/events", label: "Events", icon: Calendar },
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile hamburger menu - left side */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetTitle className="text-left mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 spiritual-gradient rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">॥</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-primary devanagari">
                        महर्षि मंगल गिरि आश्रम
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Maharshi Mangal Giri Ashram
                      </span>
                    </div>
                  </div>
                </SheetTitle>
                <div className="flex flex-col space-y-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Button
                        key={item.path}
                        variant={isActive ? "default" : "ghost"}
                        size="lg"
                        asChild
                        className="justify-start w-full"
                        onClick={closeMenu}
                      >
                        <Link to={item.path} className="flex items-center space-x-3">
                          <Icon className="h-5 w-5" />
                          <span className="text-base">{item.label}</span>
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo - centered on mobile, left-aligned on desktop */}
          <div className="flex items-center flex-1 md:flex-none justify-center md:justify-start">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 spiritual-gradient rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">॥</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm sm:text-lg text-primary devanagari text-center md:text-left">
                  महर्षि मंगल गिरि आश्रम
                </span>
                <span className="text-xs text-muted-foreground text-center md:text-left">
                  Maharshi Mangal Giri Ashram
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop navigation - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className="flex items-center space-x-2"
                >
                  <Link to={item.path}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Spacer for mobile to balance the hamburger menu */}
          <div className="md:hidden w-10"></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;