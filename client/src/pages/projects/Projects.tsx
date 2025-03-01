import React from "react";
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
import { useQuery } from "@/hooks/useFetch";

const Projects = () => {
  const { data } = useQuery("get", "/api/v1/projects");

  return (
    <Page>
      <div className="space-y-5">
        <h1 className="text-4xl font-bold">Projects</h1>
        <div className="grid grid-cols-3 gap-4">
          {data?.projects.map((project) => {
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
                  <span className={project.githubLink || "hidden"}>
                    <a
                      href={project.githubLink || ""}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <RxGithubLogo size={30} />
                    </a>
                  </span>
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
