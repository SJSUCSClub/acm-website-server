import Btn from "@/components/atoms/btn";
import { useMutation, useQuery } from "@/hooks/useFetch";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface IAttendBtnProps {
  id: string;
  full?: boolean;
}

const AttendBtn: React.FC<IAttendBtnProps> = ({ id, full = false }) => {
  const { data, isError, isLoading } = useQuery(
    "get",
    "/v1/users/my/attending-events/{eventID}",
    {
      params: {
        path: {
          eventID: id,
        },
      },
    },
  );
  const { mutate: subscribe } = useMutation(
    "post",
    "/v1/users/my/attending-events/{eventID}",
  );
  const { mutate: unsubscribe } = useMutation(
    "delete",
    "/v1/users/my/attending-events/{eventID}",
  );
  const [attending, setAttending] = useState<boolean>(false);

  useEffect(() => {
    if (data?.attending) {
      setAttending(true);
    } else {
      setAttending(false);
    }
  }, [data]);

  const toastError = () => {
    toast.error("You don't have permissions to attend");
  };

  const handleSubscribe = () => {
    if (attending) {
      unsubscribe(
        {
          params: {
            path: {
              eventID: id,
            },
          },
        },
        {
          onSuccess: () => {
            setAttending(false);
          },
          onError() {
            toastError();
          },
        },
      );
    } else if (!full) {
      subscribe(
        {
          params: {
            path: {
              eventID: id,
            },
          },
        },
        {
          onSuccess: () => {
            setAttending(true);
          },
          onError() {
            toastError();
          },
        },
      );
    } else {
      toast.error("Event capacity reached");
    }
  };

  return (
    <Btn
      className="w-full"
      disabled={isLoading || isError}
      onClick={handleSubscribe}
      variant={"outline"}
    >
      {isLoading || isError
        ? "Login to Subscribe"
        : attending
          ? "Attending"
          : "Attend"}
    </Btn>
  );
};

export { AttendBtn };
