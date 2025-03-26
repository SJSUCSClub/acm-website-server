import React, { useState } from 'react';
import { useQuery } from '@/hooks/useFetch';
import { paths } from '@/types/schema.v1';

type MajorsResponse = paths['/v1/majors']['get']['responses']['200']['content']['application/json'];
type EnumResponse = paths['/v1/enums/{enumType}']['get']['responses']['200']['content']['application/json'];
type UsersResponse = paths['/v1/users']['get']['responses']['200']['content']['application/json'];

interface UserFilter {
  name: string;
  education_level: ("Undergraduate" | "Graduate")[];
  major: string[];
  role: ("user" | "member" | "admin")[];
  paid: ("Semester" | "Annual")[];
}

const Users = () => {
  const [filters, setFilters] = useState<UserFilter>({
    name: '',
    education_level: [],
    major: [],
    role: [],
    paid: []
  });

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
  const majorOptions = (majorsData as MajorsResponse)?.majors.map(major => major.name) || [];
  const educationLevelOptions = (educationLevelData as EnumResponse)?.types || [];
  const roleOptions = (roleData as EnumResponse)?.types || [];
  const paidOptions = (membershipTermData as EnumResponse)?.types || [];

  // Use the useQuery hook with the correct path from schema and pass filters as query params
  const { data, isLoading, error } = useQuery('get', '/v1/users', {
    params: {
      query: {
        name: filters.name || undefined,
        'education_level[]': filters.education_level.length > 0 ? filters.education_level : undefined,
        'major[]': filters.major.length > 0 ? filters.major : undefined,
        'role[]': filters.role.length > 0 ? filters.role : undefined,
        'paid[]': filters.paid.length > 0 ? filters.paid : undefined
      }
    }
  });

  const users = (data as UsersResponse)?.users || [];

  const handleFilterChange = (field: keyof UserFilter, value: string | string[]) => {
    if (field === 'name') {
      setFilters(prev => ({
        ...prev,
        [field]: value as string
      }));
    } else {
      const arrayValue = Array.isArray(value) ? value : [value];
      setFilters(prev => ({
        ...prev,
        [field]: arrayValue
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
              className="w-full rounded-md border border-gray-300 p-2"
              value={filters.education_level}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value) as ("Undergraduate" | "Graduate")[];
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
            <select
              multiple
              className="w-full rounded-md border border-gray-300 p-2"
              value={filters.major}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                handleFilterChange('major', selectedOptions);
              }}
            >
              {majorOptions.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              multiple
              className="w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={filters.role}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value) as ("user" | "member" | "admin")[];
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
              className="w-full rounded-md border border-gray-300 p-2"
              value={filters.paid}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value) as ("Semester" | "Annual")[];
                handleFilterChange('paid', selectedOptions);
              }}
            >
              {paidOptions.map((term) => (
                <option key={term} value={term}>
                  {term}
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
      ) : error ? (
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
              {users.map((user) => (
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
