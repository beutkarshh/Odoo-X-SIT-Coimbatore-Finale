import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

export function SearchFilter({
  data = [],
  searchFields = [],
  filterConfig = [],
  onFilterChange,
  placeholder = 'Search...',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = field.split('.').reduce((obj, key) => obj?.[key], item);
          return String(value || '').toLowerCase().includes(query);
        })
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([filterKey, selectedValues]) => {
      if (selectedValues && selectedValues.length > 0) {
        result = result.filter(item => {
          const value = filterKey.split('.').reduce((obj, key) => obj?.[key], item);
          return selectedValues.includes(value);
        });
      }
    });

    return result;
  }, [data, searchQuery, activeFilters, searchFields]);

  // Notify parent of filtered data changes
  useEffect(() => {
    onFilterChange?.(filteredData);
  }, [filteredData]);

  const handleFilterChange = (filterKey, value, checked) => {
    setActiveFilters(prev => {
      const current = prev[filterKey] || [];
      let updated;
      if (checked) {
        updated = [...current, value];
      } else {
        updated = current.filter(v => v !== value);
      }
      return {
        ...prev,
        [filterKey]: updated.length > 0 ? updated : undefined,
      };
    });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setActiveFilters({});
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v && v.length > 0).length;
  const hasActiveFilters = searchQuery || activeFilterCount > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        {filterConfig.map((filter) => {
          const selectedValues = activeFilters[filter.key] || [];
          const hasSelection = selectedValues.length > 0;
          
          return (
            <DropdownMenu key={filter.key}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant={hasSelection ? "default" : "outline"} 
                  size="sm" 
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {filter.label}
                  {hasSelection && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                      {selectedValues.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filter.options.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleFilterChange(filter.key, option.value, checked)
                    }
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {Object.entries(activeFilters).map(([filterKey, values]) => {
            if (!values || values.length === 0) return null;
            const filterConfig_ = filterConfig.find(f => f.key === filterKey);
            return values.map(value => {
              const option = filterConfig_?.options.find(o => o.value === value);
              return (
                <Badge key={`${filterKey}-${value}`} variant="secondary" className="gap-1">
                  {filterConfig_?.label}: {option?.label || value}
                  <button onClick={() => handleFilterChange(filterKey, value, false)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            });
          })}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredData.length} of {data.length} results
      </div>
    </div>
  );
}

export default SearchFilter;
