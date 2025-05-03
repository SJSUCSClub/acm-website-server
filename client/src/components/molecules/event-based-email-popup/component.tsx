import Btn from '@/components/atoms/btn';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { api } from '@/hooks/useFetch';
import { paths } from '@/types/schema.v1';
import React, { useState } from 'react';
import { toast } from 'sonner';

type Event =
  paths['/v1/events/{eventID}']['get']['responses']['200']['content']['application/json']['event'];

export interface IEventBasedEmailPopupProps {
  event: Event;
  children: React.ReactNode;
}

type RecipientGroup = 'subscribers' | 'attendees';

const EventBasedEmailPopup: React.FC<IEventBasedEmailPopupProps> = ({ children, event }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [recipientGroup, setRecipientGroup] = useState<RecipientGroup[]>([]);
  const handleCheckboxChange = (recipient: RecipientGroup, checked: boolean) => {
    if (checked) {
      setRecipientGroup([...recipientGroup, recipient]);
    } else {
      setRecipientGroup(recipientGroup.filter((item) => item !== recipient));
    }
  };

  const handleSendEmail = async () => {
    if (recipientGroup.length === 0) {
      toast.error('Please select at least one recipient group');
      return;
    }

    setIsLoading(true);
    const { data, error } = await api.GET('/v1/events/{eventID}/email-recipients', {
      params: {
        path: {
          eventID: event.id.toString()
        },
        query: {
          recipientGroup: recipientGroup.join(',')
        }
      }
    });

    if (error) {
      toast.error('Failed to fetch recipients');
      return;
    }

    if (!data?.recipients || data?.recipients.length === 0) {
      toast.error('No recipients found');
      return;
    }

    window.open(
      `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${data?.recipients || ''}`,
      '_blank'
    );
    setIsLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>Select the recipient groups to send email to.</DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                value={'subscribers'}
                checked={recipientGroup.includes('subscribers')}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('subscribers', checked as boolean)
                }
              />
              <div className="space-y-1 leading-none">
                <Label>Subscribers</Label>
                <p className="text-sm text-muted-foreground">
                  Send to users who subscribed to this event
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                value={'attendees'}
                checked={recipientGroup.includes('attendees')}
                onCheckedChange={(checked) => handleCheckboxChange('attendees', checked as boolean)}
              />
              <div className="space-y-1 leading-none">
                <Label>Attendees</Label>
                <p className="text-sm text-muted-foreground">
                  Send to users who are attending this event
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Btn onClick={handleSendEmail} disabled={isLoading}>
            {isLoading ? 'Fetching recipients...' : 'Send Email'}
          </Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { EventBasedEmailPopup };
