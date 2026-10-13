export const BOOK_STATUSES = ["unread", "reading", "read"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];
export const BOOK_STATUS_LABEL = {
  unread: "未読",
  reading: "読書中",
  read: "読了",
} as const satisfies Record<BookStatus, string>;

export type BookRatingNumber = 1 | 2 | 3 | 4 | 5;

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  rating: BookRatingNumber | null;
}
