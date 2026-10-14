import type { Book, BookRatingNumber } from "../domain/book";
import BookCard from "./BookCard";

export default function BookList({
  books,
  editBook,
  deleteBook,
  advanceStatus,
  toggleRating,
}: {
  books: Book[];
  editBook: ({
    id,
    title,
    author,
  }: Pick<Book, "id" | "title" | "author">) => void;
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
            editBook={editBook}
            deleteBook={deleteBook}
            advanceStatus={advanceStatus}
            toggleRating={toggleRating}
          />
        </li>
      ))}
    </ul>
  );
}
