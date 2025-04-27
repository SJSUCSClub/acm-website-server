import React, { useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
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
  memberships?: User['paid'][];
  onUserUpdated?: () => void;
}

const UsersTable: React.FC<IUsersTableProps> = ({ users, roles, memberships, onUserUpdated }) => {
  const { isAdmin } = useAuth();
  const { mutateAsync: updateUser } = useMutation('put', '/v1/users/{userId}');

  const [updatedUser, setUpdatedUser] = useState<User | null>(null);
  const [openRoles, setOpenRoles] = useState<boolean>(false);
  const [openMemberships, setOpenMemberships] = useState<boolean>(false);

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

    // no change
    if (role === updatedUser.role) return;

    let membership = updatedUser.paid;

    if (role === 'member' && !updatedUser.paid) {
      // also change membership/paid if role is being set to member
      membership = 'Semester';
    } else if (role === 'user' && updatedUser.paid) {
      // set membership/paid to null if role being changed to user
      membership = null;
    }

    setUpdatedUser({ ...updatedUser, role: role as User['role'], paid: membership });
  };

  const handleMembershipChange = (membership: string) => {
    if (!updatedUser) return;

    // no change
    if (membership === updatedUser.paid) return;

    let role = updatedUser.role;

    if (membership !== 'None' && updatedUser.role === 'user') {
      // if membership is no longer null, change user role to 'member'
      role = 'member';
    } else if (membership === 'None' && updatedUser.role === 'member') {
      // change user role to null if membership is being set to null
      role = 'user';
    }

    setUpdatedUser({
      ...updatedUser,
      paid: membership === 'None' ? null : (membership as User['paid']),
      role
    });
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
              <TableHead>Membership</TableHead>
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
                    <PopoverDropdown
                      open={openMemberships}
                      setOpen={setOpenMemberships}
                      value={updatedUser.paid ?? 'None'}
                      options={['None', ...(memberships?.filter((mem) => mem !== null) ?? [])]}
                      onChange={handleMembershipChange}
                      width={110}
                    />
                  ) : user.paid ? (
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
                {isAdmin && (
                  <TableCell>
                    {updatedUser?.id === user.id ? (
                      <Btn
                        variant="outline"
                        onClick={() => {
                          // update user if a change was made
                          if (JSON.stringify(user) !== JSON.stringify(updatedUser))
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
