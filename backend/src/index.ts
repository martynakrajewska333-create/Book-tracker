import "dotenv/config";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { prismaPlugin } from "./plugins/prisma";
import { booksRoutes } from "./routes/books";

async function main() {
  const fastify = Fastify({ logger: true });

  await fastify.register(cors, {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  await prismaPlugin(fastify);
  await booksRoutes(fastify);

  await fastify.listen({ port: 3001, host: "0.0.0.0" });
  console.log("Server running on http://localhost:3001");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
