import Btn from '@/components/atoms/btn';
import Spinner from '@/components/atoms/spinner';
import FileUpload from '@/components/molecules/file-upload';
import FilesTable from '@/components/molecules/files-table';
import UsersTable from '@/components/molecules/users-table';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery } from '@/hooks/useFetch';
import { getProjectStatusColor } from '@/utils/colors';
import { Link, redirect } from '@tanstack/react-router';
import React from 'react';
import { RxGithubLogo } from 'react-icons/rx';
import { toast } from 'sonner';
import { File as TableFile } from '@/components/molecules/files-table';
import { presignedUrlFetch } from '@/utils/presignedUrlFetch';
import DeleteAlert from '@/components/molecules/delete-alert';

export interface IProjectDetailsProps {
  projectId: string;
  admin?: boolean;
}

const ProjectDetails: React.FC<IProjectDetailsProps> = ({ projectId, admin = false }) => {
  const { data: project } = useQuery('get', '/v1/projects/{projectID}', {
    params: {
      path: {
        projectID: projectId
      }
    }
  });
  const { data: files, refetch: refetchFiles } = useQuery('get', '/v1/projects/{projectID}/files', {
    params: {
      path: {
        projectID: projectId
      }
    }
  });
  const { data: interestedUsers } = useQuery(
    'get',
    '/v1/projects/{projectID}/interested',
    {
      params: {
        path: {
          projectID: projectId
        }
      }
    },
    {
      enabled: admin
    }
  );
  const { mutateAsync: uploadFile } = useMutation(
    'post',
    '/v1/projects/{projectID}/files/{filename}'
  );
  const { mutate: deleteFile } = useMutation('delete', '/v1/projects/{projectID}/files/{fileName}');
  const { mutate: deleteProject } = useMutation('delete', '/v1/projects/{projectID}');

  const handleDelete = async () => {
    deleteProject(
      {
        params: {
          path: {
            projectID: projectId.toString()
          }
        }
      },
      {
        onSuccess: () => {
          toast.success(`Project deleted successfully`);
          redirect({ to: '/admin/projects' });
        },
        onError() {
          toast.error(`Failed to delete project`);
        }
      }
    );
  };

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      await uploadFile(
        {
          params: {
            path: {
              projectID: projectId.toString(),
              filename: file.name
            }
          }
        },
        {
          onSuccess: async (data) => {
            try {
              await presignedUrlFetch(data.presigned_url, file);
              toast.success(`File uploaded successfully: ${file.name}`);
            } catch (e) {
              console.log(e);
              toast.error(`Failed to upload file: ${file.name}`);
            }
          },
          onError() {
            toast.error(`Failed to upload file: ${file.name}`);
          }
        }
      );
    }
    refetchFiles();
  };

  const handleFileDelete = async (file: TableFile) => {
    deleteFile(
      {
        params: {
          path: {
            projectID: projectId,
            fileName: file.name
          }
        }
      },
      {
        onSuccess() {
          toast.success(`File deleted successfully: ${file.name}`);
          refetchFiles();
        },
        onError() {
          toast.error(`Failed to delete file: ${file.name}`);
        }
      }
    );
  };

  return (
    <div className="w-full">
      {project && files ? (
        <div className="space-y-16">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold">{project.project.name}</h1>
                <Badge className={getProjectStatusColor(project.project.status)}>
                  {project.project.status}
                </Badge>
              </div>
              {admin && (
                <div className="flex items-center space-x-2">
                  <Link
                    to={'/admin/projects/$projectId/edit'}
                    params={{ projectId: project.project.id.toString() }}
                  >
                    <Btn>Edit</Btn>
                  </Link>

                  <DeleteAlert onDelete={handleDelete}>
                    <Btn variant="destructive">Delete</Btn>
                  </DeleteAlert>
                </div>
              )}
            </div>

            <p className="text-muted-foreground mb-4">{project.project.description}</p>

            {project.project.githubLink && (
              <Btn variant="outline" size="sm" asChild>
                <a href={project.project.githubLink} target="_blank" rel="noopener noreferrer">
                  <RxGithubLogo className="mr-2 h-4 w-4" />
                  View on GitHub
                </a>
              </Btn>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold mb-3">Files</h2>
              {admin && (
                <FileUpload onUpload={handleUpload}>
                  <Btn size="sm">Upload File</Btn>
                </FileUpload>
              )}
            </div>
            <FilesTable files={files.projectFiles} admin={admin} onFileDelete={handleFileDelete} />
          </div>

          {admin && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-3">Interested Users</h2>
              <UsersTable users={interestedUsers?.interestedUsers || []} />
            </div>
          )}
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export { ProjectDetails };
