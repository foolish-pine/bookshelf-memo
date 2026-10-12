import { useState } from "react";
import { dummyBooks } from "./data/books";
import type { Book } from "./types/Book";
import BookCards from "./components/BookCards";

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
          <BookCards books={books} />
        )}
      </main>
    </div>
  );
}
