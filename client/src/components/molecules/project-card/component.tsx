import Card, {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/atoms/card';
import { Badge } from '@/components/ui/badge';
import { paths } from '@/types/schema.v1';
import React from 'react';
import { RxGithubLogo } from 'react-icons/rx';
import InterestBtn from '@/components/molecules/interest-btn';
import { Link, useRouterState } from '@tanstack/react-router';
import { getProjectStatusColor } from '@/utils/colors';
import clsx from 'clsx';

type Project =
  paths['/v1/projects']['get']['responses']['200']['content']['application/json']['projects'][number];

export interface IProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<IProjectCardProps> = ({ project }) => {
  const state = useRouterState();
  return (
    <Card key={project.id}>
      <CardHeader>
        <Link
          to={
            state.location.pathname.includes('/admin')
              ? '/admin/projects/$projectId'
              : '/projects/$projectId'
          }
          params={{ projectId: project.id.toString() }}
        >
          <CardTitle>{project.name}</CardTitle>
        </Link>
        <CardDescription>
          <Badge className={clsx(getProjectStatusColor(project.status))}>{project.status}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>{project.description}</CardContent>
      <CardFooter>
        <div className="flex justify-between items-center w-full">
          <InterestBtn id={project.id.toString()} />
          <span className={project.githubLink || 'hidden'}>
            <a href={project.githubLink || ''} target="_blank" rel="noreferrer">
              <RxGithubLogo size={30} />
            </a>
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export { ProjectCard };
