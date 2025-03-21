import Btn from '@/components/atoms/btn';
import { useMutation, useQuery } from '@/hooks/useFetch';
import { Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface ISubscribeBtnProps {
  source: 'company' | 'event';
  id: string;
}

interface ISubscribeEventBtnProps {
  eventId: string;
}

interface ISubscribeCompanyBtnProps {
  companyId: string;
}

const SubscribeBtn: React.FC<ISubscribeBtnProps> = ({ source, id }) => {
  if (source === 'company') {
    return <SubscribeCompanyBtn companyId={id} />;
  }

  return <SubscribeEventBtn eventId={id} />;
};

const SubscribeEventBtn: React.FC<ISubscribeEventBtnProps> = ({ eventId }) => {
  const { data, isError, isLoading } = useQuery('get', '/v1/users/my/subscribed-events/{eventID}', {
    params: {
      path: {
        eventID: eventId,
      },
    },
  });
  const { mutate: subscribe } = useMutation('post', '/v1/users/my/subscribed-events/{eventID}');
  const { mutate: unsubscribe } = useMutation('delete', '/v1/users/my/subscribed-events/{eventID}');
  const [subscribed, setSubscribed] = useState<boolean>(false);

  useEffect(() => {
    if (data?.subscribed) {
      setSubscribed(true);
    } else {
      setSubscribed(false);
    }
  }, [data]);

  const handleSubscribe = () => {
    if (subscribed) {
      unsubscribe(
        {
          params: {
            path: {
              eventID: eventId
            }
          }
        },
        {
          onSuccess: () => {
            setSubscribed(false);
          },
        }
      );
    } else {
      subscribe(
        {
          params: {
            path: {
              eventID: eventId
            }
          }
        },
        {
          onSuccess: () => {
            setSubscribed(true);
          },
        }
      );
    }
  };

  return (
    <Btn
      className="w-full"
      disabled={isLoading || isError}
      onClick={handleSubscribe}
      variant={subscribed ? 'outline' : 'primary'}
    >
      {isLoading || isError ? 'Login to Subscribe' : subscribed ? 'Unsubscribe' : 'Subscribe'}
    </Btn>
  );
};

const SubscribeCompanyBtn: React.FC<ISubscribeCompanyBtnProps> = ({ companyId }) => {
  const { data, isError, isLoading } = useQuery(
    'get',
    '/v1/users/my/subscribed-companies/{companyID}',
    {
      params: {
        path: {
          companyID: companyId,
        },
      },
    }
  );
  const { mutate: subscribe } = useMutation(
    'post',
    '/v1/users/my/subscribed-companies/{companyID}'
  );
  const { mutate: unsubscribe } = useMutation(
    'delete',
    '/v1/users/my/subscribed-companies/{companyID}'
  );
  const [subscribed, setSubscribed] = useState<boolean>(false);

  useEffect(() => {
    if (data?.subscribed) {
      setSubscribed(true);
    } else {
      setSubscribed(false);
    }
  }, [data]);

  const handleSubscribe = () => {
    if (subscribed) {
      unsubscribe(
        {
          params: {
            path: {
              companyID: companyId
            }
          }
        },
        {
          onSuccess: () => {
            setSubscribed(false);
          },
        }
      );
    } else {
      subscribe(
        {
          params: {
            path: {
              companyID: companyId
            }
          }
        },
        {
          onSuccess: () => {
            setSubscribed(true);
          },
        }
      );
    }
  };

  return (
    <Btn
      className="w-full"
      disabled={isLoading || isError}
      onClick={handleSubscribe}
      variant={subscribed ? 'outline' : 'primary'}
    >
      {isLoading || isError ? 'Login to Subscribe' : subscribed ? 'Unsubscribe' : 'Subscribe'}
    </Btn>
  );
};

export { SubscribeBtn };
