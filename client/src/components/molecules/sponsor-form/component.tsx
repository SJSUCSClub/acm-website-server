import Btn from '@/components/atoms/btn';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@tanstack/react-form';
import React, { useState } from 'react';
import { z } from 'zod';
import FileUpload from '@/components/molecules/file-upload';
import { useMutation } from '@/hooks/useFetch';
import { toast } from 'sonner';
import { presignedUrlFetch } from '@/utils/presignedUrlFetch';

const formSchema = z.object({
  name: z.string().min(1),
  logo: z.instanceof(File).nullable()
});
type FormValues = z.infer<typeof formSchema>;

export interface ISponsorFormProps {
  onCreateComplete?: () => void;
}

const SponsorForm: React.FC<ISponsorFormProps> = ({ onCreateComplete = () => {} }) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createSponsor } = useMutation('post', '/v1/sponsors');
  const { mutateAsync: createLogo } = useMutation('post', '/v1/sponsors/{sponsorName}/logo');
  const form = useForm({
    defaultValues: {
      name: '',
      logo: null
    } as FormValues,
    validators: {
      onSubmit: formSchema as any // eslint-disable-line @typescript-eslint/no-explicit-any
    },
    onSubmit: async ({ value }) => {
      try {
        await createSponsor({
          body: {
            name: value.name,
            logoKey: undefined
          }
        });

        if (value.logo) {
          await handleLogoUpload(value.name, value.logo);
        }
        toast.success('Sponsor created successfully');
      } catch (e) {
        console.log(e);
        toast.error('Failed to create sponsor');
      }
      onCreateComplete();
      setOpen(false);
    }
  });

  const handleLogoUpload = async (name: string, logo: File) => {
    try {
      const data = await createLogo({
        params: {
          path: {
            sponsorName: name
          }
        }
      });
      await presignedUrlFetch(data.presigned_url, logo);
      toast.success('Image uploaded successfully');
    } catch (e) {
      console.log(e);
      toast.error('Failed to upload Image');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        <Btn variant="outline" onClick={() => setOpen(true)}>
          Add Sponsor
        </Btn>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sponsor</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-4 py-4">
            <form.Field
              name="logo"
              children={(field) => (
                <div>
                  <div className="relative w-full aspect-[1/1] overflow-hidden m-auto">
                    {field.state.value ? (
                      <img
                        src={URL.createObjectURL(field.state.value)}
                        alt={field.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-400"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <FileUpload
                      onUpload={(files: File[]) => field.handleChange(files[0])}
                      maxFiles={1}
                    >
                      <p className="underline underline-offset-4 text-blue-500">Upload</p>
                    </FileUpload>
                  </div>
                </div>
              )}
            />
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
          </div>
          <DialogFooter>
            <Btn variant="outline" type="submit">
              Add
            </Btn>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { SponsorForm };
