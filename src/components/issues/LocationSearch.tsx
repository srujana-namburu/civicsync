
import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2, MapPin } from 'lucide-react';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

export interface LocationOption {
  name: string;
  lat: number;
  lng: number;
}

interface LocationSearchProps {
  value?: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ value = '', onChange }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<LocationOption[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 3) {
      setOptions([]);
      return;
    }
    
    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedSearchTerm)}.json?access_token=pk.eyJ1IjoibmFuaS0wMDciLCJhIjoiY21hYnppeG5nMjV6NTJsc2c3MDhpeHhtMiJ9.TQ5dcosh2XePcIgpSH8ZKQ&types=place,address&limit=5`
        );
        
        if (!response.ok) throw new Error("Failed to fetch locations");
        
        const data = await response.json();
        const mappedOptions = data.features.map((feature: any) => ({
          name: feature.place_name,
          lat: feature.center[1],
          lng: feature.center[0]
        }));
        
        setOptions(mappedOptions);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLocations();
  }, [debouncedSearchTerm]);
  
  const handleSelect = (location: LocationOption) => {
    setSelectedLocation(location);
    onChange(location.name, location.lat, location.lng);
    setOpen(false);
  };
  
  // Initialize the field with existing value
  useEffect(() => {
    if (value && !selectedLocation) {
      setSearchTerm(value);
    }
  }, [value]);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
        >
          {value ? (
            <div className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{value}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Search for a location...</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]">
        <Command>
          <CommandInput 
            placeholder="Search location..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="h-9"
          />
          <CommandList>
            {isLoading && (
              <div className="py-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground pt-2">Searching locations...</p>
              </div>
            )}
            
            {!isLoading && options.length === 0 && searchTerm.length > 0 && (
              <CommandEmpty>No locations found</CommandEmpty>
            )}
            
            {!isLoading && options.length > 0 && (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={`${option.lat}-${option.lng}`}
                    value={option.name}
                    onSelect={() => handleSelect(option)}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    <span className="truncate">{option.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {searchTerm.length < 3 && !isLoading && (
              <div className="py-6 px-2 text-center text-sm text-muted-foreground">
                Type at least 3 characters to search for locations
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default LocationSearch;
