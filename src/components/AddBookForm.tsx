export default function AddBookForm({
  addBook,
}: {
  addBook: ({ title, author }: { title: string; author: string }) => void;
}) {
  const handleSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;

    if (title.trim() === "" || author.trim() === "") return;

    addBook({
      title,
      author,
    });
  };

  return (
    <form action={handleSubmit} className="form card">
      <label className="field field-label">
        タイトル
        <input className="input" type="text" name="title" required />
      </label>
      <label className="field field-label">
        著者
        <input className="input" type="text" name="author" required />
      </label>
      <button type="submit" className="btn btn-primary">登録する</button>
    </form>
  );
}
