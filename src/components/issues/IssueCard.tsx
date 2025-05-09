import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Issue } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, Image, Pencil, Trash2, MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import CategoryIcon from "./CategoryIcon";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getUserProfile } from "@/lib/supabase-data";
import { motion, AnimatePresence } from "framer-motion";

interface IssueCardProps {
  issue: Issue & { hasVoted?: boolean };
  showActions?: boolean;
  hasVoted?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onVote?: () => void;
}

const IssueCard = ({ 
  issue, 
  showActions = false, 
  hasVoted,
  onClick, 
  onEdit, 
  onDelete,
  onVote
}: IssueCardProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const [voted, setVoted] = useState(hasVoted ?? false);
  const [creatorName, setCreatorName] = useState<string>("");
  const timeAgo = formatDistanceToNow(issue.createdAt, { addSuffix: true });
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    async function fetchCreator() {
      try {
        const profile = await getUserProfile(issue.userId);
        if (mounted) setCreatorName(profile.name || profile.email || "User");
      } catch {
        if (mounted) setCreatorName("User");
      }
    }
    fetchCreator();
    return () => { mounted = false; };
  }, [issue.userId]);
  
  useEffect(() => {
    setVoted(hasVoted ?? false);
  }, [hasVoted]);
  
  const handleVote = async (e: React.MouseEvent) => {
    if (!onVote || voted) return;
    e.preventDefault();
    e.stopPropagation();
    setIsVoting(true);
    try {
      await onVote();
      setVoted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1200);
    } finally {
      setIsVoting(false);
    }
  };
  
  return (
    <Card 
      className={cn(
        "card-harmony animate-hover-lift overflow-hidden h-full flex flex-col",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-0 flex-grow">
        <div className="relative">
          {issue.imageUrl ? (
            <img 
              src={issue.imageUrl} 
              alt={issue.title}
              className="w-full h-44 object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-44 bg-muted flex items-center justify-center">
              <CategoryIcon category={issue.category} size={40} />
            </div>
          )}
          
          <div className="absolute top-3 right-3">
            <StatusBadge status={issue.status} size="md" />
          </div>
          
          {issue.imageUrl && (
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md rounded-full p-1.5">
              <Image size={16} className="text-white" />
            </div>
          )}
        </div>
        
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <CategoryIcon category={issue.category} />
            <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
              {issue.category}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">{timeAgo}</span>
          </div>
          
          <h3 className="font-outfit font-medium text-lg mb-3 line-clamp-2">
            {issue.title}
          </h3>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground truncate max-w-[60%]">
              <span className="inline-flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="truncate">{issue.location}</span>
              </span>
              <div className="text-xs text-muted-foreground mt-1">By: {creatorName}</div>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: voted ? 1 : 1.08 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={handleVote}
              disabled={isVoting || voted}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full transition-all",
                onVote ? "hover:bg-primary/10 hover:scale-105 active:scale-95 cursor-pointer" : "cursor-default",
                "bg-muted/50"
              )}
            >
              {voted ? (
                <>
                  <Check size={14} className="text-green-500" />
                  <span className="text-xs font-semibold">Voted</span>
                  <span className="text-xs font-semibold ml-1">{issue.votes + (voted && !hasVoted ? 1 : 0)} <span className="hidden sm:inline">votes</span></span>
                </>
              ) : (
                <>
                  <ThumbsUp 
                    size={14} 
                    className={cn(
                      "text-civic-blue dark:text-civic-blue-dark", 
                      isVoting && "animate-pulse"
                    )} 
                  /> 
                  <span className="text-xs font-semibold">
                    {issue.votes} <span className="hidden sm:inline">votes</span>
                  </span>
                </>
              )}
              <AnimatePresence>
                {showConfetti && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute z-50"
                    style={{ left: "50%", top: "-20px", transform: "translateX(-50%)" }}
                  >
                    <span role="img" aria-label="confetti">🎉</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {showActions && onEdit && onDelete && (
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border/50">
              {issue.status === "pending" && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3 rounded-full text-civic-blue dark:text-civic-blue-dark hover:bg-civic-blue/10 dark:hover:bg-civic-blue-dark/10" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              )}
              {issue.status === "pending" && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3 rounded-full text-destructive hover:bg-destructive/10" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueCard;
