"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

interface WeatherChartProps {
  data: any[];
  title: string;
  dataKey: string;
  color: string;
  unit: string;
}

export default function WeatherChart({ data, title, dataKey, color, unit }: WeatherChartProps) {
  // Vérifier si les données sont valides
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className="w-full h-[400px]">
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground text-center">
            <p>Aucune donnée disponible</p>
            <p className="text-sm">Les données horaires ne sont pas disponibles pour cette date</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrer les données pour s'assurer qu'elles ont la clé requise
  const validData = data.filter(item => item[dataKey] !== null && item[dataKey] !== undefined);
  
  if (validData.length === 0) {
    return (
      <Card className="w-full h-[400px]">
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground text-center">
            <p>Données incomplètes</p>
            <p className="text-sm">Les données de "{title}" ne sont pas disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[400px]">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={250}>
          <AreaChart data={validData}>
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="time" 
              tickFormatter={(time) => format(parseISO(time), "HH:mm")}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}${unit}`}
            />
            <Tooltip 
              labelFormatter={(label) => format(parseISO(label), "HH:mm")}
              formatter={(value: any) => [`${value}${unit}`, title]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fillOpacity={1}
              fill={`url(#color${dataKey})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
