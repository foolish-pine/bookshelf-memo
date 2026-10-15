import { type Book, type BookStatus, isBooks, nextBookStatus } from "./book";

describe("nextBookStatus", () => {
  it.each<[BookStatus, BookStatus]>([
    ["unread", "reading"],
    ["reading", "read"],
    ["read", "unread"],
  ])("currentStatus が %s のとき、%s を返す", (currentStatus, expected) => {
    expect(nextBookStatus(currentStatus)).toBe(expected);
  });
});

describe("isBooks", () => {
  const validValue = {
    id: "11111111-1111-1111-1111-111111111111",
    title: "タイトル",
    author: "著者",
    status: "unread",
    rating: 3,
  } satisfies Book;

  const omit = (key: keyof typeof validValue) =>
    Object.fromEntries(Object.entries(validValue).filter(([k]) => k !== key));

  it("入力値がすべて正しいデータのとき、true を返す", () => {
    expect(
      isBooks([
        validValue,
        { ...validValue, rating: 1 },
        { ...validValue, rating: 5 },
      ]),
    ).toBe(true);
  });

  it("入力値が空配列のとき、true を返す", () => {
    expect(isBooks([])).toBe(true);
  });

  it.each(["not an array", null, validValue])(
    "入力値が %j のとき、false を返す",
    (value) => {
      expect(isBooks(value)).toBe(false);
    },
  );

  it.each([
    { value: [null, validValue] },
    { value: ["not an object", validValue] },
  ])("入力値が $value のとき、false を返す", ({ value }) => {
    expect(isBooks(value)).toBe(false);
  });

  it.each<{ key: keyof typeof validValue }>([
    { key: "id" },
    { key: "title" },
    { key: "author" },
    { key: "status" },
    { key: "rating" },
  ])(
    "入力値が $key を持たないものを含む配列のとき、false を返す",
    ({ key }) => {
      expect(isBooks([omit(key)])).toBe(false);
    },
  );

  it.each<{
    key: keyof typeof validValue;
    value: number | string | null;
    label: string;
  }>([
    { key: "id", value: 123, label: "文字列でない" },
    { key: "title", value: 123, label: "文字列でない" },
    { key: "author", value: null, label: "文字列でない" },
    {
      key: "status",
      value: "unknown",
      label: "unread、reading、readのいずれでもない",
    },
    { key: "rating", value: "3", label: "数字でない" },
  ])("$key が $label とき、false を返す", ({ key, value }) => {
    expect(isBooks([{ ...validValue, [key]: value }])).toBe(false);
  });

  it("rating が null のとき、true を返す", () => {
    expect(isBooks([{ ...validValue, rating: null }])).toBe(true);
  });

  it.each([0, 6])("rating が %j のとき、false を返す", (rating) => {
    expect(isBooks([{ ...validValue, rating }])).toBe(false);
  });
});
