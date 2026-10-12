import type { Book } from "../types/Book";
import BookCard from "./BookCard";

export default function BookCards({ books }: { books: Book[] }) {
  return (
    <ul className="list">
      {books.map(({ id, title, author, status, rating }) => (
        <li key={id}>
          <BookCard
            title={title}
            author={author}
            status={status}
            rating={rating}
          />
        </li>
      ))}
    </ul>
  );
}
