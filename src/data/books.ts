import type { Book } from "../domain/book";

export const dummyBooks: Book[] = [
  {
    id: "1",
    title: "本1",
    author: "本1の著者",
    status: "unread",
    rating: null,
  },
  {
    id: "2",
    title: "本2",
    author: "本2の著者",
    status: "reading",
    rating: null,
  },
  {
    id: "3",
    title: "本3",
    author: "本3の著者",
    status: "read",
    rating: 3,
  },
];
