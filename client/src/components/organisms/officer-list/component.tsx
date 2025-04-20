import Spinner from '@/components/atoms/spinner';
import { OfficerCard } from '@/components/molecules/officer-card';
import { useQuery } from '@/hooks/useFetch';
import { paths } from '@/types/schema.v1';

type Officer =
  paths['/v1/officers']['get']['responses']['200']['content']['application/json']['officers'][number];
export interface IOfficerListProps {
  admin?: boolean;
}

const OfficerList: React.FC<IOfficerListProps> = ({ admin = false }) => {
  const { data: officers } = useQuery('get', '/v1/officers');
  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-bold">Officers</h1>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-5">
        {officers ? (
          officers?.officers.map((officer: Officer) => (
            <OfficerCard
              key={officer.id}
              officer={officer}
            />
          ))
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  );
};

export { OfficerList };
