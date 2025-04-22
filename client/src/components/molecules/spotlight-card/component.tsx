import { paths } from '@/types/schema.v1';
import Card, { CardHeader } from '@/components/atoms/card';
import React from 'react';
import { Link } from '@tanstack/react-router';
import Btn from '@/components/atoms/btn';
import { Pencil, Trash } from 'lucide-react';
import DeleteAlert from '@/components/molecules/delete-alert';
import { useMutation } from '@/hooks/useFetch';
import { toast } from 'sonner';

type Spotlight =
  paths['/v1/club/spotlights']['get']['responses']['200']['content']['application/json']['spotlights'][number];
export interface ISpotLightCardProps {
  spotlight: Spotlight;
  admin?: boolean;
  onSpotlightDelete?: () => void;
}

export const SpotLightCard: React.FC<ISpotLightCardProps> = ({
  spotlight,
  admin = false,
  onSpotlightDelete = () => {}
}) => {
  const { mutateAsync: deleteOfficer } = useMutation('delete', '/v1/club/spotlights/{spotlightID}');
  const handleOfficerDelete = async () => {
    await deleteOfficer(
      {
        params: {
          path: {
            spotlightID: spotlight.id.toString()
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
    onSpotlightDelete();
  };
  return (
    <Card>
      <CardHeader className="relative p-0">
        <img
          src={spotlight.image}
          alt={`Event spotlight for ${spotlight.name}`}
          width={300}
          className="object-cover rounded-t-lg w-full h-full"
        />
        {admin && (
          <div className="flex flex-col gap-2 absolute top-2 right-2">
            <Link
              to={'/admin/club/spotlights/$spotlightId/edit'}
              params={{ spotlightId: spotlight.id.toString() }}
            >
              <Btn size="icon" className="rounded-full bg-blue-500">
                <Pencil />
              </Btn>
            </Link>
            <DeleteAlert onDelete={handleOfficerDelete}>
              <Btn size="icon" className="rounded-full bg-blue-500">
                <Trash />
              </Btn>
            </DeleteAlert>
          </div>
        )}
      </CardHeader>
      <div className="p-4 text-left">
        <div>
          <p className="text-muted-foreground text-xs font-bold">{spotlight.type}</p>
          <h3 className="font-semibold text-lg mb-2">{spotlight.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{spotlight.description}</p>
      </div>
    </Card>
  );
};
