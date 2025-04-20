import Btn from '@/components/atoms/btn';
import { useQuery } from '@/hooks/useFetch';
import { paths } from '@/types/schema.v1';
import React, { useState } from 'react';
import Loading from '@/components/molecules/loading';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import Spinner from '@/components/atoms/spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown, X } from 'lucide-react';
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export type Company =
  paths['/v1/companies']['get']['responses']['200']['content']['application/json']['companies'][number];
export interface ICompanyMultiselectProps {
  currentCompanies: Company[];
  onSelectSubmit: (newCompanies: Company[]) => void;
  children?: React.ReactNode;
}

const CompanyMultiSelect: React.FC<ICompanyMultiselectProps> = ({
  currentCompanies,
  onSelectSubmit,
  children
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const {
    data: companies,
    isLoading: isLoadingCompanies,
    error
  } = useQuery('get', '/v1/companies');

  const handleAdd = () => {
    setIsLoading(true);
    onSelectSubmit(selectedCompanies);
    setSelectedCompanies([]);
    setIsLoading(false);
    setOpen(false);
  };

  const handleCheckboxChange = (company: Company, checked: boolean) => {
    if (checked) {
      setSelectedCompanies([...selectedCompanies, company]);
    } else {
      setSelectedCompanies(selectedCompanies.filter((item) => item.id !== company.id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="min-h-64">
        <DialogHeader>
          <DialogTitle>Add Company</DialogTitle>
        </DialogHeader>
        <Popover>
          <PopoverTrigger asChild>
            <Btn
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              Add Company
              <ChevronsUpDown className="opacity-50" />
            </Btn>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Loading isLoading={isLoadingCompanies}>
              {error || companies?.companies.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">No Companies Found</div>
              ) : (
                <Command>
                  <CommandInput />
                  <CommandList className="h-64 overflow-y-scroll">
                    {companies?.companies
                      .filter((company) => !currentCompanies.some((c) => c.id === company.id))
                      .map((company) => (
                        <CommandItem key={company.id}>
                          <div className="flex items-center gap-2 p-3">
                            <Checkbox
                              checked={selectedCompanies.some((item) => item.id === company.id)}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(company, checked as boolean)
                              }
                            />
                            <Label className="flex items-center gap-3">
                              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted">
                                <img
                                  src={company.logo || ''}
                                  alt={company.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium">{company.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {company.industryId}
                                </div>
                              </div>
                            </Label>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandList>
                </Command>
              )}
            </Loading>
          </PopoverContent>
        </Popover>
        <ul className="space-y-2">
          {selectedCompanies.map((company) => (
            <li
              key={company.id}
              className="flex items-center justify-between bg-gray-100 p-3 rounded-md"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted">
                  <img
                    src={company.logo || ''}
                    alt={company.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{company.name}</div>
                  <div className="text-xs text-muted-foreground">{company.industryId}</div>
                </div>
              </div>
              <Btn variant="ghost" size="sm" onClick={() => handleCheckboxChange(company, false)}>
                <X className="h-4 w-4" />
              </Btn>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Btn disabled={selectedCompanies.length === 0} onClick={handleAdd}>
            {isLoading ? <Spinner className="w-4 h-4" /> : 'Add Companies'}
          </Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { CompanyMultiSelect };
