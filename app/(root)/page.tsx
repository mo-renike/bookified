import HeroSection from "@/components/HeroSection";
import BookCard from "@/components/BookCard";
import { getAllBooks } from "@/lib/actions/book.actions";
import { auth } from "@clerk/nextjs/server";
import { IBook } from "@/types";
import EmptyDataState from "@/components/EmptyDataState";

const Page = async () => {
  const { userId } = await auth();

  const result = userId
    ? await getAllBooks(userId)
    : { success: true, books: [] };
  const books: IBook[] = result.success ? (result.books as IBook[]) : [];

  return (
    <main className="wrapper container">
      <HeroSection />

      {books.length > 0 ? (
        <div className="library-books-grid mt-10 md:mt-16">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      ) : (
        <EmptyDataState
          title="No books yet"
          description="Upload your first book to start building your library."
          actionText="Upload a book"
          actionLink="/books/new"
        />
      )}
    </main>
  );
};

export default Page;
