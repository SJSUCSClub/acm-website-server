import Btn from '@/components/atoms/btn';
import Card, {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@/hooks/useFetch';
import { paths } from '@/types/schema.v1';
import React, { useEffect, useState } from 'react';
import { RxGithubLogo } from 'react-icons/rx';

type Project =
  paths['/v1/users/my/projects-interest']['get']['responses']['200']['content']['application/json']['projects'][number];

const ProjectsInInterest = () => {
  const { data: pi } = useQuery('get', '/v1/users/my/projects-interest');
  const { mutate } = useMutation('delete', '/v1/users/my/projects-interest/{projectID}');
  const [projectsInInterest, setProjectsInInterest] = useState<Project[]>([]);

  useEffect(() => {
    if (!pi) return;
    setProjectsInInterest(pi.projects);
  }, [pi]);

  const removeInterest = (project: Project) => {
    const newProjects = projectsInInterest.filter((p) => p.id !== project.id);
    mutate(
      {
        params: {
          path: {
            projectID: project.id.toString(),
          },
        },
      },
      {
        onSuccess: () => {
          setProjectsInInterest(newProjects);
        },
      }
    );
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-medium">Projects in Interest</h2>
      {projectsInInterest.length === 0 ? (
        <p>You have not shown interest in any projects.</p>
      ) : (
        <div className="space-y-5">
          {projectsInInterest.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>
                  <Badge variant="outline">{project.status}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>{project.description}</CardContent>
              <CardFooter>
                <div className="flex justify-between items-center w-full">
                  <Btn size="sm" onClick={() => removeInterest(project)}>
                    Remove Interest
                  </Btn>
                  <span className={project.githubLink || 'hidden'}>
                    <a href={project.githubLink || ''} target="_blank" rel="noreferrer">
                      <RxGithubLogo size={30} />
                    </a>
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsInInterest;
