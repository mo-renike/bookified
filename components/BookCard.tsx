"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <Link href={`/books/${book.slug}`}>
      <article className="book-card">
        <figure className="book-card-figure">
          <div className="book-card-cover-wrapper">
            <Image
              src={book.coverURL}
              alt={`${book.title} cover`}
              width={150}
              height={200}
              className="book-card-cover"
            />
          </div>
        </figure>
        <figcaption className="book-card-meta ">
          <h3 className="book-card-title">{book.title}</h3>
          <p className="book-card-author">{book.author}</p>
        </figcaption>
      </article>
    </Link>
  );
};

export default BookCard;
