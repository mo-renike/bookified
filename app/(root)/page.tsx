import HeroSection from "@/components/HeroSection";
import BookCard from "@/components/BookCard";
import { searchBooks } from "@/lib/actions/book.actions";
import { auth } from "@clerk/nextjs/server";
import { IBook } from "@/types";
import EmptyDataState from "@/components/EmptyDataState";
import Link from "next/link";
import { Search, X } from "lucide-react";

interface HomePageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

const Page = async ({ searchParams }: HomePageProps) => {
  const { userId } = await auth();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = resolvedSearchParams?.q?.trim() || "";

  const result = userId ? await searchBooks(query) : null;
  const books: IBook[] = result?.success ? (result.books as IBook[]) : [];

  return (
    <main className="wrapper container">
      <HeroSection />

      <section className="mt-10 md:mt-16">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
            Recent Books
          </h2>

          <form method="GET" className="w-full sm:w-auto sm:min-w-[320px]">
            <div className="relative">
              <input
                name="q"
                defaultValue={query}
                placeholder="Search by title or author"
                className="h-11 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-3 pr-20 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-colors focus:border-[var(--accent-warm)]"
              />

              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {query ? (
                  <Link
                    href="/"
                    className="inline-flex size-8 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </Link>
                ) : null}

                <button
                  type="submit"
                  className="inline-flex size-8 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                  aria-label="Search books"
                >
                  <Search className="size-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {books.length > 0 ? (
        <div className="library-books-grid">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      ) : (
        <EmptyDataState
          title={query ? "No matching books" : "No books yet"}
          description={
            query
              ? "Try a different title or author, or clear your search."
              : "Upload your first book to start building your library."
          }
          actionText={query ? "Clear search" : "Upload a book"}
          actionLink={query ? "/" : "/books/new"}
        />
      )}
    </main>
  );
};

export default Page;
