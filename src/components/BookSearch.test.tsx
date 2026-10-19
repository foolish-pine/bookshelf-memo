import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { BooksProvider } from "../contexts/BooksContext";
import BookSearch, {
  isOpenLibrarySearchResponse,
  type OpenLibraryDoc,
  type OpenLibrarySearchResponse,
} from "./BookSearch";

const renderBookSearch = () => {
  return render(<BookSearch />, { wrapper: BooksProvider });
};

describe("BookSearch", () => {
  const validOpenLibraryDoc = {
    key: "/works/key1",
    title: "Book Title 1",
  } satisfies OpenLibraryDoc;
  const validOpenLibraryDocWithAuthors = {
    key: "/works/key2",
    title: "Book Title 2",
    author_name: ["First Author", "Second Author"],
  } satisfies OpenLibraryDoc;
  const validOpenLibrarySearchResponse = {
    start: 0,
    numFound: 2,
    docs: [validOpenLibraryDoc, validOpenLibraryDocWithAuthors],
  } satisfies OpenLibrarySearchResponse;

  describe("isOpenLibrarySearchResponse", () => {
    const omit = (key: keyof typeof validOpenLibrarySearchResponse) =>
      Object.fromEntries(
        Object.entries(validOpenLibrarySearchResponse).filter(
          ([k]) => k !== key,
        ),
      );

    it("入力値がすべて正しいデータのとき、true を返す", () => {
      expect(isOpenLibrarySearchResponse(validOpenLibrarySearchResponse)).toBe(
        true,
      );
    });

    it.each(["not an object", null])(
      "入力値が %j のとき、false を返す",
      (value) => {
        expect(isOpenLibrarySearchResponse(value)).toBe(false);
      },
    );

    it.each<{ key: keyof OpenLibrarySearchResponse }>([
      { key: "start" },
      { key: "numFound" },
      { key: "docs" },
    ])("入力値が $key を持たないとき、false を返す", ({ key }) => {
      expect(isOpenLibrarySearchResponse(omit(key))).toBe(false);
    });

    it.each<{
      key: keyof OpenLibrarySearchResponse;
      value: string;
      label: string;
    }>([
      { key: "start", value: "not a number", label: "数字でない" },
      { key: "numFound", value: "not a number", label: "数字でない" },
    ])("$key が $label とき、false を返す", ({ key, value }) => {
      expect(
        isOpenLibrarySearchResponse({
          ...validOpenLibrarySearchResponse,
          [key]: value,
        }),
      ).toBe(false);
    });

    it.each([
      { docs: "not an array", label: "文字列である" },
      { docs: null, label: "null である" },
      { docs: {}, label: "object である" },
    ])("docs が $label とき、false を返す", ({ docs }) => {
      expect(
        isOpenLibrarySearchResponse({
          ...validOpenLibrarySearchResponse,
          docs,
        }),
      ).toBe(false);
    });

    it.each([
      {
        docs: [
          validOpenLibraryDoc,
          validOpenLibraryDocWithAuthors,
          "not an object",
        ],
        label: "object でないアイテムを含む",
      },
      {
        docs: [validOpenLibraryDoc, validOpenLibraryDocWithAuthors, null],
        label: "null を含む",
      },
      {
        docs: [
          validOpenLibraryDoc,
          validOpenLibraryDocWithAuthors,
          {
            title: "Book Title 3",
            author_name: ["Third Author"],
          },
        ],
        label: "key を持たないアイテムを含む",
      },
      {
        docs: [
          validOpenLibraryDoc,
          validOpenLibraryDocWithAuthors,
          {
            key: "/works/key3",
            author_name: ["Third Author"],
          },
        ],
        label: "title を持たないアイテムを含む",
      },
      {
        docs: [
          validOpenLibraryDoc,
          validOpenLibraryDocWithAuthors,
          {
            title: "Book Title 3",
            key: "/works/key3",
            author_name: "not an array",
          },
        ],
        label: "author_name が文字列であるアイテムを含む",
      },
      {
        docs: [
          validOpenLibraryDoc,
          validOpenLibraryDocWithAuthors,
          {
            title: "Book Title 3",
            key: "/works/key3",
            author_name: {},
          },
        ],
        label: "author_name が object であるアイテムを含む",
      },
      {
        docs: [
          validOpenLibraryDoc,
          validOpenLibraryDocWithAuthors,
          {
            title: "Book Title 3",
            key: "/works/key3",
            author_name: null,
          },
        ],
        label: "author_name が null であるアイテムを含む",
      },
      {
        docs: [
          validOpenLibraryDoc,
          validOpenLibraryDocWithAuthors,
          {
            title: "Book Title 3",
            key: "/works/key3",
            author_name: ["Third Author", 1],
          },
        ],
        label: "author_name が文字列でない要素を含む",
      },
    ])("docs が $label とき、false を返す", ({ docs }) => {
      expect(
        isOpenLibrarySearchResponse({
          ...validOpenLibrarySearchResponse,
          docs,
        }),
      ).toBe(false);
    });
  });

  describe("BookSearch", () => {
    const handlers = [
      http.get("https://openlibrary.org/search.json", () => {
        return HttpResponse.json(validOpenLibrarySearchResponse);
      }),
    ];
    const server = setupServer(...handlers);

    beforeEach(() => {
      vi.useFakeTimers({
        toFake: ["setTimeout", "clearTimeout"],
        shouldAdvanceTime: true,
      });
    });
    beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
    afterEach(() => {
      vi.useRealTimers();
      server.resetHandlers();
    });
    afterAll(() => server.close());

    it("レスポンスの結果が表示される", async () => {
      server.use(
        http.get("https://openlibrary.org/search.json", () => {
          return HttpResponse.json(validOpenLibrarySearchResponse);
        }),
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderBookSearch();

      await user.type(
        screen.getByLabelText("本を検索"),
        validOpenLibraryDoc.title,
      );
      await vi.advanceTimersByTimeAsync(500);

      expect(
        await screen.findByText(`タイトル: ${validOpenLibraryDoc.title}`),
      ).toBeInTheDocument();
      expect(screen.getByText(`著者: 著者未設定`)).toBeInTheDocument();
      expect(
        screen.getByText(`タイトル: ${validOpenLibraryDocWithAuthors.title}`),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `著者: ${validOpenLibraryDocWithAuthors.author_name.join(", ")}`,
        ),
      ).toBeInTheDocument();
    });

    it("検索に一致する本が0件のとき、テキストが表示される", async () => {
      server.use(
        http.get("https://openlibrary.org/search.json", () =>
          HttpResponse.json({
            start: 0,
            numFound: 0,
            docs: [],
          }),
        ),
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderBookSearch();

      await user.type(
        screen.getByLabelText("本を検索"),
        validOpenLibraryDoc.title,
      );
      await vi.advanceTimersByTimeAsync(500);

      expect(
        await screen.findByText(
          "お探しの本はありませんでした。別のキーワードで検索してください。",
        ),
      ).toBeInTheDocument();
    });

    it("検索に失敗したとき、エラーテキストが表示される", async () => {
      server.use(
        http.get("https://openlibrary.org/search.json", () =>
          HttpResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
          ),
        ),
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderBookSearch();

      await user.type(
        screen.getByLabelText("本を検索"),
        validOpenLibraryDoc.title,
      );
      await vi.advanceTimersByTimeAsync(500);

      expect(
        await screen.findByText(
          "エラーが発生しました。時間をおいてもう一度お試しください。",
        ),
      ).toBeInTheDocument();
    });

    it("レスポンスが不正な形式のとき、エラーテキストが表示される", async () => {
      server.use(
        http.get("https://openlibrary.org/search.json", () =>
          HttpResponse.json({
            start: 0,
            numFound: 0,
            docs: null,
          }),
        ),
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderBookSearch();

      await user.type(
        screen.getByLabelText("本を検索"),
        validOpenLibraryDoc.title,
      );
      await vi.advanceTimersByTimeAsync(500);

      expect(
        await screen.findByText(
          "エラーが発生しました。時間をおいてもう一度お試しください。",
        ),
      ).toBeInTheDocument();
    });

    it("通信エラーのとき、エラーテキストが表示される", async () => {
      server.use(
        http.get("https://openlibrary.org/search.json", () =>
          HttpResponse.error(),
        ),
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderBookSearch();

      await user.type(
        screen.getByLabelText("本を検索"),
        validOpenLibraryDoc.title,
      );
      await vi.advanceTimersByTimeAsync(500);

      expect(
        await screen.findByText(
          "エラーが発生しました。時間をおいてもう一度お試しください。",
        ),
      ).toBeInTheDocument();
    });
  });
});
