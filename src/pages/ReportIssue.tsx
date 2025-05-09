
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer";
import IssueForm, { IssueFormData } from "@/components/issues/IssueForm";
import { createIssue } from "@/lib/supabase-data";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ReportIssue = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (data: IssueFormData) => {
    setIsSubmitting(true);

    try {
      await createIssue(
        {
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location,
          status: data.status || "pending",
          latitude: data.latitude,
          longitude: data.longitude,
        }, 
        data.imageFile || undefined
      );

      // Show success toast
      toast({
        title: "Issue reported successfully!",
        description: "Thank you for your submission. Your issue has been logged and will be reviewed.",
      });

      // Redirect to the issues page
      navigate("/my-issues");
    } catch (error: any) {
      console.error("Error submitting issue:", error);
      toast({
        title: "Error reporting issue",
        description: error.message || "There was a problem submitting your issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 md:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Report an Issue</h1>
            
            <p className="text-muted-foreground mb-8">
              Use this form to report civic issues in your community. Please provide as much 
              detail as possible to help us address the problem efficiently.
            </p>
            
            <Card>
              <CardHeader>
                <CardTitle>Issue Details</CardTitle>
                <CardDescription>
                  Fill out the form below with information about the issue you'd like to report.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IssueForm 
                  onSubmit={handleSubmit} 
                  isSubmitting={isSubmitting}
                  showStatusField={true}
                />
              </CardContent>
            </Card>
            
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
              <h3 className="font-medium mb-2 flex items-center">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What happens next?
              </h3>
              <p className="text-sm text-muted-foreground">
                After submitting your report, it will be assigned the status you've chosen. If left as "Pending", 
                it will be reviewed by community moderators. You can track the progress of your reported issues 
                in your "My Issues" dashboard and can update its status anytime.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReportIssue;
