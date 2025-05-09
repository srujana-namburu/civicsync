import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BarChart3, FileText, MapPin, Building2, FileWarning, ClipboardList } from "lucide-react";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";
import { ThemeToggle } from "../theme/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToAuth = () => {
    const authSection = document.getElementById("auth-section");
    if (authSection) {
      authSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAuthClick = () => {
    if (location.pathname === "/") {
      scrollToAuth();
    } else {
      navigate("/", { state: { scrollToAuth: true } });
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-background",
      "border-b border-border/50"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 transition-transform duration-300 hover:scale-105">
              <ClipboardList className="h-6 w-6 text-civic-blue dark:text-civic-blue-dark" />
              <span className="text-2xl font-outfit font-bold">
                <span className="text-civic-blue dark:text-civic-blue-dark">Civic</span>
                <span className="text-civic-green dark:text-civic-green-dark">Sync</span>
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={cn(
                "relative font-medium text-sm transition-colors hover:text-civic-blue dark:hover:text-civic-blue-dark",
                isActive("/") ? "text-civic-blue dark:text-civic-blue-dark" : "text-foreground",
                "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-civic-blue dark:after:bg-civic-blue-dark",
                isActive("/") ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
              )}
            >
              Home
            </Link>
            <Link 
              to="/issues" 
              className={cn(
                "relative font-medium text-sm transition-colors hover:text-civic-blue dark:hover:text-civic-blue-dark",
                isActive("/issues") ? "text-civic-blue dark:text-civic-blue-dark" : "text-foreground",
                "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-civic-blue dark:after:bg-civic-blue-dark",
                isActive("/issues") ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
              )}
            >
              Browse Issues
            </Link>
            <Link 
              to="/analytics" 
              className={cn(
                "relative font-medium text-sm transition-colors hover:text-civic-blue dark:hover:text-civic-blue-dark",
                isActive("/analytics") ? "text-civic-blue dark:text-civic-blue-dark" : "text-foreground",
                "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-civic-blue dark:after:bg-civic-blue-dark",
                isActive("/analytics") ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300",
                "flex items-center"
              )}
            >
              <BarChart3 size={16} className="mr-1" />
              Analytics
            </Link>
            {user && (
              <>
                <Link 
                  to="/report" 
                  className={cn(
                    "relative font-medium text-sm transition-colors hover:text-civic-blue dark:hover:text-civic-blue-dark",
                    isActive("/report") ? "text-civic-blue dark:text-civic-blue-dark" : "text-foreground",
                    "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-civic-blue dark:after:bg-civic-blue-dark",
                    isActive("/report") ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300",
                    "animate-fade-in"
                  )}
                >
                  Report Issue
                </Link>
                <Link 
                  to="/my-issues" 
                  className={cn(
                    "relative font-medium text-sm transition-colors hover:text-civic-blue dark:hover:text-civic-blue-dark",
                    isActive("/my-issues") ? "text-civic-blue dark:text-civic-blue-dark" : "text-foreground",
                    "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-civic-blue dark:after:bg-civic-blue-dark",
                    isActive("/my-issues") ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300",
                    "animate-fade-in flex items-center"
                  )}
                >
                  <FileText size={16} className="mr-1" />
                  My Issues
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {isLoading ? (
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
            ) : user ? (
              <UserMenu />
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  className="rounded-full px-5 border-civic-blue dark:border-civic-blue-dark text-civic-blue dark:text-civic-blue-dark hover:bg-civic-blue/10 dark:hover:bg-civic-blue-dark/10"
                  onClick={handleAuthClick}
                >
                  Log in
                </Button>
                <Button 
                  className="rounded-full px-5 bg-civic-blue hover:bg-civic-blue/90 dark:bg-civic-blue-dark dark:hover:bg-civic-blue-dark/90"
                  onClick={handleAuthClick}
                >
                  Sign up
                </Button>
              </div>
            )}
            
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
                className="rounded-full"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <MobileMenu 
          isLoggedIn={!!user} 
          onAuth={handleAuthClick}
          onLogout={signOut}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
