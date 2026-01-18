import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createUser } from "./controllers/userController";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Notes API is running!");
});

app.post("/users", createUser);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
