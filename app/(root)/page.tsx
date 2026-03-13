import React from "react";
import HeroSection from "@/components/HeroSection";
import { sampleBooks } from "@/lib/constants";
import BookCard from "@/components/BookCard";

const Page = () => {
  return (
    <main className="wrapper container">
      <HeroSection />

      <div className="library-books-grid mt-10 md:mt-16">
        {sampleBooks.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>
    </main>
  );
};

export default Page;
