import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { deleteBook, fetchBooks } from "../api/books";

const PAGE_SIZE = 20;

function formatDate(dateString: string): string {
  return dateString.slice(0, 10);
}

function renderStars(rating: number): string {
  return "★".repeat(rating);
}

export function BookList() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["books", page, debouncedSearch],
    queryFn: () =>
      fetchBooks({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
  });

  const books = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.page ?? page;

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    setDeletingId(id);
    try {
      await deleteBook(id);
      setPage(1);
      refetch();
    } catch (e: any) {
      console.error(
        "Delete error:",
        e?.response?.status,
        e?.response?.data,
        e?.message,
      );
      alert("Failed to delete book");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="book-list">
      <div className="form-field">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="search"
          placeholder="Search by title or author"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="status-message">Loading...</p>
      ) : books.length === 0 ? (
        <p className="status-message">No books found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Pages</th>
              <th>Rating</th>
              <th>Date Added</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.isbn}</td>
                <td>{book.pages}</td>
                <td className="rating">{renderStars(book.rating)}</td>
                <td>{formatDate(book.createdAt)}</td>
                <td>
                  <button
                    onClick={() => handleDelete(book.id, book.title)}
                    disabled={deletingId === book.id}
                  >
                    {deletingId === book.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={currentPage <= 1 || isLoading}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() =>
            setPage((current) => Math.min(totalPages, current + 1))
          }
          disabled={currentPage >= totalPages || isLoading}
        >
          Next
        </button>
      </div>
    </div>
  );
}
