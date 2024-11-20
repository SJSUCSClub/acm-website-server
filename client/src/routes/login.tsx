import { createFileRoute } from "@tanstack/react-router";
import SignIn from "../pages/LogIn";

export const Route = createFileRoute("/login")({
  component: SignIn,
});
