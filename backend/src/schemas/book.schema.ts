import { z } from "zod";

export const CreateBookSchema = z.object({
  title: z.string().min(1).max(255),
  author: z.string().min(1).max(255),
  isbn: z.string().regex(/^(?:\d{9}[\dX]|\d{13})$/),
  pages: z.number().int().min(1).max(50000),
  rating: z.number().int().min(1).max(5),
});

export const UpdateBookSchema = CreateBookSchema;

export const BookIdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const ListBooksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export type CreateBookInput = z.infer<typeof CreateBookSchema>;
export type UpdateBookInput = z.infer<typeof UpdateBookSchema>;
export type BookIdParam = z.infer<typeof BookIdParamSchema>;
export type ListBooksQuery = z.infer<typeof ListBooksQuerySchema>;
