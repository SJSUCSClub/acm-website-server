import Btn from '@/components/atoms/btn';
import FetchError from '@/components/molecules/fetch-error';
import Loading from '@/components/molecules/loading';
import { OfficerCard } from '@/components/molecules/officer-card';
import OfficerReorder from '@/components/molecules/officer-reorder';
import { useQuery } from '@/hooks/useFetch';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

export interface IOfficerListProps {
  admin?: boolean;
}

const OfficerList: React.FC<IOfficerListProps> = ({ admin = false }) => {
  const [open, setOpen] = useState(false);
  const { data: officers, isLoading, error, refetch } = useQuery('get', '/v1/officers');

  const handleOfficerReorder = () => {
    refetch();
    setOpen(false);
  };
  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-bold">Meet our Officers</h1>
      {admin && (
        <div className="flex items-center justify-end gap-2">
          <OfficerReorder
            onOfficerReorder={handleOfficerReorder}
            open={open}
            onOpenChange={setOpen}
          >
            <Btn variant="outline">Reorder</Btn>
          </OfficerReorder>
          <Link to="/admin/officers/create">
            <Btn>Create Officer</Btn>
          </Link>
        </div>
      )}
      <Loading isLoading={isLoading}>
        <FetchError isError={!!error || !officers}>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {officers?.officers.map((officer) => (
              <OfficerCard
                key={officer.id}
                officer={officer}
                admin={admin}
                onOfficerDelete={refetch}
              />
            ))}
          </div>
        </FetchError>
      </Loading>
    </div>
  );
};

export { OfficerList };
