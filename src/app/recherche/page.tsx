"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { format } from "date-fns";

export default function SearchPage() {
  const [date, setDate] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (date) {
      const [year, month, day] = date.split("-");
      router.push(`/climatologie/jour/${year}/${month}/${day}/strasbourg`);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Rechercher une date</h1>
        <p className="text-muted-foreground">Accédez aux archives météo de strasbourg pour n'importe quel jour.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">Sélectionnez une date</label>
              <input 
                type="date" 
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              <Search className="mr-2 h-4 w-4" /> Voir les archives
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {[2026, 2025, 2024, 2023, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001].map(year => (
          <Button key={year} variant="outline" onClick={() => router.push(`/climatologie/annee/${year}/strasbourg`)}>
            Année {year}
          </Button>
        ))}
      </div>
    </div>
  );
}

