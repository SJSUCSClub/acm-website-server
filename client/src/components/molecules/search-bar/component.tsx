import { useEffect, useState } from 'react';
import useDebounce from '@/hooks/useDebounce';
import Btn from '@/components/atoms/btn';
import Input from '@/components/atoms/input';

type SearchBarProps = {
  fcn: (query: string) => void;
  label: string;
  name: string;
};

const DELAY_MS = 300;

export const SearchBar: React.FC<SearchBarProps> = ({ fcn, label, name }) => {
  const [query, setQuery] = useState<string>(name);
  const debouncedQuery = useDebounce(query, DELAY_MS);

  // update after 500ms typing delay from user
  useEffect(() => {
    fcn(debouncedQuery);
  }, [fcn, debouncedQuery]);

  const handleClear = () => {
    setQuery('');
    fcn('');
  };

  return (
    <div className="relative w-[350px] flex items-center">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-[40px] w-[275px]"
        label={label}
        required={false}
        icon="/icons/search.svg"
      />
      <Btn
        onClick={handleClear}
        disabled={query.length === 0}
        className="absolute top-8 right-0"
        variant="ghost"
      >
        Clear
      </Btn>
    </div>
  );
};
