import { describe, it, expect, vi, beforeEach } from "vitest";
import Fastify, { FastifyInstance } from "fastify";

const mockPrisma = {
  book: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("@prisma/client", () => {
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

vi.mock("../../generated/prisma/client", () => {
  class PrismaClientKnownRequestError extends Error {
    code: string;
    clientVersion: string;

    constructor(
      message: string,
      { code, clientVersion }: { code: string; clientVersion: string },
    ) {
      super(message);
      this.code = code;
      this.clientVersion = clientVersion;
      this.name = "PrismaClientKnownRequestError";
    }
  }

  return {
    Prisma: {
      PrismaClientKnownRequestError,
    },
  };
});

import { Prisma } from "../../generated/prisma/client";
import { booksRoutes } from "../routes/books";

const sampleBook = {
  id: 1,
  title: "Test",
  author: "Author",
  isbn: "9780743273565",
  pages: 100,
  rating: 4,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("books routes", () => {
  let fastify: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();

    fastify = Fastify();
    fastify.decorate("prisma", mockPrisma);
    await booksRoutes(fastify);
  });

  it("POST /api/books — success → 201", async () => {
    mockPrisma.book.findUnique.mockResolvedValue(null);
    mockPrisma.book.create.mockResolvedValue(sampleBook);

    const response = await fastify.inject({
      method: "POST",
      url: "/api/books",
      payload: {
        title: "Test",
        author: "Author",
        isbn: "9780743273565",
        pages: 100,
        rating: 4,
      },
    });

    expect(response.statusCode).toBe(201);
  });

  it("POST /api/books — missing title → 400", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/api/books",
      payload: {
        author: "Author",
        isbn: "9780743273565",
        pages: 100,
        rating: 4,
      },
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toHaveProperty("error");
  });

  it("POST /api/books — invalid rating (6) → 400", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/api/books",
      payload: {
        title: "Test",
        author: "Author",
        isbn: "9780743273565",
        pages: 100,
        rating: 6,
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it("POST /api/books — duplicate ISBN → 409", async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      {
        code: "P2002",
        clientVersion: "7.8.0",
      },
    );
    mockPrisma.book.create.mockRejectedValue(prismaError);

    const response = await fastify.inject({
      method: "POST",
      url: "/api/books",
      payload: {
        title: "Test",
        author: "Author",
        isbn: "9780743273565",
        pages: 100,
        rating: 4,
      },
    });

    expect(response.statusCode).toBe(409);
  });

  it("GET /api/books — returns paginated list → 200", async () => {
    const books = [
      { ...sampleBook, id: 1 },
      { ...sampleBook, id: 2, title: "Second" },
    ];
    mockPrisma.book.findMany.mockResolvedValue(books);
    mockPrisma.book.count.mockResolvedValue(2);

    const response = await fastify.inject({
      method: "GET",
      url: "/api/books",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("total");
  });

  it("GET /api/books?search=test — filters by search → 200", async () => {
    mockPrisma.book.findMany.mockResolvedValue([]);
    mockPrisma.book.count.mockResolvedValue(0);

    const response = await fastify.inject({
      method: "GET",
      url: "/api/books?search=test",
    });

    expect(response.statusCode).toBe(200);
    expect(mockPrisma.book.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { title: { contains: "test" } },
            { author: { contains: "test" } },
          ],
        },
      }),
    );
  });
});
