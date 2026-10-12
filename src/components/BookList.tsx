import type { Book } from "../types/Book";
import BookCard from "./BookCard";

export default function BookList({
  books,
  deleteBook,
  updateStatus,
}: {
  books: Book[];
  deleteBook: (id: string) => void;
  updateStatus: (id: string) => void;
}) {
  return (
    <ul className="list">
      {books.map((book) => (
        <li key={book.id}>
          <BookCard
            book={book}
            deleteBook={deleteBook}
            updateStatus={updateStatus}
          />
        </li>
      ))}
    </ul>
  );
}
