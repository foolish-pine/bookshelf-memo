import { useEffect, useId, useState } from "react";
import { useBooks } from "../contexts/BooksContext";

export type OpenLibraryDoc = {
  key: string;
  title: string;
  author_name?: string[];
};

export type OpenLibrarySearchResponse = {
  start: number;
  numFound: number;
  docs: OpenLibraryDoc[];
};

const isOpenLibraryDoc = (value: unknown): value is OpenLibraryDoc => {
  if (typeof value !== "object" || value === null) return false;

  const doc = value as Record<string, unknown>;

  return (
    typeof doc.key === "string" &&
    typeof doc.title === "string" &&
    (doc.author_name === undefined ||
      (Array.isArray(doc.author_name) &&
        doc.author_name.every((s) => typeof s === "string")))
  );
};

export const isOpenLibrarySearchResponse = (
  value: unknown,
): value is OpenLibrarySearchResponse => {
  if (typeof value !== "object" || value === null) return false;

  const res = value as Record<string, unknown>;

  return (
    typeof res.start === "number" &&
    typeof res.numFound === "number" &&
    Array.isArray(res.docs) &&
    res.docs.every(isOpenLibraryDoc)
  );
};

async function searchBooks(
  query: string,
  signal?: AbortSignal,
): Promise<OpenLibrarySearchResponse> {
  const params = new URLSearchParams({
    q: query,
    fields: "key,title,author_name",
    limit: "10",
  });
  const res = await fetch(`https://openlibrary.org/search.json?${params}`, {
    signal,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: unknown = await res.json();

  if (!isOpenLibrarySearchResponse(data))
    throw new Error("Response is invalid.");

  return data;
}

type SearchResult =
  | {
      status: "untouched";
    }
  | {
      status: "pending";
    }
  | {
      data: OpenLibraryDoc[];
      status: "done";
    }
  | {
      status: "error";
    };

export default function BookSearch() {
  const { addBook } = useBooks();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult>({
    status: "untouched",
  });
  const id = useId();

  useEffect(() => {
    const query = searchQuery.trim();

    if (query === "") return;

    const controller = new AbortController();

    const timerId = setTimeout(async () => {
      try {
        setSearchResult({
          status: "pending",
        });

        const data = await searchBooks(query, controller.signal);

        setSearchResult({
          data: data.docs,
          status: "done",
        });
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setSearchResult({
          status: "error",
        });
        console.error("エラーが発生しました:", e);
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
      controller.abort();
    };
  }, [searchQuery]);

  return (
    <>
      <div className="field">
        <label htmlFor={`${id}-keyword`} className="field-label">
          本を検索
        </label>
        <input
          id={`${id}-keyword`}
          className="input"
          type="text"
          name="keyword"
          onChange={(e) => {
            setSearchQuery(e.target.value);

            if (e.target.value === "") {
              setSearchResult({
                status: "untouched",
              });
            }
          }}
        />
      </div>
      {searchResult.status === "pending" && (
        <p className="text-muted">検索中...</p>
      )}
      {searchResult.status === "done" && searchResult.data.length !== 0 && (
        <ul className="list">
          {searchResult.data.map((book) => {
            const author = book.author_name ?? ["著者未設定"];

            return (
              <li key={book.key} className="list-item is-vertical">
                <p className="item-title">タイトル: {book.title}</p>
                <p className="item-meta">著者: {author.join(", ")}</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    addBook({
                      title: book.title,
                      author: author.join(", "),
                    });
                  }}
                >
                  追加
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {searchResult.status === "done" && searchResult.data.length === 0 && (
        <p className="empty">
          お探しの本はありませんでした。別のキーワードで検索してください。
        </p>
      )}
      {searchResult.status === "error" && (
        <p className="notice notice-error">
          エラーが発生しました。時間をおいてもう一度お試しください。
        </p>
      )}
    </>
  );
}
