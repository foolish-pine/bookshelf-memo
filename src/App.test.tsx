import { render, screen } from "@testing-library/react";
import App from "./App.tsx";

test("アプリ名が表示される", () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: "本棚メモ" })).toBeInTheDocument();
});
