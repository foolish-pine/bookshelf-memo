import type { Book } from "../types/Book";

const bookStatusLabel = {
  unread: "未読",
  reading: "読書中",
  read: "読了",
} as const satisfies Record<Book["status"], string>;

export default function BookCard({
  title,
  author,
  status,
  rating,
}: Pick<Book, "title" | "author" | "status" | "rating">) {
  return (
    <div className="list-item is-vertical">
      <p className="item-title">{title}</p>
      <p className="item-meta">{author}</p>
      <p className="item-meta">ステータス: {bookStatusLabel[status]}</p>
      <p className="item-meta">評価: {rating === null ? "未評価" : rating}</p>
    </div>
  );
}
