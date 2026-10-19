import { createContext, type ReactNode, use, useReducer } from "react";
import { type Book, type BookRatingNumber, isBooks } from "../domain/book";
import { bookReducer } from "../domain/bookReducer";
import { useSaveToLocalStorage } from "../hooks/useSaveToLocalStorage";
import { LOCAL_STORAGE_BOOKS_KEY } from "../storage";
import { loadFromLocalStorage } from "../utils/loadFromLocalStorage";

type BooksContextValue = {
  books: Book[];
  addBook: ({ title, author }: { title: string; author: string }) => void;
  deleteBook: (id: string) => void;
  editBook: ({
    id,
    title,
    author,
  }: {
    id: string;
    title: string;
    author: string;
  }) => void;
  advanceStatus: (id: string) => void;
  toggleRating: (id: string, newRating: BookRatingNumber) => void;
};

const BooksContext = createContext<BooksContextValue | null>(null);

export function BooksProvider({ children }: { children: ReactNode }) {
  const [books, dispatch] = useReducer(bookReducer, [], () =>
    loadFromLocalStorage(LOCAL_STORAGE_BOOKS_KEY, [], isBooks),
  );
  useSaveToLocalStorage(LOCAL_STORAGE_BOOKS_KEY, books);

  const addBook = ({ title, author }: { title: string; author: string }) => {
    dispatch({ type: "add_book", id: crypto.randomUUID(), title, author });
  };

  const deleteBook = (id: string) => {
    dispatch({ type: "delete_book", id });
  };

  const editBook = ({
    id,
    title,
    author,
  }: {
    id: string;
    title: string;
    author: string;
  }) => {
    dispatch({ type: "edit_book", id, title, author });
  };

  const advanceStatus = (id: string) => {
    dispatch({ type: "advance_book_status", id });
  };

  const toggleRating = (id: string, newRating: BookRatingNumber) => {
    dispatch({ type: "toggle_book_rating", id, newRating });
  };

  return (
    <BooksContext
      value={{
        books,
        addBook,
        deleteBook,
        editBook,
        advanceStatus,
        toggleRating,
      }}
    >
      {children}
    </BooksContext>
  );
}

export function useBooks() {
  const context = use(BooksContext);

  if (!context) {
    throw new Error("Use useBooks in BooksProvider.");
  }

  return context;
}
