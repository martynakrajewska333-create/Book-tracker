import { FastifyInstance, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";
import {
  BookIdParamSchema,
  CreateBookSchema,
  ListBooksQuerySchema,
  UpdateBookSchema,
} from "../schemas/book.schema";

function validationErrorReply(reply: FastifyReply, error: ZodError) {
  return reply.status(400).send({
    error: "Validation failed",
    details: error.issues,
  });
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function isNotFoundError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

export async function booksRoutes(fastify: FastifyInstance) {
  fastify.get("/api/books", async (request, reply) => {
    const parsed = ListBooksQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return validationErrorReply(reply, parsed.error);
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

  fastify.get("/api/books/:id", async (request, reply) => {
    const parsed = BookIdParamSchema.safeParse(request.params);

    if (!parsed.success) {
      return validationErrorReply(reply, parsed.error);
    }

    const book = await fastify.prisma.book.findUnique({
      where: { id: parsed.data.id },
    });

    if (!book) {
      return reply.status(404).send({ error: "Book not found" });
    }

    return reply.send(book);
  });

  fastify.post("/api/books", async (request, reply) => {
    const parsed = CreateBookSchema.safeParse(request.body);

    if (!parsed.success) {
      return validationErrorReply(reply, parsed.error);
    }

    try {
      const book = await fastify.prisma.book.create({
        data: parsed.data,
      });

      return reply.status(201).send(book);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return reply.status(409).send({ error: "ISBN already exists" });
      }

      throw error;
    }
  });

  fastify.put("/api/books/:id", async (request, reply) => {
    const paramsParsed = BookIdParamSchema.safeParse(request.params);

    if (!paramsParsed.success) {
      return validationErrorReply(reply, paramsParsed.error);
    }

    const bodyParsed = UpdateBookSchema.safeParse(request.body);

    if (!bodyParsed.success) {
      return validationErrorReply(reply, bodyParsed.error);
    }

    try {
      const book = await fastify.prisma.book.update({
        where: { id: paramsParsed.data.id },
        data: bodyParsed.data,
      });

      return reply.send(book);
    } catch (error) {
      if (isNotFoundError(error)) {
        return reply.status(404).send({ error: "Book not found" });
      }

      if (isUniqueConstraintError(error)) {
        return reply.status(409).send({ error: "ISBN already exists" });
      }

      throw error;
    }
  });

  fastify.delete("/api/books/:id", async (request, reply) => {
    const parsed = BookIdParamSchema.safeParse(request.params);

    if (!parsed.success) {
      return validationErrorReply(reply, parsed.error);
    }

    try {
      await fastify.prisma.book.delete({
        where: { id: parsed.data.id },
      });

      return reply.status(204).send();
    } catch (error) {
      if (isNotFoundError(error)) {
        return reply.status(404).send({ error: "Book not found" });
      }

      throw error;
    }
  });
}
