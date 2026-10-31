import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import temperatureSpectrum from "../../../plage et spectre de température.json";
import WeatherCountdown from "@/components/weather-countdown";
import AnimatedClimateTable from "@/components/animated-climate-table";
import ClimateClassificationTable from "@/components/climate-classification-table";
import WeatherBackgroundEffectsWrapper from "@/components/WeatherBackgroundEffectsWrapper";

type TemperatureEntry = {
  "Température (°C)": number;
  "Température (°F)": number;
  "Hex fond": string;
  "Hex texte": string;
  "Aperçu": string;
  "Style CSS": string;
};

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Année'];

const climateData = {
  recordHigh: [27.6, 32.9, 35.6, 39.9, 41.5, 44.6, 46.6, 46.3, 43.8, 38.4, 32.3, 29.8, 46.6],
  meanMax: [21.4, 23.7, 28.8, 31.6, 34.9, 38.7, 42.3, 41.5, 36.6, 32.4, 26.3, 21.6, 42.21],
  meanDailyMax: [15.3, 17.4, 20.3, 22.9, 26.8, 31.8, 36.2, 36.0, 30.8, 25.7, 19.6, 15.9, 24.9],
  dailyMean: [10.0, 11.8, 14.4, 16.9, 20.5, 25.0, 28.8, 28.9, 24.7, 20.1, 14.5, 10.9, 18.9],
  meanDailyMin: [4.6, 6.2, 8.5, 10.8, 14.1, 18.1, 21.4, 21.8, 18.6, 14.4, 9.4, 5.9, 12.8],
  meanMin: [-0.5, 1.8, 3.2, 6.4, 9.4, 14.3, 18.0, 17.9, 13.5, 9.4, 3.5, 0.9, -1.07],
  recordLow: [-8.5, -4.2, -2.0, -0.5, 2.0, 6.0, 10.5, 8.8, 5.3, 0.0, -2.0, -3.5, -8.5],
  avgPrecipitation: [20, 24, 30, 27, 23, 8, 3, 6, 16, 27, 30, 19, 233],
  avgSnowfall: [0.11, 0.07, 0.01, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.08, 0.15, 0.42],
  avgPrecipitationDays: [3, 4, 4, 4, 3, 2, 1, 1, 2, 3, 4, 3, 34],
  avgSnowyDays: [0.005, 0.002, 0.001, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.000, 0.002, 0.01],
  avgRelativeHumidity: [65, 61, 55, 51, 46, 40, 36, 39, 50, 56, 64, 69, 58.7],
  avgDewPoint: [3.8, 4.5, 5.7, 6.8, 8.7, 10.9, 11.9, 13.1, 12.9, 10.5, 7.0, 4.8, 8.4],
  meanMonthlySunshine: [210.8, 198.8, 244.9, 258.0, 300.7, 318.0, 347.2, 322.4, 270.0, 248.0, 207.0, 204.6, 3130.4],
  percentagePossibleSunshine: [68.0, 64.5, 65.8, 66.2, 69.3, 72.1, 77.8, 77.6, 72.6, 70.8, 66.3, 66.0, 70.0],
  avgUvIndex: [3, 5, 8, 9, 11, 12, 11, 10, 9, 7, 5, 4, 8]
};

const getTempStyle = (temp: number) => {
  // Find the closest temperature entry
  let closestEntry: TemperatureEntry | undefined;
  let minDiff = Infinity;

  for (const entry of temperatureSpectrum as TemperatureEntry[]) {
    const diff = Math.abs(entry["Température (°C)"] - temp);
    if (diff < minDiff) {
      minDiff = diff;
      closestEntry = entry;
    }
  }

  if (closestEntry) {
    return {
      backgroundColor: closestEntry["Hex fond"],
      color: closestEntry["Hex texte"],
    };
  }
  return {};
};

const getPrecipitationStyle = (mm: number) => {
  // Clamp mm to 0-300 range
  const clampedMm = Math.max(0, Math.min(300, mm));
  
  // Calculate color components based on the pattern from the original data
  let red: number;
  let green: number;
  
  if (clampedMm <= 30) {
    // 0-30mm: From #FFFFFF (255,255) to #D0D0FF (208,208)
    const ratio = clampedMm / 30;
    red = Math.round(255 - ratio * 47); // 255 → 208
    green = red;
  } else {
    // 30-300mm: From #D0D0FF (208,208) to #0000FF (0,0)
    const ratio = (clampedMm - 30) / (300 - 30);
    red = Math.round(208 - ratio * 208); // 208 → 0
    green = red;
  }
  
  // Convert to hex
  const rHex = red.toString(16).padStart(2, '0').toUpperCase();
  const gHex = green.toString(16).padStart(2, '0').toUpperCase();
  const bHex = 'FF';
  
  // Determine text color: white if red/green < 128, black otherwise
  const textColor = red < 128 ? 'FFFFFF' : '000000';
  
  return {
    backgroundColor: `#${rHex}${gHex}${bHex}`,
    color: `#${textColor}`,
  };
};

const getColorClass = (type: string, value: number) => {
  switch (type) {
    case 'temp':
      return ''; // Handled by inline style now
    case 'precipitation':
      if (value === 0) return 'bg-gray-200';
      if (value < 10) return 'bg-cyan-200';
      if (value < 20) return 'bg-cyan-400';
      if (value < 30) return 'bg-green-300';
      return 'bg-green-500 text-white';
    case 'humidity':
      if (value < 40) return 'bg-blue-400 text-white';
      if (value < 50) return 'bg-blue-500 text-white';
      if (value < 60) return 'bg-blue-600 text-white';
      return 'bg-blue-700 text-white';
    case 'sunshine':
      return 'bg-yellow-300';
    case 'uv':
      if (value < 3) return 'bg-yellow-300';
      if (value < 6) return 'bg-yellow-500';
      if (value < 8) return 'bg-orange-500';
      if (value < 10) return 'bg-red-500 text-white';
      return 'bg-purple-600 text-white';
    default:
      return '';
  }
};

export default function ClimatologiePage() {
  return (
    <div className="space-y-8 relative">
      <WeatherBackgroundEffectsWrapper />
      <WeatherCountdown />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Climatologie de strasbourg</h1>
        <p className="text-muted-foreground">Données climatiques moyennes et records pour la ville de strasbourg (1940–present).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Profil Climatique</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h3 className="mt-6 mb-4"><strong>1. Position de strasbourg dans le système climatique marocain :</strong></h3>
            <p>
              strasbourg appartient au Maroc oriental intérieur, dans le couloir de la Moulouya et dans le bassin de strasbourg, à l’interface des influences rifaines, atlasiques et sahariennes. C’est précisément cette position de charnière qui donne à son climat sa personnalité : ni véritable méditerranéen maritime, ni saharien absolu, mais un climat intérieur très sec, très ensoleillé, fortement continentalisé, à dominante semi-aride à tendance aride, avec une saisonnalité des pluies de type méditerranéen dégradé. Le Maroc est globalement commandé par la latitude, l’effet de continentalité, l’influence méditerranéenne, l’Atlantique, le courant froid des Canaries, l’orographie du Rif et de l’Atlas, et les intrusions sahariennes ; dans l’Oriental intérieur, ces facteurs ne s’annulent pas, ils se superposent.
            </p>
            <p>
              Autrement dit, strasbourg est une ville d’intérieur, protégée des effets régulateurs marins les plus francs, mais pas coupée des grandes circulations atlantiques et méditerranéennes. Elle reçoit peu d’eau, beaucoup de soleil, de fortes amplitudes thermiques, et subit des contrastes saisonniers bien plus nets que les façades littorales du Maroc. C’est un climat où l’énergie radiative domine, où l’évaporation potentielle est très forte, et où l’eau est la variable limitante majeure pendant une grande partie de l’année.
            </p>
            
            <h3 className="mt-6 mb-4"><strong>2. Lecture synthétique de votre tableau climatique :</strong></h3>
            <p>
              À partir de votre tableau, le signal climatique de fond est très clair :
            </p>
            <AnimatedClimateTable />
            <p>
              Le trait fondamental n’est donc pas seulement “été chaud / hiver doux”, formulation beaucoup trop pauvre ; le trait fondamental est : sécheresse structurelle + forte continentalité thermique + insolation remarquable + grande variabilité interannuelle des pluies + risque simultané de gel radiatif hivernal et de canicule estivale.
            </p>

            <h3 className="mt-6 mb-4"><strong>3. Régime thermique : un climat plus continental qu’on ne l’imagine :</strong></h3>
            <p>
              Thermiquement, strasbourg présente une amplitude annuelle marquée. La moyenne journalière passe de 10,0 °C en janvier à 28,9 °C en août, soit près de 19 °C d’écart. La moyenne des maximales quotidiennes grimpe de 15,3 °C en janvier à 36,2 °C en juillet ; les minimales moyennes passent de 4,6 °C en janvier à 21,8 °C en août. Cela traduit un climat intérieur, très éloigné du lissage thermique côtier.
            </p>
            <p>
              Plus encore, la chaleur n’est pas seulement “forte”, elle est structurellement durable. Dès mai, la maximale moyenne atteint 26,8 °C, puis 31,8 °C en juin, 36,2 °C en juillet, 36,0 °C en août, et 30,8 °C encore en septembre. La saison chaude est donc longue, intense, et énergétiquement dominante. Elle ne se limite pas à deux mois, elle s’étire en pratique de la fin du printemps au début de l’automne.
            </p>
            <p>
              Inversement, l’hiver n’est pas rigoureusement froid en moyenne, mais il est suffisamment continental pour permettre des nuits froides et des gelées. Avec 4,6 °C de minimale moyenne en janvier et un record absolu à -8,5 °C, on n’est pas du tout dans un climat tropical doux d’hiver. strasbourg possède un hiver modeste en durée, mais réel en capacité de refroidissement nocturne. Les nuits calmes, sèches, à ciel clair, favorisent des pertes radiatives très efficaces et des inversions thermiques, surtout en contexte de bassin et de drainage d’air froid.
            </p>
            <p>
              Le résultat pratique est le suivant : journées estivales très chaudes, nuits hivernales capables de décrocher franchement, ce qui est exactement la signature d’un climat intérieur semi-aride continentalisé.
            </p>

            <h3 className="mt-6 mb-4"><strong>4. L’été de strasbourg : chaleur sèche, ciel ouvert, rayonnement brutal :</strong></h3>
            <p>
              L’été strasbourgi n’est pas seulement chaud ; il est radiatif. Avec 318 h de soleil en juin, 347,2 h en juillet, 322,4 h en août et un pourcentage d’ensoleillement possible de 72 à 78 % sur cette période, l’atmosphère estivale est dominée par la subsidence, la stabilité et la faiblesse de la nébulosité. Cela signifie : fort flux solaire, échauffement rapide des surfaces, températures de sol élevées, assèchement accéléré des horizons superficiels, et forte évapotranspiration potentielle.
            </p>
            <p>
              L’humidité relative moyenne tombe à 40 % en juin, 36 % en juillet et 39 % en août. C’est une information capitale. Une chaleur à 36 °C avec 36–40 % d’humidité n’est pas une chaleur maritime lourde ; c’est une chaleur sèche, plus “brûlante” que moite, avec refroidissement nocturne encore possible hors épisodes de vent chaud persistant. Le point de rosée moyen, qui ne dépasse qu’environ 13 °C au cœur de l’été, confirme que l’air est chaud mais rarement franchement tropical. C’est un été d’air sec, pas un été de lourdeur humide.
            </p>
            <p>
              L’indice UV culmine à 12 en juin et reste à 11 en juillet. Cela situe strasbourg dans un contexte de rayonnement ultraviolet très fort à extrême en saison chaude. En termes biométéorologiques, cela implique stress radiatif, dessiccation foliaire accrue, et exposition solaire sévère pour l’humain comme pour les cultures.
            </p>

            <h3 className="mt-6 mb-4"><strong>5. Le régime pluviométrique : peu de pluie, peu de jours de pluie, mais des pluies parfois efficaces et parfois violentes :</strong></h3>
            <p>
              Le cumul annuel de 233 mm est faible. Mais il faut aller plus loin que ce chiffre. Le plus important est la répartition et la fréquence.
            </p>
            <p>
              Sur vos données, la pluie se concentre surtout entre l’automne, l’hiver et le printemps. De juin à septembre, le total n’est que de 33 mm. À l’inverse, d’octobre à mai, on recueille environ 200 mm, soit l’essentiel du budget annuel. Cela signe une saison sèche estivale nette, conforme à un rythme méditerranéen, mais sur un fond nettement plus sec que le littoral.
            </p>
            <p>
              Cependant, strasbourg ne présente pas exactement un simple maximum hivernal océanique. Le Maroc oriental intérieur, dans la Moulouya, est justement connu pour un régime à maximum printanier ou printano-hivernal, parfois qualifié de régime “moulouyen”, lié à l’échauffement plus rapide des terres continentales et au développement de pluies convectives à l’est de l’Atlas. Votre tableau le montre bien : mars et novembre sont à 30 mm, avril à 27 mm, mai à 23 mm ; l’axe mars–mai est très actif par rapport au cœur de l’hiver.
            </p>
            <p>
              Les pluies sont en outre peu fréquentes : 34 jours par an avec au moins 1 mm. Cela signifie que le climat n’est pas seulement sec en cumul, il l’est aussi en occurrence. Le système hydrique repose donc sur un petit nombre d’épisodes, parfois modérés, parfois concentrés, parfois convectifs. C’est précisément ce type de climat qui alterne longues périodes de sécheresse atmosphérique et épisodes pluvieux ponctuellement efficaces, voire brutaux.
            </p>
            <p>
              Les travaux sur la Moulouya montrent d’ailleurs une forte irrégularité spatio-temporelle des pluies, avec plusieurs échelles de variabilité, notamment un mode dominant de 4 à 8 ans, et rappellent que les crues de l’oued Moulouya et de ses affluents menacent des villes comme strasbourg. Le paradoxe des climats semi-arides apparaît ici pleinement : peu de pluie en moyenne, mais un vrai risque d’averses intenses et de crues rapides.
            </p>

            <h3 className="mt-6 mb-4"><strong>6. Hygrométrie et point de rosée : la vraie signature psychrométrique de strasbourg :</strong></h3>
            <p>
              Vos valeurs d’humidité relative et de point de rosée sont particulièrement instructives, et elles sont trop souvent ignorées dans les descriptions climatiques banales.
            </p>
            <p>
              En hiver, l’humidité relative moyenne de 61 à 69 % s’accompagne de points de rosée autour de 4 à 5 °C. Cela donne une sensation d’air frais mais pas saturé, souvent calme, parfois brumeux ou humide en matinée si l’inversion se met en place, mais sans l’omniprésence d’un air littoral humide.
            </p>
            <p>
              Au printemps, l’humidité recule progressivement de 55 % en mars à 46 % en mai. Cela correspond à la mise en régime du séchage atmosphérique et des surfaces.
            </p>
            <p>
              En été, la combinaison 36–40 % d’humidité relative et points de rosée autour de 11 à 13 °C indique une chaleur sèche, à forte capacité évaporative. En d’autres termes, la transpiration et l’évaporation fonctionnent très bien tant que l’eau est disponible ; mais justement, l’eau manque. Pour la végétation, ce couple “rayonnement fort + chaleur + faible humidité + longue saison sèche” est beaucoup plus contraignant que la seule valeur de température.
            </p>
            <p>
              En automne, l’humidité remonte, signe de la réactivation progressive des circulations perturbées et d’une baisse de la capacité desséchante de l’air.
            </p>

            <h3 className="mt-6 mb-4"><strong>7. Insolation, nébulosité et bilan radiatif :</strong></h3>
            <p>
              Avec plus de 3 130 heures de soleil par an, strasbourg appartient clairement au domaine très ensoleillé du Maroc intérieur. Ce n’est pas anecdotique : l’ensoleillement est ici une variable structurante, pas une simple commodité.
            </p>
            <p>
              Un ensoleillement de cette ampleur signifie :
            </p>
            <ul className="list-none pl-0 space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl leading-5 flex-shrink-0">o</span>
                <span>bilan radiatif positif très puissant au printemps et en été ;</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl leading-5 flex-shrink-0">o</span>
                <span>réchauffement diurne rapide des sols et des basses couches ;</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl leading-5 flex-shrink-0">o</span>
                <span>forte capacité convective au printemps quand de l’air plus froid d’altitude vient survoler une surface déjà chauffée ;</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl leading-5 flex-shrink-0">o</span>
                <span>amplitude thermique diurne souvent bien marquée ;</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl leading-5 flex-shrink-0">o</span>
                <span>dessiccation rapide des horizons superficiels ;</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl leading-5 flex-shrink-0">o</span>
                <span>charge thermique importante sur les cultures, les bâtiments et les organismes.</span>
              </li>
            </ul>
            <p>
              Quand on met en regard cet ensoleillement avec la faiblesse pluviométrique, l’interprétation est sans ambiguïté : strasbourg fonctionne comme un climat à surplus d’énergie mais à déficit hydrique.
            </p>

            <h3 className="mt-6 mb-4"><strong>8. Configuration terrestre et effets de site : bassin, couloir, drainage et ombre pluviométrique :</strong></h3>
            <p>
              La géographie régionale explique énormément. Le climat de strasbourg ne se comprend pas seulement par sa latitude, mais par sa situation de bassin/couloir intérieur dans l’ensemble de la Moulouya, au contact de reliefs qui filtrent, dévient et modulent les flux.
            </p>
            <p>
              L’orographie marocaine joue un rôle majeur dans l’organisation des pluies. Le Rif et les chaînes atlasiques perturbent la pénétration des masses d’air humides, créent des contrastes spatiaux très forts, et favorisent à l’est intérieur des conditions plus sèches par continentalité et effet d’abri relatif. À l’échelle du Maroc oriental intérieur, les terres se réchauffent rapidement, ce qui favorise au printemps les développements convectifs, mais l’effet global du relief reste celui d’une réduction de l’apport humide régulier par rapport aux façades plus exposées.
            </p>
            <p>
              À l’échelle locale, cette configuration favorise aussi les inversions nocturnes : l’air froid plus dense glisse vers les bas-fonds, s’y accumule, et accentue les minimales au petit matin lors des nuits calmes et dégagées. C’est l’une des raisons pour lesquelles une zone horticole moyenne relativement douce peut tout de même enregistrer des gelées fortes et des poches froides.
            </p>

            <h3 className="mt-6 mb-4"><strong>9. Dynamiques atmosphériques à grande échelle : ce qui fait vraiment le temps à strasbourg :</strong></h3>
            <p>
              Le Maroc est commandé alternativement par des situations anticycloniques subtropicales et par des séquences perturbées d’origine atlantique/méditerranéenne. Quand l’extension de l’anticyclone des Açores s’étire vers le Maroc, l’atmosphère se stabilise, la subsidence domine, la convection profonde est inhibée et les perturbations des moyennes latitudes sont refoulées ou affaiblies. Ce type de configuration entretient les séquences sèches, y compris pendant la saison supposée humide.
            </p>
            <p>
              À l’inverse, les épisodes pluvieux significatifs sont associés à des circulations cycloniques, à des talwegs d’altitude, et à des dépressions positionnées à l’ouest ou au nord-ouest du Maroc, capables d’advecter de l’air humide de secteurs ouest, nord-ouest ou sud-ouest. Ce sont ces situations qui redonnent de l’instabilité, permettent la cyclogenèse secondaire ou la convection organisée, et apportent les pluies utiles.
            </p>
            <p>
              Pour le bassin de strasbourg, des travaux récents soulignent également le rôle combiné des dépressions atlantiques, des dépressions méditerranéennes, des rivières atmosphériques comme apporteurs d’humidité, ainsi que l’influence des régimes zonaux, méridiens et de blocage. Le relief local module ensuite la répartition fine des quantités.
            </p>

            <h3 className="mt-6 mb-4"><strong>10. Les saisons :</strong></h3>
            <h4 className="mt-4 mb-3"><strong>Hiver :</strong></h4>
            <p>
              L’hiver strasbourgi est une saison fraîche, modérément humide à l’échelle locale mais pauvre en pluies à l’échelle absolue. Les perturbations peuvent circuler, mais elles n’arrosent pas avec la régularité d’un climat océanisé. Le ciel clair entre deux épisodes favorise de fortes pertes radiatives nocturnes ; d’où les gelées possibles, parfois sévères. Les journées restent souvent lumineuses et relativement tempérées. C’est un hiver d’alternance : passages perturbés modestes, puis longues accalmies stables.
            </p>
            <h4 className="mt-4 mb-3"><strong>Printemps :</strong></h4>
            <p>
              Le printemps est la saison charnière la plus intéressante. Le réchauffement des terres devient rapide, l’atmosphère peut gagner en instabilité, et la région de la Moulouya montre volontiers un maximum pluviométrique relatif à cette saison. C’est la saison des contrastes : belles journées lumineuses, vent parfois agité, épisodes convectifs, averses orageuses, grêle ponctuelle possible, et démarrage franc de la sécheresse de surface dès que les pluies cessent.
            </p>
            <h4 className="mt-4 mb-3"><strong>Été :</strong></h4>
            <p>
              L’été est long, très chaud, très sec, très lumineux. La subsidence subtropicale domine, les pluies deviennent anecdotiques, l’humidité chute, les sols se vident, la végétation non irriguée entre en stress marqué. Les épisodes de vent chaud continental peuvent faire bondir les températures vers les extrêmes. Le chergui, vent d’est à sud-est chaud, sec et poussiéreux, est l’une des expressions les plus typiques de cette dynamique maroco-saharienne.
            </p>
            <h4 className="mt-4 mb-3"><strong>Automne :</strong></h4>
            <p>
              L’automne marque la reprise potentielle de l’activité pluviogène, mais sur des sols souvent desséchés et parfois encroûtés. C’est une saison météorologiquement délicate : les premières perturbations peuvent être bénéfiques, mais les épisodes intenses de courte durée peuvent produire ruissellement rapide et crues. Dans les régions semi-arides, ce n’est pas la quantité annuelle qui suffit à caractériser le risque ; c’est aussi l’intensité des événements.
            </p>

            <h3 className="mt-6 mb-4"><strong>11. Extrêmes thermiques :</strong></h3>
            <p>
              Votre série est très parlante : record absolu de 46,6 °C et record absolu de -8,5 °C. L’amplitude absolue atteint donc 55,1 °C. C’est énorme, et cela signe une continentalité réelle.
            </p>
            <p>
              Cette amplitude est rendue possible par quatre facteurs principaux : ciel souvent dégagé, air souvent sec, éloignement modéré des influences maritimes régulatrices, et topographie favorable à l’accumulation d’air froid en hiver tout en laissant s’exprimer les advections brûlantes en été.
            </p>
            <p>
              Climatologiquement, cela veut dire qu’il ne faut jamais résumer strasbourg par “hiver doux”. Un hiver de moyenne douce n’empêche nullement des décrochages sévères. De même, un été “moyen” à 36 °C de maximale n’empêche pas des pointes exceptionnellement hautes lors des advections sahariennes.
            </p>

            <h3 className="mt-6 mb-4"><strong>12. Zone de rusticité USDA :</strong></h3>
            <p>
              La carte USDA repose non pas sur la température record absolue, mais sur la moyenne des minima extrêmes annuels hivernaux. Le système USDA fonctionne par zones de 10 °F, subdivisées en demi-zones de 5 °F. La zone 10a correspond à une moyenne annuelle des extrêmes minimaux comprise entre 30 et 35 °F, soit -1,1 à +1,7 °C.
            </p>
            <p>
              Or votre tableau donne une moyenne minimum annuelle de -1,07 °C, soit pratiquement la borne inférieure de 10a. Donc oui : strasbourg peut être classé en USDA 10a.
            </p>
            <p>
              Mais le point capital, que beaucoup ratent, est le suivant : USDA 10a ne veut pas dire absence de gel sévère. Cela signifie seulement que la moyenne des minima extrêmes annuels se place dans cette tranche. Le record de -8,5 °C montre qu’en situation exceptionnelle, strasbourg peut sortir très nettement de la “douceur moyenne” de la zone 10a. Le système USDA lui-même rappelle d’ailleurs que les microclimats, le vent, l’humidité, la topographie, la durée du froid et l’exposition modifient fortement le risque réel.
            </p>
            <p>
              En langage horticole sérieux, je dirais donc ceci : strasbourg est 10a en moyenne climatologique, mais avec un risque ponctuel de comportement local de type 9b, voire plus froid dans les poches radiatives et lors des décrochages exceptionnels. C’est une nuance essentielle.
            </p>

            <h3 className="mt-6 mb-4"><strong>13. Le vrai diagnostic climatique :</strong></h3>
            <p>
              strasbourg présente un climat intérieur du Maroc oriental à dominante semi-aride fortement continentalisée, à nette sécheresse estivale, pluviométrie faible et irrégulière, très forte insolation, fortes chaleurs estivales, refroidissements nocturnes hivernaux marqués, épisodes de gel possibles, influence synoptique combinée des dorsales subtropicales, des talwegs atlantiques et méditerranéens, et modulation locale importante par le relief et le bassin de la Moulouya.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Records Historiques</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicateur</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Température Max</TableCell>
                  <TableCell className="text-red-500 font-bold">46.6°C</TableCell>
                  <TableCell>10 juillet 2023</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Température Min</TableCell>
                  <TableCell className="text-blue-500 font-bold">-8.5°C</TableCell>
                  <TableCell>8 janvier 1965</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Précipitations (24h)</TableCell>
                  <TableCell className="text-cyan-500 font-bold">85 mm</TableCell>
                  <TableCell>Novembre 2014</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ClimateClassificationTable />

      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Données Climatiques Détaillées (1940–2025)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-max border border-black">
              <TableHeader>
                <TableRow className="border-b border-black">
                  <TableHead className="bg-gray-100 dark:bg-gray-800 sticky left-0 z-10 border-r border-black">Mois</TableHead>
                  {months.map((m, i) => (
                    <TableHead key={i} className="bg-gray-100 dark:bg-gray-800 text-center min-w-[80px] border-r border-black last:border-r-0">
                      {m}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Record High */}
                <TableRow className="border-b border-black">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">Record haut °C (°F)</TableCell>
                  {climateData.recordHigh.map((v, i) => (
                    <TableCell key={i} className="text-center border-r border-black last:border-r-0" style={getTempStyle(v)}>
                      {v}° ({Math.round(v * 9/5 + 32)}°F)
                    </TableCell>
                  ))}
                </TableRow>
                {/* Mean Maximum */}
                <TableRow className="border-b border-black">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">Moyenne max °C (°F)</TableCell>
                  {climateData.meanMax.map((v, i) => (
                    <TableCell key={i} className="text-center border-r border-black last:border-r-0" style={getTempStyle(v)}>
                      {v}° ({Math.round(v * 9/5 + 32)}°F)
                    </TableCell>
                  ))}
                </TableRow>
                {/* Mean Daily Maximum */}
                <TableRow className="border-b border-black">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">Moyenne quotidienne max °C (°F)</TableCell>
                  {climateData.meanDailyMax.map((v, i) => (
                    <TableCell key={i} className="text-center border-r border-black last:border-r-0" style={getTempStyle(v)}>
                      {v}° ({Math.round(v * 9/5 + 32)}°F)
                    </TableCell>
                  ))}
                </TableRow>
                {/* Daily Mean */}
                <TableRow className="border-b border-black">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">Moyenne quotidienne °C (°F)</TableCell>
                  {climateData.dailyMean.map((v, i) => (
                    <TableCell key={i} className="text-center border-r border-black last:border-r-0" style={getTempStyle(v)}>
                      {v}° ({Math.round(v * 9/5 + 32)}°F)
                    </TableCell>
                  ))}
                </TableRow>
                {/* Mean Daily Minimum */}
                <TableRow className="border-b border-black">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">Moyenne quotidienne min °C (°F)</TableCell>
                  {climateData.meanDailyMin.map((v, i) => (
                    <TableCell key={i} className="text-center border-r border-black last:border-r-0" style={getTempStyle(v)}>
                      {v}° ({Math.round(v * 9/5 + 32)}°F)
                    </TableCell>
                  ))}
                </TableRow>
                {/* Mean Minimum */}
                <TableRow className="border-b border-black">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">Moyenne min °C (°F)</TableCell>
                  {climateData.meanMin.map((v, i) => (
                    <TableCell key={i} className="text-center border-r border-black last:border-r-0" style={getTempStyle(v)}>
                      {v}° ({Math.round(v * 9/5 + 32)}°F)
                    </TableCell>
                  ))}
                </TableRow>
                {/* Record Low */}
                <TableRow className="border-b border-black">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">Record bas °C (°F)</TableCell>
                  {climateData.recordLow.map((v, i) => (
                    <TableCell key={i} className="text-center border-r border-black last:border-r-0" style={getTempStyle(v)}>
                      {v}° ({Math.round(v * 9/5 + 32)}°F)
                    </TableCell>
                  ))}
                </TableRow>
                {/* Average Precipitation */}
                <TableRow className="border-b border-black">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">Précipitations moy. mm (pouces)</TableCell>
                  {climateData.avgPrecipitation.map((v, i) => {
                    // Pour la valeur annuelle, on utilise la moyenne mensuelle pour calculer la couleur
                    const valueForColor = i === 12 ? v / 12 : v;
                    return (
                      <TableCell key={i} className="text-center border-r border-black last:border-r-0" style={getPrecipitationStyle(valueForColor)}>
                        {v} ({(v / 25.4).toFixed(1)}")
                      </TableCell>
                    );
                  })}
                </TableRow>
                {/* Average Snowfall */}
                <TableRow className="border-b border-black">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">Chute de neige moy. cm (pouces)</TableCell>
                  {climateData.avgSnowfall.map((v, i) => (
                    <TableCell key={i} className="text-center border-r border-black last:border-r-0">
                      {v} ({(v / 2.54).toFixed(3)}")
                    </TableCell>
                  ))}
                </TableRow>
                {/* Average Precipitation Days */}
                <TableRow className="border-b border-black">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">Jours de précip. (≥ 1 mm)</TableCell>
                  {climateData.avgPrecipitationDays.map((v, i) => (
                    <TableCell key={i} className="text-center bg-indigo-100 border-r border-black last:border-r-0">
                      {v}
                    </TableCell>
                  ))}
                </TableRow>
                {/* Average Snowy Days */}
                <TableRow className="border-b border-black">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">Jours de neige</TableCell>
                  {climateData.avgSnowyDays.map((v, i) => (
                    <TableCell key={i} className="text-center bg-blue-100 border-r border-black last:border-r-0">
                      {v}
                    </TableCell>
                  ))}
                </TableRow>
                {/* Average Relative Humidity */}
                <TableRow className="border-b border-black">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">Humidité relative moy. (%)</TableCell>
                  {climateData.avgRelativeHumidity.map((v, i) => (
                    <TableCell key={i} className={`text-center border-r border-black last:border-r-0 ${getColorClass('humidity', v)}`}>
                      {v}
                    </TableCell>
                  ))}
                </TableRow>
                {/* Average Dew Point */}
                <TableRow className="border-b border-black">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">Point de rosée moy. °C (°F)</TableCell>
                  {climateData.avgDewPoint.map((v, i) => (
                    <TableCell key={i} className="text-center border-r border-black last:border-r-0" style={getTempStyle(v)}>
                      {v}° ({Math.round(v * 9/5 + 32)}°F)
                    </TableCell>
                  ))}
                </TableRow>
                {/* Mean Monthly Sunshine */}
                <TableRow className="border-b border-black">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">Ensoleillement moy. mensuel (h)</TableCell>
                  {climateData.meanMonthlySunshine.map((v, i) => (
                    <TableCell key={i} className={`text-center border-r border-black last:border-r-0 ${getColorClass('sunshine', v)}`}>
                      {v}
                    </TableCell>
                  ))}
                </TableRow>
                {/* Percentage Possible Sunshine */}
                <TableRow className="border-b border-black">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">% d'ensoleillement possible</TableCell>
                  {climateData.percentagePossibleSunshine.map((v, i) => (
                    <TableCell key={i} className={`text-center border-r border-black last:border-r-0 ${getColorClass('sunshine', v)}`}>
                      {v}%
                    </TableCell>
                  ))}
                </TableRow>
                {/* Average UV Index */}
                <TableRow className="border-b-0">
                  <TableCell className="bg-gray-50 dark:bg-gray-900 sticky left-0 z-10 font-semibold border-r border-black">Indice UV moyen</TableCell>
                  {climateData.avgUvIndex.map((v, i) => (
                    <TableCell key={i} className={`text-center border-r border-black last:border-r-0 ${getColorClass('uv', v)} font-bold`}>
                      {v}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="text-sm text-muted-foreground">
        <CardHeader>
          <CardTitle>Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Données climatiques basées sur les records historiques de 1940 à 2025, compilées à partir de diverses sources météorologiques internationales.</li>
            <li>Open-Meteo</li>
            <li>Visual Crossing</li>
            <li>Climate-Data.org</li>
          </ol>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link href="/archives">
          <Button size="lg">Explorer les données par année</Button>
        </Link>
      </div>
    </div>
  );
}

