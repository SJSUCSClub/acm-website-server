import Btn from '@/components/atoms/btn';
import { useMutation, useQuery } from '@/hooks/useFetch';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

export interface IInterestBtnProps {
  id: string;
}

const InterestBtn: React.FC<IInterestBtnProps> = ({ id }) => {
  const { data, isError, isLoading } = useQuery(
    'get',
    '/v1/users/my/projects-interest/{projectID}',
    {
      params: {
        path: {
          projectID: id
        }
      }
    }
  );
  const { mutate: showInterest } = useMutation(
    'post',
    '/v1/users/my/projects-interest/{projectID}'
  );
  const { mutate: removeInterest } = useMutation(
    'delete',
    '/v1/users/my/projects-interest/{projectID}'
  );
  const [interested, setInterested] = useState<boolean>(false);

  useEffect(() => {
    if (data?.interested) {
      setInterested(true);
    } else {
      setInterested(false);
    }
  }, [data]);

  const toastError = () => {
    toast.error('Error showing interest');
  };

  const handleInterest = () => {
    if (interested) {
      removeInterest(
        {
          params: {
            path: {
              projectID: id
            }
          }
        },
        {
          onSuccess: () => {
            setInterested(false);
          },
          onError() {
            toastError();
          }
        }
      );
    } else {
      showInterest(
        {
          params: {
            path: {
              projectID: id
            }
          }
        },
        {
          onSuccess: () => {
            setInterested(true);
          },
          onError() {
            toastError();
          }
        }
      );
    }
  };

  return (
    <Btn size="sm" disabled={isLoading || isError} onClick={handleInterest}>
      {isLoading || isError ? (
        'Login to Show Interest'
      ) : interested ? (
        <>
          <Check /> Shown Interest
        </>
      ) : (
        'Interested in Joining'
      )}
    </Btn>
  );
};

export { InterestBtn };
