import { useReducer, useState } from "react";
import AddBookForm from "./components/AddBookForm";
import BookList from "./components/BookList";
import BookSearch from "./components/BookSearch";
import {
  BOOK_STATUS_LABEL,
  BOOK_STATUSES,
  type BookRatingNumber,
  type BookStatus,
  isBooks,
} from "./domain/book";
import { bookReducer } from "./domain/bookReducer";
import { useSaveToLocalStorage } from "./hooks/useSaveToLocalStorage";
import { LOCAL_STORAGE_BOOKS_KEY } from "./storage";
import { loadFromLocalStorage } from "./utils/loadFromLocalStorage";

const BOOK_LIST_ORDER = ["addedAt", "rating", "title"] as const;
type BookListOrder = (typeof BOOK_LIST_ORDER)[number];
const isOrder = (value: unknown): value is BookListOrder =>
  (BOOK_LIST_ORDER as readonly unknown[]).includes(value);
const BOOK_LIST_ORDER_LABEL = {
  addedAt: "追加順",
  rating: "評価順",
  title: "タイトル順",
} as const satisfies Record<BookListOrder, string>;

type StatusFilter = BookStatus | "all";

export default function App() {
  const [books, dispatch] = useReducer(bookReducer, [], () =>
    loadFromLocalStorage(LOCAL_STORAGE_BOOKS_KEY, [], isBooks),
  );
  useSaveToLocalStorage(LOCAL_STORAGE_BOOKS_KEY, books);

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

  const [order, setOrder] = useState<BookListOrder>("addedAt");
  const [searchText, setSearchText] = useState("");

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

  const searchedBooks = filteredBooks.filter((book) =>
    book.title.toLowerCase().includes(searchText.toLowerCase()),
  );

  const selectOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (!isOrder(value)) return;

    setOrder(value);
  };

  const sortBooks = () => {
    switch (order) {
      case "addedAt":
        return searchedBooks;
      case "rating":
        return [...searchedBooks].sort((a, b) => {
          if (a.rating === null && b.rating === null) return 0;
          if (a.rating === null) return 1;
          if (b.rating === null) return -1;
          return b.rating - a.rating;
        });
      case "title":
        return [...searchedBooks].sort((a, b) =>
          a.title.localeCompare(b.title, "ja"),
        );
      default:
        throw new Error(order satisfies never);
    }
  };
  const sortedBooks = sortBooks();

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">本棚メモ</h1>
      </header>
      <main className="app-main">
        <AddBookForm addBook={addBook} />
        <BookSearch addBook={addBook} />
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
        <label className="field field-label">
          並び順
          <select
            className="select"
            name="order"
            value={order}
            onChange={selectOrder}
          >
            {BOOK_LIST_ORDER.map((key) => (
              <option value={key} key={key}>
                {BOOK_LIST_ORDER_LABEL[key]}
              </option>
            ))}
          </select>
        </label>
        <label className="field field-label">
          タイトルで検索
          <input
            className="input"
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </label>
        <section className="section">
          <h2 className="section-title">本一覧</h2>
          {filteredBooks.length === 0 && (
            <p className="empty">本がありません。</p>
          )}
          {filteredBooks.length !== 0 && searchedBooks.length === 0 && (
            <p className="empty">検索ワードを含む本はありません。</p>
          )}
          {filteredBooks.length !== 0 && searchedBooks.length !== 0 && (
            <BookList
              books={sortedBooks}
              editBook={editBook}
              deleteBook={deleteBook}
              advanceStatus={advanceStatus}
              toggleRating={toggleRating}
            />
          )}
        </section>
      </main>
    </div>
  );
}
