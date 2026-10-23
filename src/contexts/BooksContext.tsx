import {
  createContext,
  type ReactNode,
  use,
  useMemo,
  useSyncExternalStore,
} from "react";
import { type Book, type BookRatingNumber, isBooks } from "../domain/book";
import { type BookAction, bookReducer } from "../domain/bookReducer";
import { LOCAL_STORAGE_BOOKS_KEY } from "../storage";

const LOCAL_EVENT = "bookshelf-memo:local-storage";

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

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(LOCAL_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCAL_EVENT, callback);
  };
};

const getSnapshot = () => {
  try {
    return localStorage.getItem(LOCAL_STORAGE_BOOKS_KEY);
  } catch {
    return null;
  }
};

const parseBooks = (raw: string | null): Book[] => {
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);

    return isBooks(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const BooksContext = createContext<BooksContextValue | null>(null);

export function BooksProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const books = useMemo(() => parseBooks(raw), [raw]);

  const dispatch = (action: BookAction) => {
    const current = parseBooks(getSnapshot());
    const next = bookReducer(current, action);

    localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(next));

    window.dispatchEvent(new Event(LOCAL_EVENT));
  };

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
