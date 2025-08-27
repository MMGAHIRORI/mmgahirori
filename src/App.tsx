import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLiveStream from "./pages/admin/AdminLiveStream";
import AdminSettings from "./pages/admin/AdminSettings";
import TempUserSetup from "./pages/TempUserSetup";
import TempUserLogin from "./pages/TempUserLogin";
import TempUserDashboard from "./pages/TempUserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { initializeEventCleanup } from "./lib/eventCleanup";
import { useAuthGuard } from "./hooks/useAuthGuard";
import "./utils/debugUser"; // Make debug functions available globally

const queryClient = new QueryClient();

const AppContent = () => {
  // Global auth guard to protect admin routes
  useAuthGuard();
  
  useEffect(() => {
    // Initialize automatic event cleanup when app starts
    initializeEventCleanup();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/events" element={<Events />} />
        <Route path="/admin-login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute requireAdmin={true}><AdminEvents /></ProtectedRoute>} />
        <Route path="/admin/gallery" element={<ProtectedRoute requireAdmin={true}><AdminGallery /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/live-stream" element={<ProtectedRoute requireAdmin={true}><AdminLiveStream /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute requireAdmin={true}><AdminSettings /></ProtectedRoute>} />
        <Route path="/temp-setup" element={<TempUserSetup />} />
        <Route path="/temp-login" element={<TempUserLogin />} />
        <Route path="/temp-dashboard" element={<TempUserDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
