export type BookStatus = "unread" | "reading" | "read";

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  rating: null | 1 | 2 | 3 | 4 | 5;
}
