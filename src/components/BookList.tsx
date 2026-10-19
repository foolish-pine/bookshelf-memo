import type { Book } from "../domain/book";
import BookCard from "./BookCard";

export default function BookList({ books }: { books: Book[] }) {
  return (
    <ul className="list">
      {books.map((book) => (
        <li key={book.id}>
          <BookCard book={book} />
        </li>
      ))}
    </ul>
  );
}
