import { createFileRoute } from "@tanstack/react-router";
import Hero from "../pages/Hero";

export const Route = createFileRoute("/")({
  component: Hero,
});
