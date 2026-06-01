"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListBooksQuerySchema = exports.BookIdParamSchema = exports.UpdateBookSchema = exports.CreateBookSchema = void 0;
const zod_1 = require("zod");
exports.CreateBookSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255),
    author: zod_1.z.string().min(1).max(255),
    isbn: zod_1.z.string().regex(/^(?:\d{9}[\dX]|\d{13})$/),
    pages: zod_1.z.number().int().min(1).max(50000),
    rating: zod_1.z.number().int().min(1).max(5),
});
exports.UpdateBookSchema = exports.CreateBookSchema;
exports.BookIdParamSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().min(1),
});
exports.ListBooksQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().optional(),
});
