import Btn from '@/components/atoms/btn';
import Card, { CardContent } from '@/components/atoms/card';
import { Input } from '@/components/ui/input';
import { useMutation } from '@/hooks/useFetch';
import { paths } from '@/types/schema.v1';
import { useForm } from '@tanstack/react-form';
import { Check, CreditCard, ExternalLink, Link, Pencil, Trash, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import DeleteAlert from '@/components/molecules/delete-alert';

type PaymentLink =
  paths['/v1/payments']['get']['responses']['200']['content']['application/json']['paymentLinks'][number];

export interface IPaymentLinkProps {
  payment: PaymentLink;
  handleDelete: (paymentId: number) => void;
  admin?: boolean;
}

export interface IReadLinkProps extends IPaymentLinkProps {
  setEdit: (edit: boolean) => void;
}

export interface IEditLinkProps extends Omit<IPaymentLinkProps, 'handleDelete' | 'admin'> {
  setEdit: (edit: boolean) => void;
  setPayment: (payment: PaymentLink) => void;
}

const PaymentLink: React.FC<IPaymentLinkProps> = ({
  payment: paymentProp,
  handleDelete,
  admin = false
}) => {
  const [edit, setEdit] = useState(false);
  const [payment, setPayment] = useState(paymentProp);

  return (
    <Card className="overflow-hidden">
      {edit ? (
        <EditLink payment={payment} setEdit={setEdit} setPayment={setPayment} />
      ) : (
        <ReadLink payment={payment} setEdit={setEdit} handleDelete={handleDelete} admin={admin} />
      )}
    </Card>
  );
};

const ReadLink: React.FC<IReadLinkProps> = ({ payment, setEdit, handleDelete, admin }) => {
  return (
    <CardContent className="p-0">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="font-medium flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            <h3>{payment.name}</h3>
          </div>
          <div className="flex items-center justify-end">
            <Btn variant="ghost">
              <a href={payment.link} target="_blank">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Btn>
            {admin && (
              <>
                <Btn variant="ghost" onClick={() => setEdit(true)}>
                  <Pencil className="h-4 w-4" />
                </Btn>
                <DeleteAlert onDelete={() => handleDelete(payment.id)}>
                  <Btn variant="ghost">
                    <Trash className="h-4 w-4" />
                  </Btn>
                </DeleteAlert>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <Link className="mr-2 h-4 w-4" />
          <p className="text-muted-foreground">{payment.link}</p>
        </div>
      </div>
    </CardContent>
  );
};

const EditLink: React.FC<IEditLinkProps> = ({ payment, setEdit, setPayment }) => {
  const { mutate } = useMutation('put', '/v1/payments/{paymentId}');
  const form = useForm({
    defaultValues: {
      name: payment.name,
      link: payment.link
    },
    onSubmit: ({ value }) => {
      mutate(
        {
          params: {
            path: {
              paymentId: payment.id.toString()
            }
          },
          body: {
            name: value.name,
            link: value.link
          }
        },
        {
          onSuccess: () => {
            setPayment({
              ...payment,
              name: value.name,
              link: value.link
            });
            setEdit(false);
          },
          onError: () => {
            toast.error('Failed to update payment link');
          }
        }
      );
    }
  });
  return (
    <CardContent className="p-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="p-4 space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="font-medium flex items-center w-3/4">
            <CreditCard className="mr-2 h-4 w-4" />
            <form.Field
              name="name"
              children={(field) => (
                <Input
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="text"
                  className="w-full"
                />
              )}
            />
          </div>
          <div className="flex items-center justify-end">
            <Btn variant="ghost" type="submit">
              <Check className="h-4 w-4" />
            </Btn>
            <Btn variant="ghost" onClick={() => setEdit(false)}>
              <X className="h-4 w-4" />
            </Btn>
          </div>
        </div>
        <div className="flex items-center w-3/4">
          <Link className="mr-2 h-4 w-4" />
          <form.Field
            name="link"
            children={(field) => (
              <Input
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                type="text"
                className="w-full"
              />
            )}
          />
        </div>
      </form>
    </CardContent>
  );
};

export { PaymentLink };
