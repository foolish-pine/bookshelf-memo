import type { Book } from "../types/Book";

const bookStatusLabel = {
  unread: "未読",
  reading: "読書中",
  read: "読了",
} as const satisfies Record<Book["status"], string>;

export default function BookCard({
  book,
  deleteBook,
}: {
  book: Book;
  deleteBook: (id: string) => void;
}) {
  const handleDelete = () => {
    deleteBook(book.id);
  };

  return (
    <div className="list-item is-vertical">
      <p className="item-title">{book.title}</p>
      <p className="item-meta">{book.author}</p>
      <p className="item-meta">ステータス: {bookStatusLabel[book.status]}</p>
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
