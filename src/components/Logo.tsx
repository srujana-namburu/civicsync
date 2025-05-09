
import React from "react";
import { Building2 } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = "md", showText = true }) => {
  // Size mapping for logo
  const sizeMap = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10"
  };
  
  const textSizeMap = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl"
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse-slow"></div>
        <div className="relative flex items-center justify-center p-2 bg-gradient-to-br from-primary/80 to-secondary/80 text-primary-foreground rounded-full">
          <Building2 className={`${sizeMap[size]} animate-hover-lift`} />
        </div>
      </div>
      
      {showText && (
        <div className="font-outfit font-bold tracking-tight">
          <span className={`${textSizeMap[size]} bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent`}>
            CivicSync
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
