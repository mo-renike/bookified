import { getBookBySlug } from "@/lib/actions/book.actions";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Mic, MicOff } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

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

  if (!result.success || !result.data) {
    redirect("/");
  }

  const { title, author, coverURL, persona } = result.data as {
    title: string;
    author: string;
    coverURL: string;
    persona?: string;
  };

  return (
    <main className="book-page-container">
      <Link href="/" className="back-btn-floating" aria-label="Go back">
        <ArrowLeft className="size-5 text-[var(--text-primary)]" />
      </Link>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <section className="vapi-header-card">
          <div className="vapi-cover-wrapper">
            <Image
              src={coverURL}
              alt={`${title} cover`}
              width={120}
              height={180}
              unoptimized
              className="vapi-cover-image h-auto w-[120px]"
            />

            <div className="vapi-mic-wrapper">
              <button
                type="button"
                className="vapi-mic-btn vapi-mic-btn-inactive"
                aria-label="Mic disabled"
              >
                <MicOff className="size-7 text-[var(--text-primary)]" />
              </button>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div>
              <h1 className="font-serif text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1 text-base text-[var(--text-secondary)]">
                by {author}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="vapi-status-indicator">
                <span className="vapi-status-dot vapi-status-dot-ready" />
                <span className="vapi-status-text">Ready</span>
              </div>

              <div className="vapi-status-indicator">
                <span className="vapi-status-text">
                  Voice: {persona || "Default"}
                </span>
              </div>

              <div className="vapi-status-indicator">
                <span className="vapi-status-text">0:00/15:00</span>
              </div>
            </div>
          </div>
        </section>

        <section className="transcript-container min-h-[400px]">
          <div className="transcript-empty">
            <Mic className="mb-3 size-12 text-[var(--text-muted)]" />
            <p className="transcript-empty-text">No conversation yet</p>
            <p className="transcript-empty-hint">
              Click the mic button above to start talking
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default BookDetailsPage;
