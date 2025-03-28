import Spinner from '@/components/atoms/spinner';
import { useQuery } from '@/hooks/useFetch';
import React from 'react';
import PaymentLink from '@/components/molecules/payment-link';

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
            <PaymentLink payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
};

export { PaymentLinks };
