import { OfficerCard } from '@/components/molecules/officer-card';
import { useQuery } from '@/hooks/useFetch';
import { paths } from '@/types/schema.v1';

type Officer =
  paths['/v1/officers']['get']['responses']['200']['content']['application/json']['officers'][0];

const Officers = () => {
  const { data: officers } = useQuery('get', '/v1/officers');
  return (
      <div className="about text-text">
        <div className="devteam">
          <h1 className="text-4xl text-center font-bold my-8">Officers</h1>
          <div className="flex flex-col items-center justify-center gap-16 sm:gap-8 mx-[-10%]">
            <div className="sm:flex sm:flex-wrap gap-x-10 items-center justify-center">
              {officers?.officers.map((officer: Officer) => (
                <OfficerCard
                  key={officer.id}
                  name={officer.userId}
                  position={officer.position}
                  photo={officer.photo || ''}
                  linkedin={officer.linkedin || ''}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Officers;
