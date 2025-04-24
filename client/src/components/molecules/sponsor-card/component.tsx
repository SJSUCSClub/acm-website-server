import { useMutation } from '@/hooks/useFetch';
import { paths } from '@/types/schema.v1';
import React from 'react';
import { toast } from 'sonner';
import DeleteAlert from '@/components/molecules/delete-alert';
import Btn from '@/components/atoms/btn';
import { Trash } from 'lucide-react';

type Sponsor =
  paths['/v1/sponsors']['get']['responses']['200']['content']['application/json']['sponsors'][number];

export interface ISponsorCardProps {
  sponsor: Sponsor;
  admin?: boolean;
  onSponsorDelete?: () => void;
}

const SponsorCard: React.FC<ISponsorCardProps> = ({
  sponsor,
  admin = false,
  onSponsorDelete = () => { }
}) => {
  const { mutateAsync: deleteSponsor } = useMutation('delete', '/v1/sponsors/{sponsorName}');

  const handleDelete = async () => {
    await deleteSponsor(
      {
        params: {
          path: {
            sponsorName: sponsor.name
          }
        }
      },
      {
        onSuccess: () => {
          toast.success('Sponsor deleted successfully');
        },
        onError: () => {
          toast.error('Failed to delete sponsor');
        }
      }
    );
    onSponsorDelete();
  };

  return (
    <div className="w-full">
      <div className="relative w-full aspect-[1/1] overflow-hidden m-auto flex flex-col items-center justify-center">
        <img
          src={sponsor.logoKey}
          alt={`${sponsor.name} logo`}
          width={300}
          height={300}
          className="object-cover"
        />
        {admin && (
          <div className="flex flex-col gap-2 absolute top-2 right-2">
            <DeleteAlert onDelete={handleDelete}>
              <Btn variant="outline" size="icon" className="bg-white text-black">
                <Trash />
              </Btn>
            </DeleteAlert>
          </div>
        )}
      </div>
      <h3 className="text-center text-lg font-bold">{sponsor.name}</h3>
    </div>
  );
};

export { SponsorCard };
