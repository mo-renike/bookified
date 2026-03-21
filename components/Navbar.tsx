"use client";
import { cn } from "@/lib/utils";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const ThemeToggle = dynamic(() => import("./ThemeToggle"), {
  ssr: false,
});

const navItems = [
  {
    label: "Library",
    href: "/",
  },
  {
    label: "Add New Book",
    href: "/books/new",
  },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="w-full fixed z-50 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]">
      <div className="wrapper navbar-height py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex gap-.5 items-center">
          <Image
            src="/assets/logo.png"
            alt="Bookly Logo"
            width={42}
            height={26}
            className="rounded-sm"
          />
          <span className="logo-text">Bookly</span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <nav className="w-fit items-center flex gap-7">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "nav-link-base",
                    isActive ? "nav-link-active" : "nav-link-default",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="nav-btn">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="nav-signup-btn">Sign Up</button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <Link href="/subscriptions" className="nav-user-name">
                Subscriptions
              </Link>
              <UserButton />
            </Show>

            <ThemeToggle />
          </div>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)]"
          >
            {isMobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="wrapper pb-4 md:hidden">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-soft-sm">
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[var(--bg-tertiary)] text-[var(--color-brand)]"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="my-3 h-px bg-[var(--border-subtle)]" />

            <div className="flex flex-col gap-2">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button
                    onClick={closeMobileMenu}
                    className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
                  >
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    onClick={closeMobileMenu}
                    className="w-full rounded-md bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white"
                  >
                    Sign Up
                  </button>
                </SignUpButton>
              </Show>

              <Show when="signed-in">
                <Link
                  href="/subscriptions"
                  onClick={closeMobileMenu}
                  className="rounded-md px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-tertiary)]"
                >
                  Subscriptions
                </Link>
                <div className="px-1">
                  <UserButton />
                </div>
              </Show>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
