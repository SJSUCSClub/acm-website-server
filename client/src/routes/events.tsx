import { createFileRoute } from "@tanstack/react-router";
import Events from "../pages/events/Events";

export const Route = createFileRoute("/events")({
  component: Events,
});
