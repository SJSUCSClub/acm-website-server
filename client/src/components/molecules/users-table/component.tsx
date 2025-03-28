import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { paths } from '@/types/schema.v1';

type User =
  paths['/v1/users']['get']['responses']['200']['content']['application/json']['users'][number];

interface UsersTableProps {
  users: User[];
}

const UsersTable = ({ users }: UsersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Education</TableHead>
          <TableHead>Major</TableHead>
          <TableHead>Membership</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell className="max-w-[200px] truncate">{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.education_level}</TableCell>
            <TableCell className="max-w-[200px] truncate">{user.major}</TableCell>
            <TableCell>{user.paid || 'None'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;
