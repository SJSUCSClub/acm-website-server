import Spinner from '@/components/atoms/spinner';
import { useMutation, useQuery } from '@/hooks/useFetch';
import React, { useEffect, useState } from 'react';
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

interface ICreatePaymentLinksProps {
  handleCreate: (payment: PaymentLink) => void;
}

const PaymentLinks = () => {
  const { data, error, isLoading } = useQuery('get', '/v1/payments');
  const { mutate: deletePayment } = useMutation('delete', '/v1/payments/{paymentId}');
  const { mutate: createPayment } = useMutation('post', '/v1/payments');
  const [payments, setPayments] = useState<PaymentLink[]>([]);

  useEffect(() => {
    if (data) {
      setPayments(data.paymentLinks);
    }
  }, [data]);

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
          setPayments(payments.filter((payment) => payment.id !== paymentId));
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
          setPayments([...payments, payment]);
        },
        onError: () => {
          toast.error('Failed to create payment link');
        }
      }
    );
  };

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : !data || error ? (
        <p>Error loading payment links</p>
      ) : payments.length === 0 ? (
        <p className="text-center">No payment links</p>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-end">
            <CreatePaymentLink handleCreate={handleCreate} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payments.map((payment) => (
              <PaymentLink payment={payment} handleDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}
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
    <Dialog open={open}>
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
              Save changes
            </Btn>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { PaymentLinks };
