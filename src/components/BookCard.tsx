import { useState } from "react";
import {
  BOOK_RATINGS,
  BOOK_STATUS_LABEL,
  type Book,
  type BookRatingNumber,
} from "../domain/book";

export default function BookCard({
  book,
  editBook,
  deleteBook,
  advanceStatus,
  toggleRating,
}: {
  book: Book;
  editBook: ({
    id,
    title,
    author,
  }: Pick<Book, "id" | "title" | "author">) => void;
  deleteBook: (id: string) => void;
  advanceStatus: (id: string) => void;
  toggleRating: (id: string, newRating: BookRatingNumber) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (formData: FormData) => {
    const title = formData.get("title");
    const author = formData.get("author");

    if (typeof title !== "string" || typeof author !== "string") return;

    if (title.trim() === "" || author.trim() === "") return;

    editBook({ id: book.id, title, author });

    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteBook(book.id);
  };

  const handleAdvanceStatus = () => {
    advanceStatus(book.id);
  };

  const handleToggleRating = (rating: BookRatingNumber) => {
    toggleRating(book.id, rating);
  };

  return (
    <div className="list-item is-vertical">
      {isEditing ? (
        <form action={handleSubmit} className="form">
          <label className="field field-label">
            タイトル
            <input
              className="input"
              type="text"
              name="title"
              defaultValue={book.title}
              required
            />
          </label>
          <label className="field field-label">
            著者
            <input
              className="input"
              type="text"
              name="author"
              defaultValue={book.author}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary btn-sm">
            保存
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setIsEditing(false);
            }}
          >
            キャンセル
          </button>
        </form>
      ) : (
        <>
          <p className="item-title">{book.title}</p>
          <p className="item-meta">{book.author}</p>
        </>
      )}

      <p className="item-meta">
        ステータス:
        <button type="button" className="badge" onClick={handleAdvanceStatus}>
          {BOOK_STATUS_LABEL[book.status]}
        </button>
      </p>
      <p className="item-meta stars stars-glyph">
        評価:{" "}
        {BOOK_RATINGS.map((rating) => (
          <button
            key={rating}
            type="button"
            className="star"
            onClick={() => handleToggleRating(rating)}
          >
            {book.rating !== null && book.rating >= rating ? "★" : "☆"}
          </button>
        ))}
      </p>
      {!isEditing && (
        <>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setIsEditing(true);
            }}
          >
            編集
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
          >
            削除
          </button>
        </>
      )}
    </div>
  );
}
