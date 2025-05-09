import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer";
import { getIssues, voteOnIssue, hasVotedOnIssue } from "@/lib/supabase-data";
import { Issue, IssueCategory, IssueStatus } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, X, SlidersHorizontal, ArrowUpCircle,
  Clock, Filter, ChevronLeft, ChevronRight, MapPin
} from "lucide-react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { debounce } from "@/lib/utils";
import IssueCard from "@/components/issues/IssueCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Sort options
type SortOption = "newest" | "votes" | "location";

type IssueWithVoted = Issue & { hasVoted?: boolean };

const BrowseIssues = () => {
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [displayedIssues, setDisplayedIssues] = useState<Issue[]>([]);
  const [displayedIssuesWithVoted, setDisplayedIssuesWithVoted] = useState<IssueWithVoted[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real issues from Supabase using React Query
  const { data: issues = [], isLoading, isError } = useQuery({
    queryKey: ['issues'],
    queryFn: getIssues
  });

  // Handle voting
  const handleVote = async (issueId: string) => {
    try {
      // First check if the user has already voted
      const hasVoted = await hasVotedOnIssue(issueId);
      if (hasVoted) {
        toast({
          title: "Already voted",
          description: "You've already voted on this issue",
          variant: "default",
        });
        return;
      }

      // Process the vote
      await voteOnIssue(issueId);

      // Invalidate the issues query to refresh data
      queryClient.invalidateQueries({queryKey: ['issues']});
      
      toast({
        title: "Vote recorded",
        description: "Your vote has been counted!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error voting",
        description: error instanceof Error ? error.message : "Could not record your vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setIsSearching(false);
      applyFilters(issues, categoryFilter, statusFilter, sortBy, term);
    }, 300),
    [issues, categoryFilter, statusFilter, sortBy]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsSearching(true);
    debouncedSearch(term);
  };

  // Apply all filters
  const applyFilters = (
    issues: Issue[],
    category: IssueCategory | "all",
    status: IssueStatus | "all",
    sortOption: SortOption,
    search: string
  ) => {
    let result = [...issues];

    // Apply category filter
    if (category !== "all") {
      result = result.filter(issue => issue.category === category);
    }

    // Apply status filter
    if (status !== "all") {
      result = result.filter(issue => issue.status === status);
    }

    // Apply search term
    if (search) {
      const lowercasedTerm = search.toLowerCase();
      result = result.filter(issue => 
        issue.title.toLowerCase().includes(lowercasedTerm) || 
        issue.description.toLowerCase().includes(lowercasedTerm) ||
        issue.location.toLowerCase().includes(lowercasedTerm)
      );
    }

    // Apply sorting
    if (sortOption === "newest") {
      result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortOption === "votes") {
      result.sort((a, b) => b.votes - a.votes);
    } else if (sortOption === "location") {
      // Sort by location (alphabetically)
      result.sort((a, b) => a.location.localeCompare(b.location));
    }

    setFilteredIssues(result);
    updatePagination(result);
  };

  // Update pagination
  const updatePagination = (issues: Issue[]) => {
    const total = Math.ceil(issues.length / itemsPerPage);
    setTotalPages(total === 0 ? 1 : total);
    
    // Ensure current page is valid
    const validPage = Math.min(page, total === 0 ? 1 : total);
    if (validPage !== page) {
      setPage(validPage);
    }
    
    // Update displayed issues
    const startIndex = (validPage - 1) * itemsPerPage;
    setDisplayedIssues(issues.slice(startIndex, startIndex + itemsPerPage));
  };

  // Reset filters
  const resetFilters = () => {
    setCategoryFilter("all");
    setStatusFilter("all");
    setSearchTerm("");
    setSortBy("newest");
    applyFilters(issues, "all", "all", "newest", "");
  };

  // Apply filters when issues or filter settings change
  useEffect(() => {
    if (issues && issues.length > 0) {
      applyFilters(issues, categoryFilter, statusFilter, sortBy, searchTerm);
    }
  }, [issues, categoryFilter, statusFilter, sortBy]);

  // Update displayed issues when page changes
  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage;
    setDisplayedIssues(filteredIssues.slice(startIndex, startIndex + itemsPerPage));
  }, [filteredIssues, page]);

  // Update displayed issues with voted status
  useEffect(() => {
    const fetchVotedStatus = async () => {
      const updated = await Promise.all(
        displayedIssues.map(async (issue) => ({
          ...issue,
          hasVoted: await hasVotedOnIssue(issue.id),
        }))
      );
      setDisplayedIssuesWithVoted(updated);
    };
    if (displayedIssues.length > 0) {
      fetchVotedStatus();
    } else {
      setDisplayedIssuesWithVoted([]);
    }
  }, [displayedIssues]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to issue details
  const navigateToIssue = (id: string) => {
    navigate(`/issues/${id}`);
  };

  // Show active filters count
  const activeFiltersCount = [
    categoryFilter !== "all" ? 1 : 0,
    statusFilter !== "all" ? 1 : 0,
    sortBy !== "newest" ? 1 : 0
  ].reduce((sum, val) => sum + val, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 md:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Community Issues</h1>
              <p className="text-muted-foreground">
                Explore and support civic issues in your community
              </p>
            </div>
            <Button variant="outline" className="self-start" asChild>
              <a href="/report">Report New Issue</a>
            </Button>
          </div>
          
          {/* Search and Filter Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 mb-8 shadow-sm border">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search issues by title, description or location..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-r-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Mobile Filters Toggle */}
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="lg:hidden self-end"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
                
                {/* Desktop Filters */}
                <div className={`flex flex-col sm:flex-row gap-3 lg:flex ${showMobileFilters ? 'block' : 'hidden lg:flex'}`}>
                  {/* Category Filter */}
                  <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as IssueCategory | "all")}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Filter by category</SelectLabel>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="road">Road</SelectItem>
                        <SelectItem value="water">Water</SelectItem>
                        <SelectItem value="sanitation">Sanitation</SelectItem>
                        <SelectItem value="electricity">Electricity</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as IssueStatus | "all")}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Filter by status</SelectLabel>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  
                  {/* Sort Order */}
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Sort by</SelectLabel>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="votes">Most Voted</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  
                  {/* Reset Filters */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={resetFilters} 
                    className="ml-auto flex items-center gap-1"
                    disabled={categoryFilter === "all" && statusFilter === "all" && sortBy === "newest" && !searchTerm}
                  >
                    <X className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Active Filters */}
            {(categoryFilter !== "all" || statusFilter !== "all" || sortBy !== "newest" || searchTerm) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                {categoryFilter !== "all" && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <Filter className="h-3 w-3" />
                    Category: <span className="capitalize">{categoryFilter}</span>
                    <button 
                      className="ml-1 hover:text-primary-foreground" 
                      onClick={() => setCategoryFilter("all")}
                      aria-label="Remove category filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {statusFilter !== "all" && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <Filter className="h-3 w-3" />
                    Status: 
                    <span>{statusFilter === "in-progress" ? "In Progress" : 
                           statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                    <button 
                      className="ml-1 hover:text-primary-foreground" 
                      onClick={() => setStatusFilter("all")}
                      aria-label="Remove status filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {sortBy !== "newest" && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {sortBy === "votes" ? (
                      <ArrowUpCircle className="h-3 w-3" />
                    ) : (
                      <MapPin className="h-3 w-3" />
                    )}
                    Sorted by: {sortBy === "votes" ? "Most Votes" : sortBy === "location" ? "Location" : sortBy}
                    <button 
                      className="ml-1 hover:text-primary-foreground" 
                      onClick={() => setSortBy("newest")}
                      aria-label="Reset sort order"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {searchTerm && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <Search className="h-3 w-3" />
                    Search: {searchTerm.length > 20 ? `${searchTerm.substring(0, 20)}...` : searchTerm}
                    <button 
                      className="ml-1 hover:text-primary-foreground" 
                      onClick={() => setSearchTerm("")}
                      aria-label="Clear search"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Showing {filteredIssues.length} {filteredIssues.length === 1 ? "issue" : "issues"}
              {isLoading && (
                <span className="inline-flex items-center ml-2">
                  <div className="animate-spin h-3 w-3 border-2 border-primary border-r-transparent rounded-full mr-1"></div>
                  Loading...
                </span>
              )}
            </p>
          </div>
          
          {/* Issue Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <Skeleton className="h-36 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <div className="flex justify-between mt-4">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-lg border border-dashed">
              <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <X className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Error Loading Issues</h3>
              <p className="text-center text-muted-foreground mb-6">
                There was a problem loading the issues. Please try again later.
              </p>
              <Button onClick={() => queryClient.invalidateQueries({queryKey: ['issues']})}>Retry</Button>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-lg border border-dashed">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Issues Found</h3>
              <p className="text-center text-muted-foreground mb-6">
                {searchTerm || categoryFilter !== "all" || statusFilter !== "all" ?
                  "We couldn't find any issues matching your current filters." :
                  "There aren't any issues reported yet. Be the first to report one!"
                }
              </p>
              {(searchTerm || categoryFilter !== "all" || statusFilter !== "all") ? (
                <Button onClick={resetFilters}>Reset All Filters</Button>
              ) : (
                <Button asChild>
                  <a href="/report">Report an Issue</a>
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedIssuesWithVoted.map(issue => (
                  <IssueCard 
                    key={issue.id} 
                    issue={issue}
                    hasVoted={issue.hasVoted}
                    onClick={() => navigateToIssue(issue.id)}
                    onVote={async () => {
                      await handleVote(issue.id);
                      setDisplayedIssuesWithVoted(prev =>
                        prev.map(i =>
                          i.id === issue.id ? { ...i, hasVoted: true, votes: i.votes + 1 } : i
                        )
                      );
                    }}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }).map((_, i) => {
                        // Show first, last, and pages around current
                        if (
                          i === 0 || 
                          i === totalPages - 1 || 
                          (i >= page - 2 && i <= page)
                        ) {
                          return (
                            <PaginationItem key={i}>
                              <PaginationLink 
                                isActive={page === i + 1}
                                onClick={() => setPage(i + 1)}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        // Show ellipsis for skipped pages
                        if (i === 1 && page > 3) {
                          return <PaginationItem key="ellipsis-1">...</PaginationItem>;
                        }
                        if (i === totalPages - 2 && page < totalPages - 2) {
                          return <PaginationItem key="ellipsis-2">...</PaginationItem>;
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
          
          {/* Back to Top Button (shows when scrolled down) */}
          <button 
            className="fixed bottom-6 right-6 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all transform hover:scale-110 z-10 hidden" 
            id="back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          </button>
        </div>
      </main>
      
      <Footer />
      
      {/* Confetti animation styles */}
      <style>{`
        .confetti {
          position: fixed;
          width: 8px;
          height: 8px;
          z-index: 1000;
          animation: confetti-fall linear forwards;
          pointer-events: none;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        
        /* Show back to top button when scrolled down */
        @media (min-width: 768px) {
          html.scrolled #back-to-top {
            display: block;
          }
        }
      `}</style>
      
      {/* Script for back to top button visibility */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
              document.documentElement.classList.add('scrolled');
            } else {
              document.documentElement.classList.remove('scrolled');
            }
          });
        `
      }} />
    </div>
  );
};

export default BrowseIssues;
