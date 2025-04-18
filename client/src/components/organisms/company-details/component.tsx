import Btn from '@/components/atoms/btn';
import DeleteAlert from '@/components/molecules/delete-alert';
import EventsTable from '@/components/molecules/events-table';
import FetchError from '@/components/molecules/fetch-error';
import Loading from '@/components/molecules/loading';
import UsersTable from '@/components/molecules/users-table';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery } from '@/hooks/useFetch';
import { Link, useNavigate } from '@tanstack/react-router';
import { MapPin } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

export interface ICompanyDetailsProps {
  companyId: string;
  admin?: boolean;
}

const CompanyDetails: React.FC<ICompanyDetailsProps> = ({ companyId, admin = false }) => {
  const navigate = useNavigate();
  const {
    data: company,
    isLoading: isLoadingCompany,
    error: errorCompany
  } = useQuery('get', '/v1/companies/{companyID}', {
    params: {
      path: {
        companyID: companyId
      }
    }
  });
  const {
    data: events,
    isLoading: isLoadingEvents,
    error: errorEvents
  } = useQuery('get', '/v1/companies/{companyID}/events', {
    params: {
      path: {
        companyID: companyId
      }
    }
  });
  const {
    data: subscribedUsers,
    isLoading: isLoadingSubscribed,
    error: errorSubscribed
  } = useQuery(
    'get',
    '/v1/companies/{companyID}/subscribers',
    {
      params: {
        path: {
          companyID: companyId
        }
      }
    },
    {
      enabled: admin
    }
  );
  const { mutate: deleteCompany } = useMutation('delete', '/v1/companies/{companyID}');

  const handleCompanyDelete = () => {
    deleteCompany(
      {
        params: {
          path: {
            companyID: companyId
          }
        }
      },
      {
        onSuccess() {
          toast.success('Company deleted successfully');
          navigate({
            to: '/admin/companies',
            replace: true
          });
        },
        onError() {
          toast.error('Failed to delete company');
        }
      }
    );
  };

  return (
    <div className="space-y-16">
      <Loading isLoading={isLoadingCompany}>
        <FetchError isError={!!errorCompany || !company}>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {' '}
                <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={company?.company.logo || ''}
                    alt={company?.company.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{company?.company.name}</h1>
                  <Badge variant="outline" className="mt-1">
                    {company?.company.industryId.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              {admin && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Link to={'/admin/companies/$companyId/edit'} params={{ companyId }}>
                    <Btn>Edit</Btn>
                  </Link>
                  <DeleteAlert onDelete={handleCompanyDelete}>
                    <Btn className="bg-red-500">Delete</Btn>
                  </DeleteAlert>
                </div>
              )}
            </div>
            <div>
              {company?.company.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{company?.company.location}</span>
                </div>
              )}

              <div className="mt-2">
                <p className="text-muted-foreground">{company?.company.description}</p>
              </div>
            </div>
          </div>
        </FetchError>
      </Loading>

      <Loading isLoading={isLoadingEvents}>
        <FetchError isError={!!errorEvents || !events}>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-3">Associated Events</h2>
            <EventsTable events={events?.companyEvents || []} />
          </div>
        </FetchError>
      </Loading>

      {admin && (
        <Loading isLoading={isLoadingSubscribed}>
          <FetchError isError={!!errorSubscribed || !subscribedUsers}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-3">Subscribed Users</h2>
              <UsersTable users={subscribedUsers?.companySubscribers || []} />
            </div>
          </FetchError>
        </Loading>
      )}
    </div>
  );
};

export { CompanyDetails };
