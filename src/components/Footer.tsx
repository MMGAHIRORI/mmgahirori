import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center space-x-2 justify-center md:justify-start mb-4">
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
            <p className="text-sm text-muted-foreground devanagari mb-4">
              आध्यात्मिक ज्ञान और शांति का केंद्र
            </p>
            <p className="text-xs text-muted-foreground">
              A center of spiritual knowledge and peace
            </p>
          </div>

          {/* Contact Information */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-foreground mb-4 devanagari">संपर्क</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 justify-center md:justify-start">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">अहिरोरी हरदोई 241121</span>
              </div>
              <div className="flex items-center space-x-2 justify-center md:justify-start">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">+91 9580094376</span>
              </div>
              <div className="flex items-center space-x-2 justify-center md:justify-start">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">mmgahirori@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Admin Access */}
          <div className="text-center md:text-right">
            <h3 className="font-semibold text-foreground mb-4">Administration</h3>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hover:spiritual-gradient hover:text-white transition-all duration-300"
            >
              <Link to="/admin-login" className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Admin Login</span>
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Site management portal
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © 2024 Maharshi Mangal Giri Ashram. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link to="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Events
              </Link>
              <Link to="/gallery" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Gallery
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;