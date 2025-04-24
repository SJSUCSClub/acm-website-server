import Btn from '@/components/atoms/btn';
import FieldErrorMessage from '@/components/atoms/field-error-message';
import BtnTagFilter from '@/components/molecules/btn-tag-filter';
import { Calendar } from '@/components/molecules/calendar';
import FetchError from '@/components/molecules/fetch-error';
import FileUpload from '@/components/molecules/file-upload';
import Loading from '@/components/molecules/loading';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from '@/hooks/useFetch';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/formatter';
import { presignedUrlFetch } from '@/utils/presignedUrlFetch';
import { toBoolean } from '@/utils/transform';
import { AnyFieldApi, useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { CalendarIcon, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  location: z.string().min(3, { message: 'Location is required' }),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  urls: z.array(z.string()),
  eventType: z.enum(
    ['Workshop', 'Seminar', 'Hackathon', 'Conference', 'Meetup', 'Tech Talk', 'Other'],
    { required_error: 'Event type is required' }
  ),
  eventCapacity: z.number().int().positive().nullable(),
  image: z.instanceof(File).or(z.string()).nullable(),
  startTime: z.string().min(1, { message: 'Start time is required' }),
  endTime: z.string().min(1, { message: 'End time is required' }),
  tags: z.array(
    z.enum([
      'Web Development',
      'Machine Learning',
      'Cloud Computing',
      'Artificial Intelligence',
      'Networking',
      'Cybersecurity',
      'Mobile Development',
      'Game Development',
      'Data Science'
    ])
  ),
  targetAudience: z.enum(['Students']).nullable(),
  memberOnly: z.boolean(),
  shortenedEventUrl: z.number().nullable()
});

type FormValues = z.infer<typeof formSchema>;

export interface IEventFormProps {
  eventId?: string;
}

const EventForm: React.FC<IEventFormProps> = ({ eventId }) => {
  const navigate = useNavigate();
  const [newUrl, setNewUrl] = useState('');
  const {
    data: eventTypeData,
    isLoading: isLoadingEventType,
    error: errorEventType
  } = useQuery('get', '/v1/enums/{enumType}', {
    params: {
      path: {
        enumType: 'events_enum'
      }
    }
  });
  const {
    data: targetAudienceData,
    isLoading: isLoadingTargetAudience,
    error: errorTargetAudience
  } = useQuery('get', '/v1/enums/{enumType}', {
    params: {
      path: {
        enumType: 'target_audience_enum'
      }
    }
  });
  const {
    data: eventData,
    isLoading: isLoadingEvent,
    error: errorEvent
  } = useQuery(
    'get',
    '/v1/events/{eventID}',
    {
      params: {
        path: {
          eventID: eventId || ''
        }
      }
    },
    {
      enabled: !!eventId
    }
  );
  const { mutateAsync: createEvent } = useMutation('post', '/v1/events');
  const { mutateAsync: updateEvent } = useMutation('put', '/v1/events/{eventID}');
  const { mutateAsync: createImage } = useMutation('post', '/v1/events/{eventID}/image');
  const { mutate: deleteImage } = useMutation('delete', '/v1/events/{eventID}/image');

  const form = useForm({
    defaultValues: {
      name: eventData?.event.name || '',
      location: eventData?.event.location || '',
      startDate: eventData?.event.startDate ? new Date(eventData?.event.startDate) : new Date(),
      endDate: eventData?.event.endDate ? new Date(eventData?.event.endDate) : new Date(),
      description: eventData?.event.description || '',
      urls: eventData?.event.urls || [],
      eventType: eventData?.event.eventType || 'Workshop',
      eventCapacity: eventData?.event.eventCapacity || null,
      image: eventData?.event.image || null,
      startTime: eventData?.event.startTime || '',
      endTime: eventData?.event.endTime || '',
      tags: eventData?.event.tags || [],
      targetAudience: eventData?.event.targetAudience || null,
      memberOnly: eventData?.event.memberOnly || false,
      shortenedEventUrl: eventData?.event.shortenedEventUrl || null
    } as FormValues,
    validators: {
      onSubmit: formSchema
    },
    onSubmit: async ({ value }) => {
      if (!eventId) {
        try {
          const data = await createEvent({
            body: {
              ...value,
              startDate: value.startDate.toISOString(),
              endDate: value.endDate.toISOString(),
              image: undefined
            }
          });

          const eventId = data.event.id.toString();
          if (typeof value.image !== 'string') {
            await handleImageUpload(eventId, value.image);
          }
          toast.success(`Event created successfully`);
          navigate({
            to: '/admin/events/$eventId',
            params: { eventId }
          });
        } catch (e) {
          console.log(e);
          toast.error('Failed to create event');
        }
      } else {
        try {
          await updateEvent({
            params: {
              path: {
                eventID: eventId
              }
            },
            body: {
              ...value,
              startDate: value.startDate.toISOString(),
              endDate: value.endDate.toISOString(),
              image: undefined
            }
          });
          if (typeof value.image !== 'string') {
            await handleImageUpload(eventId, value.image);
          }
          toast.success(`Event updated successfully`);
          navigate({
            to: '/admin/events/$eventId',
            params: { eventId }
          });
        } catch (e) {
          console.log(e);
          toast.error('Failed to update event');
        }
      }
    }
  });

  const handleImageUpload = async (eventId: string, image: File | null) => {
    if (image) {
      try {
        const data = await createImage({
          params: {
            path: {
              eventID: eventId.toString()
            }
          }
        });
        await presignedUrlFetch(data.presigned_url, image);
        toast.success('Image uploaded successfully');
      } catch (e) {
        console.log(e);
        toast.error('Failed to upload image');
      }
    } else {
      deleteImage(
        {
          params: {
            path: {
              eventID: eventId
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

  const addUrl = () => {
    form.setFieldValue('urls', [...form.getFieldValue('urls'), newUrl]);
    setNewUrl('');
  };

  const removeUrl = (index: number) => {
    form.getFieldValue('urls').splice(index, 1);
    form.setFieldValue('urls', [...form.getFieldValue('urls')]);
    setNewUrl('');
  };

  const handleLogoUpload = (files: File[], field: AnyFieldApi) => {
    field.handleChange(files[0]);
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-5">{eventId ? 'Edit Event' : 'Create Event'}</h1>
      <Loading isLoading={isLoadingEventType || isLoadingTargetAudience || isLoadingEvent}>
        <FetchError isError={!!errorEventType || !!errorTargetAudience || !!errorEvent}>
          <form
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <div className="lg:col-span-1 space-y-8">
              <form.Field
                name="image"
                children={(field) => (
                  <div>
                    <div className="relative rounded-xl overflow-hidden">
                      {field.state.value ? (
                        <img
                          src={
                            typeof field.state.value === 'string'
                              ? field.state.value
                              : URL.createObjectURL(field.state.value)
                          }
                          alt={field.name}
                          className="w-full h-full aspect-[2/3] object-cover"
                        />
                      ) : (
                        <div className="w-full h-[36rem] bg-muted"></div>
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
            <div className="space-y-8 lg:col-span-2">
              <form.Field
                name="name"
                children={(field) => (
                  <div>
                    <Label htmlFor={field.name} className="text-lg">
                      Name
                    </Label>
                    <Input
                      placeholder="Name"
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
                name="location"
                children={(field) => (
                  <div>
                    <Label htmlFor={field.name} className="text-lg">
                      Location
                    </Label>
                    <Input
                      placeholder="Location"
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
              <div className="grid grid-cols-4 gap-4">
                <form.Field
                  name="startDate"
                  children={(field) => (
                    <div>
                      <Label htmlFor={field.name} className="text-lg">
                        Start Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Btn
                            type="button"
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.state.value && 'text-muted-foreground'
                            )}
                          >
                            {field.state.value ? (
                              formatDate(field.state.value.toISOString())
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Btn>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.state.value}
                            onSelect={(date) => field.handleChange(date || new Date())}
                            className="w-full"
                          />
                        </PopoverContent>
                      </Popover>
                      <FieldErrorMessage field={field} />
                    </div>
                  )}
                />
                <form.Field
                  name="endDate"
                  children={(field) => (
                    <div>
                      <Label htmlFor={field.name} className="text-lg">
                        End Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Btn
                            type="button"
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.state.value && 'text-muted-foreground'
                            )}
                          >
                            {field.state.value ? (
                              formatDate(field.state.value.toISOString())
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Btn>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.state.value}
                            onSelect={(date) => field.handleChange(date || new Date())}
                            className="w-full"
                          />
                        </PopoverContent>
                      </Popover>
                      <FieldErrorMessage field={field} />
                    </div>
                  )}
                />
                <form.Field
                  name="startTime"
                  children={(field) => (
                    <div>
                      <Label htmlFor={field.name} className="text-lg">
                        Start Time
                      </Label>
                      <Input
                        type="time"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full"
                      />
                      <FieldErrorMessage field={field} />
                    </div>
                  )}
                />
                <form.Field
                  name="endTime"
                  children={(field) => (
                    <div>
                      <Label htmlFor={field.name} className="text-lg">
                        End Time
                      </Label>
                      <Input
                        type="time"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full"
                      />
                      <FieldErrorMessage field={field} />
                    </div>
                  )}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <form.Field
                  name="eventType"
                  children={(field) => (
                    <div>
                      <Label htmlFor={field.name} className="text-lg">
                        Event Type
                      </Label>
                      <Select
                        onValueChange={(val) => field.handleChange(val as FormValues['eventType'])}
                        defaultValue={field.state.value}
                        name={field.name}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypeData?.types.map((type) => (
                            <SelectItem value={type} key={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldErrorMessage field={field} />
                    </div>
                  )}
                />
                <form.Field
                  name="eventCapacity"
                  children={(field) => (
                    <div>
                      <Label htmlFor={field.name} className="text-lg">
                        Event Capacity
                      </Label>
                      <Input
                        type="number"
                        value={field.state.value || ''}
                        onChange={(e) =>
                          field.handleChange(e.target.value ? parseInt(e.target.value) : null)
                        }
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground">
                        Leave blank if event is not capacity limited
                      </p>
                      <FieldErrorMessage field={field} />
                    </div>
                  )}
                />
                <form.Field
                  name="targetAudience"
                  children={(field) => (
                    <div>
                      <Label htmlFor={field.name} className="text-lg">
                        Target Audience
                      </Label>
                      <Select
                        onValueChange={(val) =>
                          field.handleChange(
                            val !== 'All' ? (val as FormValues['targetAudience']) : null
                          )
                        }
                        defaultValue={field.options.defaultValue || 'All'}
                        name={field.name}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">For Everyone</SelectItem>
                          {targetAudienceData?.types.map((type) => (
                            <SelectItem value={type} key={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldErrorMessage field={field} />
                    </div>
                  )}
                />
                <form.Field
                  name="memberOnly"
                  children={(field) => (
                    <div>
                      <Label htmlFor={field.name} className="text-lg">
                        Member Only
                      </Label>
                      <Select
                        onValueChange={(val) => field.handleChange(toBoolean(val))}
                        defaultValue={field.state.value.toString()}
                        name={field.name}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select target audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldErrorMessage field={field} />
                    </div>
                  )}
                />
              </div>
              <form.Field
                name="description"
                children={(field) => (
                  <div>
                    <Label htmlFor={field.name} className="text-lg">
                      Description
                    </Label>
                    <Textarea
                      placeholder="Describe your event"
                      className="min-h-[120px] w-full"
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldErrorMessage field={field} />
                  </div>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="urls"
                  children={(field) => (
                    <div>
                      <Label htmlFor={field.name} className="text-lg">
                        Urls
                      </Label>
                      <div className="flex items-center gap-2 text-sm border border-gray-300 rounded-md mb-2">
                        <Input
                          placeholder="https://example.com"
                          name={field.name}
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          type="text"
                          className="w-full border-none focus-visible:ring-0"
                        />
                        <Btn type="button" variant="ghost" onClick={addUrl} disabled={!newUrl}>
                          <Plus className="h-4 w-4" />
                        </Btn>
                      </div>
                      <div className="space-y-2">
                        {field.state.value.map((url, index) => (
                          <div
                            key={index}
                            className="flex bg-muted p-2 rounded-md items-center gap-2"
                          >
                            <div className="flex-1 truncate text-sm">{url}</div>
                            <Btn
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeUrl(index)}
                            >
                              <X className="h-4 w-4" />
                            </Btn>
                          </div>
                        ))}
                      </div>
                      <FieldErrorMessage field={field} />
                    </div>
                  )}
                />
                <form.Field
                  name="tags"
                  children={(field) => (
                    <div>
                      <Label htmlFor={field.name} className="text-lg">
                        Tags
                      </Label>
                      <div>
                        <BtnTagFilter
                          selectedTags={field.state.value}
                          onSelectChange={field.handleChange}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.state.value.map((tag) => {
                            return (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="flex items-center gap-2"
                              >
                                <p>{tag}</p>
                                <Btn
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    field.handleChange(
                                      field.state.value.filter((item) => item !== tag)
                                    )
                                  }
                                >
                                  <X className="ml-2 h-4 w-4" />
                                </Btn>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <FieldErrorMessage field={field} />
                    </div>
                  )}
                />
              </div>
              <Btn variant="outline" type="submit">
                {eventId ? 'Update' : 'Create'}
              </Btn>
            </div>
          </form>
        </FetchError>
      </Loading>
    </div>
  );
};

export { EventForm };
