import Card, { CardContent, CardHeader } from '@/components/atoms/card';
import React from 'react';
import LinkedinBtn from '../linkedin-btn';
import { paths } from '@/types/schema.v1';
import { Pencil, Trash } from 'lucide-react';
import { DeleteAlert } from '@/components/molecules/delete-alert';
import { Link } from '@tanstack/react-router';
import Btn from '@/components/atoms/btn';
import { useMutation } from '@/hooks/useFetch';
import { toast } from 'sonner';

type Officer =
  paths['/v1/officers']['get']['responses']['200']['content']['application/json']['officers'][number];
export interface IOfficerCardProps {
  officer: Officer;
  admin?: boolean;
  onOfficerDelete?: () => void;
}

export const OfficerCard: React.FC<IOfficerCardProps> = ({
  officer,
  admin = false,
  onOfficerDelete = () => {}
}) => {
  const { mutateAsync: deleteOfficer } = useMutation('delete', '/v1/officers/{officerID}');
  const handleOfficerDelete = async () => {
    await deleteOfficer(
      {
        params: {
          path: {
            officerID: officer.id.toString()
          }
        }
      },
      {
        onSuccess() {
          toast.success('Officer deleted successfully');
        },
        onError() {
          toast.error('Failed to delete officer');
        }
      }
    );
    onOfficerDelete();
  };
  return (
    <Card>
      <CardHeader>
        <div className="relative w-full h-60 bg-muted m-auto rounded-lg overflow-hidden">
          <img src={officer.photo || ''} alt="Photo" className="object-cover w-full h-full" />
          {admin && (
            <div className="flex flex-col gap-2 absolute top-2 right-2">
              <Link
                to={'/admin/officers/$officerId/edit'}
                params={{ officerId: officer.id.toString() }}
              >
                <Btn variant="outline" size="icon" className="bg-white text-black">
                  <Pencil />
                </Btn>
              </Link>
              <DeleteAlert onDelete={handleOfficerDelete}>
                <Btn variant="outline" size="icon" className="bg-white text-black">
                  <Trash />
                </Btn>
              </DeleteAlert>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-semibold text-neutral">{officer.position}</p>{' '}
        <h1 className="font-bold text-lg">{officer.name}</h1>
        <div className="flex justify-start items-center w-full">
          {officer.linkedin && <LinkedinBtn href={officer.linkedin} />}
        </div>
      </CardContent>
    </Card>
  );
};
