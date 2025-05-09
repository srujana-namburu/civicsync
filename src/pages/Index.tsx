import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthForm from '@/components/auth/AuthForm';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { MapPin, CheckCircle, ArrowRight, BadgeCheck, Shield, Users, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTopVotedIssues } from '@/lib/supabase-data';
import IssueCard from '@/components/issues/IssueCard';

const Index = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const authSectionRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [topIssues, setTopIssues] = useState([]);
  const [loadingTopIssues, setLoadingTopIssues] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (location.state && location.state.scrollToAuth && authSectionRef.current) {
      authSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      // Clear the state to prevent scrolling on subsequent renders
      navigate('/', { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchTopIssues = async () => {
      setLoadingTopIssues(true);
      try {
        const issues = await getTopVotedIssues(3);
        setTopIssues(issues);
      } catch (e) {
        setTopIssues([]);
      } finally {
        setLoadingTopIssues(false);
      }
    };
    fetchTopIssues();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/report');
    } else if (authSectionRef.current) {
      authSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthSuccess = () => {
    navigate('/report');
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-5%] right-[-5%] w-72 h-72 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-secondary/5 blur-3xl"></div>
          <div className="absolute top-[20%] left-[40%] w-60 h-60 rounded-full bg-accent/5 blur-3xl"></div>
        </div>
        
        <div className="container px-4 sm:px-6 py-16 md:py-24 lg:py-32 relative z-10 mb-0">
          <div className="flex flex-col items-center text-center mb-0">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <BadgeCheck size={16} className="mr-1.5" />
              Empowering communities through civic engagement
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-outfit font-bold max-w-4xl leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-civic-blue to-civic-green dark:from-civic-blue-dark dark:to-civic-green-dark">
                Make your voice heard.
              </span> Report local issues that matter.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mt-6">
              CivicSync is your platform to report, track, and vote on local civic issues. 
              Together, we can build stronger, more responsive communities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button 
                size="lg" 
                className="rounded-full btn-harmony px-8 bg-civic-blue hover:bg-civic-blue/90 dark:bg-civic-blue-dark dark:hover:bg-civic-blue-dark/90"
                onClick={handleGetStarted}
              >
                {user ? 'Report an Issue' : 'Get Started'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {!user && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full btn-harmony px-8 border-civic-blue dark:border-civic-blue-dark text-civic-blue dark:text-civic-blue-dark"
                  asChild
                >
                  <Link to="/issues">Browse Issues</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Important Issues Section - Add image above */}
      <section className="pt-0 pb-12 md:pb-16 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="w-full m-0 flex justify-center">
            <img
              src="/c4.png"
              alt="CivicSync Banner Light"
              className="w-full max-w-4xl object-contain rounded-xl shadow-md border bg-white dark:hidden"
            />
            <img
              src="/civicsync3.png"
              alt="CivicSync Banner Dark"
              className="w-full max-w-4xl object-contain rounded-xl shadow-md border bg-white hidden dark:block"
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-8 text-left">Important Issues</h2>
          {loadingTopIssues ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : topIssues.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No important issues found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {topIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30"></div>
        <div className="container px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-4">Key Features</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              CivicSync provides powerful tools to help citizens and local governments 
              collaborate effectively on addressing community issues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-harmony p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-outfit mb-3">Report Issues</h3>
              <p className="text-muted-foreground mb-4">
                Submit detailed reports about civic issues with locations, photos, and descriptions.
              </p>
              {user ? (
                <Link to="/report" className="inline-flex items-center text-primary hover:underline">
                  Create a report <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              ) : (
                <Link to="/" className="inline-flex items-center text-primary hover:underline" onClick={handleGetStarted}>
                  Sign up to report <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              )}
            </div>

            <div className="card-harmony p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-outfit mb-3">Vote & Support</h3>
              <p className="text-muted-foreground mb-4">
                Upvote issues that matter to you and help prioritize community concerns.
              </p>
              <Link to="/issues" className="inline-flex items-center text-primary hover:underline">
                Browse issues <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="card-harmony p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-outfit mb-3">Track Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Visualize data trends and monitor the progress of issue resolution.
              </p>
              <Link to="/analytics" className="inline-flex items-center text-primary hover:underline">
                View analytics <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              A simple, efficient process to report and resolve community issues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-5 relative">
                  <span className="text-xl font-bold font-outfit text-primary">1</span>
                </div>
                <div className="absolute top-7 left-14 w-full h-1 bg-primary/20 hidden md:block"></div>
              </div>
              <h3 className="text-xl font-bold font-outfit mb-3">Sign Up</h3>
              <p className="text-muted-foreground">
                Create an account to access all features.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <span className="text-xl font-bold font-outfit text-primary">2</span>
                </div>
                <div className="absolute top-7 left-14 w-full h-1 bg-primary/20 hidden md:block"></div>
              </div>
              <h3 className="text-xl font-bold font-outfit mb-3">Report Issue</h3>
              <p className="text-muted-foreground">
                Submit details about the civic issue you've observed.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <span className="text-xl font-bold font-outfit text-primary">3</span>
                </div>
                <div className="absolute top-7 left-14 w-full h-1 bg-primary/20 hidden md:block"></div>
              </div>
              <h3 className="text-xl font-bold font-outfit mb-3">Community Support</h3>
              <p className="text-muted-foreground">
                Others can vote and comment on your issue.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-outfit mb-3">Resolution</h3>
              <p className="text-muted-foreground">
                Track the progress until the issue is resolved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      {!user && (
        <section ref={authSectionRef} id="auth-section" className="py-16 md:py-24 bg-muted/30">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-4">Join CivicSync Today</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Create an account to start reporting issues, voting, and making a difference in your community.
              </p>
            </div>
            
            <AuthForm onSuccess={handleAuthSuccess} />
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="py-16 md:py-20">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-4">Trusted By Communities</h2>
              <p className="text-lg text-muted-foreground">
                CivicSync is built with privacy, security, and accessibility as core principles.
                Your data is protected, and your voice matters.
              </p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <span>Data privacy & security</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span>Community-driven priorities</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  </div>
                  <span>Transparent issue tracking</span>
                </li>
              </ul>
            </div>
            
            <div className="flex-1">
              <div className="rounded-2xl overflow-hidden border shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Community meeting" 
                  className="w-full h-full object-cover aspect-video"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary/5">
        <div className="container px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-6">
              Ready to improve your community?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join CivicSync today and start making a difference. Report issues, vote on what matters, 
              and help build a better community together.
            </p>
            <Button 
              size="lg" 
              className="rounded-full btn-harmony px-8 text-lg bg-civic-blue hover:bg-civic-blue/90 dark:bg-civic-blue-dark dark:hover:bg-civic-blue-dark/90"
              onClick={handleGetStarted}
            >
              {user ? 'Report an Issue Now' : 'Get Started'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
