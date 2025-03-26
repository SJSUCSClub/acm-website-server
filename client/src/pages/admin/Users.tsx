import React, { useState, useEffect } from 'react';

// Import individual components or check if there's a UI library available in the project
// For now, using div elements as placeholders
// Uncomment and adjust the import if these components exist in your project
// import { Card, Input, Select, Spinner, Table } from '@/components/ui';

// These enums should match what's in the database
const educationLevelOptions = [
  'FRESHMAN',
  'SOPHOMORE',
  'JUNIOR',
  'SENIOR',
  'MASTERS',
  'PHD',
  'ALUMNI'
];
const roleOptions = ['user', 'member', 'admin'];
const paidOptions = ['FALL_2023', 'SPRING_2024', 'ACADEMIC_YEAR_2023_2024'];

interface UserFilter {
  name: string;
  education_level: string[];
  major: string[];
  role: string[];
  paid: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  education_level: string;
  major: string;
  paid?: string;
}

const Users = () => {
  const [filters, setFilters] = useState<UserFilter>({
    name: '',
    education_level: [],
    major: [],
    role: [],
    paid: []
  });
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Construct API URL with query parameters
  const buildQueryUrl = () => {
    const params = new URLSearchParams();
    console.log('Building URL with filters:', filters);

    // Add name filter (simple string)
    if (filters.name) {
      params.append('name', filters.name);
    }

    // Handle array parameters
    if (filters.education_level.length > 0) {
      filters.education_level.forEach((level) => {
        params.append('education_level[]', level);
      });
    }

    if (filters.major.length > 0) {
      filters.major.forEach((major) => {
        params.append('major[]', major);
      });
    }

    if (filters.role.length > 0) {
      filters.role.forEach((role) => {
        params.append('role[]', role);
      });
    }

    if (filters.paid.length > 0) {
      filters.paid.forEach((term) => {
        params.append('paid[]', term);
      });
    }

    const url = `/api/v1/users${params.toString() ? '?' + params.toString() : ''}`;
    console.log('Built URL:', url);
    return url;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const url = buildQueryUrl();
        console.log('Fetching users with URL:', url);
        console.log('Current filters:', filters);

        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Received users data:', data);
        setUsers(data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [filters]);

  const handleFilterChange = (field: keyof UserFilter, value: string | string[]) => {
    if (field === 'name') {
      setFilters((prev) => ({
        ...prev,
        [field]: value as string
      }));
    } else {
      // For array fields, ensure we're always working with arrays
      setFilters((prev) => ({
        ...prev,
        [field]: Array.isArray(value) ? value : value.split(',').filter(Boolean)
      }));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Users Management</h1>

      <div className="mb-6 p-4 border rounded shadow-sm">
        <h2 className="text-lg font-medium mb-3">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={filters.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFilterChange('name', e.target.value)
              }
              placeholder="Search by name"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Education Level</label>
            <select
              multiple
              className="w-full p-2 border rounded"
              value={filters.education_level}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const selectedOptions = Array.from(e.target.selectedOptions).map(
                  (option) => option.value
                );
                handleFilterChange('education_level', selectedOptions);
              }}
            >
              {educationLevelOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Major</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={filters.major.join(',')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFilterChange('major', e.target.value.split(',').filter(Boolean))
              }
              placeholder="CS,EE,etc. (comma separated)"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              multiple
              className="w-full p-2 border rounded"
              value={filters.role}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const selectedOptions = Array.from(e.target.selectedOptions).map(
                  (option) => option.value
                );
                handleFilterChange('role', selectedOptions);
              }}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Membership Term</label>
            <select
              multiple
              className="w-full p-2 border rounded"
              value={filters.paid}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const selectedOptions = Array.from(e.target.selectedOptions).map(
                  (option) => option.value
                );
                handleFilterChange('paid', selectedOptions);
              }}
            >
              {paidOptions.map((term) => (
                <option key={term} value={term}>
                  {term.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : isError ? (
        <div className="text-red-500 p-4">Error loading users data</div>
      ) : users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Education
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Major
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membership
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user: User) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.education_level}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.major}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.paid || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>No users found</div>
      )}
    </div>
  );
};

export default Users;
