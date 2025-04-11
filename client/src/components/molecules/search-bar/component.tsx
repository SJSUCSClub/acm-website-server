import { useEffect, useState } from 'react';
import useDebounce from '@/hooks/useDebounce';

type SearchBarProps = {
  fcn: (query: string) => void;
  label: string;
  value: string;
  placeholder?: string;
};

const DELAY_MS = 300;

export const SearchBar: React.FC<SearchBarProps> = ({ fcn, label, value, placeholder }) => {
  const [query, setQuery] = useState<string>(value);
  const debouncedQuery = useDebounce(query, DELAY_MS);

  // update after 500ms typing delay from user
  useEffect(() => {
    fcn(debouncedQuery);
  }, [fcn, debouncedQuery]);

  // sync the query if incoming value is different
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value]);

  return (
    <div className="">
      <label className="block text-sm mb-1">{label}</label>
      <input
        type="text"
        className="w-full p-2 border rounded text-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};
