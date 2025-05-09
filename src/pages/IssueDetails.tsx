import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer";
import { getIssueById, voteOnIssue, hasVotedOnIssue, getUserProfile } from "@/lib/supabase-data";
import { Issue } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ThumbsUp, MapPin, Calendar, Edit, ArrowLeft } from "lucide-react";
import StatusBadge from "@/components/issues/StatusBadge";
import CategoryIcon from "@/components/issues/CategoryIcon";
import IssueList from "@/components/issues/IssueList";
import { useAuth } from "@/context/AuthContext";

const IssueDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedIssues, setRelatedIssues] = useState<Issue[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [creatorName, setCreatorName] = useState<string>("");

  useEffect(() => {
    const fetchIssue = async () => {
      if (!id) return;
      
      try {
        const data = await getIssueById(id);
        if (data) {
          setIssue(data);
          
          // Check if user has voted on this issue
          if (user) {
            const voted = await hasVotedOnIssue(id);
            setHasVoted(voted);
          }
          
          // For demo: Get "related" issues (in a real app, these would be nearby or similar issues)
          try {
            const relatedData = await getIssueById(data.id === "1" ? "2" : "1");
            if (relatedData) {
              setRelatedIssues([relatedData]);
            }
          } catch (error) {
            console.error("Error fetching related issues:", error);
          }

          if (id) {
            getUserProfile(data.userId).then(profile => {
              setCreatorName(profile.name || profile.email || "User");
            }).catch(() => setCreatorName("User"));
          }
        } else {
          toast({
            title: "Issue not found",
            description: "The requested issue could not be found.",
            variant: "destructive",
          });
          navigate("/issues");
        }
      } catch (error: any) {
        console.error("Error fetching issue:", error);
        toast({
          title: "Error loading issue",
          description: error.message || "There was a problem loading the issue details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id, navigate, toast, user]);

  const handleVote = async () => {
    if (!issue || hasVoted || !user) {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to vote on issues.",
          variant: "destructive",
        });
      }
      return;
    }
    
    try {
      const updatedIssue = await voteOnIssue(issue.id);
      if (updatedIssue) {
        setIssue(updatedIssue);
        setHasVoted(true);
        toast({
          title: "Vote recorded",
          description: "Thank you for your vote!",
        });
      }
    } catch (error: any) {
      console.error("Error voting on issue:", error);
      toast({
        title: "Error recording vote",
        description: error.message || "There was a problem recording your vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navigateToMap = () => {
    if (issue?.latitude && issue?.longitude) {
      navigate(`/analytics`, { state: { issueId: issue.id, showMap: true } });
    } else {
      toast({
        title: "Location not available",
        description: "This issue doesn't have precise location coordinates to display on the map.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-800">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-12 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Issue Not Found</h1>
            <p className="mb-6">The issue you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <a href="/issues">Browse All Issues</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(issue.createdAt, { addSuffix: true });
  const formattedDate = format(issue.createdAt, "MMMM d, yyyy");
  const userOwnsIssue = user && user.id === issue.userId;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 md:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <Button 
            variant="ghost" 
            className="mb-6 -ml-2" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Card className="overflow-hidden mb-8">
            <div className="relative">
              {issue.imageUrl ? (
                <div className="relative h-64 md:h-80 bg-muted">
                  <img 
                    src={issue.imageUrl} 
                    alt={issue.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-32 bg-muted flex items-center justify-center">
                  <CategoryIcon category={issue.category} size={48} />
                </div>
              )}
              
              <div className="absolute top-4 right-4">
                <StatusBadge status={issue.status} />
              </div>
            </div>
            
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-wrap gap-2 items-center mb-4">
                <div className="flex items-center mr-4">
                  <CategoryIcon category={issue.category} />
                  <span className="ml-2 capitalize">{issue.category}</span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 flex items-center text-muted-foreground"
                  onClick={navigateToMap}
                >
                  <MapPin size={16} className="mr-1" />
                  <span>{issue.location}</span>
                </Button>
                
                <div className="flex items-center text-muted-foreground ml-auto">
                  <Calendar size={16} className="mr-1" />
                  <span title={formattedDate}>{timeAgo}</span>
                </div>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{issue.title}</h1>
              <div className="mb-2 text-sm text-muted-foreground">By: {creatorName}</div>
              
              <div className="prose dark:prose-invert max-w-none mb-6">
                <p>{issue.description}</p>
              </div>
            </CardContent>
            
            <CardFooter className="p-6 md:p-8 pt-0 border-t flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <Button 
                  variant={hasVoted ? "secondary" : "outline"}
                  className="flex items-center gap-2"
                  onClick={handleVote}
                  disabled={hasVoted || !user}
                >
                  <ThumbsUp size={18} />
                  <span>{hasVoted ? "Voted" : "UPVOTE"}</span>
                  <span className="ml-1">({issue.votes})</span>
                </Button>
                
                {userOwnsIssue && issue.status === "pending" && (
                  <Button variant="outline" className="flex items-center gap-2" asChild>
                    <a href={`/edit-issue/${issue.id}`}>
                      <Edit size={18} />
                      <span>Edit</span>
                    </a>
                  </Button>
                )}
              </div>
              
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground">
                  Issue ID: {issue.id}
                </span>
              </div>
            </CardFooter>
          </Card>
          
          {relatedIssues.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6">Related Issues</h2>
              <IssueList issues={relatedIssues} />
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default IssueDetails;
