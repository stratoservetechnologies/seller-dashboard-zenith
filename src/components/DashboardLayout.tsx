
import { useState, useEffect } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";

type SidebarProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: SidebarProps) {
  const { currentUser, userProfile, logout, isProfileComplete } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // If profile not complete, redirect to complete profile
  if (!isProfileComplete) {
    return <Navigate to="/complete-profile" />;
  }
  
  // Extract first letter of store name for avatar fallback
  const getInitial = () => {
    return userProfile?.storeName?.charAt(0) || userProfile?.email?.charAt(0) || "S";
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const routes = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    },
    {
      name: "Products",
      path: "/products",
      icon: ShoppingBag
    },
    {
      name: "Orders",
      path: "/orders",
      icon: Package
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings
    }
  ];
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleSidebar}
          className="bg-white"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out z-30 w-64 bg-white border-r border-gray-200 flex flex-col`}
      >
        {/* Sidebar Header / Logo */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-purple-700">Seller Dashboard</h1>
        </div>
        
        {/* User Profile */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={userProfile?.photoURL || ""} />
            <AvatarFallback className="bg-purple-100 text-purple-800">{getInitial()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{userProfile?.storeName || "Your Store"}</span>
            <span className="text-xs text-gray-500">{userProfile?.location || "Location"}</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {routes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className={`flex items-center px-3 py-3 rounded-md transition-colors ${
                location.pathname === route.path
                  ? "bg-purple-100 text-purple-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <route.icon className="h-5 w-5 mr-3" />
              {route.name}
            </Link>
          ))}
        </nav>
        
        {/* Logout Button */}
        <div className="px-6 py-4 border-t border-gray-100">
          <Button 
            onClick={logout}
            variant="outline"
            className="w-full flex items-center justify-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-200 ${isSidebarOpen ? "md:ml-64" : ""}`}>
        {/* Content Area */}
        <main className="h-full overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
