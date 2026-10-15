import { type Book, type BookRatingNumber, nextBookStatus } from "./book";

export type Action =
  | {
      type: "add_book";
      id: string;
      title: string;
      author: string;
    }
  | {
      type: "edit_book";
      id: string;
      title: string;
      author: string;
    }
  | {
      type: "delete_book";
      id: string;
    }
  | {
      type: "advance_book_status";
      id: string;
    }
  | {
      type: "toggle_book_rating";
      id: string;
      newRating: BookRatingNumber;
    };

export function bookReducer(state: readonly Book[], action: Action): Book[] {
  const type = action.type;
  switch (type) {
    case "add_book":
      return [
        {
          id: action.id,
          title: action.title,
          author: action.author,
          status: "unread",
          rating: null,
        },
        ...state,
      ];
    case "edit_book":
      return state.map((book) => {
        if (book.id !== action.id) return book;

        return {
          ...book,
          title: action.title,
          author: action.author,
        };
      });
    case "delete_book":
      return state.filter((book) => book.id !== action.id);
    case "advance_book_status":
      return state.map((book) => {
        if (book.id !== action.id) return book;

        return {
          ...book,
          status: nextBookStatus(book.status),
        };
      });
    case "toggle_book_rating":
      return state.map((book) => {
        if (book.id !== action.id) return book;

        return {
          ...book,
          rating: book.rating === action.newRating ? null : action.newRating,
        };
      });
    default:
      throw new Error(type satisfies never);
  }
}
