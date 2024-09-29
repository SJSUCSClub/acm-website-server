import { Hono } from "hono";
import { cors } from "hono/cors";
import v1App from "./router/v1/v1.router";

const app = new Hono();

app.use("/*", cors());
app.get("/", (c) =>
  c.json(
    {
      status: "ok",
    },
    200
  )
);

// V1 API
app.route("/v1", v1App);

export default {
  port: process.env.PORT || 5001,
  fetch: app.fetch,
};
