import Btn from '@/components/atoms/btn';
import Spinner from '@/components/atoms/spinner';
import ProjectCard from '@/components/molecules/project-card';
import { useQuery } from '@/hooks/useFetch';
import { Link } from '@tanstack/react-router';
import React from 'react';

export interface IProjectListProps {
  admin?: boolean;
}

const ProjectList: React.FC<IProjectListProps> = ({ admin = false }) => {
  const { data: allProjects } = useQuery('get', '/v1/projects');
  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-bold">Projects</h1>
      {admin && (
        <div className="flex items-center justify-end">
          <Link to="/admin/projects/create">
            <Btn>Create Project</Btn>
          </Link>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {allProjects ? (
          allProjects.projects.map((project) => <ProjectCard key={project.id} project={project} />)
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  );
};

export { ProjectList };
