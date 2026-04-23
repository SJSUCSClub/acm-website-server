import React, { useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from '@/hooks/useFetch';
import { paths } from '@/types/schema.v1';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import Avatar, { AvatarFallback, AvatarImage } from '@/components/atoms/avatar';
import UserDialog from '@/components/molecules/user-dialog';
import Btn from '@/components/atoms/btn';
import PopoverDropdown from '@/components/atoms/popover';

type User =
  paths['/v1/users']['get']['responses']['200']['content']['application/json']['users'][number];

export interface IUsersTableProps {
  users: User[];
  roles?: User['role'][];
  onUserUpdated?: () => void;
  canEdit?: boolean;
}

const UsersTable: React.FC<IUsersTableProps> = ({
  users,
  roles,
  onUserUpdated,
  canEdit = false
}) => {
  const { mutateAsync: updateUser } = useMutation('put', '/v1/users/{userId}');

  const [updatedUser, setUpdatedUser] = useState<User | null>(null);
  const [openRoles, setOpenRoles] = useState<boolean>(false);

  const handleUpdateUser = async () => {
    if (!updatedUser) return;

    try {
      await updateUser({ body: { ...updatedUser }, params: { path: { userId: updatedUser.id } } });
      toast.success('User updated successfully');
      onUserUpdated?.();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update user.');
    }
  };

  const handleRoleChange = (role: string) => {
    if (!updatedUser) return;
    if (role === updatedUser.role) return;
    setUpdatedUser({ ...updatedUser, role: role as User['role'] });
  };

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
              <TableHead className="w-[20px]"></TableHead>
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
                <TableCell>
                  {updatedUser?.id === user.id ? (
                    <PopoverDropdown
                      open={openRoles}
                      setOpen={setOpenRoles}
                      value={updatedUser.role.toLocaleUpperCase()}
                      options={roles ?? []}
                      onChange={handleRoleChange}
                      width={110}
                    />
                  ) : (
                    user.role.toUpperCase()
                  )}
                </TableCell>
                <TableCell>
                  {updatedUser?.id === user.id ? (
                    <Btn variant="outline" onClick={() => setUpdatedUser(null)}>
                      <X className="h-4 w-4" />
                    </Btn>
                  ) : (
                    <UserDialog user={user}>
                      <Btn variant="outline">Open</Btn>
                    </UserDialog>
                  )}
                </TableCell>
                {canEdit && (
                  <TableCell>
                    {updatedUser?.id === user.id ? (
                      <Btn
                        variant="outline"
                        onClick={() => {
                          handleUpdateUser();
                          setUpdatedUser(null);
                        }}
                      >
                        <Check />
                      </Btn>
                    ) : (
                      <Btn variant="ghost" onClick={() => setUpdatedUser(user)}>
                        <Pencil className="h-4 w-4" />
                      </Btn>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export { UsersTable };
