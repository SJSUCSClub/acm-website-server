import React, { useState } from 'react';
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

  // Fetch options from API endpoints
  const { data: majorsData } = useQuery('get', '/v1/majors', {});
  const { data: educationLevelData } = useQuery('get', '/v1/enums/{enumType}', {
    params: {
      path: {
        enumType: 'education_level_enum'
      }
    }
  });
  const { data: roleData } = useQuery('get', '/v1/enums/{enumType}', {
    params: {
      path: {
        enumType: 'user_role_enum'
      }
    }
  });
  const { data: membershipTermData } = useQuery('get', '/v1/enums/{enumType}', {
    params: {
      path: {
        enumType: 'membership_term_enum'
      }
    }
  });

  // Extract options from API responses with type assertions
  const majorOptions = (majorsData as MajorsResponse)?.majors.map((major) => major.name) || [];
  const educationLevelOptions = (educationLevelData as EnumResponse)?.types || [];
  const roleOptions = (roleData as EnumResponse)?.types || [];
  const paidOptions = (membershipTermData as EnumResponse)?.types || [];

  // Update the useQuery hook to include pagination parameters
  const { data, isLoading, error } = useQuery('get', '/v1/users', {
    params: {
      query: {
        name: filters.name || undefined,
        'education_level[]':
          filters.education_level.length > 0 ? filters.education_level : undefined,
        'major[]': filters.major.length > 0 ? filters.major : undefined,
        'role[]': filters.role.length > 0 ? filters.role : undefined,
        'paid[]': filters.paid.length > 0 ? filters.paid : undefined,
        page: currentPage,
        per_page: itemsPerPage
      }
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
    if (field === 'name') {
      setFilters((prev) => ({
        ...prev,
        [field]: value as string
      }));
    } else {
      const arrayValue = Array.isArray(value) ? value : [value];
      setFilters((prev) => ({
        ...prev,
        [field]: arrayValue
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      education_level: [],
      major: [],
      role: [],
      paid: []
    });
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
              <CommandList>
                <CommandGroup>
                  {options.map((option) => (
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
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
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
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
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
