import type { ErrorInfo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useBooks } from "../contexts/BooksContext";
import type { Book } from "../domain/book";
import BookCard from "./BookCard";

const logError = (error: unknown, info: ErrorInfo) => {
  console.error(error);
  console.error(info.componentStack);
};

export default function BookList({ books }: { books: Book[] }) {
  const { deleteBook } = useBooks();

  return (
    <ul className="list">
      {books.map((book) => (
        <li key={book.id}>
          <ErrorBoundary
            fallbackRender={() => (
              <div role="alert" className="list-item is-broken">
                <p className="item-body">データが壊れています。</p>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteBook(book.id)}
                >
                  削除
                </button>
              </div>
            )}
            onError={logError}
            resetKeys={[book]}
          >
            <BookCard book={book} />
          </ErrorBoundary>
        </li>
      ))}
    </ul>
  );
}
