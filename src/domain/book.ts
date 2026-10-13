export const BOOK_STATUSES = ["unread", "reading", "read"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];
export const BOOK_STATUS_LABEL = {
  unread: "未読",
  reading: "読書中",
  read: "読了",
} as const satisfies Record<BookStatus, string>;
export const nextBookStatus = (currentStatus: BookStatus) => {
  switch (currentStatus) {
    case "unread":
      return "reading";
    case "reading":
      return "read";
    case "read":
      return "unread";
    default: {
      const exhaustiveCheck: never = currentStatus;
      return exhaustiveCheck;
    }
  }
};

export const BOOK_RATINGS = [1, 2, 3, 4, 5] as const;
export type BookRatingNumber = (typeof BOOK_RATINGS)[number];

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  rating: BookRatingNumber | null;
}
