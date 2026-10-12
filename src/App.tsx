import { useState } from "react";
import { dummyBooks } from "./data/books";
import type { Book, BookStatus } from "./types/Book";
import BookList from "./components/BookList";
import AddBookForm from "./components/AddBookForm";

const nextBookStatus = (currentStatus: BookStatus) => {
  switch (currentStatus) {
    case "unread":
      return "reading";
    case "reading":
      return "read";
    case "read":
      return "unread";
    default:
      const exhaustiveCheck: never = currentStatus;
      return exhaustiveCheck;
  }
};

export default function App() {
  const [books, setBooks] = useState<Book[]>(dummyBooks);

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

  const updateStatus = (id: string) => {
    const target = books.filter((book) => book.id === id)[0];

    if (!target) return;

    const currentStatus = target.status;
    const newStatus = nextBookStatus(currentStatus);

    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== id) return book;

        return {
          ...book,
          status: newStatus,
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
        {books.length === 0 ? (
          <p className="empty">本がありません。</p>
        ) : (
          <BookList
            books={books}
            deleteBook={deleteBook}
            updateStatus={updateStatus}
          />
        )}
      </main>
    </div>
  );
}
