import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { paths } from '@/types/schema.v1';

type Company =
  paths['/v1/companies']['get']['responses']['200']['content']['application/json']['companies'][number];

interface CompanyDialogProps {
  company: Company;
  children?: React.ReactNode;
}

const CompanyDialog: React.FC<CompanyDialogProps> = ({ company, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted">
              <img
                src={company.logo || ''}
                alt={company.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <DialogTitle className="text-xl">{company.name}</DialogTitle>
              <Badge variant="outline" className="mt-1">
                {company.industryId.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {company.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{company.location}</span>
          </div>
        )}

        <div className="mt-2">
          <p className="text-muted-foreground">{company.description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { CompanyDialog };
