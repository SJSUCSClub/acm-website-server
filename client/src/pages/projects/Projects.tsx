import React from "react";
import { paths } from "@/types/schema.v1";
import { Badge } from "@/components/ui/badge"
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/atoms/card";
import { RxGithubLogo } from "react-icons/rx";

type Projects =
  paths["/api/v1/projects"]["get"]["responses"]["200"]["content"]["application/json"]['projects']
const projects: Projects = [
  {
    id: 1,
    name: "AI Chatbot",
    description: "An intelligent chatbot using natural language processing",
    githubLink: null,
    status: "not started",
  },
  {
    id: 2,
    name: "Weather App",
    description: "A weather forecasting app using open weather API",
    githubLink: null,
    status: "looking for members",
  },
  {
    id: 3,
    name: "Task Manager",
    description: "A task management tool to organize daily activities",
    githubLink: null,
    status: "in progress",
  },
  {
    id: 4,
    name: "Portfolio Website",
    description:
      "A personal portfolio website built with React and Tailwind CSS",
    githubLink: null,
    status: "completed",
  },
  {
    id: 5,
    name: "Inventory System",
    description:
      "A desktop application for managing inventory in small businesses",
    githubLink: 'https://github.com/SJSUCSClub/acm-website-server/pulls',
    status: "not started",
  },
];

const Projects = () => {
  return (
    <div className="p-10 space-y-10">
      <h1 className="text-4xl font-bold">Projects</h1>
      <div className="grid grid-cols-3 gap-4">
        {projects.map((project) => {
          return (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>
                  <Badge variant='outline'>
                    {project.status}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project.description}
              </CardContent>
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
  );
};

export default Projects;
