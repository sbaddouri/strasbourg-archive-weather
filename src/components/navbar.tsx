"use client";

import Link from "next/link";
import { CloudSun, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <CloudSun className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl hidden sm:inline-block">strasbourg Archive</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/climatologie" className="transition-colors hover:text-primary">Climatologie</Link>
          <Link href="/archives" className="transition-colors hover:text-primary">Archives</Link>
          <Link href="/recherche" className="transition-colors hover:text-primary">Recherche</Link>
          <Link href="/radar" className="transition-colors hover:text-primary">Radar</Link>
          <Link href="/rapport-scientifique" className="transition-colors hover:text-primary">Rapport scientifique</Link>
          <Link href="/records-absolus" className="transition-colors hover:text-primary">Records absolus</Link>
          <ThemeToggle />
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="flex items-center md:hidden space-x-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden border-b bg-background p-4 flex flex-col space-y-4">
          <Link href="/climatologie" onClick={() => setIsOpen(false)}>Climatologie</Link>
          <Link href="/archives" onClick={() => setIsOpen(false)}>Archives</Link>
          <Link href="/recherche" onClick={() => setIsOpen(false)}>Recherche</Link>
          <Link href="/radar" onClick={() => setIsOpen(false)}>Radar</Link>
          <Link href="/rapport-scientifique" onClick={() => setIsOpen(false)}>Rapport scientifique</Link>
          <Link href="/records-absolus" onClick={() => setIsOpen(false)}>Records absolus</Link>
        </div>
      )}
    </header>
  );
}

