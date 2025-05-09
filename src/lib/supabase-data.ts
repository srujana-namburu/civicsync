
import { Issue, IssueCategory, IssueStatus, UserProfile } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Helper function to transform issue data from database
const transformIssueFromDb = (data: any): Issue => {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category as IssueCategory,
    location: data.location,
    status: data.status as IssueStatus,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    userId: data.user_id,
    imageUrl: data.image_url,
    votes: data.votes,
    latitude: data.latitude || null,
    longitude: data.longitude || null
  };
};

// Function to get all issues
export const getIssues = async (): Promise<Issue[]> => {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching issues:", error);
    throw error;
  }
  
  return data.map(transformIssueFromDb);
};

// Function to get a specific issue by ID
export const getIssueById = async (id: string): Promise<Issue | undefined> => {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return undefined; // Issue not found
    }
    console.error("Error fetching issue:", error);
    throw error;
  }
  
  return transformIssueFromDb(data);
};

// Function to get user's issues
export const getUserIssues = async (): Promise<Issue[]> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('user_id', session.session.user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching user issues:", error);
    throw error;
  }
  
  return data.map(transformIssueFromDb);
};

// Function to create a new issue
export const createIssue = async (issueData: Partial<Issue>, imageFile?: File): Promise<Issue> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    throw new Error("User not authenticated");
  }
  
  // Handle image upload if provided
  let imageUrl = issueData.imageUrl;
  if (imageFile) {
    const fileName = `${Date.now()}-${imageFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('issue-images')
      .upload(fileName, imageFile);
    
    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('issue-images')
      .getPublicUrl(fileName);
    
    imageUrl = publicUrlData.publicUrl;
  }
  
  // Insert the issue
  const { data, error } = await supabase
    .from('issues')
    .insert({
      title: issueData.title || "",
      description: issueData.description || "",
      category: issueData.category as IssueCategory || "other",
      location: issueData.location || "",
      status: issueData.status as IssueStatus || "pending",
      user_id: session.session.user.id,
      image_url: imageUrl,
      latitude: issueData.latitude,
      longitude: issueData.longitude
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating issue:", error);
    throw error;
  }
  
  return transformIssueFromDb(data);
};

// Function to update an issue
export const updateIssue = async (id: string, issueData: Partial<Issue>, imageFile?: File | null): Promise<Issue | undefined> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    throw new Error("User not authenticated");
  }
  
  // First check if issue exists and user owns it
  const { data: existingIssue, error: fetchError } = await supabase
    .from('issues')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.session.user.id)
    .single();
  
  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return undefined; // Issue not found or not owned by user
    }
    console.error("Error fetching issue:", fetchError);
    throw fetchError;
  }
  
  // Handle image upload if provided
  let imageUrl = imageFile === null ? null : existingIssue.image_url;
  if (imageFile && imageFile instanceof File) {
    const fileName = `${Date.now()}-${imageFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('issue-images')
      .upload(fileName, imageFile);
    
    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('issue-images')
      .getPublicUrl(fileName);
    
    imageUrl = publicUrlData.publicUrl;
  }
  
  // Update the issue
  const { data, error } = await supabase
    .from('issues')
    .update({
      title: issueData.title,
      description: issueData.description,
      category: issueData.category,
      location: issueData.location,
      status: issueData.status,
      image_url: imageUrl,
      latitude: issueData.latitude,
      longitude: issueData.longitude
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating issue:", error);
    throw error;
  }
  
  return transformIssueFromDb(data);
};

// Function to delete an issue
export const deleteIssue = async (id: string): Promise<boolean> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    throw new Error("User not authenticated");
  }
  
  const { error } = await supabase
    .from('issues')
    .delete()
    .eq('id', id)
    .eq('user_id', session.session.user.id);
  
  if (error) {
    console.error("Error deleting issue:", error);
    throw error;
  }
  
  return true;
};

// Function to vote on an issue
export const voteOnIssue = async (id: string): Promise<Issue | undefined> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    throw new Error("User not authenticated");
  }
  
  // Check if the user has already voted
  const { data: existingVote, error: checkError } = await supabase
    .from('issue_votes')
    .select()
    .eq('issue_id', id)
    .eq('user_id', session.session.user.id);
  
  if (checkError) {
    console.error("Error checking vote:", checkError);
    throw checkError;
  }
  
  if (existingVote && existingVote.length > 0) {
    throw new Error("User has already voted on this issue");
  }
  
  // Create the vote
  const { error: voteError } = await supabase
    .from('issue_votes')
    .insert({
      issue_id: id,
      user_id: session.session.user.id
    });
  
  if (voteError) {
    console.error("Error creating vote:", voteError);
    throw voteError;
  }
  
  // Get the updated issue
  const { data: updatedIssue, error: fetchError } = await supabase
    .from('issues')
    .select()
    .eq('id', id)
    .single();
  
  if (fetchError) {
    console.error("Error fetching updated issue:", fetchError);
    throw fetchError;
  }
  
  return transformIssueFromDb(updatedIssue);
};

// Function to check if user has voted on an issue
export const hasVotedOnIssue = async (issueId: string): Promise<boolean> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    return false;
  }
  
  const { data, error } = await supabase
    .from('issue_votes')
    .select()
    .eq('issue_id', issueId)
    .eq('user_id', session.session.user.id);
  
  if (error) {
    console.error("Error checking vote:", error);
    throw error;
  }
  
  return data && data.length > 0;
};

// Function to get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
  
  // Return only the properties defined in the UserProfile interface
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    bio: data.bio as string | null
  };
};

// Function to update user profile
export const updateUserProfile = async (profileData: { name?: string, bio?: string }): Promise<UserProfile> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', session.session.user.id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
  
  // Return only the properties defined in the UserProfile interface
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    bio: data.bio as string | null
  };
};

// Function to get user's voted issues
export const getUserVotedIssues = async (): Promise<Issue[]> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from('issue_votes')
    .select('issue_id')
    .eq('user_id', session.session.user.id);
  
  if (error) {
    console.error("Error fetching user votes:", error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    return [];
  }
  
  const issueIds = data.map(vote => vote.issue_id);
  
  const { data: issues, error: issuesError } = await supabase
    .from('issues')
    .select('*')
    .in('id', issueIds)
    .order('created_at', { ascending: false });
  
  if (issuesError) {
    console.error("Error fetching voted issues:", issuesError);
    throw issuesError;
  }
  
  return issues.map(transformIssueFromDb);
};

// Analytics functions
export const getCategoryDistribution = async () => {
  const { data, error } = await supabase
    .from('issues')
    .select('category');
  
  if (error) {
    console.error("Error fetching category distribution:", error);
    throw error;
  }
  
  // Process the data to count occurrences of each category
  const categoryCounts: Record<string, number> = {};
  
  data.forEach((issue) => {
    const category = issue.category;
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  // Convert to the expected format
  return Object.entries(categoryCounts).map(([category, count]) => ({
    category: category as IssueCategory,
    count: count
  }));
};

export const getTemporalAnalysis = async (days: number = 7) => {
  // Get today's date
  const today = new Date();
  const dates = [];
  
  // Generate array of dates for the past X days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push({
      date: date.toISOString().split('T')[0],
      count: 0
    });
  }
  
  // Get issues created in the past X days
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);
  
  const { data, error } = await supabase
    .from('issues')
    .select('created_at')
    .gte('created_at', startDate.toISOString());
  
  if (error) {
    console.error("Error fetching temporal analysis:", error);
    throw error;
  }
  
  // Count issues per day
  data.forEach(issue => {
    const issueDate = new Date(issue.created_at).toISOString().split('T')[0];
    const dayData = dates.find(d => d.date === issueDate);
    if (dayData) {
      dayData.count++;
    }
  });
  
  return dates;
};

export const getTopVotedIssues = async (limit: number = 10) => {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .order('votes', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error("Error fetching top voted issues:", error);
    throw error;
  }
  
  return data.map(transformIssueFromDb);
};

export const getIssuesForMap = async () => {
  // Get issues with real location data
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching map issues:", error);
    throw error;
  }
  
  return data.map((issue) => ({
    id: issue.id,
    title: issue.title,
    category: issue.category as IssueCategory,
    status: issue.status as IssueStatus,
    votes: issue.votes,
    lat: issue.latitude || (40.7128 + (Math.random() * 0.02 - 0.01)), // Use actual data or fallback to mock
    lng: issue.longitude || (-74.006 + (Math.random() * 0.02 - 0.01))  // Use actual data or fallback to mock
  }));
};
