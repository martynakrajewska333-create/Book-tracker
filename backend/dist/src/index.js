"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("@fastify/cors"));
const fastify_1 = __importDefault(require("fastify"));
const prisma_1 = require("./plugins/prisma");
const books_1 = require("./routes/books");
async function main() {
    const fastify = (0, fastify_1.default)({ logger: true });
    await fastify.register(cors_1.default, { origin: "http://localhost:5173" });
    await (0, prisma_1.prismaPlugin)(fastify);
    await (0, books_1.booksRoutes)(fastify);
    await fastify.listen({ port: 3001, host: "0.0.0.0" });
    console.log("Server running on http://localhost:3001");
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
