import { paths } from '@/types/schema.v1';

type User =
  paths['/v1/users']['get']['responses']['200']['content']['application/json']['users'][number];

interface UsersTableProps {
  users: User[];
}

const UsersTable = ({ users }: UsersTableProps) => {
  return (
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
  );
};

export default UsersTable;
