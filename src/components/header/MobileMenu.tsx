
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Home, BarChart3, MapPin, Users, Settings, LogOut, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isLoggedIn: boolean;
  onAuth: () => void;
  onLogout: () => void;
  onClose: () => void;
}

const MobileMenu = ({ isLoggedIn, onAuth, onLogout, onClose }: MobileMenuProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden animate-fade-in">
      <div className="px-4 py-4 space-y-6 bg-background/95 backdrop-blur-md shadow-lg border-t">
        <div className="space-y-2">
          <Link 
            to="/" 
            className={cn(
              "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/") ? "bg-primary/10 text-primary" : "hover:bg-muted"
            )}
            onClick={onClose}
          >
            <Home size={18} className="mr-3" />
            Home
          </Link>
          <Link 
            to="/issues" 
            className={cn(
              "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/issues") ? "bg-primary/10 text-primary" : "hover:bg-muted"
            )}
            onClick={onClose}
          >
            <MapPin size={18} className="mr-3" />
            Browse Issues
          </Link>
          <Link 
            to="/analytics" 
            className={cn(
              "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/analytics") ? "bg-primary/10 text-primary" : "hover:bg-muted"
            )}
            onClick={onClose}
          >
            <BarChart3 size={18} className="mr-3" />
            Analytics
          </Link>
        </div>
        
        {isLoggedIn && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <h3 className="px-3 text-xs uppercase text-muted-foreground font-semibold tracking-wider">My Account</h3>
            <Link 
              to="/report" 
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive("/report") ? "bg-primary/10 text-primary" : "hover:bg-muted"
              )}
              onClick={onClose}
            >
              <PlusCircle size={18} className="mr-3" />
              Report Issue
            </Link>
            <Link 
              to="/my-issues" 
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive("/my-issues") ? "bg-primary/10 text-primary" : "hover:bg-muted"
              )}
              onClick={onClose}
            >
              <FileText size={18} className="mr-3" />
              My Issues
            </Link>
            <Link 
              to="/profile" 
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive("/profile") ? "bg-primary/10 text-primary" : "hover:bg-muted"
              )}
              onClick={onClose}
            >
              <Settings size={18} className="mr-3" />
              Profile
            </Link>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                onLogout();
                onClose();
              }}
            >
              <LogOut size={18} className="mr-3" />
              Log out
            </Button>
          </div>
        )}
        
        {!isLoggedIn && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <h3 className="px-3 text-xs uppercase text-muted-foreground font-semibold tracking-wider">Account</h3>
            <Button 
              variant="outline" 
              className="w-full rounded-full border-civic-blue dark:border-civic-blue-dark text-civic-blue dark:text-civic-blue-dark hover:bg-civic-blue/10 dark:hover:bg-civic-blue-dark/10"
              onClick={() => {
                onAuth();
                onClose();
              }}
            >
              Log in
            </Button>
            <Button 
              className="w-full rounded-full bg-civic-blue hover:bg-civic-blue/90 dark:bg-civic-blue-dark dark:hover:bg-civic-blue-dark/90"
              onClick={() => {
                onAuth();
                onClose();
              }}
            >
              Sign up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
