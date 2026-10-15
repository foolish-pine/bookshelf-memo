import { type Book, isBooks } from "../domain/book";
import { loadFromLocalStorage } from "./loadFromLocalStorage";

const STORAGE_KEY = "books";
const saveToLocalStorage = (value: string) =>
  localStorage.setItem(STORAGE_KEY, value);

const validBook = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "タイトル",
  author: "著者",
  status: "reading",
  rating: 3,
} satisfies Book;

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("loadFromLocalStorage", () => {
  it("対象のキーで何も保存されていないとき、初期値を返す", () => {
    expect(loadFromLocalStorage(STORAGE_KEY, [], isBooks)).toStrictEqual([]);
  });

  it("保存されている文字列が JSON にパースできない値のとき、初期値を返す", () => {
    saveToLocalStorage("not a JSON string");

    expect(loadFromLocalStorage(STORAGE_KEY, [], isBooks)).toStrictEqual([]);
  });

  it("保存されている文字列が JSON にパースできるが validate をパスしない値のとき、初期値を返す", () => {
    saveToLocalStorage(JSON.stringify([{}]));

    expect(loadFromLocalStorage(STORAGE_KEY, [], isBooks)).toStrictEqual([]);
  });

  it("保存されている文字列が JSON にパースできるかつ validate をパスする値のとき、パースした値を返す", () => {
    saveToLocalStorage(JSON.stringify([validBook]));

    expect(loadFromLocalStorage(STORAGE_KEY, [], isBooks)).toStrictEqual([
      validBook,
    ]);
  });

  it("localStorage.getItem() が例外を投げたとき、初期値を返す", () => {
    saveToLocalStorage(JSON.stringify([validBook]));

    const getItem = vi.fn(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    vi.stubGlobal("localStorage", { getItem });

    expect(loadFromLocalStorage(STORAGE_KEY, [], isBooks)).toStrictEqual([]);
    expect(getItem).toHaveBeenCalledWith(STORAGE_KEY);
  });
});
