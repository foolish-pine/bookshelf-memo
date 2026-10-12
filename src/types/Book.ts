export type BookStatus = "unread" | "reading" | "read";

export type BookRatingNumber = 1 | 2 | 3 | 4 | 5;

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  rating: BookRatingNumber | null;
}
