import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  pages: number;
  rating: number;
  createdAt: string;
}

export interface CreateBookDTO {
  title: string;
  author: string;
  isbn: string;
  pages: number;
  rating: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export async function fetchBooks(params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<PaginatedResponse<Book>> {
  const response = await api.get<PaginatedResponse<Book>>("/api/books", {
    params,
  });
  return response.data;
}

export async function createBook(data: CreateBookDTO): Promise<Book> {
  const response = await api.post<Book>("/api/books", data);
  return response.data;
}

export const deleteBook = (id: number): Promise<void> =>
  api.delete(`/api/books/${id}`).then(() => undefined);
