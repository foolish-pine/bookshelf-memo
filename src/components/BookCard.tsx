import type { Book, BookStatus } from "../types/Book";

const bookStatusLabel = {
  unread: "未読",
  reading: "読書中",
  read: "読了",
} as const satisfies Record<BookStatus, string>;

export default function BookCard({
  book,
  deleteBook,
  advanceStatus,
}: {
  book: Book;
  deleteBook: (id: string) => void;
  advanceStatus: (id: string) => void;
}) {
  const handleDelete = () => {
    deleteBook(book.id);
  };

  const handleAdvanceStatus = () => {
    advanceStatus(book.id);
  };

  return (
    <div className="list-item is-vertical">
      <p className="item-title">{book.title}</p>
      <p className="item-meta">{book.author}</p>
      <p className="item-meta">
        ステータス:
        <button type="button" className="badge" onClick={handleAdvanceStatus}>
          {bookStatusLabel[book.status]}
        </button>
      </p>
      <p className="item-meta">
        評価: {book.rating === null ? "未評価" : book.rating}
      </p>
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={handleDelete}
      >
        削除
      </button>
    </div>
  );
}
