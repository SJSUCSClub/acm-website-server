import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/atoms/card";
import { RxGithubLogo } from "react-icons/rx";
import Page from "@/components/templates/Page";
import { useMutation, useQuery } from "@/hooks/useFetch";
import Btn from "@/components/atoms/btn";

const Projects = () => {
  const { data: allProjects } = useQuery('get', '/v1/projects')
  const { data: projectsInInterest } = useQuery('get', '/v1/users/my/projects-interest')
  const [projectsInInterestIds, setProjectsInInterestIds] = useState<number[]>([])
  const { mutate: addInterest } = useMutation('post', '/v1/users/my/projects-interest/{projectID}')
  const { mutate: deleteInterest } = useMutation('delete', '/v1/users/my/projects-interest/{projectID}')

  useEffect(() => {
    if (projectsInInterest) {
      setProjectsInInterestIds(projectsInInterest.projects.map(p => p.id))
    }
  }, [projectsInInterest])
  

  const showInterest = (projectId: number) => {
    addInterest({
      params: {
        path: {
          projectID: projectId.toString(),
        }
      }
    }, {
      onSuccess: () => {
        setProjectsInInterestIds([...projectsInInterestIds, projectId])
      }
    });
  };

  const removeInterest = (projectId: number) => {
    deleteInterest({
      params: {
        path: {
          projectID: projectId.toString(),
        }
      }
    }, {
      onSuccess: () => {
        setProjectsInInterestIds(projectsInInterestIds.filter(id => id !== projectId))
      }
    });
  };

  const handleInterest = (projectId: number, interested: boolean) => {
    if (interested) {
      showInterest(projectId)
    } else {
      removeInterest(projectId)
    }
  };

  return (
    <Page>
      <div className="space-y-5">
        <h1 className="text-4xl font-bold">Projects</h1>
        <div className="grid grid-cols-3 gap-4">
          {allProjects?.projects.map((project) => {
            const shownInterest = projectsInInterestIds.some(id => id === project.id)
            return (
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
                  <Btn size="sm" disabled={!projectsInInterest} onClick={() => handleInterest(project.id, !shownInterest)}>
                    {shownInterest ? "Remove Interest" : "Interested"}
                  </Btn>
                  <span className={project.githubLink || "hidden"}>
                    <a
                      href={project.githubLink || ""}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <RxGithubLogo size={30} />
                    </a>
                  </span>
                </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </Page>
  );
};

export default Projects;
