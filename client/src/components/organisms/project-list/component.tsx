import Spinner from '@/components/atoms/spinner';
import ProjectCard from '@/components/molecules/project-card';
import { useQuery } from '@/hooks/useFetch';
import React from 'react';

const ProjectList = () => {
  const { data: allProjects } = useQuery('get', '/v1/projects');
  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-bold">Projects</h1>
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
