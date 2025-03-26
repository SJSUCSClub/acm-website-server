import React, { useState, useEffect } from 'react';
import { useQuery } from '@/hooks/useFetch';
import { paths } from '@/types/schema.v1';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronsUpDown, X } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type MajorsResponse = paths['/v1/majors']['get']['responses']['200']['content']['application/json'];
type EnumResponse =
  paths['/v1/enums/{enumType}']['get']['responses']['200']['content']['application/json'];
type UsersResponse =
  paths['/v1/users']['get']['responses']['200']['content']['application/json'] & {
    total: number;
  };

interface UserFilter {
  name: string;
  education_level: ('Undergraduate' | 'Graduate')[];
  major: string[];
  role: ('user' | 'member' | 'admin')[];
  paid: ('Semester' | 'Annual')[];
}

const Users = () => {
  const [filters, setFilters] = useState<UserFilter>({
    name: '',
    education_level: [],
    major: [],
    role: [],
    paid: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [nameSearch, setNameSearch] = useState('');

  // Debounce name search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Convert to lowercase before sending to API to ensure case-insensitive search
      setFilters((prev) => ({ ...prev, name: nameSearch.toLowerCase() }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [nameSearch]);

  // Handle name search change
  const handleNameSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Store search value as is - backend handles case insensitivity
    setNameSearch(e.target.value);
  };

  // Fetch options from API endpoints with proper query configuration
  const { data: majorsData } = useQuery('get', '/v1/majors', {
    options: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 30000
    }
  });

  const { data: educationLevelData } = useQuery('get', '/v1/enums/{enumType}', {
    params: {
      path: {
        enumType: 'education_level_enum'
      }
    },
    options: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 30000
    }
  });

  const { data: roleData } = useQuery('get', '/v1/enums/{enumType}', {
    params: {
      path: {
        enumType: 'user_role_enum'
      }
    },
    options: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 30000
    }
  });

  const { data: membershipTermData } = useQuery('get', '/v1/enums/{enumType}', {
    params: {
      path: {
        enumType: 'membership_term_enum'
      }
    },
    options: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 30000
    }
  });

  // Extract options from API responses with type assertions
  const majorOptions = (majorsData as MajorsResponse)?.majors.map((major) => major.name) || [];
  const educationLevelOptions = (educationLevelData as EnumResponse)?.types || [];
  const roleOptions = (roleData as EnumResponse)?.types || [];
  const paidOptions = (membershipTermData as EnumResponse)?.types || [];

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Create a wrapper function that converts array values into the correct format for the API
  const createArrayParam = <T extends string>(values: T[]): T | T[] | undefined => {
    return values.length > 0 ? values : undefined;
  };

  // Construct the query parameters
  const queryParams = {
    name: filters.name ? filters.name.toLowerCase() : undefined,
    page: currentPage.toString(),
    per_page: itemsPerPage.toString()
  };

  // Use the useQuery hook with type-safe parameters
  const { data, isLoading, error } = useQuery('get', '/v1/users', {
    params: {
      query: {
        ...queryParams,
        'education_level[]': createArrayParam(filters.education_level),
        'major[]': createArrayParam(filters.major),
        'role[]': createArrayParam(filters.role),
        'paid[]': createArrayParam(filters.paid)
      }
    },
    options: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 30000
    }
  });

  // Update totalPages when data changes
  React.useEffect(() => {
    if (data) {
      setTotalPages(Math.ceil((data as UsersResponse).total / itemsPerPage));
    }
  }, [data, itemsPerPage]);

  // Handle changing items per page
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const users = (data as UsersResponse)?.users || [];

  const handleFilterChange = (field: keyof UserFilter, value: string | string[]) => {
    setCurrentPage(1); // Reset to first page when filters change

    if (field === 'name') {
      setFilters((prev) => ({
        ...prev,
        [field]: value as string
      }));
      setNameSearch(value as string);
    } else {
      const arrayValue = Array.isArray(value) ? value : [value];
      setFilters((prev) => ({
        ...prev,
        [field]: arrayValue
      }));
    }
  };

  const removeFilter = (field: keyof UserFilter, value?: string) => {
    if (field === 'name') {
      setFilters((prev) => ({ ...prev, name: '' }));
      setNameSearch('');
    } else if (value) {
      setFilters((prev) => ({
        ...prev,
        [field]: prev[field].filter((v) => v !== value)
      }));
    }
    setCurrentPage(1); // Reset to first page when removing filters
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      education_level: [],
      major: [],
      role: [],
      paid: []
    });
    setNameSearch('');
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const FilterDropdown = ({
    label,
    options,
    value,
    onChange
  }: {
    label: string;
    options: string[];
    value: string[];
    onChange: (values: string[]) => void;
  }) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);

    // Update filtered options when options prop changes
    React.useEffect(() => {
      setFilteredOptions(options);
    }, [options]);

    // Fuzzy search implementation
    const handleSearch = (input: string) => {
      setSearchQuery(input);
      if (!input.trim()) {
        setFilteredOptions(options);
        return;
      }

      // Simple fuzzy search
      const fuzzySearch = (query: string, text: string) => {
        // Convert both query and text to lowercase for case-insensitive comparison
        query = query.toLowerCase();
        text = text.toLowerCase();

        // If query is a substring of text, it's a match
        if (text.includes(query)) return true;

        // Fuzzy matching logic
        let queryIndex = 0;
        for (let i = 0; i < text.length && queryIndex < query.length; i++) {
          if (query[queryIndex] === text[i]) {
            queryIndex++;
          }
        }

        // If all characters in query were found in order in text
        return queryIndex === query.length;
      };

      const filtered = options.filter((option) => fuzzySearch(input, option));
      setFilteredOptions(filtered);
    };

    return (
      <div className="w-full">
        <label className="block text-sm mb-1">{label}</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {value.length === 0 ? `Select ${label}` : `${value.length} selected`}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              {options.length > 10 && (
                <div className="px-2 pt-2">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                    <svg
                      className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    {searchQuery && (
                      <button
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-500"
                        onClick={() => {
                          setSearchQuery('');
                          setFilteredOptions(options);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
              <CommandList className={options.length > 10 ? 'max-h-[300px] overflow-auto' : ''}>
                {filteredOptions.length === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-500">No results found</div>
                ) : (
                  <CommandGroup>
                    {filteredOptions.map((option) => (
                      <CommandItem
                        key={option}
                        onSelect={() => {
                          const newValue = value.includes(option)
                            ? value.filter((v) => v !== option)
                            : [...value, option];
                          onChange(newValue);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={value.includes(option)} />
                          <span>{option}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  // Function to render active filter chips
  const renderFilterChips = () => {
    const activeFilters = [];

    if (filters.name) {
      activeFilters.push(
        <div
          key="name"
          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-900"
        >
          <span>Name: {filters.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 -mr-1 rounded-full p-1 hover:bg-gray-200"
            onClick={() => removeFilter('name')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    filters.education_level.forEach((level) => {
      activeFilters.push(
        <div
          key={`edu-${level}`}
          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-900"
        >
          <span>Education: {level}</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 -mr-1 rounded-full p-1 hover:bg-gray-200"
            onClick={() => removeFilter('education_level', level)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    });

    filters.major.forEach((major) => {
      activeFilters.push(
        <div
          key={`major-${major}`}
          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-900"
        >
          <span>Major: {major}</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 -mr-1 rounded-full p-1 hover:bg-gray-200"
            onClick={() => removeFilter('major', major)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    });

    filters.role.forEach((role) => {
      activeFilters.push(
        <div
          key={`role-${role}`}
          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-900"
        >
          <span>Role: {role}</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 -mr-1 rounded-full p-1 hover:bg-gray-200"
            onClick={() => removeFilter('role', role)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    });

    filters.paid.forEach((term) => {
      activeFilters.push(
        <div
          key={`paid-${term}`}
          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-900"
        >
          <span>Membership: {term}</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 -mr-1 rounded-full p-1 hover:bg-gray-200"
            onClick={() => removeFilter('paid', term)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    });

    return activeFilters.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-4">{activeFilters}</div>
    ) : null;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Users Management</h1>

      <div className="mb-6 p-4 border rounded shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium">Filters</h2>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center gap-2 text-black border-black hover:bg-black/5"
            disabled={
              !filters.name &&
              !filters.education_level.length &&
              !filters.major.length &&
              !filters.role.length &&
              !filters.paid.length
            }
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={nameSearch}
              onChange={handleNameSearchChange}
              placeholder="Search by name"
            />
          </div>

          <FilterDropdown
            label="Education Level"
            options={educationLevelOptions}
            value={filters.education_level}
            onChange={(values) => handleFilterChange('education_level', values)}
          />

          <FilterDropdown
            label="Major"
            options={majorOptions}
            value={filters.major}
            onChange={(values) => handleFilterChange('major', values)}
          />

          <FilterDropdown
            label="Role"
            options={roleOptions}
            value={filters.role}
            onChange={(values) => handleFilterChange('role', values)}
          />

          <FilterDropdown
            label="Membership Term"
            options={paidOptions}
            value={filters.paid}
            onChange={(values) => handleFilterChange('paid', values)}
          />
        </div>

        {renderFilterChips()}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">Error loading users data</div>
      ) : users.length > 0 ? (
        <>
          <div className="w-full overflow-x-auto border rounded-md">
            <table className="w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Education
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Major
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membership
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-4 text-sm">{user.name}</td>
                    <td className="px-3 md:px-6 py-4 text-sm overflow-hidden text-ellipsis">
                      {user.email}
                    </td>
                    <td className="px-3 md:px-6 py-4 text-sm">{user.role}</td>
                    <td className="px-3 md:px-6 py-4 text-sm">{user.education_level}</td>
                    <td className="px-3 md:px-6 py-4 text-sm overflow-hidden text-ellipsis">
                      {user.major}
                    </td>
                    <td className="px-3 md:px-6 py-4 text-sm">{user.paid || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 items-center gap-4 sm:gap-0">
            <div className="flex justify-center sm:justify-start items-center space-x-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">Items per page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue placeholder="20" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isWithinRange =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!isWithinRange) {
                      if (page === 2 || page === totalPages - 1) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    }

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
            <div className="hidden sm:block"></div> {/* Empty div for the 3-column grid */}
          </div>
        </>
      ) : (
        <div>No users found</div>
      )}
    </div>
  );
};

export default Users;
