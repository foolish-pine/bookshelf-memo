import type { Book } from "../types/Book";
import BookCard from "./BookCard";

export default function BookList({
  books,
  deleteBook,
  advanceStatus,
}: {
  books: Book[];
  deleteBook: (id: string) => void;
  advanceStatus: (id: string) => void;
}) {
  return (
    <ul className="list">
      {books.map((book) => (
        <li key={book.id}>
          <BookCard
            book={book}
            deleteBook={deleteBook}
            advanceStatus={advanceStatus}
          />
        </li>
      ))}
    </ul>
  );
}
