"use client";
import { cn } from "@/lib/utils";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import ThemeToggle from "./ThemeToggle";

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
  return (
    <header className="w-full fixed z-50 bg-[var(--bg-primary)]">
      <div className="wrapper navbar-height py-4 flex items-center justify-between">
        <Link href="/" className="flex gap-.5 items-center ">
          <Image
            src="/assets/logo.png"
            alt="Bookly Logo"
            width={42}
            height={26}
            className="rounded-sm"
          />
          <span className="logo-text">Bookly</span>
        </Link>
        <div className="flex items-center gap-4">
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
          </nav>{" "}
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal" />
              <SignUpButton mode="modal">
                <button className="nav-signup-btn">Sign Up</button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/subscriptions" className="nav-user-name">
                Subscriptions
              </Link>
              <UserButton />{" "}
              {/* {user?.firstName && (
                <span className="nav-user-name">{user.firstName}</span>
              )} */}
            </Show>{" "}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
