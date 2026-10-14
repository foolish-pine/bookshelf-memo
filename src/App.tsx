import { useReducer, useState } from "react";
import AddBookForm from "./components/AddBookForm";
import BookList from "./components/BookList";
import {
  BOOK_STATUS_LABEL,
  BOOK_STATUSES,
  type Book,
  type BookRatingNumber,
  type BookStatus,
  isBooks,
  nextBookStatus,
} from "./domain/book";
import { useSaveToLocalStorage } from "./hooks/useSaveToLocalStorage";
import { loadFromLocalStorage } from "./utils/loadFromLocalStorage";

type StatusFilter = BookStatus | "all";

const STORAGE_KEY = "books";

type Action =
  | {
      type: "add_book";
      id: string;
      title: string;
      author: string;
    }
  | {
      type: "edit_book";
      id: string;
      title: string;
      author: string;
    }
  | {
      type: "delete_book";
      id: string;
    }
  | {
      type: "advance_book_status";
      id: string;
    }
  | {
      type: "toggle_book_rating";
      id: string;
      newRating: BookRatingNumber;
    };

function reducer(state: Book[], action: Action): Book[] {
  const type = action.type;
  switch (type) {
    case "add_book":
      return [
        {
          id: action.id,
          title: action.title,
          author: action.author,
          status: "unread",
          rating: null,
        },
        ...state,
      ];
    case "edit_book":
      return state.map((book) => {
        if (book.id !== action.id) return book;

        return {
          ...book,
          title: action.title,
          author: action.author,
        };
      });
    case "delete_book":
      return state.filter((book) => book.id !== action.id);
    case "advance_book_status":
      return state.map((book) => {
        if (book.id !== action.id) return book;

        return {
          ...book,
          status: nextBookStatus(book.status),
        };
      });
    case "toggle_book_rating":
      return state.map((book) => {
        if (book.id !== action.id) return book;

        return {
          ...book,
          rating: book.rating === action.newRating ? null : action.newRating,
        };
      });
    default:
      throw new Error(type satisfies never);
  }
}

export default function App() {
  const [books, dispatch] = useReducer(reducer, [], () =>
    loadFromLocalStorage(STORAGE_KEY, [], isBooks),
  );
  useSaveToLocalStorage(STORAGE_KEY, books);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const filteredBooks =
    statusFilter === "all"
      ? books
      : books.filter((book) => book.status === statusFilter);
  const allBooksCount = books.length;
  const readingBooksCount = books.filter(
    (book) => book.status === "reading",
  ).length;
  const readBooksCount = books.filter((book) => book.status === "read").length;

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
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">本棚メモ</h1>
      </header>
      <main className="app-main">
        <AddBookForm addBook={addBook} />
        <p className="summary">
          登録数: {allBooksCount} / 読書中: {readingBooksCount} / 読了:{" "}
          {readBooksCount}
        </p>
        <nav>
          <ul className="tabs">
            <li>
              <button
                type="button"
                className={statusFilter === "all" ? "tab is-active" : "tab"}
                onClick={() => setStatusFilter("all")}
              >
                すべて
              </button>
            </li>
            {BOOK_STATUSES.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  className={statusFilter === key ? "tab is-active" : "tab"}
                  onClick={() => setStatusFilter(key)}
                >
                  {BOOK_STATUS_LABEL[key]}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {filteredBooks.length === 0 ? (
          <p className="empty">本がありません。</p>
        ) : (
          <BookList
            books={filteredBooks}
            editBook={editBook}
            deleteBook={deleteBook}
            advanceStatus={advanceStatus}
            toggleRating={toggleRating}
          />
        )}
      </main>
    </div>
  );
}
