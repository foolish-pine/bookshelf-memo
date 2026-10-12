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
  const handleSubmit = (formData: FormData) => {
    const id = formData.get("id");

    if (typeof id !== "string") return;

    deleteBook(id);
  };

  return (
    <div className="list-item is-vertical">
      <p className="item-title">{book.title}</p>
      <p className="item-meta">{book.author}</p>
      <p className="item-meta">ステータス: {bookStatusLabel[book.status]}</p>
      <p className="item-meta">
        評価: {book.rating === null ? "未評価" : book.rating}
      </p>
      <form action={handleSubmit} className="item-actions">
        <input type="hidden" name="id" value={book.id} />
        <button type="submit" className="btn btn-danger btn-sm">削除</button>
      </form>
    </div>
  );
}
