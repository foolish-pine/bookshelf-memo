import { useState } from "react";
import {
  BOOK_STATUS_LABEL,
  BOOK_STATUSES,
  isBooks,
  nextBookStatus,
  type Book,
  type BookRatingNumber,
  type BookStatus,
} from "./domain/book";
import BookList from "./components/BookList";
import AddBookForm from "./components/AddBookForm";
import { useLocalStorage } from "./hooks/useLocalStorage";

type StatusFilter = BookStatus | "all";

const STORAGE_KEY = "books";

export default function App() {
  const [books, setBooks] = useLocalStorage<Book[]>(STORAGE_KEY, [], isBooks);
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
    setBooks((prev) => [
      {
        id: crypto.randomUUID(),
        title,
        author,
        status: "unread",
        rating: null,
      },
      ...prev,
    ]);
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((book) => book.id !== id));
  };

  const advanceStatus = (id: string) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== id) return book;

        return {
          ...book,
          status: nextBookStatus(book.status),
        };
      }),
    );
  };

  const toggleRating = (id: string, newRating: BookRatingNumber) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== id) return book;

        return {
          ...book,
          rating: book.rating === newRating ? null : newRating,
        };
      }),
    );
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
            deleteBook={deleteBook}
            advanceStatus={advanceStatus}
            toggleRating={toggleRating}
          />
        )}
      </main>
    </div>
  );
}
