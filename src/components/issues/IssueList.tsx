import { useState } from "react";
import { Issue } from "@/types";
import IssueCard from "./IssueCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import VoteButton from "./VoteButton";

interface IssueListProps {
  issues: (Issue & { hasVoted?: boolean })[];
  isUserOwned?: boolean;
  onEdit?: (issue: Issue) => void;
  onDelete?: (issueId: string) => void;
  onVote?: (issueId: string) => Promise<void>;
  onClick?: (issue: Issue) => void;
}

const IssueList = ({ 
  issues, 
  isUserOwned = false,
  onEdit,
  onDelete,
  onVote,
  onClick
}: IssueListProps) => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<Issue | null>(null);

  const handleDelete = (issue: Issue) => {
    setIssueToDelete(issue);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (issueToDelete && onDelete) {
      onDelete(issueToDelete.id);
      toast({
        title: "Issue deleted",
        description: `The issue "${issueToDelete.title}" has been deleted.`,
      });
    }
    setDeleteDialogOpen(false);
    setIssueToDelete(null);
  };

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-muted-foreground"
          >
            <rect width="8" height="8" x="2" y="2" rx="1" />
            <rect width="8" height="8" x="14" y="2" rx="1" />
            <rect width="8" height="8" x="2" y="14" rx="1" />
            <rect width="8" height="8" x="14" y="14" rx="1" />
          </svg>
        </div>
        <h3 className="font-semibold text-lg">No issues found</h3>
        <p className="text-muted-foreground mt-2">
          {isUserOwned 
            ? "You haven't reported any issues yet." 
            : "No issues have been reported in this area."}
        </p>
        {isUserOwned && (
          <Button className="mt-4" asChild>
            <a href="/report">Report an issue</a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            showActions={isUserOwned}
            hasVoted={issue.hasVoted}
            onEdit={onEdit ? () => onEdit(issue) : undefined}
            onDelete={onDelete ? () => handleDelete(issue) : undefined}
            onVote={onVote ? () => onVote(issue.id) : undefined}
            onClick={onClick ? () => onClick(issue) : undefined}
          />
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the issue &quot;{issueToDelete?.title}&quot;. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default IssueList;
