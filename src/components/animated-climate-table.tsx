"use client";

import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AnimatedClimateTable() {
  return (
    <div className="overflow-x-auto mb-4">
      <Table className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-blue-200 dark:border-slate-700 shadow-lg">
        <TableHeader className="bg-gradient-to-r from-blue-600 to-indigo-600">
          <TableRow>
            <TableHead className="text-white font-bold text-base">Variable</TableHead>
            <TableHead className="text-white font-bold text-center text-base">Valeur</TableHead>
            <TableHead className="text-white font-bold text-base">Lecture climatologique</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <TableCell className="font-medium">Température moyenne annuelle</TableCell>
            <TableCell className="text-center font-bold text-blue-700 dark:text-blue-400">18,9 °C</TableCell>
            <TableCell>climat doux à chaud à l’échelle annuelle</TableCell>
          </motion.tr>
          <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <TableCell className="font-medium">Tmax moyenne la plus élevée</TableCell>
            <TableCell className="text-center font-bold text-red-600 dark:text-red-400">36,2 °C en juillet</TableCell>
            <TableCell>été très chaud</TableCell>
          </motion.tr>
          <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <TableCell className="font-medium">Tmin moyenne la plus basse</TableCell>
            <TableCell className="text-center font-bold text-blue-600 dark:text-blue-400">4,6 °C en janvier</TableCell>
            <TableCell>hiver frais la nuit</TableCell>
          </motion.tr>
          <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <TableCell className="font-medium">Record absolu de chaleur</TableCell>
            <TableCell className="text-center font-bold text-red-700 dark:text-red-500">46,6 °C</TableCell>
            <TableCell>potentiel caniculaire très élevé</TableCell>
          </motion.tr>
          <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <TableCell className="font-medium">Record absolu de froid</TableCell>
            <TableCell className="text-center font-bold text-blue-800 dark:text-blue-300">-8,5 °C</TableCell>
            <TableCell>vraies gelées sévères possibles</TableCell>
          </motion.tr>
          <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <TableCell className="font-medium">Précipitations annuelles</TableCell>
            <TableCell className="text-center font-bold text-cyan-600 dark:text-cyan-400">233 mm</TableCell>
            <TableCell>climat nettement sec</TableCell>
          </motion.tr>
          <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <TableCell className="font-medium">Jours avec ≥ 1 mm</TableCell>
            <TableCell className="text-center font-bold text-indigo-600 dark:text-indigo-400">34 jours/an</TableCell>
            <TableCell>pluies peu fréquentes</TableCell>
          </motion.tr>
          <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <TableCell className="font-medium">Humidité relative moyenne annuelle</TableCell>
            <TableCell className="text-center font-bold text-teal-600 dark:text-teal-400">58,7 %</TableCell>
            <TableCell>air globalement sec à modérément sec</TableCell>
          </motion.tr>
          <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <TableCell className="font-medium">Point de rosée moyen annuel</TableCell>
            <TableCell className="text-center font-bold text-emerald-600 dark:text-emerald-400">8,4 °C</TableCell>
            <TableCell>chaleur souvent “sèche”, peu moite</TableCell>
          </motion.tr>
          <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <TableCell className="font-medium">Ensoleillement annuel</TableCell>
            <TableCell className="text-center font-bold text-yellow-600 dark:text-yellow-400">3 130,4 h</TableCell>
            <TableCell>très forte insolation</TableCell>
          </motion.tr>
          <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <TableCell className="font-medium">Pourcentage d’ensoleillement possible</TableCell>
            <TableCell className="text-center font-bold text-orange-600 dark:text-orange-400">70 %</TableCell>
            <TableCell>ciel souvent dégagé</TableCell>
          </motion.tr>
          <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <TableCell className="font-medium">Neige moyenne annuelle</TableCell>
            <TableCell className="text-center font-bold text-slate-600 dark:text-slate-400">0,42 cm</TableCell>
            <TableCell>phénomène exceptionnel mais non impossible</TableCell>
          </motion.tr>
          <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <TableCell className="font-medium">Indice UV max</TableCell>
            <TableCell className="text-center font-bold text-violet-600 dark:text-violet-400">12 en juin</TableCell>
            <TableCell>rayonnement estival extrêmement fort</TableCell>
          </motion.tr>
        </TableBody>
      </Table>
    </div>
  );
}
