import type { Book } from "../types/Book";
import BookCard from "./BookCard";

export default function BookList({
  books,
  deleteBook,
}: {
  books: Book[];
  deleteBook: (id: string) => void;
}) {
  return (
    <ul className="list">
      {books.map((book) => (
        <li key={book.id}>
          <BookCard book={book} deleteBook={deleteBook} />
        </li>
      ))}
    </ul>
  );
}
