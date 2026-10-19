import { useState } from "react";
import AddBookForm from "./components/AddBookForm";
import BookList from "./components/BookList";
import BookSearch from "./components/BookSearch";
import { useBooks } from "./contexts/BooksContext";
import {
  BOOK_STATUS_LABEL,
  BOOK_STATUSES,
  type BookStatus,
} from "./domain/book";

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
  const { books } = useBooks();

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
        <section className="section card">
          <h2 className="section-title">本を追加</h2>
          <div className="subsection">
            <h3 className="subsection-title">手入力で追加</h3>
            <AddBookForm />
          </div>
          <div className="subsection">
            <h3 className="subsection-title">Open Library で探して追加</h3>
            <BookSearch />
          </div>
        </section>
        <div className="toolbar card">
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
          <div className="row">
            <label className="field field-label">
              タイトルで検索
              <input
                className="input"
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </label>
            <label className="field field-label field-narrow">
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
          </div>
        </div>
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">本一覧</h2>
            <p className="summary">
              登録数: {allBooksCount} / 読書中: {readingBooksCount} / 読了:{" "}
              {readBooksCount}
            </p>
          </div>
          {filteredBooks.length === 0 && (
            <p className="empty">本がありません。</p>
          )}
          {filteredBooks.length !== 0 && searchedBooks.length === 0 && (
            <p className="empty">検索ワードを含む本はありません。</p>
          )}
          {filteredBooks.length !== 0 && searchedBooks.length !== 0 && (
            <BookList books={sortedBooks} />
          )}
        </section>
      </main>
    </div>
  );
}
