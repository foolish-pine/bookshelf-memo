import type { Book, BookStatus } from "./book";
import { bookReducer } from "./bookReducer";

const validBook = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "タイトル",
  author: "著者",
  status: "reading",
  rating: 3,
} satisfies Book;
const anotherValidBook = {
  id: "22222222-2222-2222-2222-222222222222",
  title: "タイトル2",
  author: "著者2",
  status: "read",
  rating: 4,
} satisfies Book;

const freezeState = (state: Book[]) =>
  Object.freeze(state.map((book) => Object.freeze(book)));

describe("bookReducer", () => {
  describe("本の追加", () => {
    it("本が先頭に追加された新しい配列を返す", () => {
      const prevState = freezeState([{ ...validBook }]);
      const id = "22222222-2222-2222-2222-222222222222";
      const title = "タイトル2";
      const author = "著者2";

      const nextState = bookReducer(prevState, {
        type: "add_book",
        id,
        title,
        author,
      });

      expect(nextState).toStrictEqual([
        {
          id,
          title,
          author,
          status: "unread",
          rating: null,
        },
        validBook,
      ]);
    });
  });

  describe("本の編集", () => {
    const prevState = freezeState([{ ...validBook }, { ...anotherValidBook }]);

    it("対象の id を持つ本の title と author を書き換える", () => {
      const targetId = validBook.id;
      const newTitle = "新しいタイトル";
      const newAuthor = "新しい著者";

      const nextState = bookReducer(prevState, {
        type: "edit_book",
        id: targetId,
        title: newTitle,
        author: newAuthor,
      });

      expect(nextState).toStrictEqual([
        {
          id: targetId,
          title: newTitle,
          author: newAuthor,
          status: validBook.status,
          rating: validBook.rating,
        },
        anotherValidBook,
      ]);
    });

    it("対象の id を持つ本がなければ、前の state と中身が同じ配列を返す", () => {
      const notExistingId = "not-existing-id";
      const newTitle = "新しいタイトル";
      const newAuthor = "新しい著者";

      const nextState = bookReducer(prevState, {
        type: "edit_book",
        id: notExistingId,
        title: newTitle,
        author: newAuthor,
      });

      expect(nextState).toStrictEqual([validBook, anotherValidBook]);
    });
  });

  describe("本の削除", () => {
    const prevState = freezeState([{ ...validBook }, { ...anotherValidBook }]);

    it("対象の id を持つ本のみを削除する", () => {
      const targetId = validBook.id;

      const nextState = bookReducer(prevState, {
        type: "delete_book",
        id: targetId,
      });

      expect(nextState).toStrictEqual([anotherValidBook]);
    });

    it("対象の id を持つ本がなければ、前の state と中身が同じ配列を返す", () => {
      const notExistingId = "not-existing-id";

      const nextState = bookReducer(prevState, {
        type: "delete_book",
        id: notExistingId,
      });

      expect(nextState).toStrictEqual([validBook, anotherValidBook]);
    });
  });

  describe("本のステータスの更新", () => {
    it.each<[BookStatus, BookStatus]>([
      ["unread", "reading"],
      ["reading", "read"],
      ["read", "unread"],
    ])(
      "対象の id を持つ本のステータスを %s から %s に変更する",
      (prevStatus, expectedStatus) => {
        const prevState = freezeState([
          { ...validBook, status: prevStatus },
          { ...anotherValidBook },
        ]);
        const targetId = validBook.id;

        const nextState = bookReducer(prevState, {
          type: "advance_book_status",
          id: targetId,
        });

        expect(nextState).toStrictEqual([
          { ...validBook, status: expectedStatus },
          anotherValidBook,
        ]);
      },
    );

    it("対象の id を持つ本がなければ、前の state と中身が同じ配列を返す", () => {
      const prevState = freezeState([
        { ...validBook },
        { ...anotherValidBook },
      ]);
      const notExistingId = "not-existing-id";

      const nextState = bookReducer(prevState, {
        type: "advance_book_status",
        id: notExistingId,
      });

      expect(nextState).toStrictEqual([validBook, anotherValidBook]);
    });
  });

  describe("本の評価の更新", () => {
    const prevState = freezeState([
      { ...validBook, rating: 3 },
      { ...anotherValidBook },
    ]);
    it("対象の id を持つ本の評価と新しい評価が異なる値のとき、新しい評価に変更する", () => {
      const targetId = validBook.id;

      const nextState = bookReducer(prevState, {
        type: "toggle_book_rating",
        id: targetId,
        newRating: 5,
      });

      expect(nextState).toStrictEqual([
        { ...validBook, rating: 5 },
        anotherValidBook,
      ]);
    });

    it("対象の id を持つ本が未評価のとき、新しい評価に変更する", () => {
      const prevState = freezeState([
        { ...validBook, rating: null },
        { ...anotherValidBook },
      ]);
      const targetId = validBook.id;

      const nextState = bookReducer(prevState, {
        type: "toggle_book_rating",
        id: targetId,
        newRating: 3,
      });

      expect(nextState).toStrictEqual([
        { ...validBook, rating: 3 },
        anotherValidBook,
      ]);
    });

    it("対象の id を持つ本の評価と新しい評価が同じ値のとき、評価を null に変更する", () => {
      const targetId = validBook.id;

      const nextState = bookReducer(prevState, {
        type: "toggle_book_rating",
        id: targetId,
        newRating: 3,
      });

      expect(nextState).toStrictEqual([
        { ...validBook, rating: null },
        anotherValidBook,
      ]);
    });

    it("対象の id を持つ本がなければ、前の state と中身が同じ配列を返す", () => {
      const notExistingId = "not-existing-id";

      const nextState = bookReducer(prevState, {
        type: "toggle_book_rating",
        id: notExistingId,
        newRating: 5,
      });

      expect(nextState).toStrictEqual([validBook, anotherValidBook]);
    });
  });
});
