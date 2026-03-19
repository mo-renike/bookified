import { getBookBySlug } from "@/lib/actions/book.actions";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import VapiControls from "@/components/VapiControls";
import { IBook } from "@/types";

interface BookDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const BookDetailsPage = async ({ params }: BookDetailsPageProps) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { slug } = await params;
  const result = await getBookBySlug(userId, slug);

  const book = result.data as IBook;

  if (!result.success || !book) {
    redirect("/");
  }

  return (
    <main className="book-page-container">
      <Link href="/" className="back-btn-floating" aria-label="Go back">
        <ArrowLeft className="size-6 text-[var(--text-primary)]" />
      </Link>

      <VapiControls book={book} />
    </main>
  );
};

export default BookDetailsPage;
