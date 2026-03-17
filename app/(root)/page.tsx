import React from "react";
import HeroSection from "@/components/HeroSection";
import { sampleBooks } from "@/lib/constants";
import BookCard from "@/components/BookCard";
import { getAllBooks } from "@/lib/actions/book.actions";
import { useAuth } from "@clerk/nextjs";

const Page = async () => {
  // const { userId } = useAuth();
  const { books } = (await getAllBooks()) || { books: [] };

  return (
    <main className="wrapper container">
      <HeroSection />

      <div className="library-books-grid mt-10 md:mt-16">
        {books?.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>
    </main>
  );
};

export default Page;
