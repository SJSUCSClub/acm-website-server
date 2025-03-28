import Card, { CardContent } from '@/components/atoms/card';
import Spinner from '@/components/atoms/spinner';
import { useQuery } from '@/hooks/useFetch';
import { CreditCard, ExternalLink } from 'lucide-react';
import React from 'react';

const PaymentLinks = () => {
  const { data, error, isLoading } = useQuery('get', '/v1/payments');
  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : !data || error ? (
        <p>Error loading payment links</p>
      ) : data.paymentLinks.length === 0 ? (
        <p>No payment links</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {data.paymentLinks.map((payment) => (
            <Card key={payment.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="font-medium flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <h3>{payment.name}</h3>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm text-muted-foreground mt-1 break-all">{payment.link}</p>
                    <a href={payment.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export { PaymentLinks };
