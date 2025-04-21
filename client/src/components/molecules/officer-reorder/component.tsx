import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useMutation, useQuery } from '@/hooks/useFetch';
import Loading from '@/components/molecules/loading';
import FetchError from '@/components/molecules/fetch-error';
import { paths } from '@/types/schema.v1';
import Btn from '@/components/atoms/btn';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

type Officer =
  paths['/v1/officers']['get']['responses']['200']['content']['application/json']['officers'][number];
export interface IOfficerReorderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  onOfficerReorder?: () => void;
}

const OfficerReorder: React.FC<IOfficerReorderProps> = ({
  open,
  onOpenChange,
  children,
  onOfficerReorder = () => {}
}) => {
  const { data, isLoading, error } = useQuery('get', '/v1/officers');
  const { mutateAsync: reorderOfficers } = useMutation('put', '/v1/officers/reorder');
  const [officers, setOfficers] = React.useState<Officer[]>([]);

  useEffect(() => {
    if (data) {
      setOfficers(data.officers);
    }
  }, [data]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= officers.length) return;

    const updated = [...officers];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setOfficers(updated);
  };

  const handleOfficerReorder = async () => {
    try {
      await reorderOfficers({
        body: {
          reorder: officers.map((officer, index) => ({ id: officer.id, order_index: index + 1 }))
        }
      });
      toast.success('Officers reordered successfully');
    } catch (error) {
      console.log(error);
      toast.error('Failed to reorder officers');
    }
    onOfficerReorder();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reorder Officers</DialogTitle>
        </DialogHeader>
        <Loading isLoading={isLoading}>
          <FetchError isError={!!error || !data}>
            <div className="space-y-4">
              {officers.map((officer, index) => (
                <div
                  key={officer.id}
                  className="flex items-center justify-between p-3 bg-gray-100 rounded-md"
                >
                  <div>
                    <div className="font-medium">{officer.name}</div>
                    <div className="text-xs text-muted-foreground">{officer.position}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn
                      variant="ghost"
                      size="icon"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp />
                    </Btn>
                    <Btn
                      variant="ghost"
                      size="icon"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === officers.length - 1}
                    >
                      <ChevronDown />
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          </FetchError>
        </Loading>
        <DialogFooter>
          <Btn variant="outline" onClick={handleOfficerReorder}>
            Save
          </Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { OfficerReorder };
