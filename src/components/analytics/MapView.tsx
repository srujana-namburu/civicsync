import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronDown, 
  Search, 
  X, 
  Layers, 
  LocateFixed,
  Filter,
  ChevronUp,
  Map as MapIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/issues/StatusBadge";
import CategoryIcon from "@/components/issues/CategoryIcon";
import { IssueCategory, IssueStatus } from "@/types";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Helper function for debouncing
const debounce = <F extends (...args: any[]) => any>(
  fn: F,
  delay: number
) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: Parameters<F>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};

interface MapIssue {
  id: string;
  title: string;
  lat: number;
  lng: number;
  category: IssueCategory;
  status: IssueStatus;
  votes: number;
}

interface MapViewProps {
  issues: MapIssue[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  focusIssueId?: string | null;
}

// Set Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoibmFuaS0wMDciLCJhIjoiY21hYnppeG5nMjV6NTJsc2c3MDhpeHhtMiJ9.TQ5dcosh2XePcIgpSH8ZKQ';

const MapView: React.FC<MapViewProps> = ({ 
  issues, 
  selectedCategory,
  setSelectedCategory,
  focusIssueId
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Record<string, boolean>>({
    pending: true,
    "in-progress": true,
    resolved: false
  });
  const [categoryFilter, setCategoryFilter] = useState<Record<string, boolean>>({
    road: true,
    water: true,
    sanitation: true,
    electricity: true,
    other: true
  });
  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [mapStyle, setMapStyle] = useState("light-v11");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  
  // Define filteredIssues before using it
  const filteredIssues = issues.filter(issue => {
    // Apply search filter
    const matchesSearch = searchQuery === "" || 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter[issue.status];
    
    // Apply category filter
    const matchesCategory = categoryFilter[issue.category];
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Find the issue to focus on if focusIssueId is provided
  const focusIssue = focusIssueId ? issues.find(issue => issue.id === focusIssueId) : null;
  
  // Update category filters when selectedCategory changes from parent
  useEffect(() => {
    if (selectedCategory) {
      const newCategoryFilter = {
        road: selectedCategory === "road",
        water: selectedCategory === "water",
        sanitation: selectedCategory === "sanitation",
        electricity: selectedCategory === "electricity",
        other: selectedCategory === "other"
      };
      setCategoryFilter(newCategoryFilter);
    } else if (selectedCategory === null && 
              Object.values(categoryFilter).filter(Boolean).length === 1) {
      // Reset all filters if only one is selected
      setCategoryFilter({
        road: true,
        water: true,
        sanitation: true,
        electricity: true,
        other: true
      });
    }
  }, [selectedCategory]);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
      center: [0, 20], // Default center (will be adjusted based on issues)
      zoom: 1.5
    });
    
    // Add navigation controls
    newMap.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );
    
    map.current = newMap;
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Update map style when theme changes
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}`);
    }
  }, [mapStyle]);
  
  // Update markers when issues, filters, or selectedIssue change
  useEffect(() => {
    if (!map.current) return;
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Create new markers for filtered issues
    const bounds = new mapboxgl.LngLatBounds();
    let hasValidBounds = false;
    
    filteredIssues.forEach(issue => {
      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'marker-container';
      
      // Style the marker based on category
      const color = 
        issue.category === 'road' ? '#F59E0B' : 
        issue.category === 'water' ? '#2563EB' :
        issue.category === 'sanitation' ? '#22C55E' :
        issue.category === 'electricity' ? '#FACC15' :
        '#6B7280';
      
      // Highlight the selected issue with a special marker
      const isSelected = selectedIssue && issue.id === selectedIssue.id;
      markerElement.innerHTML = `
        <div class="w-6 h-6 rounded-full ${isSelected ? 'ring-4 ring-primary scale-125' : ''} bg-white flex items-center justify-center border-2" 
             style="border-color: ${color}">
          <div class="text-xs">${getCategoryIconText(issue.category)}</div>
        </div>
      `;
      markerElement.style.cursor = 'pointer';
      
      // Create and add the marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([issue.lng, issue.lat]);

      // If this is the selected issue, add a popup
      if (isSelected) {
        const popupNode = document.createElement('div');
        popupNode.innerHTML = `
          <div style="min-width:180px;max-width:220px;">
            <strong>${issue.title}</strong><br/>
            <span style="font-size:12px;">${issue.category} | ${issue.status}</span><br/>
            <span style="font-size:12px; font-weight: 500; color: #2563EB;">${issue.votes} vote${issue.votes === 1 ? '' : 's'}</span><br/>
            <button id="view-details-btn" style="margin-top:6px;padding:4px 8px;background:#2563EB;color:white;border:none;border-radius:4px;cursor:pointer;">View Details</button>
          </div>
        `;
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setDOMContent(popupNode);
        marker.setPopup(popup);
        setTimeout(() => {
          popup.addTo(map.current!);
          // Add click handler for the button
          const btn = popupNode.querySelector('#view-details-btn');
          if (btn) {
            btn.addEventListener('click', () => {
              navigate(`/issues/${issue.id}`);
            });
          }
        }, 0);
      }

      // Marker click: select and focus this issue
      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedIssue(issue);
        map.current!.flyTo({ center: [issue.lng, issue.lat], zoom: 14, essential: true });
      });
      
      marker.addTo(map.current!);
      markers.current.push(marker);
      
      // Extend bounds
      if (issue.lat && issue.lng) {
      bounds.extend([issue.lng, issue.lat]);
      hasValidBounds = true;
      }
    });

    // Fit map to bounds if there are issues
    if (hasValidBounds && filteredIssues.length > 1) {
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 12 });
    }
  }, [filteredIssues, selectedIssue]);
  
  const getCategoryIconText = (category: IssueCategory) => {
    switch (category) {
      case 'road': return 'R';
      case 'water': return 'W';
      case 'sanitation': return 'S';
      case 'electricity': return 'E';
      case 'other': return 'O';
    }
  };
  
  const handleSearchChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, 300);
  
  const clearSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
      setSearchQuery("");
    }
  };
  
  const resetFilters = () => {
    setCategoryFilter({
      road: true,
      water: true,
      sanitation: true,
      electricity: true,
      other: true
    });
    setStatusFilter({
      pending: true,
      "in-progress": true,
      resolved: false
    });
    setSelectedCategory(null);
    clearSearch();
  };
  
  const handleMapClick = () => {
    setSelectedIssue(null);
  };
  
  const handleIssueClick = (issue: MapIssue) => {
    setSelectedIssue(issue);
    // Center map on the selected issue
    if (map.current) {
      map.current.flyTo({
        center: [issue.lng, issue.lat],
        zoom: 14,
        essential: true
      });
    }
  };
  
  const handleViewDetails = (issue: MapIssue) => {
    navigate(`/issues/${issue.id}`);
  };
  
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategoryFilter = {
      ...categoryFilter,
      [category]: checked
    };
    setCategoryFilter(newCategoryFilter);
    
    // Update parent's selectedCategory if only one category is selected
    const selectedCategories = Object.entries(newCategoryFilter)
      .filter(([_, isSelected]) => isSelected)
      .map(([cat]) => cat);
    
    if (selectedCategories.length === 1) {
      setSelectedCategory(selectedCategories[0]);
    } else {
      setSelectedCategory(null);
    }
  };

  // Get user location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation && map.current) {
      navigator.geolocation.getCurrentPosition(position => {
        const { longitude, latitude } = position.coords;
        map.current!.flyTo({
          center: [longitude, latitude],
          zoom: 13,
          essential: true
        });
      }, error => {
        console.error("Error getting location:", error);
      });
    }
  };

  return (
    <div className="flex h-[600px] relative">
      {/* Sidebar */}
      <div 
        className={`${
          showSidebar 
            ? "w-80 translate-x-0" 
            : "w-0 -translate-x-full"
        } h-full bg-background border-r overflow-hidden transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b">
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search issues..."
              className="pl-9 pr-9"
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Filters</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs"
              onClick={resetFilters}
            >
              Reset all
            </Button>
          </div>
          
          <div className="mb-3">
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">Categories</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries({
                road: "Road",
                water: "Water",
                sanitation: "Sanitation",
                electricity: "Electricity",
                other: "Other"
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${key}`}
                    checked={categoryFilter[key]}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(key, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`category-${key}`}
                    className="flex items-center text-sm cursor-pointer"
                  >
                    <CategoryIcon category={key as IssueCategory} size={14} />
                    <span className="ml-1">{label}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">Status</h4>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries({
                pending: "Pending",
                "in-progress": "In Progress",
                resolved: "Resolved"
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${key}`}
                    checked={statusFilter[key]}
                    onCheckedChange={(checked) => 
                      setStatusFilter(prev => ({ ...prev, [key]: checked === true }))
                    }
                  />
                  <Label
                    htmlFor={`status-${key}`}
                    className="text-sm cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Issues ({filteredIssues.length})</h3>
              <div className="text-xs text-muted-foreground">
                {filteredIssues.length} of {issues.length} shown
              </div>
            </div>
            
            <div className="space-y-2">
              {filteredIssues.map(issue => (
                <div
                  key={issue.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedIssue?.id === issue.id 
                      ? "border-primary bg-primary/5" 
                      : "hover:bg-muted"
                  }`}
                  onClick={() => handleIssueClick(issue)}
                >
                  <div className="flex items-start gap-2">
                    <CategoryIcon category={issue.category} />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">{issue.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={issue.status} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          {issue.votes} votes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredIssues.length === 0 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No issues match the current filters
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" onClick={handleMapClick} />
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <Button
            variant="outline"
            size="icon"
            className="bg-background shadow-md h-8 w-8"
            onClick={handleGetCurrentLocation}
          >
            <LocateFixed size={16} />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-background shadow-md h-8 w-8"
              >
                <Layers size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-32 p-2" align="end">
              <div className="space-y-1">
                <Button
                  variant={mapStyle === "light-v11" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => setMapStyle("light-v11")}
                >
                  Light
                </Button>
                <Button
                  variant={mapStyle === "dark-v11" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => setMapStyle("dark-v11")}
                >
                  Dark
                </Button>
                <Button
                  variant={mapStyle === "satellite-v9" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => setMapStyle("satellite-v9")}
                >
                  Satellite
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Toggle Sidebar Button */}
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 left-4 bg-background shadow-md h-8 px-2 z-10"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <Filter size={16} className="mr-1" />
          {showSidebar ? "Hide Filters" : "Show Filters"}
        </Button>
        
        {/* Back to Top Button */}
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            variant="outline"
            size="icon"
            className="bg-background shadow-md rounded-full h-10 w-10"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ChevronUp size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapView;
