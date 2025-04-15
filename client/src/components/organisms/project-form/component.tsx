import Btn from '@/components/atoms/btn';
import FieldErrorMessage from '@/components/atoms/field-error-message';
import FetchError from '@/components/molecules/fetch-error';
import Loading from '@/components/molecules/loading';
import { Button } from '@/components/ui/button';
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
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

type Project =
  paths['/v1/projects']['post']['responses']['201']['content']['application/json']['project'];
export interface IProjectFormProps {
  projectId?: string;
}

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  githubLink: z.string().url().or(z.literal('')),
  status: z.enum(['Not Started', 'Looking for Members', 'In Progress', 'Completed'])
});

const ProjectForm: React.FC<IProjectFormProps> = ({ projectId = null }) => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery(
    'get',
    '/v1/projects/{projectID}',
    {
      params: {
        path: {
          projectID: projectId || ''
        }
      }
    },
    {
      enabled: !!projectId
    }
  );
  const { mutate: createProject } = useMutation('post', '/v1/projects');
  const { mutate: updateProject } = useMutation('put', '/v1/projects/{projectID}');

  const form = useForm({
    defaultValues: {
      name: data?.project.name || '',
      description: data?.project.description || '',
      githubLink: data?.project.githubLink || '',
      status: data?.project.status || 'Not Started'
    },
    validators: {
      onChange: formSchema
    },
    onSubmit: ({ value }) => {
      if (projectId) {
        updateProject(
          {
            params: {
              path: {
                projectID: projectId
              }
            },
            body: {
              ...value,
              githubLink: value.githubLink || null
            }
          },
          {
            onSuccess() {
              navigate({
                to: '/admin/projects/$projectId',
                params: { projectId: projectId }
              });
            },
            onError() {
              toast.error('Failed to update project');
            }
          }
        );
      } else {
        createProject(
          {
            body: {
              ...value,
              githubLink: value.githubLink || null
            }
          },
          {
            onSuccess(data) {
              navigate({
                to: '/admin/projects/$projectId',
                params: { projectId: data.project.id.toString() }
              });
            },
            onError() {
              toast.error('Failed to create project');
            }
          }
        );
      }
    }
  });

  return (
    <Loading isLoading={isLoading}>
      <FetchError isError={!!error}>
        <div>
          <h1 className="text-4xl font-bold mb-5">
            {projectId ? 'Edit Project' : 'Create Project'}
          </h1>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="name"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name} className="text-lg">
                    Name
                  </Label>
                  <Input
                    placeholder="Enter project name"
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
              name="description"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name} className="text-lg">
                    Description
                  </Label>
                  <Textarea
                    placeholder="Describe your project"
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
              name="githubLink"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name} className="text-lg">
                    GitHub Link
                  </Label>
                  <Input
                    placeholder="https://github.com/username/repo"
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
              name="status"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name} className="text-lg">
                    Status
                  </Label>
                  <Select
                    onValueChange={(val) => field.handleChange(val as Project['status'])}
                    defaultValue={field.state.value}
                    name={field.name}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select project status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Looking for Members">Looking for Members</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldErrorMessage field={field} />
                </div>
              )}
            />
            <Btn type="submit">{projectId ? 'Update' : 'Create'}</Btn>
          </form>
        </div>
      </FetchError>
    </Loading>
  );
};

export { ProjectForm };
