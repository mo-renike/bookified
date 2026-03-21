import Link from "next/link";
import React from "react";

interface EmptyDataStateProps {
  title: string;
  description: string;
  actionText: string;
  actionLink: string;
}

const EmptyDataState: React.FC<EmptyDataStateProps> = ({
  title,
  description,
  actionText,
  actionLink,
}) => {
  return (
    <section className="mt-10 md:mt-16">
      <div className="library-empty-card w-[350px] m-auto text-center">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="mt-2 text-base text-[var(--text-secondary)]">
          {description}
        </p>
        <Link
          href={actionLink}
          className="mt-6 inline-flex rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-hover)]"
        >
          {actionText}
        </Link>
      </div>
    </section>
  );
};

export default EmptyDataState;
