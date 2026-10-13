import type { Book, BookRatingNumber } from "../domain/book";
import BookCard from "./BookCard";

export default function BookList({
  books,
  deleteBook,
  advanceStatus,
  toggleRating,
}: {
  books: Book[];
  deleteBook: (id: string) => void;
  advanceStatus: (id: string) => void;
  toggleRating: (id: string, newRating: BookRatingNumber) => void;
}) {
  return (
    <ul className="list">
      {books.map((book) => (
        <li key={book.id}>
          <BookCard
            book={book}
            deleteBook={deleteBook}
            advanceStatus={advanceStatus}
            toggleRating={toggleRating}
          />
        </li>
      ))}
    </ul>
  );
}
