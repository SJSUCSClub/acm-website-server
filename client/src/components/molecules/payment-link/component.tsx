import Card, { CardContent } from '@/components/atoms/card';
import { paths } from '@/types/schema.v1';
import { CreditCard, ExternalLink } from 'lucide-react';
import React from 'react';

type PaymentLink =
  paths['/v1/payments']['get']['responses']['200']['content']['application/json']['paymentLinks'][number];

export interface IPaymentLinkProps {
  payment: PaymentLink;
}

const PaymentLink: React.FC<IPaymentLinkProps> = ({ payment }) => {
  return (
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
  );
};

export { PaymentLink };
