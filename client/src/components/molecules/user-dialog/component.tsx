import Avatar, { AvatarFallback, AvatarImage } from '@/components/atoms/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { paths } from '@/types/schema.v1';
import { formatDate } from '@/utils/formatter';
import React from 'react';
import { RxDiscordLogo, RxGithubLogo, RxGlobe, RxLinkedinLogo } from 'react-icons/rx';

type User =
  paths['/v1/users']['get']['responses']['200']['content']['application/json']['users'][number];

export interface IUserDialogProps {
  user: User;
  children: React.ReactNode;
}

const UserDialog: React.FC<IUserDialogProps> = ({ user, children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user.profilePic} alt={user.name} />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="flex items-center gap-2">{user.name}</DialogTitle>
              <DialogDescription>{user.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <div className="text-sm font-medium text-slate-500">User Since</div>
            <div>{formatDate(user.createdAt)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Role</div>
            <div>{user.role.toUpperCase()}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Major</div>
            <div>{user.major}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Education</div>
            <div>{user.education_level}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Graduation</div>
            <div>{formatDate(user.gradDate)}</div>
          </div>

          <div className="col-span-2">
            <div className="text-sm font-medium text-slate-500">Interests</div>
            <div className="flex flex-wrap gap-1">
              {user.interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="mr-1 mb-1">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {user.github && (
            <a href={user.github} target="_blank" rel="noopener noreferrer">
              <RxGithubLogo size={30} />
            </a>
          )}
          {user.linkedin && (
            <a href={user.linkedin} target="_blank" rel="noopener noreferrer">
              <RxLinkedinLogo size={30} />
            </a>
          )}
          {user.discord && (
            <a href={user.discord} target="_blank" rel="noopener noreferrer">
              <RxDiscordLogo size={30} />
            </a>
          )}
          {user.website && (
            <a href={user.website} target="_blank" rel="noopener noreferrer">
              <RxGlobe size={30} />
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { UserDialog };
