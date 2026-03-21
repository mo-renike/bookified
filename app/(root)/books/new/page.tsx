import UploadForm from "@/components/UploadForm";
import React from "react";

const Page = () => {
  return (
    <main className="wrapper container">
      <div className="mx-auto max-w-180 space-y-10">
        <section className="flex flex-col gap-5">
          <h1 className="page-title-xl text-[var(--text-primary)]">
            Add a New Book
          </h1>
          <p className="sub-title">
            Upload a pdf of your book to start an interactive conversation with
            it.
          </p>
        </section>
        <UploadForm />
      </div>
    </main>
  );
};

export default Page;
