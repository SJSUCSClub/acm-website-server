import Spinner from '@/components/atoms/spinner';
import { Input } from '@/components/ui/input';
import { useQuery } from '@/hooks/useFetch';
import { Search } from 'lucide-react';
import React, { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import debounce from '@/utils/debounce';
import { useNavigate } from '@tanstack/react-router';
import { FileRouteTypes } from '@/routeTree.gen';
import { paths } from '@/types/schema.v1';

type Result =
  paths['/v1/search']['get']['responses']['200']['content']['application/json']['results'][number];
const typeRoutes: Record<Result['type'], FileRouteTypes['to'] | null> = {
  event: '/events/$eventId',
  project: '/projects/$projectId',
  company: null
};

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { data, error, isLoading, refetch } = useQuery('get', '/v1/search', {
    params: {
      query: {
        query
      }
    }
  });

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, isFocused]);

  const debouncedFetch = useCallback(debounce(refetch, 5000), []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    debouncedFetch();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isFocused || !query || data?.results.length === 0) return;

    if (data) {
      console.log(e.key);
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prevIndex) =>
            prevIndex < data.results.length - 1 ? prevIndex + 1 : prevIndex
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            setQuery('');
            handleNavigate(data.results[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsFocused(false);
          break;
        default:
          break;
      }
    }
  };

  const handleNavigate = (item: Result) => {
    const route = typeRoutes[item.type];
    const param = item.type === 'event' ? 'eventId' : 'projectId';
    if (route) {
      navigate({ to: route, params: { [param]: item.id } });
    }
  };

  return (
    <div className="relative flex items-center border border-gray-300 rounded-md pl-4 focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-blue-500 focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-blue-500 w-full">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input
        required={false}
        onFocus={() => setIsFocused(true)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        type="search"
        placeholder="Search..."
        value={query}
        className="w-full border-none focus-visible:ring-0 font-lg"
        role="combobox"
        aria-expanded={isFocused && query.length > 0}
        aria-autocomplete="list"
        aria-controls="search-results"
      />
      {isFocused && query && (
        <div
          id="search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-[60vh] overflow-y-auto"
        >
          {isLoading ? (
            <div className="px-4 py-3 flex justify-center">
              <Spinner className="h-4 w-4" />
            </div>
          ) : !data || error ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">Error loading results</div>
          ) : data.results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            <div className="py-2">
              {data.results.map((result, index) => (
                <div
                  key={index}
                  role="option"
                  aria-selected={selectedIndex === index}
                  tabIndex={0}
                  className={`px-4 py-2 cursor-pointer flex items-center gap-3 ${
                    selectedIndex === index ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    setQuery('');
                    setIsFocused(false);
                    handleNavigate(result);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.name}</p>
                    <p className="text-xs text-muted-foreground">{result.type.toUpperCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { SearchBar };
