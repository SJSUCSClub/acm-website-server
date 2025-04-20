import Card, { CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { Badge } from '@/components/ui/badge';
import { paths } from '@/types/schema.v1';
import { Link, useRouterState } from '@tanstack/react-router';
import { MapPin } from 'lucide-react';
import React from 'react';

type Company =
  paths['/v1/companies']['get']['responses']['200']['content']['application/json']['companies'][number];

export interface ICompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<ICompanyCardProps> = ({ company }) => {
  const state = useRouterState();
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted">
            <img
              src={company.logo || ''}
              alt={company.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <Link
              to={
                state.location.pathname.includes('/admin')
                  ? '/admin/companies/$companyId'
                  : '/companies/$companyId'
              }
              params={{ companyId: company.id.toString() }}
            >
              <CardTitle className="text-xl">{company.name}</CardTitle>
            </Link>
            <Badge variant="outline" className="mt-1">
              {company.industryId.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {company.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{company.location}</span>
          </div>
        )}

        <div className="mt-2">
          <p className="text-muted-foreground">{company.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export { CompanyCard };
