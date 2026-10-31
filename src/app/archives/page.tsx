import fs from 'fs';
import path from 'path';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Plus besoin de force-dynamic. On va lire les fichiers au build.
const DATA_DIR = path.join(process.cwd(), 'data', 'daily');

export default function ArchivesPage() {
  // Cette lecture se fait UNE SEULE FOIS, pendant le build.
  let years: string[] = [];
  if (fs.existsSync(DATA_DIR)) {
    years = fs.readdirSync(DATA_DIR).sort((a, b) => b.localeCompare(a));
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Archives Climatologiques</h1>
      <p className="text-muted-foreground">Parcourez les données historiques de strasbourg par année et par mois.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {years.map(year => {
          const monthsDir = path.join(DATA_DIR, year);
          const months = fs.existsSync(monthsDir)
            ? fs.readdirSync(monthsDir).sort((a, b) => b.localeCompare(a))
            : [];

          return (
            <Card key={year}>
              <CardHeader>
                <CardTitle>Année {year}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {months.map(month => (
                    <Link 
                      key={month} 
                      href={`/climatologie/mois/${year}/${month}/strasbourg`}
                      className="text-sm p-2 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-center capitalize"
                    >
                      {format(new Date(parseInt(year), parseInt(month) - 1), "MMMM", { locale: fr })}
                    </Link>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link 
                    href={`/climatologie/annee/${year}/strasbourg`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Voir le résumé de l'année →
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
