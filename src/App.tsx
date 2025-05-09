
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ReportIssue from "./pages/ReportIssue";
import MyIssues from "./pages/MyIssues";
import BrowseIssues from "./pages/BrowseIssues";
import IssueDetails from "./pages/IssueDetails";
import EditIssue from "./pages/EditIssue";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="issue-radar-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/report" element={
                <RequireAuth>
                  <ReportIssue />
                </RequireAuth>
              } />
              <Route path="/my-issues" element={
                <RequireAuth>
                  <MyIssues />
                </RequireAuth>
              } />
              <Route path="/issues" element={<BrowseIssues />} />
              <Route path="/issues/:id" element={<IssueDetails />} />
              <Route path="/edit-issue/:id" element={
                <RequireAuth>
                  <EditIssue />
                </RequireAuth>
              } />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
