"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ThermometerSun, Droplets, Wind, Sun, Cloud, CloudFog, Sparkles } from "lucide-react";
import TiltCard from "./3d-tilt-card";

const climateData = [
  {
    system: "Köppen",
    code: "BSh / BSk / BWh",
    description: "Climat steppe semi-aride chaud / Climat steppe semi-aride froide / Climat désertique chaud",
    icon: <Cloud className="w-8 h-8 text-orange-500" />,
    gradient: "from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/30 dark:via-amber-900/30 dark:to-yellow-900/30",
    borderColor: "border-orange-300 dark:border-orange-700"
  },
  {
    system: "Trewartha",
    code: "BS",
    description: "Climat semi-aride chaud à steppe",
    icon: <Sun className="w-8 h-8 text-yellow-500" />,
    gradient: "from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-900/30 dark:via-orange-900/30 dark:to-amber-900/30",
    borderColor: "border-yellow-300 dark:border-yellow-700"
  },
  {
    system: "Alisov",
    code: "SCs",
    description: "Climat subtropical continental semi-aride ou Subtropical continental sec",
    icon: <Wind className="w-8 h-8 text-amber-500" />,
    gradient: "from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/30 dark:via-yellow-900/30 dark:to-orange-900/30",
    borderColor: "border-amber-300 dark:border-amber-700"
  },
  {
    system: "Strahler",
    code: "BS midlat",
    description: "Climat de steppe semi-aride subtropical ou Semi-aride des moyennes latitudes",
    icon: <ThermometerSun className="w-8 h-8 text-orange-600" />,
    gradient: "from-orange-100 via-amber-100 to-yellow-100 dark:from-orange-900/40 dark:via-amber-900/40 dark:to-yellow-900/40",
    borderColor: "border-orange-400 dark:border-orange-600"
  },
  {
    system: "Thornthwaite",
    code: "C1 B’2 (semi-aride mésothermique)",
    description: "Climat semi-aride, mésithermique",
    icon: <Droplets className="w-8 h-8 text-blue-500" />,
    gradient: "from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-900/30 dark:via-cyan-900/30 dark:to-sky-900/30",
    borderColor: "border-blue-300 dark:border-blue-700"
  },
  {
    system: "Neef",
    code: "AhT",
    description: "Climat semi-aride subtropical continental ou Aride chaud à hiver tempéré",
    icon: <CloudFog className="w-8 h-8 text-gray-500" />,
    gradient: "from-gray-50 via-orange-50 to-amber-50 dark:from-gray-900/30 dark:via-orange-900/30 dark:to-amber-900/30",
    borderColor: "border-gray-300 dark:border-gray-700"
  }
];

const martonneData = {
  name: "Indice d'aridité de Martonne",
  value: "8,06",
  description: "Climat aride à limite semi-aride",
  formula: "I = P / (T + 10)",
  details: "P = 233 mm, T = 18,9 °C"
};

export default function ClimateClassificationTable() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="space-y-10"
      suppressHydrationWarning
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center space-y-4 relative"
      >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 20, ease: "linear", repeat: Infinity },
              scale: { duration: 2, ease: "easeInOut", repeat: Infinity }
            }}
          >
            <Sparkles className="w-8 h-8 text-amber-400" />
          </motion.div>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-400 dark:via-amber-400 dark:to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
          Classifications Climatiques
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Découvrir comment strasbourg est classé selon les principaux systèmes de classification climatique mondiaux
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {climateData.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <TiltCard>
              <Card className={`overflow-hidden border-2 ${item.borderColor} shadow-xl hover:shadow-2xl transition-shadow duration-500 bg-gradient-to-br ${item.gradient}`}>
                <CardHeader className="pb-4 pt-6">
                  <CardTitle className="flex items-center gap-4 text-2xl">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {item.icon}
                    </motion.div>
                    <span>{item.system}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="font-mono text-xl font-extrabold text-orange-600 dark:text-orange-400 bg-white/40 dark:bg-gray-800/40 px-4 py-2 rounded-xl inline-block">
                    {item.code}
                  </div>
                  <p className="text-lg leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
        whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
      >
        <TiltCard>
          <Card className="overflow-hidden border-2 border-blue-300 dark:border-blue-700 shadow-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-900/30 dark:via-cyan-900/30 dark:to-sky-900/30">
            <CardHeader className="pb-6 pt-8">
              <CardTitle className="flex items-center gap-4 text-3xl">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut"
                  }}
                >
                  <Droplets className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <span className="bg-gradient-to-r from-blue-700 to-cyan-700 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  {martonneData.name}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1, type: "spring" }}
                  className="text-7xl md:text-8xl font-black bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-600 dark:from-blue-400 dark:via-cyan-400 dark:to-sky-400 bg-clip-text text-transparent"
                >
                  {martonneData.value}
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="text-2xl font-semibold text-blue-900 dark:text-blue-300"
                >
                  {martonneData.description}
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-blue-200 dark:border-blue-700 shadow-xl"
              >
                <div className="font-mono text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                  Formulaire :
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-300 mb-4 font-mono">
                  {martonneData.formula}
                </div>
                <div className="text-lg text-blue-800 dark:text-blue-400 leading-relaxed">
                  {martonneData.details}
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </TiltCard>
      </motion.div>
    </motion.div>
  );
}

