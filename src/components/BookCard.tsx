import {
  BOOK_STATUS_LABEL,
  type Book,
  type BookRatingNumber,
} from "../domain/book";

const BOOK_RATINGS = [
  1, 2, 3, 4, 5,
] as const satisfies readonly BookRatingNumber[];

export default function BookCard({
  book,
  deleteBook,
  advanceStatus,
  toggleRating,
}: {
  book: Book;
  deleteBook: (id: string) => void;
  advanceStatus: (id: string) => void;
  toggleRating: (id: string, newRating: BookRatingNumber) => void;
}) {
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
      <p className="item-title">{book.title}</p>
      <p className="item-meta">{book.author}</p>
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
