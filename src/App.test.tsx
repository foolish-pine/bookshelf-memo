import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import App from "./App.tsx";
import { BooksProvider } from "./contexts/BooksContext.tsx";
import {
  BOOK_STATUS_LABEL,
  type Book,
  type BookStatus,
} from "./domain/book.ts";
import { LOCAL_STORAGE_BOOKS_KEY } from "./storage.ts";

const renderApp = () => {
  return render(<App />, { wrapper: BooksProvider });
};

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

const getNavElement = () => screen.getByRole("navigation");

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
  describe("アクセシビリティ", () => {
    async function checkA11y(container: Element) {
      const results = await axe.run(container, {
        rules: {
          // jsdom / happy-dom は描画しないため判定できない
          "color-contrast": { enabled: false },
        },
      });

      const messages = results.violations.map((v) => {
        const targets = v.nodes
          .map((n) => `  - ${n.target.join(" ")}`)
          .join("\n");
        return `[${v.impact}] ${v.id}: ${v.help}\n${targets}\n  ${v.helpUrl}`;
      });

      expect(messages, messages.join("\n\n")).toEqual([]);
    }

    it("本の編集中でないとき、アクセシビリティ違反がない", async () => {
      setupBooksInLocalStorage([
        createBook({
          status: "unread",
          rating: null,
        }),
        createBook({
          status: "reading",
          rating: 3,
        }),
      ]);
      const { container } = renderApp();

      await checkA11y(container);
    });

    it("本を編集中のとき、アクセシビリティ違反がない", async () => {
      const user = userEvent.setup();

      const targetBook = createBook({
        status: "unread",
        rating: null,
      });
      setupBooksInLocalStorage([
        targetBook,
        createBook({
          status: "reading",
          rating: 3,
        }),
      ]);
      const { container } = renderApp();

      const bookListSectionElement = getBookListSectionElement();
      const targetBookElement = getTargetBookElement(
        bookListSectionElement,
        targetBook.title,
      );

      await user.click(
        within(targetBookElement).getByRole("button", { name: "編集" }),
      );

      await checkA11y(container);
    });
  });

  describe("追加フォームからの本の追加", () => {
    it("本を追加できる", async () => {
      const user = userEvent.setup();
      renderApp();

      const title = "本のタイトル";
      const author = "本の著者";

      const bookListSectionElement = getBookListSectionElement();

      expect(
        within(bookListSectionElement).queryByText("本がありません。"),
      ).toBeInTheDocument();

      await user.type(screen.getByLabelText("タイトル"), title);
      await user.type(screen.getByLabelText("著者"), author);
      await user.click(screen.getByRole("button", { name: "登録する" }));

      expect(
        within(bookListSectionElement).getByText(title),
      ).toBeInTheDocument();
      expect(
        within(bookListSectionElement).getByText(author),
      ).toBeInTheDocument();
    });

    it.each([
      { title: "", author: "本の著者", label: "タイトルが空" },
      { title: " ", author: "本の著者", label: "タイトルがスペースのみ" },
      { title: "本のタイトル", author: "", label: "著者が空" },
      { title: "本のタイトル", author: " ", label: "著者がスペースのみ" },
    ])("$label のとき、本は追加できない", async ({ title, author }) => {
      const user = userEvent.setup();
      renderApp();

      const bookListSectionElement = getBookListSectionElement();

      expect(
        within(bookListSectionElement).queryByText("本がありません。"),
      ).toBeInTheDocument();

      if (title !== "") {
        await user.type(screen.getByLabelText("タイトル"), title);
      }
      if (author !== "") {
        await user.type(screen.getByLabelText("著者"), author);
      }
      await user.click(screen.getByRole("button", { name: "登録する" }));

      expect(
        within(bookListSectionElement).queryByText("本がありません。"),
      ).toBeInTheDocument();
    });
  });

  it("本を削除できる", async () => {
    const user = userEvent.setup();

    const targetBook = createBook();
    const anotherBook = createBook();
    setupBooksInLocalStorage([targetBook, anotherBook]);

    renderApp();

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

  describe("本の編集", () => {
    it("本のタイトルと著者を編集できる", async () => {
      const user = userEvent.setup();

      const targetBook = createBook();
      const anotherBook = createBook();
      setupBooksInLocalStorage([targetBook, anotherBook]);
      renderApp();

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

    it("編集中になったとき、本のタイトル欄にフォーカスが移動する", async () => {
      const user = userEvent.setup();

      const targetBook = createBook();
      const anotherBook = createBook();
      setupBooksInLocalStorage([targetBook, anotherBook]);
      renderApp();

      const bookListSectionElement = getBookListSectionElement();
      const targetBookElement = getTargetBookElement(
        bookListSectionElement,
        targetBook.title,
      );

      await user.click(
        within(targetBookElement).getByRole("button", { name: "編集" }),
      );

      expect(
        within(targetBookElement).getByLabelText("タイトル"),
      ).toHaveFocus();
    });

    it("編集中、他の本のステータスや評価を変更してもタイトルにフォーカスが移動しない", async () => {
      const user = userEvent.setup();

      const targetBook = createBook();
      const anotherBook = createBook({ status: "unread", rating: null });
      setupBooksInLocalStorage([targetBook, anotherBook]);
      renderApp();

      const bookListSectionElement = getBookListSectionElement();
      const targetBookElement = getTargetBookElement(
        bookListSectionElement,
        targetBook.title,
      );
      const anotherBookElement = getTargetBookElement(
        bookListSectionElement,
        anotherBook.title,
      );

      await user.click(
        within(targetBookElement).getByRole("button", { name: "編集" }),
      );
      await user.click(
        within(anotherBookElement).getByRole("button", { name: "未読" }),
      );
      await user.click(
        within(anotherBookElement).getByRole("button", { name: "3点" }),
      );

      expect(
        within(targetBookElement).getByLabelText("タイトル"),
      ).not.toHaveFocus();
      expect(
        within(anotherBookElement).getByRole("button", { name: "3点" }),
      ).toHaveFocus();
    });
  });

  it("本のステータスを更新できる", async () => {
    const user = userEvent.setup();

    const targetBook = createBook();
    const anotherBook = createBook();
    setupBooksInLocalStorage([targetBook, anotherBook]);
    renderApp();

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

    const targetBook = createBook({ rating: null });
    const anotherBook = createBook({ rating: null });
    setupBooksInLocalStorage([targetBook, anotherBook]);
    renderApp();

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
      within(targetBookElement).queryAllByRole("button", {
        name: /点$/,
        pressed: true,
      }),
    ).toHaveLength(0);
    expect(
      within(targetBookElement).getByText("評価: 未評価"),
    ).toBeInTheDocument();

    await user.click(
      within(targetBookElement).getByRole("button", { name: "3点" }),
    );

    expect(
      within(targetBookElement).getByRole("button", {
        name: "3点",
        pressed: true,
      }),
    ).toBeInTheDocument();
    expect(
      within(targetBookElement).getAllByRole("button", {
        name: /点$/,
        pressed: true,
      }),
    ).toHaveLength(1);
    expect(
      within(targetBookElement).getByText("評価: 3点"),
    ).toBeInTheDocument();

    expect(
      within(anotherBookElement).queryAllByRole("button", {
        name: /点$/,
        pressed: true,
      }),
    ).toHaveLength(0);
    expect(
      within(anotherBookElement).getByText("評価: 未評価"),
    ).toBeInTheDocument();
  });

  describe("タイトル検索機能", () => {
    it("大文字小文字を区別せず入力値に部分一致するタイトルの本のみを表示する", async () => {
      const user = userEvent.setup();

      const targetBook = createBook({ title: "targetBook" });
      const anotherBook = createBook({ title: "anotherBook" });
      setupBooksInLocalStorage([targetBook, anotherBook]);
      renderApp();

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
      renderApp();

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

  it("登録している本、読書中の本、読了済みの本の数を表示する", () => {
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
    renderApp();

    expect(
      screen.getByText("登録数: 9 / 読書中: 3 / 読了: 4"),
    ).toBeInTheDocument();
  });

  describe("ステータスによる絞り込み機能", () => {
    beforeEach(() => {
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
    });

    it("すべての本を表示する", async () => {
      const user = userEvent.setup();

      renderApp();

      const bookListSectionElement = getBookListSectionElement();
      const navElement = getNavElement();

      await user.click(
        within(navElement).getByRole("button", { name: "未読" }),
      );
      await user.click(
        within(navElement).getByRole("button", { name: "すべて" }),
      );

      expect(
        within(bookListSectionElement).getAllByRole("listitem"),
      ).toHaveLength(9);
    });

    it.each<{
      status: BookStatus;
      count: number;
    }>([
      {
        status: "unread",
        count: 2,
      },
      {
        status: "reading",
        count: 3,
      },
      {
        status: "read",
        count: 4,
      },
    ])(
      "$status タブで該当するステータスの本のみ表示する",
      async ({ status, count }) => {
        const user = userEvent.setup();

        renderApp();

        const bookListSectionElement = getBookListSectionElement();
        const navElement = getNavElement();

        await user.click(
          within(navElement).getByRole("button", {
            name: BOOK_STATUS_LABEL[status],
          }),
        );

        expect(
          within(bookListSectionElement).getAllByRole("listitem"),
        ).toHaveLength(count);
      },
    );

    it("選択中のタブが aria-pressed で伝達される", async () => {
      const user = userEvent.setup();

      renderApp();

      const navElement = getNavElement();

      await user.click(
        within(navElement).getByRole("button", { name: "未読" }),
      );

      expect(
        within(navElement).getByRole("button", {
          name: "すべて",
          pressed: false,
        }),
      ).toBeInTheDocument();
      expect(
        within(navElement).getByRole("button", { name: "未読", pressed: true }),
      ).toBeInTheDocument();
    });
  });

  describe("本の並び順の変更", () => {
    const book1 = createBook({ title: "ホンノタイトル", rating: 2 });
    const book2 = createBook({ title: "本のタイトル", rating: 4 });
    const book3 = createBook({ title: "English Book Title", rating: 1 });
    const book4 = createBook({ title: "1. 本のタイトル", rating: null });
    const book5 = createBook({ title: "本のタイ", rating: 3 });
    const book6 = createBook({ title: "ほん", rating: 5 });
    const initialBooks = [book1, book2, book3, book4, book5, book6];

    const getBookElementTitles = () => {
      const bookListSectionElement = getBookListSectionElement();
      return within(bookListSectionElement)
        .getAllByRole("listitem")
        .map(
          (bookElement) => within(bookElement).getByRole("heading").textContent,
        );
    };

    beforeEach(() => {
      setupBooksInLocalStorage(initialBooks);
    });

    it("追加順に並び替える", async () => {
      const user = userEvent.setup();

      renderApp();

      await user.selectOptions(
        screen.getByRole("combobox", { name: "並び順" }),
        "評価順",
      );
      await user.selectOptions(
        screen.getByRole("combobox", { name: "並び順" }),
        "追加順",
      );

      const bookElementTitles = getBookElementTitles();
      const expected = initialBooks.map((book) => book.title);

      expect(bookElementTitles).toStrictEqual(expected);
    });

    it("評価順に並び替える", async () => {
      const user = userEvent.setup();

      renderApp();

      await user.selectOptions(
        screen.getByRole("combobox", { name: "並び順" }),
        "評価順",
      );

      const bookElementTitles = getBookElementTitles();

      expect(bookElementTitles).toStrictEqual([
        book6.title,
        book2.title,
        book5.title,
        book1.title,
        book3.title,
        book4.title,
      ]);
    });

    it("タイトル順に並び替える", async () => {
      const user = userEvent.setup();

      renderApp();

      await user.selectOptions(
        screen.getByRole("combobox", { name: "並び順" }),
        "タイトル順",
      );

      const bookElementTitles = getBookElementTitles();

      expect(bookElementTitles).toStrictEqual([
        book4.title,
        book3.title,
        book6.title,
        book1.title,
        book5.title,
        book2.title,
      ]);
    });
  });

  it("ブラウザをリロードしても操作の結果が残る", async () => {
    const user = userEvent.setup();
    const { unmount } = renderApp();

    const title = "本のタイトル";
    const author = "本の著者";

    const beforeBookListSectionElement = getBookListSectionElement();

    expect(
      within(beforeBookListSectionElement).queryByText("本がありません。"),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("タイトル"), title);
    await user.type(screen.getByLabelText("著者"), author);
    await user.click(screen.getByRole("button", { name: "登録する" }));

    expect(
      within(beforeBookListSectionElement).getByText(title),
    ).toBeInTheDocument();
    expect(
      within(beforeBookListSectionElement).getByText(author),
    ).toBeInTheDocument();

    unmount();
    renderApp();

    const afterBookListSectionElement = getBookListSectionElement();

    expect(
      within(afterBookListSectionElement).getByText(title),
    ).toBeInTheDocument();
    expect(
      within(afterBookListSectionElement).getByText(author),
    ).toBeInTheDocument();
  });
});
