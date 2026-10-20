import { useId } from "react";
import { useBooks } from "../contexts/BooksContext";

export default function AddBookForm() {
  const { addBook } = useBooks();
  const id = useId();

  const handleSubmit = (formData: FormData) => {
    const title = formData.get("title");
    const author = formData.get("author");

    if (typeof title !== "string" || typeof author !== "string") return;

    if (title.trim() === "" || author.trim() === "") return;

    addBook({
      title,
      author,
    });
  };

  return (
    <form action={handleSubmit} className="form">
      <div className="field">
        <label htmlFor={`${id}-title`} className="field-label">
          タイトル
        </label>
        <input
          id={`${id}-title`}
          className="input"
          type="text"
          name="title"
          required
        />
      </div>
      <div className="field">
        <label htmlFor={`${id}-author`} className="field-label">
          著者
        </label>
        <input
          id={`${id}-author`}
          className="input"
          type="text"
          name="author"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">
        登録する
      </button>
    </form>
  );
}
