
import React from "react";
import Header from "./header/Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, className = "", fullWidth = false }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-grow ${fullWidth ? '' : 'container mx-auto px-4'} ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
