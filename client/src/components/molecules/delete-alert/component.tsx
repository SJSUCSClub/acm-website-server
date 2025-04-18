import Btn from '@/components/atoms/btn';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import React from 'react';

export interface IDeleteAlertProps {
  onDelete: () => void;
  children: React.ReactNode;
  alertTitle?: string;
  alertDescription?: string;
}

const DeleteAlert: React.FC<IDeleteAlertProps> = ({
  onDelete,
  children,
  alertTitle = 'Are you absolutely sure?',
  alertDescription = 'This action cannot be undone.'
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
          <AlertDialogDescription>{alertDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Btn className="bg-red-500" onClick={onDelete}>
              Delete
            </Btn>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { DeleteAlert };
