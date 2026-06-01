"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.booksRoutes = booksRoutes;
const client_1 = require("../../generated/prisma/client");
const book_schema_1 = require("../schemas/book.schema");
async function booksRoutes(fastify) {
    fastify.post("/api/books", async (request, reply) => {
        const parsed = book_schema_1.CreateBookSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({
                error: "Validation failed",
                details: parsed.error.issues,
            });
        }
        try {
            const book = await fastify.prisma.book.create({
                data: parsed.data,
            });
            return reply.status(201).send(book);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002") {
                return reply.status(409).send({ error: "ISBN already exists" });
            }
            throw error;
        }
    });
    fastify.get("/api/books", async (request, reply) => {
        const parsed = book_schema_1.ListBooksQuerySchema.safeParse(request.query);
        if (!parsed.success) {
            return reply.status(400).send({
                error: "Validation failed",
                details: parsed.error.issues,
            });
        }
        const { page, limit, search } = parsed.data;
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { title: { contains: search } },
                    { author: { contains: search } },
                ],
            }
            : undefined;
        const [data, total] = await Promise.all([
            fastify.prisma.book.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            fastify.prisma.book.count({ where }),
        ]);
        return reply.send({
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    });
}
