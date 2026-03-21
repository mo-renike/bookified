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
      <div className="rounded-xl w-[350px] m-auto p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-dark-100">{title}</h2>
        <p className="mt-2 text-base text-gray-600">{description}</p>
        <Link
          href={actionLink}
          className="mt-6 inline-flex rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {actionText}
        </Link>
      </div>
    </section>
  );
};

export default EmptyDataState;
