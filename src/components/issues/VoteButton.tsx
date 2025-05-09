import { useState } from "react";
import { ThumbsUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface VoteButtonProps {
  issueId: string;
  initialVotes: number;
  initialVoted?: boolean;
  onVote?: (issueId: string) => Promise<void>;
  size?: "sm" | "default";
  showCount?: boolean;
}

const VoteButton = ({ 
  issueId, 
  initialVotes, 
  initialVoted = false,
  onVote,
  size = "default",
  showCount = true 
}: VoteButtonProps) => {
  const [isVoted, setIsVoted] = useState(initialVoted);
  const [votes, setVotes] = useState(initialVotes);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVote = async () => {
    if (isVoted || isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (onVote) {
        await onVote(issueId);
      }
      
      setVotes(prev => prev + 1);
      setIsVoted(true);
      
      toast({
        title: "Vote recorded",
        description: "Thanks for supporting this issue!",
      });
      
      // Simple confetti effect for milestone votes
      if ((votes + 1) % 10 === 0) {
        showConfetti();
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Could not record vote",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const showConfetti = () => {
    // This is a simple implementation, in a real app you might use a library like canvas-confetti
    const confettiCount = 50;
    const colors = ['#1EAEDB', '#33C3F0', '#F2FCE2', '#8A898C'];
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
      confetti.style.opacity = `${Math.random() * 0.5 + 0.5}`;
      document.body.appendChild(confetti);
      
      setTimeout(() => document.body.removeChild(confetti), 5000);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={isVoted ? "secondary" : "outline"}
            size={size === "sm" ? "sm" : "default"}
            className={cn(
              "group transition-all duration-200",
              isVoted ? "border-secondary/50" : "",
              isLoading ? "opacity-80 cursor-not-allowed" : ""
            )}
            onClick={handleVote}
            disabled={isVoted || isLoading}
          >
            {isVoted ? (
              <Check className="w-4 h-4 mr-1 text-secondary" />
            ) : (
              <ThumbsUp className={cn(
                "w-4 h-4 mr-1",
                "group-hover:scale-110 group-hover:text-primary transition-all duration-200"
              )} />
            )}
            <span>{isVoted ? "Voted" : "UPVOTE"}</span>
            {showCount && <span className="ml-1">({votes})</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isVoted 
            ? "You've already voted on this issue" 
            : "Upvote this issue to show your support"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VoteButton;
