import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const FULL_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Construit l'URL de la page "jour" à partir d'une date ISO (YYYY-MM-DD). */
export function getDayHref(date?: string | null): string | null {
  if (!date) return null;
  const match = FULL_DATE_REGEX.exec(date);
  if (!match) return null;
  const [, year, month, day] = match;
  return `/climatologie/jour/${year}/${month}/${day}/strasbourg`;
}

/** Construit l'URL de la page "mois" à partir d'une année et d'un mois (MM). */
export function getMonthHref(year?: string | null, month?: string | null): string | null {
  if (!year || !month) return null;
  return `/climatologie/mois/${year}/${month}/strasbourg`;
}

/** Construit l'URL de la page "année" à partir d'une année. */
export function getYearHref(year?: string | null): string | null {
  if (!year) return null;
  return `/climatologie/annee/${year}/strasbourg`;
}

const navLinkClass =
  "inline-flex items-center justify-center rounded-md border border-border bg-background/90 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap";

function NavLink({ href, title, children }: { href: string; title: string; children: ReactNode }) {
  return (
    <Link href={href} title={title} className={navLinkClass}>
      {children}
    </Link>
  );
}

interface RecordNavLinksProps {
  /** Date complète du record (YYYY-MM-DD) pour les records journaliers. */
  date?: string | null;
  /** Année du record. */
  year?: string | null;
  /** Mois du record (MM), généralement celui de la colonne du tableau. */
  month?: string | null;
  className?: string;
  dayLabel?: string;
  monthLabel?: string;
  yearLabel?: string;
}

/**
 * Affiche les boutons de navigation vers les pages "jour", "mois" (et "année"
 * pour les records annuels) correspondant à un record absolu.
 *
 * - "Jour"  : uniquement si le record est rattaché à une date précise.
 * - "Mois"  : à partir de l'année du record et du mois de la colonne.
 * - "Année" : uniquement si aucun mois n'est disponible (record annuel).
 */
export function RecordNavLinks({
  date,
  year,
  month,
  className,
  dayLabel = "Jour",
  monthLabel = "Mois",
  yearLabel = "Année",
}: RecordNavLinksProps) {
  const dayHref = getDayHref(date);
  const monthHref = getMonthHref(year, month);
  const yearHref = monthHref ? null : getYearHref(year);

  if (!dayHref && !monthHref && !yearHref) return null;

  return (
    <div className={cn("mt-1 flex flex-wrap items-center justify-center gap-1", className)}>
      {dayHref && (
        <NavLink href={dayHref} title="Voir la page de ce jour">
          {dayLabel}
        </NavLink>
      )}
      {monthHref && (
        <NavLink href={monthHref} title="Voir la page de ce mois">
          {monthLabel}
        </NavLink>
      )}
      {yearHref && (
        <NavLink href={yearHref} title="Voir la page de cette année">
          {yearLabel}
        </NavLink>
      )}
    </div>
  );
}

export default RecordNavLinks;

