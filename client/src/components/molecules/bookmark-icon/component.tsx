import Btn from '@/components/atoms/btn';
import { useMutation, useQuery } from '@/hooks/useFetch';
import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface IBookmarkIconProps {
  id: string;
}

const BookmarkIcon: React.FC<IBookmarkIconProps> = ({ id }) => {
  const { data, isError, isLoading } = useQuery('get', '/v1/users/my/bookmarked/{eventID}', {
    params: {
      path: {
        eventID: id,
      },
    },
  });
  const { mutate: subscribe } = useMutation('post', '/v1/users/my/bookmarked/{eventID}');
  const { mutate: unsubscribe } = useMutation('delete', '/v1/users/my/bookmarked/{eventID}');
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  useEffect(() => {
    setBookmarked(data?.bookmarked ?? false);
  }, [data]);

  const handleSubscribe = () => {
    if (bookmarked) {
      unsubscribe(
        {
          params: {
            path: {
              eventID: id
            }
          }
        },
        {
          onSuccess: () => {
            setBookmarked(false);
          },
        }
      );
    } else {
      subscribe(
        {
          params: {
            path: {
              eventID: id
            }
          }
        },
        {
          onSuccess: () => {
            setBookmarked(true);
          },
        }
      );
    }
  };

  return (
    <Btn
      disabled={isLoading || isError}
      onClick={handleSubscribe}
      size="icon"
      variant="secondary"
      className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90"
    >
      <Bookmark fill={bookmarked ? '#00000' : '#ffffff'} className="h-5 w-5" />
      <span className="sr-only">Bookmark</span>
    </Btn>
  );
};

export { BookmarkIcon };
