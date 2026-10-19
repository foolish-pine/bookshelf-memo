import { useBooks } from "../contexts/BooksContext";

export default function AddBookForm() {
  const { addBook } = useBooks();

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
      <label className="field field-label">
        タイトル
        <input className="input" type="text" name="title" required />
      </label>
      <label className="field field-label">
        著者
        <input className="input" type="text" name="author" required />
      </label>
      <button type="submit" className="btn btn-primary">
        登録する
      </button>
    </form>
  );
}
