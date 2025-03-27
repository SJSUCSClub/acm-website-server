import Avatar, { AvatarFallback, AvatarImage } from '@/components/atoms/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { paths } from '@/types/schema.v1';
import React from 'react';
import UserDialog from '@/components/molecules/user-dialog';
import Btn from '@/components/atoms/btn';

type User =
  paths['/v1/users']['get']['responses']['200']['content']['application/json']['users'][number];

export interface IUsersTableProps {
  users: User[];
}

const UsersTable: React.FC<IUsersTableProps> = ({ users }) => {
  return (
    <div>
      {users.length === 0 ? (
        <div className="text-text text-center my-10">No users found</div>
      ) : (
        <Table className="overflow-x-auto border rounded-md">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[400px]">Major</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead className="w-[20px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.profilePic} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div>{user.major}</div>
                  <div className="text-xs text-muted-foreground">{user.education_level}</div>
                </TableCell>
                <TableCell>{user.role.toUpperCase()}</TableCell>
                <TableCell>
                  {user.paid ? (
                    <div className="text-green-500">{user.paid}</div>
                  ) : (
                    <div className="text-red-500">None</div>
                  )}
                </TableCell>
                <TableCell>
                  <UserDialog user={user}>
                    <Btn variant="outline">Open</Btn>
                  </UserDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export { UsersTable };
