import Btn from '@/components/atoms/btn';
import Spinner from '@/components/atoms/spinner';
import FilesTable from '@/components/molecules/files-table';
import UsersTable from '@/components/molecules/users-table';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@/hooks/useFetch';
import { getProjectStatusColor } from '@/utils/colors';
import React from 'react';
import { RxGithubLogo } from 'react-icons/rx';

export interface IProjectDetailsProps {
  projectId: string;
}

const ProjectDetails: React.FC<IProjectDetailsProps> = ({ projectId }) => {
  const { data: project } = useQuery('get', '/v1/projects/{projectID}', {
    params: {
      path: {
        projectID: projectId
      }
    }
  });
  const { data: files } = useQuery('get', '/v1/projects/{projectID}/files', {
    params: {
      path: {
        projectID: projectId
      }
    }
  });
  const { data: interestedUsers } = useQuery('get', '/v1/projects/{projectID}/interested', {
    params: {
      path: {
        projectID: projectId
      }
    }
  });

  return (
    <div className="w-full">
      {project && files ? (
        <div className="space-y-16">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{project.project.name}</h1>
              <Badge className={getProjectStatusColor(project.project.status)}>
                {project.project.status}
              </Badge>
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
            <h2 className="text-xl font-semibold mb-3">Files</h2>
            <FilesTable files={files.projectFiles} />
          </div>

          {interestedUsers && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-3">Interested Users</h2>
              <UsersTable users={interestedUsers.interestedUsers} />
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
