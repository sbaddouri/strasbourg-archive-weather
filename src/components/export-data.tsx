"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportDataProps {
  data: any;
  filename: string;
}

export default function ExportData({ data, filename }: ExportDataProps) {
  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${filename}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadCSV = () => {
    if (!Array.isArray(data)) return;
    const keys = Object.keys(data[0]);
    const csvContent = [
      keys.join(','),
      ...data.map(row => keys.map(key => row[key]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" onClick={downloadJSON}>
        <Download className="mr-2 h-4 w-4" /> JSON
      </Button>
      <Button variant="outline" size="sm" onClick={downloadCSV}>
        <Download className="mr-2 h-4 w-4" /> CSV
      </Button>
    </div>
  );
}
