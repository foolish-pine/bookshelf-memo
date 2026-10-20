import { useId, useState } from "react";
import { useBooks } from "../contexts/BooksContext";
import {
  BOOK_RATINGS,
  BOOK_STATUS_LABEL,
  type Book,
  type BookRatingNumber,
} from "../domain/book";

const focusOnMount = (el: HTMLInputElement | null) => {
  el?.focus();
};

export default function BookCard({ book }: { book: Book }) {
  const { editBook, deleteBook, advanceStatus, toggleRating } = useBooks();
  const [isEditing, setIsEditing] = useState(false);
  const id = useId();

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
          <div className="field">
            <label htmlFor={`${id}-title`} className="field-label">
              タイトル
            </label>
            <input
              id={`${id}-title`}
              className="input"
              type="text"
              name="title"
              defaultValue={book.title}
              ref={focusOnMount}
              required
            />
          </div>
          <div className="field">
            <label htmlFor={`${id}-author`} className="field-label">
              著者
            </label>
            <input
              id={`${id}-author`}
              className="input"
              type="text"
              name="author"
              defaultValue={book.author}
              required
            />
          </div>
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
          <h3 className="item-title">{book.title}</h3>
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
        <span className="visually-hidden">
          評価: {book.rating === null ? "未評価" : `${book.rating}点`}
        </span>
        <span aria-hidden="true">評価: </span>
        {BOOK_RATINGS.map((rating) => (
          <button
            key={rating}
            type="button"
            className="star"
            aria-pressed={book.rating === rating}
            onClick={() => handleToggleRating(rating)}
          >
            <span className="visually-hidden">{rating}点</span>
            {book.rating !== null && book.rating >= rating ? (
              <span aria-hidden="true">★</span>
            ) : (
              <span aria-hidden="true">☆</span>
            )}
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
