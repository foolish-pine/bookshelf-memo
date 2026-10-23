import nodeConsole from "node:console";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import App from "../App.tsx";
import { BooksProvider } from "../contexts/BooksContext.tsx";
import type { Book } from "../domain/book.ts";
import { LOCAL_STORAGE_BOOKS_KEY } from "../storage.ts";
import BookList from "./BookList.tsx";

const createBook = ({
  id,
  title,
  author,
  status,
  rating,
}: Partial<Book> = {}): Book => {
  const randomId = crypto.randomUUID();

  return {
    id: id ?? `id-${randomId}`,
    title: title ?? `タイトル-${randomId}`,
    author: author ?? `著者-${randomId}`,
    status: status ?? "unread",
    rating: rating ?? null,
  };
};

const setupBooksInLocalStorage = (books: Book[]) => {
  localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(books));
};

const getTargetBookElement = (bookTitle: string) => {
  const targetBook = screen
    .getAllByRole("listitem")
    .find((li) => within(li).queryByText(bookTitle));

  if (!targetBook) throw new Error("targetBook does not exist.");

  return targetBook;
};

vi.mock("./BookCard", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./BookCard")>();
  const RealBookCard = actual.default;

  return {
    default: (props: ComponentProps<typeof RealBookCard>) => {
      if (props.book.id === "broken") {
        throw new Error("壊れたデータ");
      }
      return <RealBookCard {...props} />;
    },
  };
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("BookList", () => {
  it("エラーが起きている本でフォールバックが表示され、他の本は正常に表示される", () => {
    vi.spyOn(nodeConsole, "error").mockImplementation(() => {});
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const targetBook = createBook({
      status: "unread",
      rating: null,
    });
    const brokenBook = createBook({
      id: "broken",
    });
    const books = [targetBook, brokenBook];

    render(<BookList books={books} />, { wrapper: BooksProvider });

    const targetBookElement = getTargetBookElement(targetBook.title);

    expect(targetBookElement).toBeInTheDocument();
    expect(screen.getByText("データが壊れています。")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
  });

  it("エラーが起きている本を削除できる", async () => {
    vi.spyOn(nodeConsole, "error").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    const user = userEvent.setup();

    const targetBook = createBook({
      status: "unread",
      rating: null,
    });
    const brokenBook = createBook({
      id: "broken",
    });
    const books = [targetBook, brokenBook];

    setupBooksInLocalStorage(books);

    render(<App />, { wrapper: BooksProvider });

    const targetBookElement = getTargetBookElement(targetBook.title);
    const brokenBookElement = screen
      .getByText("データが壊れています。")
      .closest("li");

    if (!brokenBookElement)
      throw new Error("brokenBookElement does not exist.");

    await user.click(
      within(brokenBookElement).getByRole("button", { name: "削除" }),
    );

    expect(targetBookElement).toBeInTheDocument();
    expect(brokenBookElement).not.toBeInTheDocument();
    expect(
      screen.queryByText("データが壊れています。"),
    ).not.toBeInTheDocument();
  });
});
