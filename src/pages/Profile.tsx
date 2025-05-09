import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Tab } from "@/components/ui/tab";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer";
import { getUserIssues, getUserVotedIssues, updateUserProfile } from "@/lib/supabase-data";
import { Issue, UserProfile } from "@/types";
import IssueList from "@/components/issues/IssueList";
import { Pencil, Check, X } from "lucide-react";
import { getUserProfile } from "@/lib/supabase-data";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("my-issues");
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [votedIssues, setVotedIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch user profile
        const profileData = await getUserProfile(user.id);
        // Create UserProfile object with optional bio field
        const userProfile: UserProfile = {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          bio: profileData.bio || null
        };
        setProfile(userProfile);
        setProfileName(userProfile.name || "");
        setProfileBio(userProfile.bio || "");

        // Load initial tab data
        if (activeTab === "my-issues") {
          const issues = await getUserIssues();
          setMyIssues(issues);
        } else if (activeTab === "voted-issues") {
          const issues = await getUserVotedIssues();
          setVotedIssues(issues);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, activeTab]);

  const handleTabChange = async (newTab: string) => {
    setActiveTab(newTab);
    setIsLoading(true);

    try {
      if (newTab === "my-issues" && myIssues.length === 0) {
        const issues = await getUserIssues();
        setMyIssues(issues);
      } else if (newTab === "voted-issues" && votedIssues.length === 0) {
        const issues = await getUserVotedIssues();
        setVotedIssues(issues);
      }
    } catch (error) {
      console.error(`Error fetching ${newTab}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditIssue = (issue: Issue) => {
    navigate(`/edit-issue/${issue.id}`, { state: { issue } });
  };

  const handleDeleteIssue = async (issueId: string) => {
    try {
      // Remove issue from local state
      setMyIssues((prevIssues) => prevIssues.filter(issue => issue.id !== issueId));
    } catch (error) {
      console.error("Error deleting issue:", error);
    }
  };

  const handleProfileSave = async () => {
    if (!user) return;

    try {
      const updatedProfileData = await updateUserProfile({
        name: profileName,
        bio: profileBio
      });
      
      const updatedProfile: UserProfile = {
        id: updatedProfileData.id,
        name: updatedProfileData.name,
        email: updatedProfileData.email,
        bio: updatedProfileData.bio || null
      };
      
      setProfile(updatedProfile);
      setIsEditingProfile(false);

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center py-12 bg-gray-50 dark:bg-gray-800">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please log in to view your profile.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <a href="/">Go to Login</a>
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow py-8 md:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto">
            {/* Profile Card */}
            <Card>
              <CardHeader className="relative">
                <div className="absolute right-6 top-6">
                  {isEditingProfile ? (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0" 
                        onClick={() => setIsEditingProfile(false)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Cancel</span>
                      </Button>
                      <Button 
                        size="sm"
                        className="h-8 w-8 p-0" 
                        onClick={handleProfileSave}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Save</span>
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 px-2" 
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    {isEditingProfile ? (
                      <Input 
                        id="name" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium mt-1">{profile?.name || user.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <p className="text-muted-foreground mt-1">{user.email}</p>
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    {isEditingProfile ? (
                      <Textarea 
                        id="bio" 
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        placeholder="Tell us a bit about yourself..."
                        className="mt-1 min-h-[100px]"
                      />
                    ) : (
                      <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                        {profile?.bio || "No bio yet. Click edit to add information about yourself."}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="flex border-b mb-4">
                <Tab value="my-issues" className={`px-4 py-2 ${activeTab === "my-issues" ? "border-b-2 border-primary font-medium" : ""}`}>
                  My Issues
                </Tab>
                <Tab value="voted-issues" className={`px-4 py-2 ${activeTab === "voted-issues" ? "border-b-2 border-primary font-medium" : ""}`}>
                  Issues I Voted
                </Tab>
              </div>

              <div className="tab-content">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : activeTab === "my-issues" ? (
                  <IssueList 
                    issues={myIssues} 
                    isUserOwned={true}
                    onEdit={handleEditIssue}
                    onDelete={handleDeleteIssue}
                  />
                ) : (
                  <IssueList issues={votedIssues} />
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
