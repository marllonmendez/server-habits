import { appRoutes } from "./routes";
import { fastify } from "fastify";
import cors from "@fastify/cors";

const app = fastify();

app.register(cors);
app.register(appRoutes);

app.get("/", () => {
  return "Hello World";
});

app.listen({ port: 3000 }).then(() => {
  console.log("HTTP Server running!");
});
