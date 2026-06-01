import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, type FormEvent } from "react";
import { createBook, type CreateBookDTO } from "../api/books";

const ISBN_REGEX = /^(?:\d{9}[\dX]|\d{13})$/;

type FormFields = {
  title: string;
  author: string;
  isbn: string;
  pages: string;
  rating: string;
};

type FieldErrors = Partial<Record<keyof FormFields, string>>;

const initialForm: FormFields = {
  title: "",
  author: "",
  isbn: "",
  pages: "",
  rating: "",
};

function validateForm(fields: FormFields): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.title.trim()) {
    errors.title = "Title is required";
  } else if (fields.title.length > 255) {
    errors.title = "Title must be at most 255 characters";
  }

  if (!fields.author.trim()) {
    errors.author = "Author is required";
  } else if (fields.author.length > 255) {
    errors.author = "Author must be at most 255 characters";
  }

  if (!fields.isbn.trim()) {
    errors.isbn = "ISBN is required";
  } else if (!ISBN_REGEX.test(fields.isbn.trim())) {
    errors.isbn = "ISBN must be 10 or 13 digits (ISBN-10 may end with X)";
  }

  const pages = Number(fields.pages);
  if (!fields.pages.trim()) {
    errors.pages = "Number of pages is required";
  } else if (!Number.isInteger(pages) || pages < 1 || pages > 50000) {
    errors.pages = "Pages must be an integer between 1 and 50,000";
  }

  const rating = Number(fields.rating);
  if (!fields.rating) {
    errors.rating = "Rating is required";
  } else if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = "Rating must be between 1 and 5";
  }

  return errors;
}

export function AddBookForm() {
  const queryClient = useQueryClient();
  const [fields, setFields] = useState<FormFields>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      setFields(initialForm);
      setFieldErrors({});
      setSubmitError(null);
      setSuccessMessage("Book added successfully");
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error) => {
      setSuccessMessage(null);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setSubmitError("This ISBN already exists");
          return;
        }

        if (error.response?.status === 400) {
          const data = error.response.data as { error?: string };
          setSubmitError(data.error ?? "Validation failed");
          return;
        }
      }

      setSubmitError("Failed to add book. Please try again.");
    },
  });

  function handleChange(field: keyof FormFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
    setSuccessMessage(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    const errors = validateForm(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const payload: CreateBookDTO = {
      title: fields.title.trim(),
      author: fields.author.trim(),
      isbn: fields.isbn.trim(),
      pages: Number(fields.pages),
      rating: Number(fields.rating),
    };

    mutation.mutate(payload);
  }

  return (
    <form className="book-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={fields.title}
          onChange={(event) => handleChange("title", event.target.value)}
        />
        {fieldErrors.title && (
          <p className="field-error">{fieldErrors.title}</p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="author">Author</label>
        <input
          id="author"
          type="text"
          value={fields.author}
          onChange={(event) => handleChange("author", event.target.value)}
        />
        {fieldErrors.author && (
          <p className="field-error">{fieldErrors.author}</p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="isbn">ISBN</label>
        <input
          id="isbn"
          type="text"
          placeholder="10 or 13 digits"
          value={fields.isbn}
          onChange={(event) => handleChange("isbn", event.target.value)}
        />
        {fieldErrors.isbn && <p className="field-error">{fieldErrors.isbn}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="pages">Number of pages</label>
        <input
          id="pages"
          type="number"
          min={1}
          max={50000}
          value={fields.pages}
          onChange={(event) => handleChange("pages", event.target.value)}
        />
        {fieldErrors.pages && (
          <p className="field-error">{fieldErrors.pages}</p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="rating">Rating</label>
        <select
          id="rating"
          value={fields.rating}
          onChange={(event) => handleChange("rating", event.target.value)}
        >
          <option value="">Select rating</option>
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        {fieldErrors.rating && (
          <p className="field-error">{fieldErrors.rating}</p>
        )}
      </div>

      {submitError && <p className="form-message error">{submitError}</p>}
      {successMessage && (
        <p className="form-message success">{successMessage}</p>
      )}

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding..." : "Add Book"}
      </button>
    </form>
  );
}
