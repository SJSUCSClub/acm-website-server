import { useMutation, useQuery } from '@/hooks/useFetch';
import React, { useState } from 'react';
import PaymentLink from '@/components/molecules/payment-link';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import Btn from '@/components/atoms/btn';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@tanstack/react-form';
import FetchError from '@/components/molecules/fetch-error';
import Loading from '@/components/molecules/loading';

interface ICreatePaymentLinksProps {
  handleCreate: (payment: PaymentLink) => void;
}

const PaymentLinks = () => {
  const { data: payments, error, isLoading, refetch } = useQuery('get', '/v1/payments');
  const { mutate: deletePayment } = useMutation('delete', '/v1/payments/{paymentId}');
  const { mutate: createPayment } = useMutation('post', '/v1/payments');

  const handleDelete = (paymentId: number) => {
    deletePayment(
      {
        params: {
          path: {
            paymentId: paymentId.toString()
          }
        }
      },
      {
        onSuccess: () => {
          refetch();
        },
        onError: () => {
          toast.error('Failed to delete payment link');
        }
      }
    );
  };

  const handleCreate = (payment: PaymentLink) => {
    createPayment(
      {
        body: {
          name: payment.name,
          link: payment.link
        }
      },
      {
        onSuccess: () => {
          refetch();
        },
        onError: () => {
          toast.error('Failed to create payment link');
        }
      }
    );
  };

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-lg">Payment Links</h3>
      <div className="flex justify-end">
        <CreatePaymentLink handleCreate={handleCreate} />
      </div>
      <Loading isLoading={isLoading}>
        <FetchError isError={!!error || !payments}>
          {payments?.paymentLinks.length === 0 && (
            <div className="text-center text-lg">No payment links found</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payments?.paymentLinks.map((payment) => (
              <PaymentLink key={payment.id} payment={payment} handleDelete={handleDelete} />
            ))}
          </div>
        </FetchError>
      </Loading>
    </div>
  );
};

const CreatePaymentLink: React.FC<ICreatePaymentLinksProps> = ({ handleCreate }) => {
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      name: '',
      link: ''
    },
    onSubmit: ({ value }) => {
      handleCreate({ ...value, id: Date.now() });
      setOpen(false);
    }
  });
  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        <Btn variant="outline" onClick={() => setOpen(true)}>
          Create Payment Link
        </Btn>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Payment Link</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-4 py-4">
            <form.Field
              name="name"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name} className="text-muted-foreground text-xs font-bold">
                    Name
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
            />
            <form.Field
              name="link"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name} className="text-muted-foreground text-xs font-bold">
                    Link
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
            />
          </div>
          <DialogFooter>
            <Btn variant="outline" type="submit">
              Create
            </Btn>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { PaymentLinks };
