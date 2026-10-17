import { render, screen, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import App from "./App.tsx";

const getBookListSection = () => {
  const bookListSection = screen
    .getByRole("heading", { name: "本一覧" })
    .closest("section");

  if (!bookListSection) throw new Error("bookListSection does not exist.");

  return bookListSection;
};

const addBook = async (user: UserEvent) => {
  const randomId = crypto.randomUUID();
  const title = `タイトル-${randomId}`;
  const author = `著者-${randomId}`;

  const bookListSection = getBookListSection();

  expect(within(bookListSection).queryByText(title)).not.toBeInTheDocument();
  expect(within(bookListSection).queryByText(author)).not.toBeInTheDocument();

  const titleInput = screen.getByLabelText("タイトル");
  const authorInput = screen.getByLabelText("著者");

  await user.clear(titleInput);
  await user.type(titleInput, title);
  await user.clear(authorInput);
  await user.type(authorInput, author);
  await user.click(screen.getByRole("button", { name: "登録する" }));

  expect(within(bookListSection).getByText(title)).toBeInTheDocument();
  expect(within(bookListSection).getByText(author)).toBeInTheDocument();

  return { title, author };
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

    const bookListSection = getBookListSection();

    expect(
      within(bookListSection).queryByText("本がありません。"),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("タイトル"), title);
    await user.type(screen.getByLabelText("著者"), author);
    await user.click(screen.getByRole("button", { name: "登録する" }));

    expect(within(bookListSection).getByText(title)).toBeInTheDocument();
    expect(within(bookListSection).getByText(author)).toBeInTheDocument();
  });

  it("本を削除できる", async () => {
    const user = userEvent.setup();
    render(<App />);

    const { title, author } = await addBook(user);
    const { title: targetTitle } = await addBook(user);

    const bookListSection = getBookListSection();
    const targetBook = within(bookListSection)
      .getAllByRole("listitem")
      .find((li) => within(li).queryByText(targetTitle));

    if (!targetBook) throw new Error("targetBook does not exist.");

    await user.click(within(targetBook).getByRole("button", { name: "削除" }));

    expect(targetBook).not.toBeInTheDocument();
    expect(within(bookListSection).getByText(title)).toBeInTheDocument();
    expect(within(bookListSection).getByText(author)).toBeInTheDocument();
  });
});
