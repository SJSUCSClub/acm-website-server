import Btn from '@/components/atoms/btn';
import FieldErrorMessage from '@/components/atoms/field-error-message';
import FetchError from '@/components/molecules/fetch-error';
import FileUpload from '@/components/molecules/file-upload';
import Loading from '@/components/molecules/loading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from '@/hooks/useFetch';
import { paths } from '@/types/schema.v1';
import { presignedUrlFetch } from '@/utils/presignedUrlFetch';
import { AnyFieldApi, useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

type Company =
  paths['/v1/companies']['post']['responses']['201']['content']['application/json']['company'];
const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  location: z.string().nullable(),
  description: z.string().min(1, { message: 'Description is required' }),
  industryId: z.enum([
    'Banking and Finance',
    'Aerospace',
    'Healthcare',
    'Automotive',
    'Energy',
    'Technology'
  ]),
  logo: z.instanceof(File).or(z.string()).nullable()
});
type FormValues = z.infer<typeof formSchema>;

export interface ICompanyForm {
  companyId?: string;
}

const CompanyForm: React.FC<ICompanyForm> = ({ companyId }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const {
    data: industryData,
    isLoading,
    error
  } = useQuery('get', '/v1/enums/{enumType}', {
    params: {
      path: {
        enumType: 'industry_enum'
      }
    }
  });
  const {
    data: companyData,
    isLoading: isLoadingCompany,
    error: errorCompany
  } = useQuery(
    'get',
    '/v1/companies/{companyID}',
    {
      params: {
        path: {
          companyID: companyId || ''
        }
      }
    },
    {
      enabled: !!companyId
    }
  );
  const { mutateAsync: createCompany } = useMutation('post', '/v1/companies');
  const { mutateAsync: updateCompany } = useMutation('put', '/v1/companies/{companyID}');
  const { mutateAsync: createLogo } = useMutation('post', '/v1/companies/{companyID}/logo');
  const { mutate: deleteLogo } = useMutation('delete', '/v1/companies/{companyID}/logo');

  const form = useForm({
    defaultValues: {
      name: companyData?.company.name || '',
      location: companyData?.company.location || null,
      description: companyData?.company.description || '',
      industryId: companyData?.company.industryId || industryData?.types[0],
      logo: companyData?.company.logo || null
    } as FormValues,
    validators: {
      onSubmit: formSchema
    },
    onSubmit: async ({ value }) => {
      if (!companyId) {
        try {
          const data = await createCompany({
            body: {
              ...value,
              logo: undefined
            }
          });

          const companyid = data.company.id.toString();
          if (typeof value.logo !== 'string') {
            await handleLogoSubmit(companyid, value.logo);
          }
          toast.success(`Company created successfully`);
          navigate({
            to: '/admin/companies/$companyId',
            params: { companyId: companyid }
          });
        } catch (e) {
          console.log(e);
          toast.error('Failed to create company');
        }
      } else {
        try {
          await updateCompany({
            params: {
              path: {
                companyID: companyId
              }
            },
            body: {
              ...value,
              logo: undefined
            }
          });
          if (typeof value.logo !== 'string') {
            await handleLogoSubmit(companyId, value.logo);
          }
          toast.success(`Company updated successfully`);
          navigate({
            to: '/admin/companies/$companyId',
            params: { companyId: companyId }
          });
        } catch (e) {
          console.log(e);
          toast.error('Failed to update company');
        }
      }
    }
  });

  const handleLogoSubmit = async (companyId: string, logo: File | null) => {
    if (logo) {
      try {
        const data = await createLogo({
          params: {
            path: {
              companyID: companyId
            }
          }
        });
        await presignedUrlFetch(data.presigned_url, logo);
        toast.success('Logo uploaded successfully');
      } catch (e) {
        console.log(e);
        toast.error('Failed to upload logo');
      }
    } else if (typeof form.options.defaultValues?.logo === 'string' && !logo) {
      deleteLogo(
        {
          params: {
            path: {
              companyID: companyId
            }
          }
        },
        {
          onSuccess() {
            toast.success('Logo deleted successfully');
          },
          onError() {
            toast.error('Failed to delete logo');
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
      <h1 className="text-4xl font-bold mb-5">Create Company</h1>
      <Loading isLoading={isLoading || isLoadingCompany}>
        <FetchError isError={!!error || !!errorCompany}>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="logo"
              children={(field) => (
                <div className="flex items-center gap-2">
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden">
                    {field.state.value ? (
                      <img
                        src={
                          typeof field.state.value === 'string'
                            ? field.state.value
                            : URL.createObjectURL(field.state.value)
                        }
                        alt={field.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted"></div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <FileUpload
                        onUpload={(files: File[]) => handleLogoUpload(files, field)}
                        open={isOpen}
                        onOpenChange={setIsOpen}
                        maxFiles={1}
                      >
                        <Btn type="button" variant="outline">
                          Upload
                        </Btn>
                      </FileUpload>
                    </div>
                    <Btn type="button" variant="outline" onClick={() => field.handleChange(null)}>
                      Remove
                    </Btn>
                  </div>
                </div>
              )}
            />
            <form.Field
              name="name"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name} className="text-lg">
                    Name
                  </Label>
                  <Input
                    placeholder="Company name"
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
                    placeholder="Company location"
                    name={field.name}
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value || null)}
                    type="text"
                    className="w-full"
                  />
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
                    placeholder="Describe your company"
                    className="min-h-[120px] w-full"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldErrorMessage field={field} />
                </div>
              )}
            />
            <form.Field
              name="industryId"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name} className="text-lg">
                    Industry
                  </Label>
                  <Select
                    disabled={isLoading}
                    onValueChange={(val) => field.handleChange(val as Company['industryId'])}
                    defaultValue={field.state.value}
                    name={field.name}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select project status" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryData?.types.map((type) => (
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

            <Btn type="submit" variant="outline">
              {companyId ? 'Update' : 'Create'}
            </Btn>
          </form>
        </FetchError>
      </Loading>
    </div>
  );
};

export { CompanyForm };
