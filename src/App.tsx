import { useState } from "react";
import { dummyBooks } from "./data/books";
import type { Book } from "./types/Book";

const bookStatusLabel = {
  unread: "未読",
  reading: "読書中",
  read: "読了",
};

export default function App() {
  const [books] = useState<Book[]>(dummyBooks);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">本棚メモ</h1>
      </header>
      <main className="app-main">
        {books.length === 0 ? (
          <p className="empty">本がありません。</p>
        ) : (
          <ul className="list">
            {books.map((book) => (
              <li key={book.id} className="list-item is-vertical">
                <p className="item-title">{book.title}</p>
                <p className="item-meta">{book.author}</p>
                <p className="item-meta">ステータス: {bookStatusLabel[book.status]}</p>
                <p className="item-meta">評価: {book.rating === null ? "未評価" : book.rating}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
