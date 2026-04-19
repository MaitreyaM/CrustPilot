"use client";

import React, { useEffect, useRef, useState } from "react";

const AnimatedNavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <a
      className="group relative inline-block h-5 overflow-hidden text-sm text-white/55"
      href={href}
    >
      <div className="flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-1/2">
        <span>{children}</span>
        <span className="text-white">{children}</span>
      </div>
    </a>
  );
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState("rounded-full");
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass("rounded-2xl");
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass("rounded-full");
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const navLinksData = [
    { label: "Manifesto", href: "#manifesto" },
    { label: "Careers", href: "#careers" },
    { label: "Discover", href: "#discover" },
  ];

  return (
    <header
      className={`fixed left-1/2 top-5 z-20 flex w-[calc(100%-2rem)] -translate-x-1/2 transform flex-col border border-white/10 bg-black/35 px-6 py-3 backdrop-blur-xl transition-[border-radius] duration-300 sm:w-auto ${headerShapeClass}`}
    >
      <div className="flex items-center justify-between gap-x-8">
        <div className="flex items-center">
          <div className="relative flex h-5 w-5 items-center justify-center">
            <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/80"></span>
            <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/80"></span>
            <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/80"></span>
            <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/80"></span>
          </div>
        </div>

        <nav className="hidden items-center space-x-6 sm:flex">
          {navLinksData.map((link) => (
            <AnimatedNavLink href={link.href} key={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/65 transition hover:text-white">
            Log in
          </button>
          <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90">
            Signup
          </button>
        </div>

        <button
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
          className="flex h-8 w-8 items-center justify-center text-white/70 sm:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          )}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out sm:hidden ${
          isOpen ? "max-h-96 pt-4 opacity-100" : "pointer-events-none max-h-0 pt-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col items-center space-y-4">
          {navLinksData.map((link) => (
            <a className="text-white/65 transition hover:text-white" href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
