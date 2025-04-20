import Btn from '@/components/atoms/btn';
import FieldErrorMessage from '@/components/atoms/field-error-message';
import FetchError from '@/components/molecules/fetch-error';
import FileUpload from '@/components/molecules/file-upload';
import Loading from '@/components/molecules/loading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery } from '@/hooks/useFetch';
import { paths } from '@/types/schema.v1';
import { presignedUrlFetch } from '@/utils/presignedUrlFetch';
import { AnyFieldApi, useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  position: z.string().min(1, { message: 'Position is required' }),
  linkedin: z.string().url().or(z.literal('')),
  photo: z.instanceof(File).or(z.string()).nullable()
});
type FormValues = z.infer<typeof formSchema>;
export interface IOfficerFormProps {
  officerId?: string;
}

const OfficerForm: React.FC<IOfficerFormProps> = ({ officerId }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const {
    data: officerData,
    isLoading: isLoadingOfficer,
    error: errorOfficer,
  } = useQuery(
    'get',
    '/v1/officers/{officerID}',
    {
      params: {
        path: {
          officerID: officerId || ''
        }
      }
    },
    {
      enabled: !!officerId
    }
  );
  const { mutateAsync: updateOfficer } = useMutation('put', '/v1/officers/{officerID}');
  const { mutateAsync: createOfficer } = useMutation('post', '/v1/officers');
  const { mutateAsync: createPhoto } = useMutation('post', '/v1/officers/{officerID}/photo');
  const { mutate: deletePhoto } = useMutation('delete', '/v1/officers/{officerID}/photo');

  const form = useForm({
    defaultValues: {
      name: officerData?.officer.name || '',
      position: officerData?.officer.position || '',
      linkedin: officerData?.officer.linkedin || '',
      photo: officerData?.officer.photo || null
    } as FormValues,
    validators: {
      onSubmit: formSchema
    },
    onSubmit: async ({ value }) => {
      if (!officerId) {
        try {
          const data = await createOfficer({
            body: {
              ...value,
              photo: undefined
            }
          });

          const officerId = data.officer.id.toString();
          if (typeof value.photo !== 'string') {
            await handlePhotoUpload(officerId, value.photo);
          }
          toast.success(`Officer created successfully`);
          navigate({
            to: '/admin/officers'
          });
        } catch (e) {
          console.log(e);
          toast.error('Failed to create officer');
        }
      } else {
        try {
          await updateOfficer({
            params: {
              path: {
                officerID: officerId
              }
            },
            body: {
              ...value,
              photo: undefined
            }
          });
          if (typeof value.photo !== 'string') {
            await handlePhotoUpload(officerId, value.photo);
          }
          toast.success(`Officer updated successfully`);
          navigate({
            to: '/admin/officers'
          });
        } catch (e) {
          console.log(e);
          toast.error('Failed to update officer');
        }
      }
    }
  });

  const handlePhotoUpload = async (officerId: string, photo: File | null) => {
    if (photo) {
      try {
        const data = await createPhoto({
          params: {
            path: {
              officerID: officerId
            }
          }
        });
        await presignedUrlFetch(data.presigned_url, photo);
        toast.success('Photo uploaded successfully');
      } catch (e) {
        console.log(e);
        toast.error('Failed to upload photo');
      }
    } else {
      deletePhoto(
        {
          params: {
            path: {
              officerID: officerId
            }
          }
        },
        {
          onSuccess() {
            toast.success('Photo deleted successfully');
          },
          onError() {
            toast.error('Failed to delete photo');
          }
        }
      );
    }
  };

  const handleLogoUpload = (files: File[], field: AnyFieldApi) => {
    field.handleChange(files[0]);
    setIsOpen(false);
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-5">Create Officer</h1>
      <Loading isLoading={isLoadingOfficer}>
        <FetchError isError={!!errorOfficer}>
          <form
            className="grid grid-cols-4 gap-8"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <div className="space-y-8">
              <form.Field
                name="photo"
                children={(field) => (
                  <div>
                    <div className="relative h-60 w-60 rounded-lg overflow-hidden m-auto">
                      {field.state.value ? (
                        <img
                          src={
                            typeof field.state.value === 'string'
                              ? field.state.value
                              : URL.createObjectURL(field.state.value)
                          }
                          alt={field.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted"></div>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <FileUpload
                        onUpload={(files: File[]) => handleLogoUpload(files, field)}
                        open={isOpen}
                        onOpenChange={setIsOpen}
                        maxFiles={1}
                      >
                        <p className="underline underline-offset-4 text-blue-500">Upload</p>
                      </FileUpload>
                      <p
                        className="underline underline-offset-4 text-red-500 cursor-pointer"
                        onClick={() => field.handleChange(null)}
                      >
                        Delete
                      </p>
                    </div>
                  </div>
                )}
              />
            </div>
            <div className="lg:col-span-3 space-y-5">
              <form.Field
                name="name"
                children={(field) => (
                  <div>
                    <Label htmlFor={field.name} className="text-lg">
                      Name
                    </Label>
                    <Input
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="text"
                      className="w-full"
                    />
                    <FieldErrorMessage field={field} />
                  </div>
                )}
              />
              <form.Field
                name="position"
                children={(field) => (
                  <div>
                    <Label htmlFor={field.name} className="text-lg">
                      Position
                    </Label>
                    <Input
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="text"
                      className="w-full"
                    />
                    <FieldErrorMessage field={field} />
                  </div>
                )}
              />
              <form.Field
                name="linkedin"
                children={(field) => (
                  <div>
                    <Label htmlFor={field.name} className="text-lg">
                      Linkedin
                    </Label>
                    <Input
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="text"
                      className="w-full"
                    />
                    <FieldErrorMessage field={field} />
                  </div>
                )}
              />
              <Btn type="submit" variant="outline">
                Submit
              </Btn>
            </div>
          </form>
        </FetchError>
      </Loading>
    </div>
  );
};

export { OfficerForm };
