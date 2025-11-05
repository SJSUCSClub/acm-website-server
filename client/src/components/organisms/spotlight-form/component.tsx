import Btn from '@/components/atoms/btn';
import FieldErrorMessage from '@/components/atoms/field-error-message';
import EventCombobox from '@/components/molecules/event-combobox';
import FetchError from '@/components/molecules/fetch-error';
import FileUpload from '@/components/molecules/file-upload';
import Loading from '@/components/molecules/loading';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from '@/hooks/useFetch';
import { presignedUrlFetch } from '@/utils/presignedUrlFetch';
import { AnyFieldApi, useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  description: z.string().min(1, { message: 'Description is required' }),
  eventId: z.number().int().positive(),
  image: z.instanceof(File).or(z.string()).nullable()
});
type FormValues = z.infer<typeof formSchema>;
export interface ISpotlightFormProps {
  spotlightId?: string;
}

const SpotlightForm: React.FC<ISpotlightFormProps> = ({ spotlightId }) => {
  const navigate = useNavigate();
  const {
    data: spotlightData,
    isLoading: isLoadingSpotlight,
    error: errorSpotlight
  } = useQuery(
    'get',
    '/v1/club/spotlights/{spotlightID}',
    {
      params: {
        path: {
          spotlightID: spotlightId || ''
        }
      }
    },
    {
      enabled: !!spotlightId
    }
  );
  const { mutateAsync: updateSpotlight } = useMutation('put', '/v1/club/spotlights/{spotlightID}');
  const { mutateAsync: createSpotlight } = useMutation('post', '/v1/club/spotlights');
  const { mutateAsync: createImage } = useMutation(
    'post',
    '/v1/club/spotlights/{spotlightID}/image'
  );
  const { mutate: deleteImage } = useMutation('delete', '/v1/club/spotlights/{spotlightID}/image');

  const form = useForm({
    defaultValues: {
      description: spotlightData?.spotlight.description || '',
      eventId: spotlightData?.spotlight.eventId || null,
      image: spotlightData?.spotlight.image || null
    } as FormValues,
    validators: {
      onSubmit: formSchema as any // eslint-disable-line @typescript-eslint/no-explicit-any
    },
    onSubmit: async ({ value }) => {
      if (!spotlightId) {
        try {
          const data = await createSpotlight({
            body: {
              ...value,
              imageKey: undefined
            }
          });

          const spotlightId = data.spotlight.id.toString();
          if (typeof value.image !== 'string') {
            await handleImageUpload(spotlightId, value.image);
          }
          toast.success('Spotlight created successfully');
          navigate({
            to: '/admin/club'
          });
        } catch (e) {
          console.log(e);
          toast.error('Failed to create spotlight');
        }
      } else {
        try {
          await updateSpotlight({
            params: {
              path: {
                spotlightID: spotlightId
              }
            },
            body: {
              ...value,
              imageKey: undefined
            }
          });
          if (typeof value.image !== 'string') {
            await handleImageUpload(spotlightId, value.image);
          }
          toast.success('Spotlight updated successfully');
          navigate({
            to: '/admin/club'
          });
        } catch (e) {
          console.log(e);
          toast.error('Failed to update spotlight');
        }
      }
    }
  });

  const handleImageUpload = async (spotlightId: string, image: File | null) => {
    if (image) {
      try {
        const data = await createImage({
          params: {
            path: {
              spotlightID: spotlightId
            }
          }
        });
        await presignedUrlFetch(data.presigned_url, image);
        toast.success('Image uploaded successfully');
      } catch (e) {
        console.log(e);
        toast.error('Failed to upload Image');
      }
    } else {
      deleteImage(
        {
          params: {
            path: {
              spotlightID: spotlightId
            }
          }
        },
        {
          onSuccess() {
            toast.success('Image deleted successfully');
          },
          onError() {
            toast.error('Failed to delete image');
          }
        }
      );
    }
  };

  const handleLogoUpload = (files: File[], field: AnyFieldApi) => {
    field.handleChange(files[0]);
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-5">
        {spotlightId ? 'Edit Spotlight' : 'Create Spotlight'}
      </h1>
      <Loading isLoading={isLoadingSpotlight}>
        <FetchError isError={!!errorSpotlight}>
          <form
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <div className="space-y-8">
              <form.Field
                name="image"
                children={(field) => (
                  <div>
                    <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden m-auto">
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
                        <div className="w-full h-full bg-gray-400"></div>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <FileUpload
                        onUpload={(files: File[]) => handleLogoUpload(files, field)}
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
            <div className="lg:col-span-2 space-y-5">
              <form.Field
                name="eventId"
                children={(field) => (
                  <div>
                    <Label htmlFor={field.name} className="text-lg">
                      Event
                    </Label>
                    <div>
                      <EventCombobox
                        selectedId={field.state.value}
                        onSelectChange={field.handleChange}
                      />
                    </div>
                    <FieldErrorMessage field={field} />
                  </div>
                )}
              />
              <form.Field
                name="description"
                children={(field) => (
                  <div>
                    <Label htmlFor={field.name} className="text-lg">
                      Description
                    </Label>
                    <Textarea
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full"
                    />
                    <FieldErrorMessage field={field} />
                  </div>
                )}
              />
              <Btn type="submit" variant="outline">
                {spotlightId ? 'Update' : 'Create'}
              </Btn>
            </div>
          </form>
        </FetchError>
      </Loading>
    </div>
  );
};

export { SpotlightForm };
