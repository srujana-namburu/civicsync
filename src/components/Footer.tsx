import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Github, Twitter, Facebook } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <MapPin className="h-6 w-6 text-civic-blue dark:text-civic-blue-dark" />
              <span className="text-xl font-outfit font-bold">
                <span className="text-civic-blue dark:text-civic-blue-dark">Civic</span>
                <span className="text-civic-green dark:text-civic-green-dark">Sync</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering citizens to report and track civic issues in their communities for more responsive local governance.
            </p>
            <div className="flex items-center space-x-3 mt-4">
              <a 
                href="#" 
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center transition-colors hover:bg-primary/20"
                aria-label="Twitter"
              >
                <Twitter size={16} className="text-primary" />
              </a>
              <a 
                href="#" 
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center transition-colors hover:bg-primary/20"
                aria-label="Facebook"
              >
                <Facebook size={16} className="text-primary" />
              </a>
              <a 
                href="#" 
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center transition-colors hover:bg-primary/20"
                aria-label="GitHub"
              >
                <Github size={16} className="text-primary" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-outfit font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/issues" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Browse Issues
                </Link>
              </li>
              <li>
                <Link to="/report" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Report Issue
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Analytics
                </Link>
              </li>
              <li>
                <Link to="/my-issues" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  My Issues
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-outfit font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Accessibility
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-outfit font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href="mailto:info@civicsync.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  info@civicsync.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href="tel:+15555555555" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  (555) 555-5555
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Have questions or suggestions?{" "}
                <a href="#" className="text-primary hover:underline">Contact us</a>
              </p>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} CivicSync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
