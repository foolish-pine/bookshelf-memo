import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.tsx";
import type { Book } from "./domain/book.ts";
import { LOCAL_STORAGE_BOOKS_KEY } from "./storage.ts";

const createBook = ({
  title,
  author,
  status,
  rating,
}: Partial<Omit<Book, "id">> = {}): Book => {
  const randomId = crypto.randomUUID();

  return {
    id: `id-${randomId}`,
    title: title ?? `タイトル-${randomId}`,
    author: author ?? `著者-${randomId}`,
    status: status ?? "unread",
    rating: rating ?? null,
  };
};

const setupBooksInLocalStorage = (books: Book[]) => {
  localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(books));
};

const getBookListSectionElement = () => {
  const bookListSectionElement = screen
    .getByRole("heading", { name: "本一覧" })
    .closest("section");

  if (!bookListSectionElement)
    throw new Error("bookListSectionElement does not exist.");

  return bookListSectionElement;
};

const getTargetBookElement = (
  bookListSection: HTMLElement,
  bookTitle: string,
) => {
  const targetBook = within(bookListSection)
    .getAllByRole("listitem")
    .find((li) => within(li).queryByText(bookTitle));

  if (!targetBook) throw new Error("targetBook does not exist.");

  return targetBook;
};

afterEach(() => {
  localStorage.clear();
});

describe("App", () => {
  it("本を追加できる", async () => {
    const user = userEvent.setup();
    render(<App />);

    const title = "本のタイトル";
    const author = "本の著者";

    const bookListSectionElement = getBookListSectionElement();

    expect(
      within(bookListSectionElement).queryByText("本がありません。"),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("タイトル"), title);
    await user.type(screen.getByLabelText("著者"), author);
    await user.click(screen.getByRole("button", { name: "登録する" }));

    expect(within(bookListSectionElement).getByText(title)).toBeInTheDocument();
    expect(
      within(bookListSectionElement).getByText(author),
    ).toBeInTheDocument();
  });

  it("本を削除できる", async () => {
    const user = userEvent.setup();

    const targetBook = createBook();
    const anotherBook = createBook();
    setupBooksInLocalStorage([targetBook, anotherBook]);

    render(<App />);

    const bookListSectionElement = getBookListSectionElement();
    const targetBookElement = getTargetBookElement(
      bookListSectionElement,
      targetBook.title,
    );

    await user.click(
      within(targetBookElement).getByRole("button", { name: "削除" }),
    );

    expect(targetBookElement).not.toBeInTheDocument();
    expect(
      within(bookListSectionElement).getByText(anotherBook.title),
    ).toBeInTheDocument();
    expect(
      within(bookListSectionElement).getByText(anotherBook.author),
    ).toBeInTheDocument();
  });

  it("本のタイトルと著者を編集できる", async () => {
    const user = userEvent.setup();

    const targetBook = createBook();
    const anotherBook = createBook();
    setupBooksInLocalStorage([targetBook, anotherBook]);
    render(<App />);

    const bookListSectionElement = getBookListSectionElement();
    const targetBookElement = getTargetBookElement(
      bookListSectionElement,
      targetBook.title,
    );

    await user.click(
      within(targetBookElement).getByRole("button", { name: "編集" }),
    );

    const newTitle = "新しいタイトル";
    const titleInput = within(targetBookElement).getByLabelText("タイトル");
    const newAuthor = "新しい著者";
    const authorInput = within(targetBookElement).getByLabelText("著者");

    await user.clear(titleInput);
    await user.type(titleInput, newTitle);
    await user.clear(authorInput);
    await user.type(authorInput, newAuthor);
    await user.click(
      within(targetBookElement).getByRole("button", { name: "保存" }),
    );

    expect(
      within(bookListSectionElement).queryByText(targetBook.title),
    ).not.toBeInTheDocument();
    expect(
      within(bookListSectionElement).queryByText(targetBook.author),
    ).not.toBeInTheDocument();
    expect(
      within(bookListSectionElement).getByText(newTitle),
    ).toBeInTheDocument();
    expect(
      within(bookListSectionElement).getByText(newAuthor),
    ).toBeInTheDocument();
    expect(
      within(bookListSectionElement).getByText(anotherBook.title),
    ).toBeInTheDocument();
    expect(
      within(bookListSectionElement).getByText(anotherBook.author),
    ).toBeInTheDocument();
  });

  it("本のステータスを更新できる", async () => {
    const user = userEvent.setup();

    const targetBook = createBook();
    const anotherBook = createBook();
    setupBooksInLocalStorage([targetBook, anotherBook]);
    render(<App />);

    const bookListSectionElement = getBookListSectionElement();
    const targetBookElement = getTargetBookElement(
      bookListSectionElement,
      targetBook.title,
    );
    const statusButtonElement = within(targetBookElement).getByRole("button", {
      name: "未読",
    });
    const anotherBookElement = getTargetBookElement(
      bookListSectionElement,
      anotherBook.title,
    );

    await user.click(statusButtonElement);

    expect(
      within(targetBookElement).getByRole("button", {
        name: "読書中",
      }),
    ).toBeInTheDocument();
    expect(
      within(anotherBookElement).getByRole("button", {
        name: "未読",
      }),
    ).toBeInTheDocument();
  });

  it("本の評価を更新できる", async () => {
    const user = userEvent.setup();

    const targetBook = createBook();
    const anotherBook = createBook();
    setupBooksInLocalStorage([targetBook, anotherBook]);
    render(<App />);

    const bookListSectionElement = getBookListSectionElement();
    const targetBookElement = getTargetBookElement(
      bookListSectionElement,
      targetBook.title,
    );
    const anotherBookElement = getTargetBookElement(
      bookListSectionElement,
      anotherBook.title,
    );

    expect(
      within(targetBookElement).queryAllByRole("button", { name: "★" }),
    ).toHaveLength(0);

    await user.click(
      within(targetBookElement).getAllByRole("button", { name: /☆|★/ })[3],
    );

    expect(
      within(targetBookElement).getAllByRole("button", { name: "★" }),
    ).toHaveLength(4);
    expect(
      within(anotherBookElement).queryAllByRole("button", { name: "★" }),
    ).toHaveLength(0);
  });

  describe("タイトル検索機能", () => {
    it("大文字小文字を区別せず入力値に部分一致するタイトルの本のみを表示する", async () => {
      const user = userEvent.setup();

      const targetBook = createBook({ title: "targetBook" });
      const anotherBook = createBook({ title: "anotherBook" });
      setupBooksInLocalStorage([targetBook, anotherBook]);
      render(<App />);

      const bookListSectionElement = getBookListSectionElement();
      const targetBookElement = getTargetBookElement(
        bookListSectionElement,
        targetBook.title,
      );
      const anotherBookElement = getTargetBookElement(
        bookListSectionElement,
        anotherBook.title,
      );

      const searchInput = screen.getByLabelText("タイトルで検索");

      await user.type(searchInput, "GETBO");

      expect(targetBookElement).toBeInTheDocument();
      expect(anotherBookElement).not.toBeInTheDocument();
    });

    it("部分一致する本がないとき、テキストが表示される", async () => {
      const user = userEvent.setup();

      const targetBook = createBook({ title: "targetBook" });
      const anotherBook = createBook({ title: "anotherBook" });
      setupBooksInLocalStorage([targetBook, anotherBook]);
      render(<App />);

      const bookListSectionElement = getBookListSectionElement();
      const targetBookElement = getTargetBookElement(
        bookListSectionElement,
        targetBook.title,
      );
      const anotherBookElement = getTargetBookElement(
        bookListSectionElement,
        anotherBook.title,
      );

      const searchInput = screen.getByLabelText("タイトルで検索");

      await user.type(searchInput, "not-existing-title");

      expect(targetBookElement).not.toBeInTheDocument();
      expect(anotherBookElement).not.toBeInTheDocument();
      expect(
        within(bookListSectionElement).getByText(
          "検索ワードを含む本はありません。",
        ),
      ).toBeInTheDocument();
    });
  });

  it("登録している本、読書中の本、読了済みの本の数を表示する", async () => {
    setupBooksInLocalStorage([
      createBook({ status: "unread" }),
      createBook({ status: "unread" }),
      createBook({ status: "reading" }),
      createBook({ status: "reading" }),
      createBook({ status: "reading" }),
      createBook({ status: "read" }),
      createBook({ status: "read" }),
      createBook({ status: "read" }),
      createBook({ status: "read" }),
    ]);
    render(<App />);

    expect(
      screen.getByText("登録数: 9 / 読書中: 3 / 読了: 4"),
    ).toBeInTheDocument();
  });
});
