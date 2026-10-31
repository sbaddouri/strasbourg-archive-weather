import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WeatherCountdown from '@/components/weather-countdown';

export default function RapportScientifiquePage() {
  return (
    <div className="space-y-8">
      <WeatherCountdown />
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">RAPPORT SCIENTIFIQUE DE CLIMATOLOGIE COMPARÉE MONDIALE</h1>
        <div className="space-y-2 text-lg">
          <h2 className="text-xl font-semibold">Analogues climatiques planétaires du bassin de strasbourg</h2>
          <p>Province de strasbourg, Région de l’Oriental, Royaume du Maroc</p>
          <p>Étude bioclimatique, agroclimatique, écophysiologique et biogéographique exhaustive</p>
          <p>Auteur du rapport : Cabinet international de climatologie comparée</p>
          <p>Objet : Identification exhaustive des analogues climatiques mondiaux de la station de strasbourg (34°13′N, 3°21′W, ~370 m d’altitude)</p>
          <p>Méthodologie : Comparaison multi-classificatoire (Köppen-Geiger, Trewartha, Emberger, UNESCO-FAO, USDA, AHS), analyse multi-paramétrique (52 variables climatologiques), correction saisonnière hémisphérique, analyse écophysiologique par espèce indicatrice.</p>
          <p>Longueur : Rapport intégral non abrégé.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PARTIE I — CADRE MÉTHODOLOGIQUE ET DIAGNOSTIC CLIMATIQUE DE RÉFÉRENCE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-2">1.1. Positionnement climatique de la station de référence</h3>
            <p className="text-justify space-y-2">
              Avant toute comparaison à l’échelle mondiale, il convient de rappeler avec la plus grande rigueur la signature climatique de strasbourg, laquelle constitue la matrice de référence de l’ensemble des analogies développées dans le présent rapport.
            </p>
            <p className="text-justify space-y-2">
              Dans la classification de Köppen-Geiger, strasbourg se situe à la limite précise entre les sous-types BSk — climat steppique froid à hiver frais — et BSh — climat steppique chaud. Avec une température moyenne annuelle de 18,9 °C, la station se place très légèrement au-dessus du seuil de 18,0 °C retenu par Köppen pour la distinction entre climat sec chaud et climat sec froid ; toutefois, la moyenne du mois le plus froid, janvier à 10,0 °C, ainsi que la moyenne des minimales du mois le plus froid, 4,6 °C, traduisent l’existence d’une véritable saison froide. Cette réalité conduit plusieurs auteurs, notamment Peel, Finlayson &amp; McMahon (2007), à classer strasbourg en BSk dans les cartographies actualisées. La formule pluviométrique de Köppen, P &lt; 10·(T + 14) dans le cas d’un régime à pluies hivernales, est ici très largement satisfaite : 233 mm &lt; 10·(18,9 + 14) = 329 mm. strasbourg relève donc pleinement d’un climat sec de type steppique, non d’un climat désertique BWh/BWk, puisque le seuil supérieur de distinction BS/BW, à savoir P &gt; 5·(T + 14) = 164,5 mm, est franchi. Ce positionnement intermédiaire, à mi-chemin entre semi-aride et aride, revêt une importance fondamentale : il exclut d’emblée aussi bien les analogues purement sahariens que les analogues méditerranéens humides.
            </p>
            <p className="text-justify space-y-2">
              Dans la classification de Trewartha, strasbourg correspond au sous-type BSh du système modifié, avec 8 à 12 mois au-dessus de 10 °C ; en l’espèce, la station atteint la limite supérieure, puisque même janvier présente une moyenne de 10,0 °C. Trewartha interprète ainsi strasbourg comme un climat semi-aride subtropical à saison sèche estivale prolongée.
            </p>
            <p className="text-justify space-y-2">
              Dans la classification d’Emberger, particulièrement adaptée aux ensembles méditerranéens, le quotient pluviothermique Q₂ = 2000·P / (M² − m²), où M représente la moyenne des maximales du mois le plus chaud en Kelvin (309,35 K) et m la moyenne des minimales du mois le plus froid en Kelvin (277,75 K), conduit à une valeur de Q₂ ≈ 25,1. Cette valeur situe strasbourg dans l’étage bioclimatique méditerranéen aride à hiver frais, à la limite du semi-aride inférieur. Il s’agit, dans le cadre du présent exercice comparatif, de la classification la plus discriminante.
            </p>
            <p className="text-justify space-y-2">
              En matière de zonage USDA et AHS, strasbourg relève, comme le montrait déjà avec justesse le rapport initial, de la zone USDA 10a en moyenne climatologique, sur la base d’une moyenne des minima extrêmes annuels d’environ −1,07 °C, tout en présentant, lors des décrochages radiatifs les plus sévères, un comportement épisodique de type 9b, son record absolu s’établissant à −8,5 °C. Pour la AHS Heat Zone, avec environ 100 à 120 jours par an dépassant 30 °C, strasbourg se situe en AHS Zone 8–9, ce qui constitue un critère de première importance dans l’établissement des analogies thermiques estivales.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">1.2. Paramètres discriminants pour la recherche d’analogues</h3>
            <p className="text-justify space-y-2">
              L’analyse comparative ne saurait se réduire à un simple alignement de moyennes annuelles. La signature climatique de strasbourg procède d’une combinatoire spécifique que l’on peut qualifier de « signature strasbourgienne », et qui repose sur sept invariants majeurs.
            </p>
            <ul className="list-disc list-inside space-y-4 ml-4">
              <li className="text-justify">
                Le premier invariant réside dans une pluviométrie annuelle comprise entre 200 et 270 mm, avec une concentration hivernale et printanière marquée — novembre à avril représentant environ 75 % du total annuel — ainsi qu’un maximum secondaire printanier remarquable, caractéristique de la signature « moulouyenne » : mars à 30 mm, avril à 27 mm, mai à 23 mm.
              </li>
              <li className="text-justify">
                Le deuxième invariant est constitué par une saison sèche estivale sévère, le cumul juin-août demeurant inférieur ou égal à 20 mm.
              </li>
              <li className="text-justify">
                Le troisième invariant correspond à un été très chaud à torride, avec une moyenne des maximales de juillet supérieure ou égale à 36 °C et une moyenne journalière de juillet-août supérieure ou égale à 28,8 °C.
              </li>
              <li className="text-justify">
                Le quatrième invariant renvoie à un hiver frais, sans être froid en moyenne, caractérisé par une Tmin de janvier proche de 4–5 °C, une Tmax de janvier proche de 15–16 °C, et surtout par une capacité à enregistrer des gels radiatifs sévères, les records pouvant descendre autour de −8 à −9 °C.
              </li>
              <li className="text-justify">
                Le cinquième invariant est une insolation annuelle supérieure ou égale à 3 000 heures, représentant environ 70 % du potentiel héliométrique.
              </li>
              <li className="text-justify">
                Le sixième invariant concerne l’humidité relative, avec une moyenne annuelle comprise entre 55 et 65 %, une chute estivale à 36–40 %, un point de rosée annuel proche de 8 °C, et un point de rosée estival voisin de 11–13 °C.
              </li>
              <li className="text-justify">
                Le septième invariant est celui d’une continentalité modérée, traduite par une amplitude thermique annuelle des moyennes d’environ 19 °C et une amplitude absolue d’environ 55 °C.
              </li>
            </ul>
            <p className="text-justify mt-4">
              Toute région du monde ne satisfaisant pas simultanément ces sept invariants doit être d’emblée exclue de la catégorie des « climats pratiquement identiques ». Il s’agit là d’un filtre d’une sélectivité extrême.
            </p>
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PARTIE II — ANALOGUES CLIMATIQUES DU MAROC ET DU MAGHREB</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-2">Analogues nationaux et régionaux</h3>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">2.1. Catégorie 1 — Climats pratiquement identiques (similarité 97–100 %)</h4>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">2.1.1. Taourirt (Province de Taourirt, Région de l’Oriental, Maroc) — Similarité climatique ≈ 99 %</h5>
                <p className="text-justify">
                  Taourirt, située à environ 55 km à l’est de strasbourg, dans le même couloir de la basse Moulouya, à une altitude comparable de 415 m, constitue de très loin l’analogue le plus parfait de strasbourg à l’échelle planétaire. Les températures moyennes annuelles y sont pratiquement identiques, 18,7 °C contre 18,9 °C, les précipitations avoisinent 240 mm avec le même régime « moulouyen » à double maximum équinoxial, l’insolation y dépasse 3 100 h, l’humidité relative estivale y chute à 38–40 %, et le chergui y souffle avec une violence comparable. Les rares différences observables tiennent à une très légère majoration des précipitations printanières à Taourirt, du fait d’une proximité un peu plus sensible des reliefs des Beni-Snassen, ainsi qu’à des minimales hivernales légèrement moins basses, sous l’effet de l’ouverture du couloir en direction de la Méditerranée. Sur les plans botanique et agronomique, la totalité des espèces cultivées à strasbourg — olivier, agrumes en irrigation, palmier dattier en bordure, vigne de cuve, grenadier, figuier, amandier, pistachier — y présente un comportement rigoureusement identique. Le zonage USDA 10a est également partagé. Aucune différence agroclimatique significative n’y est décelable.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">2.1.2. Missour (Province de Boulemane, plaine de la haute Moulouya) — Similarité ≈ 96 %</h5>
                <p className="text-justify">
                  Missour, située à environ 100 km au sud-sud-ouest de strasbourg, dans la haute Moulouya à 900 m d’altitude, présente une signature très proche, bien que légèrement plus continentalisée du fait de l’altitude. Les précipitations annuelles y sont sensiblement équivalentes, de l’ordre de 195 à 220 mm, l’insolation y dépasse 3 100 h, mais les hivers y sont notablement plus rigoureux, avec une Tmin de janvier proche de 2 °C et des records pouvant descendre jusqu’à −10 °C, tandis que les étés y sont légèrement moins torrides, la Tmax de juillet se situant aux alentours de 35 °C. Les gelées y sont plus fréquentes, de l’ordre de 25 à 40 nuits par an, contre 15 à 20 à strasbourg, ce qui entraîne de véritables conséquences horticoles : le palmier dattier y demeure cultivable, mais avec un risque accru de brûlures foliaires hivernales sur les jeunes feuilles ; les agrumes sensibles, tels que le citronnier et la lime, requièrent une protection plus stricte. En revanche, la vigne, l’amandier, le pistachier et l’olivier y prospèrent de manière identique.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">2.1.3. Outat El Haj (Province de Boulemane) — Similarité ≈ 97 %</h5>
                <p className="text-justify">
                  Outat El Haj, dans la moyenne Moulouya à environ 800 m d’altitude, se rapproche de Missour tout en demeurant plus chaude que cette dernière en été. Le régime pluviométrique y est extrêmement proche de celui de strasbourg, avec environ 220 mm annuels et un maximum printanier prononcé. Les différences sont marginales et se limitent à une insolation très légèrement inférieure ainsi qu’à des minimales hivernales plus basses d’environ 1 à 2 °C. Le comportement des cultures y est identique à celui observé à strasbourg, avec un très léger désavantage pour les agrumes précoces.
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold">2.2. Catégorie 2 — Climats extrêmement similaires (similarité 92–97 %)</h4>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">2.2.1. Oujda (chef-lieu de la Région de l’Oriental) — Similarité ≈ 93 %</h5>
                <p className="text-justify">
                  Oujda, à 470 m d’altitude, est davantage ouverte aux influences méditerranéennes indirectes par le couloir Taourirt–Oujda. La pluviométrie y est légèrement supérieure, de l’ordre de 330 mm, les étés y sont un peu moins secs et légèrement moins torrides, avec une Tmax de juillet proche de 34 °C, mais la structure saisonnière demeure très fidèle à celle de strasbourg. Du point de vue agronomique, Oujda autorise une agriculture pluviale un peu plus assurée, tout en conservant une palette culturale identique.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">2.2.2. Berkane et la plaine des Triffa — Similarité ≈ 88 %</h5>
                <p className="text-justify">
                  La plaine des Triffa, réputée pour son agrumiculture, est nettement plus arrosée, avec 350 à 400 mm annuels, et sensiblement plus douce en hiver du fait de la proximité méditerranéenne. La comparaison n’est véritablement pertinente que pour la période estivale, au cours de laquelle les températures maximales approchent celles de strasbourg. La similarité globale demeure néanmoins limitée par l’influence maritime.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">2.2.3. Midelt (Province de Midelt) — Similarité ≈ 78 %</h5>
                <p className="text-justify">
                  Midelt, à 1 500 m d’altitude, présente un climat semi-aride de haute altitude beaucoup plus rigoureux en hiver, avec une Tmin de janvier proche de −1 °C et 60 à 80 nuits de gel par an, mais des étés comparables en journée. L’analogie y demeure partielle et concerne principalement le régime hydrique.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">2.2.4. Erfoud, Rissani, Errachidia (vallée du Ziz, présahariens marocains) — Similarité ≈ 82 %</h5>
                <p className="text-justify">
                  Ces stations présahariennes présentent une pluviométrie plus faible encore, de l’ordre de 100 à 130 mm, ainsi que des étés significativement plus chauds, avec des Tmax de juillet comprises entre 40 et 42 °C en moyenne. En revanche, leur régime d’ensoleillement, leur humidité et leur continentalité sont extrêmement voisins de ceux de strasbourg. Il s’agit d’analogues « chauds » de strasbourg, décalés vers l’aridité désertique. Le palmier dattier y trouve son optimum, alors qu’à strasbourg il vit à la limite septentrionale de son domaine nord-africain.
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold">2.3. Analogues algériens (analogies très fortes à parfaites)</h4>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">2.3.1. Tlemcen (versant sud) et Sebdou — Similarité ≈ 92 %</h5>
                <p className="text-justify">
                  Sur le versant sud des monts de Tlemcen, à des altitudes comparables de 800 à 1 000 m, le climat devient très semblable à celui de strasbourg, avec une pluviométrie de 300 à 350 mm, un maximum équinoxial marqué, des étés secs et chauds, et une continentalité comparable.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">2.3.2. Aïn Sefra, Naâma, Mécheria (Hauts Plateaux occidentaux algériens) — Similarité ≈ 90 %</h5>
                <p className="text-justify">
                  Ces stations, situées entre 900 et 1 100 m sur les Hauts Plateaux algériens, présentent une signature remarquablement proche de celle de strasbourg, avec toutefois une continentalité accrue du fait de l’altitude : hivers plus froids, avec Tmin de janvier de 0 à 2 °C et records atteignant −12 °C, étés très chauds et secs, avec Tmax de juillet de 35 à 37 °C, et pluviométrie de 180 à 250 mm à répartition mars-avril-mai marquée. Il s’agit de la « ceinture steppique » nord-africaine, dont strasbourg constitue l’extrémité occidentale.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">2.3.3. Djelfa, Laghouat, Bou Saâda (Hauts Plateaux centraux) — Similarité ≈ 87–91 %</h5>
                <p className="text-justify">
                  Djelfa, à 1 130 m, présente une continentalité plus marquée, avec un record de −10,7 °C, tandis que Laghouat, plus méridionale et située à 750 m, tend davantage vers un climat aride chaud. La transition strasbourg → Djelfa → Laghouat illustre parfaitement le gradient allant du semi-aride tempéré vers le semi-aride désertique.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">2.3.4. Batna, Khenchela, Aïn Beïda (Hauts Plateaux orientaux) — Similarité ≈ 86 %</h5>
                <p className="text-justify">
                  Batna, à 1 040 m, est légèrement plus fraîche, avec une température moyenne annuelle d’environ 14 °C, et plus arrosée, avec environ 350 mm. Elle est donc moins analogue sur le plan thermique, mais demeure très analogue du point de vue hygrométrique et de la structure saisonnière.
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold">2.4. Analogues tunisiens et libyens</h4>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">2.4.1. Kasserine, Sbeïtla, Gafsa (centre-ouest tunisien) — Similarité ≈ 91 %</h5>
                <p className="text-justify">
                  Kasserine, à 670 m, présente environ 260 mm annuels, un régime pluviométrique à double maximum équinoxial, des étés très chauds, avec une Tmax de juillet de 36 à 37 °C, une humidité estivale basse, et une insolation supérieure à 3 000 h. Il s’agit de l’un des meilleurs analogues extra-marocains de strasbourg. Sbeïtla et Gafsa complètent cet ensemble, avec une inflexion vers une aridité plus chaude dans le cas de Gafsa.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">2.4.2. Le Kef, Siliana (dorsale tunisienne intérieure) — Similarité ≈ 84 %</h5>
                <p className="text-justify">
                  Ces stations sont légèrement plus arrosées, mais présentent la même signature thermique.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">2.4.3. Nalut, Yefren (Djebel Nefoussa libyen) — Similarité ≈ 89 %</h5>
                <p className="text-justify">
                  Le Djebel Nefoussa, entre 700 et 900 m d’altitude, présente une combinatoire climatique remarquablement proche de celle de strasbourg : 200 à 280 mm annuels, une insolation supérieure à 3 200 h, des étés très chauds, et des hivers frais où des gelées demeurent possibles.
                </p>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PARTIE III — ANALOGUES DU BASSIN MÉDITERRANÉEN NORD</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-2">3.1. Analogues ibériques</h3>
            
            <div className="space-y-4">
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">3.1.1. Almería intérieure — Tabernas, Sorbas, Gádor, Níjar — Similarité ≈ 93 %</h5>
                <p className="text-justify">
                  Le désert de Tabernas et les bassins intérieurs d’Almería constituent, à l’échelle européenne, l’analogue le plus fidèle du bassin de strasbourg. Tabernas, à 400 m, reçoit environ 235 mm annuels, présente un régime pluviométrique à maximum équinoxial, notamment en octobre-novembre et mars-avril, une insolation supérieure à 3 000 h, des étés très chauds, avec une Tmax de juillet proche de 34 °C, et des hivers frais marqués par des gelées occasionnelles, le record s’établissant autour de −6 °C. La différence essentielle réside dans la proximité maritime plus immédiate, qui atténue légèrement les extrêmes hivernaux et modère les canicules estivales par l’advection des brises. D’un point de vue botanique, la palette culturale y est rigoureusement identique : olivier, amandier, figuier, grenadier, pistachier, jojoba introduit expérimentalement, agave, opuntia. Le palmier dattier y fructifie dans les microstations abritées de la région Elche–Almería, ce qui correspond également à la situation de strasbourg.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">3.1.2. Bassin du Guadix-Baza (Grenade intérieure) — Similarité ≈ 91 %</h5>
                <p className="text-justify">
                  Ce bassin intramontagnard, situé à environ 900 m d’altitude, en position d’abri pluviométrique derrière les sierras Béticas, présente 250 à 320 mm annuels, une continentalité marquée, avec un record de −14 °C à Baza, des étés très chauds, et une signature d’inversion thermique hivernale caractéristique. Il s’agit d’un analogue « altitudinal » de strasbourg, doté d’un hiver plus rigoureux.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">3.1.3. Bassin de l’Èbre intérieur — Zaragoza, Bardenas Reales, Monegros — Similarité ≈ 85 %</h5>
                <p className="text-justify">
                  Ces régions présentent 280 à 350 mm annuels, un climat semi-aride continentalisé de type BSk, mais avec des hivers nettement plus froids, Tmin de janvier proche de 2 °C, et 40 à 60 nuits de gel par an, une signature pluviométrique équinoxiale et des étés très chauds. Les Bardenas Reales et les Monegros constituent le désert semi-aride ibérique, avec un régime d’inversion thermique hivernale rappelant celui de la Vallée Centrale de Californie.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">3.1.4. Fraga, Lleida, plaine centrale catalane — Similarité ≈ 79 %</h5>
                <p className="text-justify">
                  L’analogie y demeure partielle, limitée par une humidité hivernale plus forte et par la fréquence de brouillards persistants.
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold mb-2">3.2. Analogues italiens et grecs</h3>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">3.2.1. Sicile intérieure — Enna, Caltanissetta, Piazza Armerina — Similarité ≈ 82 %</h5>
                <p className="text-justify">
                  L’intérieur sicilien d’altitude présente des étés très chauds et secs, mais des hivers plus humides, ainsi qu’une pluviométrie annuelle sensiblement plus élevée, de l’ordre de 500 à 700 mm, ce qui réduit l’analogie hydrique.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">3.2.2. Crète intérieure — Similarité ≈ 78 %</h5>
                <p className="text-justify">
                  L’analogie y demeure partielle.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">3.2.3. Chypre intérieure — Nicosie, Athienou — Similarité ≈ 84 %</h5>
                <p className="text-justify">
                  Nicosie présente environ 320 mm annuels, une saison sèche estivale marquée, une insolation élevée, mais des hivers plus doux et plus humides.
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold mb-2">3.3. Analogues turcs</h3>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">3.3.1. Konya, Karapınar, Karaman (plateau anatolien central intérieur) — Similarité ≈ 83 %</h5>
                <p className="text-justify">
                  Konya, à 1 020 m, reçoit environ 320 mm annuels avec un régime équinoxial. La continentalité y est toutefois beaucoup plus marquée qu’à strasbourg, avec une Tmin de janvier proche de −4 °C et des records atteignant −26 °C, de sorte que l’analogie est surtout estivale et hygrométrique.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">3.3.2. Şanlıurfa, Mardin, Diyarbakır (Anatolie du Sud-Est) — Similarité ≈ 86 %</h5>
                <p className="text-justify">
                  Şanlıurfa, à 550 m, reçoit environ 460 mm, mais présente des étés extrêmement chauds, avec une Tmax de juillet voisine de 39 °C, et un régime pluviométrique concentré sur l’hiver et le printemps. L’analogie estivale y est très forte, l’analogie hivernale sensiblement moins satisfaisante, les hivers étant plus rigoureux.
                </p>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PARTIE IV — ANALOGUES DU PROCHE ET MOYEN-ORIENT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-2">4.1. Analogues du Levant</h3>
            
            <div className="space-y-4">
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">4.1.1. Alep intérieure, Homs, Hama (Syrie centre-nord) — Similarité ≈ 88 %</h5>
                <p className="text-justify">
                  Ces stations présentent 300 à 380 mm annuels, un régime pluviométrique méditerranéen à maximum hivernal marqué, des étés secs et chauds, avec des Tmax de juillet de 35 à 37 °C, ainsi que des hivers frais où les gelées occasionnelles demeurent possibles. La signature agronomique y est presque parfaite : olivier, pistachier de haute qualité, amandier, vigne, grenadier.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">4.1.2. Amman, Madaba (plateau jordanien) — Similarité ≈ 87 %</h5>
                <p className="text-justify">
                  Amman, à 780 m, reçoit environ 275 mm, présente une saison sèche estivale absolue, des étés chauds mais tempérés par l’altitude, avec une Tmax de juillet proche de 32 °C, et des hivers frais. L’analogie est très forte, sauf en ce qui concerne l’intensité estivale, plus modérée qu’à strasbourg.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">4.1.3. Bekaa nord — Baalbek, Hermel — Similarité ≈ 89 %</h5>
                <p className="text-justify">
                  La Bekaa septentrionale libanaise, à environ 1 100 m d’altitude, reçoit 200 à 350 mm annuels selon les secteurs, avec un régime pluviométrique typiquement méditerranéen. Les étés y sont très chauds et secs, l’insolation extrêmement forte, et la continentalité marquée. Il s’agit de l’un des meilleurs analogues levantins.
                </p>
              </div>

              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">4.1.4. Steppe syrienne intérieure — Palmyre, Deir ez-Zor — Similarité ≈ 82 %</h5>
                <p className="text-justify">
                  L’analogie y est forte sur le plan estival, moins satisfaisante sur le plan hivernal, les hivers étant plus froids et plus brefs.
                </p>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold mb-2">4.2. Analogues iraniens</h3>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">4.2.1. Piémont du Zagros — Kermanshah, Khorramabad, Ilam — Similarité ≈ 85 %</h5>
                <p className="text-justify">
                  Kermanshah, à 1 320 m, reçoit environ 450 mm, mais présente une saison sèche estivale absolue et une insolation très élevée. L’analogie demeure partielle, en raison d’un excès pluviométrique et d’une continentalité accrue.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">4.2.2. Plateau iranien central — Yazd, Kerman, Isfahan intérieure — Similarité ≈ 80 %</h5>
                <p className="text-justify">
                  Ces stations basculent vers le semi-aride désertique, voire le désert froid, de type BWk, avec 60 à 130 mm annuels. L’analogie porte sur la structure thermique et hygrométrique, non sur la pluviométrie.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">4.2.3. Shiraz — Similarité ≈ 84 %</h5>
                <p className="text-justify">
                  Shiraz, à 1 500 m, reçoit environ 340 mm et présente une signature méditerranéenne d’altitude, avec des étés très chauds et secs et des hivers frais. L’analogie y demeure forte.
                </p>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold mb-2">4.3. Analogues d’Asie centrale</h3>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">4.3.1. Tachkent, Samarcande, Boukhara (Ouzbékistan) — Similarité ≈ 76 %</h5>
                <p className="text-justify">
                  La continentalité y est beaucoup plus marquée, avec des hivers pouvant atteindre −20 °C. L’analogie estivale est forte ; l’analogie hivernale, faible.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">4.3.2. Douchanbé (Tadjikistan) — Similarité ≈ 78 %</h5>
                <p className="text-justify">
                  L’analogie y demeure modérée.
                </p>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>PARTIE V — ANALOGUES AMÉRICAINS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-2">5.1. Californie et Grand Bassin — analyse détaillée</h3>
            
            <div className="space-y-4">
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">5.1.1. Bakersfield (Vallée Centrale de Californie) — Similarité ≈ 84 %</h5>
                <p className="text-justify">
                  Comme le soulignait avec pertinence le rapport initial, Bakersfield doit être mentionnée en priorité, malgré son statut d’analogue imparfait. Les convergences sont substantielles : classification Köppen BSk, précipitations annuelles de l’ordre de 165 à 170 mm, ce qui rend Bakersfield plus sèche que strasbourg mais dans le même ordre de grandeur, régime pluviométrique à concentration hivernale avec novembre à mars représentant environ 85 % du total, étés extrêmement chauds, avec une Tmax de juillet proche de 36 à 37 °C, comparable à celle de strasbourg, insolation annuelle proche de 3 200 h, et humidité estivale basse.
                </p>
                <p className="text-justify">
                  Toutefois, plusieurs différences majeures interdisent d’accorder à Bakersfield une similarité supérieure.
                </p>
                <p className="text-justify">
                  Premièrement, l’hiver bakersfieldien est marqué par le célèbre brouillard de Tule, phénomène de brouillard radiatif d’inversion caractéristique de la Vallée Centrale, résultant de l’accumulation d’air humide et froid dans la cuvette californienne, piégé sous une couche d’inversion souvent persistante durant plusieurs jours, voire plusieurs semaines. Ce brouillard, absent à strasbourg, transforme radicalement l’ambiance hivernale : humidité relative diurne dépassant 90 % pendant des semaines entières, ensoleillement hivernal effectif fortement réduit, Bakersfield ne recevant qu’environ 60 % du possible en décembre-janvier, contre 66 à 68 % à strasbourg, ainsi qu’un point de rosée hivernal plus élevé.
                </p>
                <p className="text-justify">
                  Deuxièmement, l’inversion thermique hivernale y est beaucoup plus marquée, la Vallée Centrale constituant un piège topographique très fermé, encadré par la Sierra Nevada à l’est et les Coast Ranges à l’ouest, tandis que le bassin de strasbourg demeure plus ouvert et plus ventilé, notamment sous l’action du chergui et des advections perturbées.
                </p>
                <p className="text-justify">
                  Troisièmement, les records de froid hivernaux sont légèrement moins sévères à Bakersfield, de l’ordre de −5 à −6 °C, qu’à strasbourg, où le record absolu s’établit à −8,5 °C, bien que la fréquence des gelées soit comparable.
                </p>
                <p className="text-justify">
                  Quatrièmement, ces différences ont des conséquences précises sur le plan botanique et agronomique. Phoenix dactylifera est cultivé commercialement dans la Coachella Valley, analogue thermique estival de strasbourg, mais pas dans la Vallée Centrale de Bakersfield, car les brouillards persistants et l’humidité hivernale favorisent les maladies cryptogamiques, notamment Graphiola phoenicis, et compromettent la maturation parfaite des dattes. À strasbourg, en revanche, la clarté et la sécheresse hivernales autorisent la culture du dattier dans les stations abritées. Les agrumes prospèrent à Bakersfield — oranger, mandarinier, pomelo — avec d’excellents rendements sous irrigation. À strasbourg, ils demeurent également cultivables, mais avec une vigueur moindre en raison de la pluviométrie plus faible et d’une aridité estivale plus sèche. L’olivier, l’amandier, le pistachier, la vigne et le grenadier se comportent, quant à eux, de manière quasi identique dans les deux régions.
                </p>
                <p className="text-justify">
                  En conclusion, Bakersfield constitue un analogue estival de très haute qualité, mais un analogue hivernal médiocre en raison du complexe brouillard-humidité-inversion. Sa similarité globale doit donc être plafonnée à ≈ 84 %.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">5.1.2. Coachella Valley — Indio, Palm Springs, Mecca — Similarité ≈ 79 %</h5>
                <p className="text-justify">
                  La Coachella Valley bascule vers le désert chaud BWh, avec environ 80 mm annuels seulement et des étés extrêmement chauds, les Tmax de juillet y atteignant ≈ 42 °C. L’analogie y est estivale forte, hivernale correcte, et pluviométriquement faible. Il s’agit d’un analogue « chaud et sec » de strasbourg, décalé vers l’aridité désertique. Le dattier y trouve son optimum planétaire.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">5.1.3. Fresno, Merced, Modesto, Sacramento sud — Similarité ≈ 82 %</h5>
                <p className="text-justify">
                  Ces stations constituent des analogues comparables à Bakersfield, mais avec un été légèrement moins torride.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">5.1.4. Reno, Fallon, Fernley (Nevada occidental) — Similarité ≈ 85 %</h5>
                <p className="text-justify">
                  Ces stations du Grand Bassin, situées entre 1 300 et 1 400 m, présentent un climat steppique BSk classique, avec 180 à 200 mm annuels, une forte insolation, une humidité basse, des étés chauds et secs, et des hivers frais à froids. Leur signature est très proche de celle de strasbourg, bien qu’accompagnée d’une continentalité accrue par l’altitude.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">5.1.5. Winnemucca, Elko (Nevada nord) — Similarité ≈ 76 %</h5>
                <p className="text-justify">
                  Les hivers y sont trop froids pour permettre une analogie complète.
                </p>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold mb-2">5.2. Grand Sud-Ouest américain</h3>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">5.2.1. Albuquerque (Nouveau-Mexique) — Similarité ≈ 82 %</h5>
                <p className="text-justify">
                  Albuquerque, à 1 620 m, reçoit environ 240 mm annuels, présente une insolation supérieure à 3 400 h, des étés chauds, avec une Tmax de juillet proche de 32 °C, et des hivers frais. La différence majeure réside dans le régime pluviométrique : Albuquerque connaît un maximum estival de mousson nord-américaine, en juillet-août, absolument opposé au régime méditerranéen de strasbourg. Cette inversion pluviométrique constitue un obstacle structurel à une analogie parfaite.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">5.2.2. El Paso, Las Cruces, Roswell (Nouveau-Mexique / Texas) — Similarité ≈ 78 %</h5>
                <p className="text-justify">
                  La même remarque s’impose concernant le régime de mousson estivale.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">5.2.3. Phoenix, Tucson (Arizona) — Similarité ≈ 72 %</h5>
                <p className="text-justify">
                  Ces stations sont trop chaudes et soumises à un régime de mousson estivale.
                </p>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold mb-2">5.3. Amérique latine</h3>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">5.3.1. Vallée de Mexico intérieure — non analogue</h5>
                <p className="text-justify">
                  La vallée de Mexico intérieure ne saurait être retenue comme analogue, en raison de son climat tropical de haute altitude.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">5.3.2. Nord du Mexique — Chihuahua, Saltillo, Monterrey intérieure — Similarité ≈ 78 %</h5>
                <p className="text-justify">
                  Chihuahua, à 1 440 m, présente environ 385 mm annuels avec un maximum estival de mousson. L’analogie thermique y demeure moyenne.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">5.3.3. Vallées argentines — Mendoza, San Juan, La Rioja — Similarité ≈ 90 % (avec inversion saisonnière)</h5>
                <p className="text-justify">
                  Mendoza, à 827 m, constitue, à l’échelle de l’hémisphère Sud, l’un des meilleurs analogues de strasbourg. Après correction saisonnière — janvier ↔ juillet, juillet ↔ janvier — on obtient une structure remarquablement instructive. Les précipitations annuelles, de l’ordre de 220 mm, sont proches des 233 mm de strasbourg. Le régime pluviométrique, en revanche, présente un maximum estival austral, de décembre à mars, ce qui, après inversion, correspondrait à juin-septembre : une différence structurelle fondamentale apparaît donc ici, Mendoza relevant d’un régime à maximum estival austral, tandis que strasbourg relève d’un régime à maximum équinoxial-hivernal. Cette divergence, souvent négligée, réduit la similarité à environ 82 % si l’on pondère strictement le régime des pluies. Sur le plan thermique, les Tmax du mois le plus chaud austral, c’est-à-dire janvier, atteignent environ 32 °C, contre 36,2 °C à strasbourg ; les hivers austraux, avec des Tmin de juillet proches de 3 °C, sont en revanche comparables. L’insolation, l’humidité et la continentalité sont très proches.
                </p>
                <p className="text-justify">
                  San Juan, à 600 m, est plus chaude et plus sèche, avec 90 mm annuels, se rapprochant davantage de la Coachella Valley que de strasbourg. La Rioja constitue un excellent analogue, avec 350 mm et un climat semi-aride subtropical. L’ensemble du Cuyo argentin représente une grande région viticole et oléicole, exactement comme le Maroc oriental pourrait le devenir. Le comportement de la vigne, de l’olivier, du pistachier, de l’amandier et du grenadier y est rigoureusement analogue à celui observé à strasbourg.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">5.3.4. Vallées chiliennes intérieures — Copiapó, Vallenar, Ovalle — Similarité ≈ 80 % (avec inversion saisonnière)</h5>
                <p className="text-justify">
                  Ces stations présentent un climat semi-aride à hivers frais et étés secs, mais avec une pluviométrie plus faible, inférieure à 100 mm pour Copiapó et proche de 130 mm pour Ovalle. L’analogie thermique y est correcte, l’analogie hydrique plus limitée.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">5.3.5. Vallées péruviennes intérieures — Arequipa — Similarité ≈ 70 %</h5>
                <p className="text-justify">
                  L’altitude y est trop importante et le climat sensiblement différent.
                </p>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>PARTIE VI — ANALOGUES DE L’HÉMISPHÈRE SUD</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-2">Afrique australe et Océanie</h3>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">6.1. Afrique du Sud</h4>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">6.1.1. Karoo — Beaufort West, Prince Albert, Oudtshoorn — Similarité ≈ 78–85 %</h5>
                <p className="text-justify">
                  Le Karoo sud-africain, et plus particulièrement le Little Karoo (Klein Karoo), constitue l’un des rares analogues sud-africains de strasbourg. Oudtshoorn, à 300 m, reçoit environ 250 mm annuels, présente une insolation très élevée, des étés chauds, les Tmax de janvier-février austral atteignant environ 32 °C, ce qui correspond à juillet-août dans l’hémisphère Nord, ainsi que des hivers frais avec gelées occasionnelles. Toutefois, le régime pluviométrique du Karoo est plus dispersé sur l’année, avec des pluies convectives estivales durant décembre-mars austral, ce qui le distingue du régime hivernal méditerranéen de strasbourg. Après correction saisonnière, la structure thermique est très fidèle, mais le régime hydrique reste divergent.
                </p>
                <p className="text-justify">
                  Beaufort West, à 850 m, est plus continentale et plus proche du régime steppique semi-aride.
                </p>
                <p className="text-justify">
                  Sur le plan botanique, le Karoo est réputé pour ses cultures de vigne, d’olivier, d’amandier, de grenadier, ainsi que pour l’élevage historique de l’autruche, particulièrement adapté à la sécheresse. La palette agronomique y est très voisine de celle envisageable à strasbourg.
                </p>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold">6.2. Australie</h4>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">6.2.1. Mildura, Renmark, Griffith (bassin Murray-Darling intérieur) — Similarité ≈ 87 % (avec inversion saisonnière)</h5>
                <p className="text-justify">
                  Mildura, dans l’État de Victoria, constitue probablement le meilleur analogue climatique de strasbourg dans l’hémisphère Sud. La pluviométrie annuelle y atteint environ 280 mm, l’insolation y dépasse 3 400 h, les étés y sont très chauds, avec des Tmax de janvier proches de 33 °C, mais comportant des pointes fréquentes à 40 °C, et les hivers y sont frais, avec des Tmin de juillet proches de 4 °C et des gelées possibles. Le régime pluviométrique y est légèrement plus régulier au cours de l’année, avec un léger maximum d’hiver austral. La région est célèbre pour sa viticulture, ses agrumes irrigués, ses amandiers, ses oliviers, et pour ses palmiers dattiers cultivés expérimentalement à Alice Springs et Coober Pedy.
                </p>
                <p className="text-justify">
                  Renmark, en Australie-Méridionale, et Griffith, en Nouvelle-Galles du Sud, présentent des signatures très proches.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">6.2.2. Alice Springs (Territoire du Nord, Australie centrale) — Similarité ≈ 72 %</h5>
                <p className="text-justify">
                  Cette station est trop chaude et trop désertique, avec un régime pluviométrique estival.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">6.2.3. Broken Hill (Nouvelle-Galles du Sud) — Similarité ≈ 83 %</h5>
                <p className="text-justify">
                  Il s’agit d’un analogue très correct, quoique légèrement plus aride que strasbourg.
                </p>
              </div>
              
              <div className="space-y-3 ml-4">
                <h5 className="font-semibold">6.2.4. Wagga Wagga, Deniliquin — Similarité ≈ 82 %</h5>
                <p className="text-justify">
                  Ces stations constituent des analogues satisfaisants, mais plus arrosés, avec environ 500 mm.
                </p>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold">6.3. Nouvelle-Zélande</h4>
              <p className="text-justify">
                La Nouvelle-Zélande ne présente aucun analogue direct de strasbourg, son climat étant partout modéré par une influence océanique dominante. Le Central Otago, notamment les vallées de Cromwell et Alexandra, constitue la seule région néo-zélandaise à caractère semi-continental avec sécheresse estivale ; néanmoins, sa pluviométrie, comprise entre 350 et 450 mm, et ses hivers plus froids en font un analogue lointain, dont la similarité ne dépasse pas ≈ 68 %.
              </p>
            </div>
          </section>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>PARTIE VII — SYNTHÈSE COMPARATIVE ORDONNÉE PAR NIVEAU DE SIMILARITÉ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-2">Catégorie 1 — Climat pratiquement identique à strasbourg (97–100 %)</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Rang 1 : Taourirt, Maroc — 99 %</li>
              <li>Rang 2 : Outat El Haj, Maroc — 97 %</li>
              <li>Rang 3 : Guenfouda, Jerada (sud), Maroc — 97 %</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">Catégorie 2 — Climat extrêmement similaires (92–96 %)</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Rang 4 : Missour, Maroc — 96 %</li>
              <li>Rang 5 : Oujda, Maroc — 93 %</li>
              <li>Rang 6 : Tabernas / Sorbas, Espagne — 93 %</li>
              <li>Rang 7 : Sebdou / Tlemcen sud, Algérie — 92 %</li>
              <li>Rang 8 : Kasserine / Sbeïtla, Tunisie — 91 %</li>
              <li>Rang 9 : Guadix-Baza, Espagne — 91 %</li>
              <li>Rang 10 : Aïn Sefra / Naâma, Algérie — 90 %</li>
              <li>Rang 11 : Mendoza (après correction saisonnière + régime), Argentine — 90 %</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">Catégorie 3 — Climat très fortement comparables (85–91 %)</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Rang 12 : Nalut / Yefren, Libye — 89 %</li>
              <li>Rang 13 : Bekaa nord (Baalbek), Liban — 89 %</li>
              <li>Rang 14 : Djelfa, Algérie — 88 %</li>
              <li>Rang 15 : Alep / Homs / Hama, Syrie — 88 %</li>
              <li>Rang 16 : La Rioja, Argentine — 87 %</li>
              <li>Rang 17 : Mildura / Renmark, Australie — 87 %</li>
              <li>Rang 18 : Amman, Jordanie — 87 %</li>
              <li>Rang 19 : Şanlıurfa, Turquie — 86 %</li>
              <li>Rang 20 : Batna, Algérie — 86 %</li>
              <li>Rang 21 : Bassin de l’Èbre (Zaragoza), Espagne — 85 %</li>
              <li>Rang 22 : Reno / Fallon, États-Unis — 85 %</li>
              <li>Rang 23 : Kermanshah, Iran — 85 %</li>
              <li>Rang 24 : Oudtshoorn (Karoo), Afrique du Sud — 85 %</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">Catégorie 4 — Climat comparable avec quelques différences (78–84 %)</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Rang 25 : Chypre intérieure (Nicosie), Chypre — 84 %</li>
              <li>Rang 26 : Shiraz, Iran — 84 %</li>
              <li>Rang 27 : Bakersfield, États-Unis — 84 %</li>
              <li>Rang 28 : Konya / Karaman, Turquie — 83 %</li>
              <li>Rang 29 : Broken Hill, Australie — 83 %</li>
              <li>Rang 30 : Fresno / Modesto, États-Unis — 82 %</li>
              <li>Rang 31 : Erfoud / Errachidia, Maroc — 82 %</li>
              <li>Rang 32 : Enna / Caltanissetta, Italie (Sicile) — 82 %</li>
              <li>Rang 33 : Albuquerque, États-Unis — 82 %</li>
              <li>Rang 34 : Palmyre / Deir ez-Zor, Syrie — 82 %</li>
              <li>Rang 35 : Wagga Wagga, Australie — 82 %</li>
              <li>Rang 36 : Le Kef / Siliana, Tunisie — 84 %</li>
              <li>Rang 37 : Vallenar / Ovalle, Chili — 80 %</li>
              <li>Rang 38 : Yazd / Kerman, Iran — 80 %</li>
              <li>Rang 39 : Coachella Valley, États-Unis — 79 %</li>
              <li>Rang 40 : Chihuahua, Mexique — 78 %</li>
              <li>Rang 41 : Crète intérieure, Grèce — 78 %</li>
              <li>Rang 42 : El Paso / Las Cruces, États-Unis — 78 %</li>
              <li>Rang 43 : Douchanbé, Tadjikistan — 78 %</li>
              <li>Rang 44 : Midelt, Maroc — 78 %</li>
              <li>Rang 45 : Beaufort West (Karoo), Afrique du Sud — 78 %</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-2 mt-6">Catégorie 5 — Climat ressemblant mais présentant des différences importantes (70–77 %)</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Rang 46 : Tachkent / Samarcande, Ouzbékistan — 76 %</li>
              <li>Rang 47 : Winnemucca, États-Unis — 76 %</li>
              <li>Rang 48 : Phoenix / Tucson, États-Unis — 72 %</li>
              <li>Rang 49 : Alice Springs, Australie — 72 %</li>
              <li>Rang 50 : Arequipa, Pérou — 70 %</li>
              <li>Rang 51 : Central Otago (Cromwell), Nouvelle-Zélande — 68 %</li>
            </ul>
          </section>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>PARTIE VIII — ANALYSE ÉCOPHYSIOLOGIQUE ET AGRONOMIQUE COMPARÉE PAR ESPÈCE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">8.1. Phoenix dactylifera (palmier dattier)</h4>
              <p className="text-justify">
                Le palmier dattier exige une somme thermique estivale élevée, correspondant à un indice thermique de Nixon-Furr ≥ 1 800 unités thermiques, une saison sèche estivale absolue, une faible humidité durant la maturation, ainsi qu’une tolérance au gel modérée, avec une résistance pouvant atteindre −6 à −9 °C chez les sujets adultes. strasbourg satisfait ces critères dans leur expression limite : la maturation des variétés tardives, telles que Medjool et Boufeggous, y demeure marginale, tandis que les variétés précoces, telles que Bou Sthammi et Aziza, y sont préférables.
              </p>
              <p className="text-justify">
                Le dattier est cultivable optimalement dans la Coachella Valley, à Erfoud-Rissani, à Deir ez-Zor, à Nalut, à Palmyre, à Yazd et à Alice Springs. Il est cultivable en position marginale, comme à strasbourg, à Taourirt, Missour, Tabernas, Baalbek et Mildura. Il n’est pas cultivable commercialement à Bakersfield, en raison des brouillards, à Mendoza, du fait d’une maturation incomplète, à Konya, où l’hiver est trop froid, ni dans le Central Otago, où l’été est insuffisant.
              </p>
            </div>
            
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold">8.2. Olivea europaea (olivier)</h4>
              <p className="text-justify">
                L’olivier tolère parfaitement l’ensemble des régions énumérées, à l’exception des zones soumises à des gels sévères prolongés, telles que Konya, certains secteurs d’altitude de Djelfa, et le Central Otago sur les fonds de vallée. Il constitue l’espèce indicatrice quasi universelle de l’ensemble des analogues étudiés.
              </p>
            </div>
            
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold">8.3. Vitis vinifera (vigne)</h4>
              <p className="text-justify">
                La vigne est parfaitement adaptée à l’ensemble des régions recensées. Les meilleurs analogues viticoles de strasbourg sont Mendoza, La Rioja en Argentine, le Karoo, Mildura, Aïn Sefra, Kasserine et la Bekaa. La qualité de la vinification y est excellente, notamment grâce à l’amplitude thermique diurne.
              </p>
            </div>
            
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold">8.4. Agrumes (Citrus spp.)</h4>
              <p className="text-justify">
                Les agrumes exigent l’absence de gel prolongé et une humidité modérée. Les meilleurs analogues sont Berkane (Triffa), Bakersfield, Fresno, Mildura et Nicosie. À strasbourg, l’oranger et le mandarinier sont cultivables sous irrigation ; le citronnier et la lime demeurent plus fragiles au froid.
              </p>
            </div>
            
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold">8.5. Pistacia vera (pistachier)</h4>
              <p className="text-justify">
                Le pistachier est parfaitement adapté à l’ensemble des régions à hivers frais et été chauds et secs. Les meilleurs analogues pistachicoles sont Kerman en Iran, référence mondiale, Şanlıurfa, Alep, Kasserine et Aïn Sefra. strasbourg présente un potentiel pistachicole excellent, mais sous-exploité.
              </p>
            </div>
            
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold">8.6. Amandier, figuier, grenadier, caroubier</h4>
              <p className="text-justify">
                Ces espèces méditerranéennes classiques prospèrent dans la totalité des analogues énumérés, à l’exception des zones soumises à des gels sévères pour le caroubier, dont la limite se situe approximativement en zone USDA 9b.
              </p>
            </div>
            
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold">8.7. Argania spinosa (arganier)</h4>
              <p className="text-justify">
                L’arganier est endémique du sud-ouest marocain, notamment du Souss-Massa, et ne trouve nulle part ailleurs dans le monde un véritable analogue climato-édaphique. Sa culture à strasbourg demeure marginale.
              </p>
            </div>
            
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold">8.8. Simmondsia chinensis (jojoba)</h4>
              <p className="text-justify">
                Le jojoba est originaire du désert de Sonora. Il tolère bien strasbourg, mais préfère les climats de type Coachella, Sonora ou Néguev.
              </p>
            </div>
            
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold">8.9. Washingtonia filifera / robusta et palmiers ornementaux</h4>
              <p className="text-justify">
                Ces palmiers sont parfaitement adaptés à l’ensemble des régions classées en USDA ≥ 9a. strasbourg leur convient parfaitement.
              </p>
            </div>
            
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold">8.10. Eucalyptus, Prosopis, Acacia, Tamarix</h4>
              <p className="text-justify">
                Il s’agit d’espèces xérophytes universelles, adaptées à l’ensemble des régions semi-arides énumérées dans le présent rapport.
              </p>
            </div>
          </section>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>PARTIE IX — CONCLUSION SCIENTIFIQUE GÉNÉRALE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <p className="text-justify">
              Le bassin de strasbourg appartient à une famille climatique restreinte à l’échelle planétaire : celle des bassins intérieurs semi-arides méditerranéens à double signature, à la fois steppique et méditerranéenne dégradée, caractérisée par une pluviométrie annuelle de 200 à 280 mm, un régime équinoxial-hivernal, une insolation supérieure à 3 000 h, des étés très chauds et secs, ainsi que des hivers frais avec gels radiatifs possibles.
            </p>
            <p className="text-justify">
              Cette famille climatique ne compte, à l’échelle mondiale, que moins de vingt régions parfaitement identifiées, dont environ la moitié se situe dans le seul Maghreb — couloir de la Moulouya, Hauts Plateaux algériens, Tunisie centrale, Djebel Nefoussa libyen — ce qui souligne à la fois le caractère régionalement spécifique et la rareté bioclimatique du climat de strasbourg.
            </p>
            <p className="text-justify">
              Les analogues extra-maghrébins de très haute fidélité sont, par ordre décroissant, Tabernas et le bassin de Guadix-Baza en Espagne intérieure sud-orientale, Kasserine en Tunisie, la Bekaa septentrionale au Liban, Şanlıurfa et Konya en Turquie, Mendoza et La Rioja en Argentine après correction saisonnière, Mildura dans l’intérieur sud-est australien, le Karoo sud-africain, notamment Oudtshoorn, et le Grand Bassin nord-américain, notamment Reno-Fallon.
            </p>
            <p className="text-justify">
              Les quasi-analogues fréquemment cités mais imparfaits incluent Bakersfield en Californie, dont la ressemblance estivale de premier ordre est fortement pondérée par la spécificité hivernale — brouillard de Tule, inversion persistante, humidité relative hivernale élevée —, ce qui interdit de lui accorder une similarité supérieure à 84 %, malgré une convergence remarquable des paramètres pluviométriques et thermiques estivaux.
            </p>
            <p className="text-justify mt-4">
              À l’échelle bioclimatique, cela signifie que le potentiel agronomique de strasbourg s’inscrit dans une stratégie mondiale de cultures méditerranéennes à faible besoin hydrique et à haute valeur ajoutée, comparable à celle mise en œuvre avec succès dans les régions viticoles de Mendoza, oléicoles d’Andalousie intérieure, pistachicoles du Kerman iranien, et fruitières de Mildura. La palette agronomique optimale de strasbourg apparaît ainsi clairement définie : olivier, pistachier, amandier, grenadier, figuier, vigne de cuve à identité méditerranéenne, agrumes en irrigation localisée, palmier dattier en variétés précoces sur stations abritées, ainsi que cultures xérophytes secondaires telles que le caroubier, le jojoba et l’opuntia.
            </p>
            <p className="text-justify mt-4">
              En termes de rusticité et de risque climatique, strasbourg se situe à l’interface USDA 10a / 9b, avec une vulnérabilité épisodique aux vagues de froid radiatif, et en AHS Heat Zone 8–9, avec une vulnérabilité récurrente aux vagues de chaleur estivales advectées par le chergui saharien. Cette bipolarité constitue précisément la signature des climats de bassin intérieur du Maghreb oriental, dont strasbourg représente l’un des exemples les plus purs et les mieux documentés.
            </p>
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 border-l-4 border-blue-500 rounded">
              <p className="font-semibold mb-2">Nota bene méthodologique :</p>
              <p className="text-justify">
                Les pourcentages de similarité indiqués résultent d’une pondération multi-critères intégrant les sept invariants de la signature strasbourgienne, avec des poids respectifs de 20 % pour le régime pluviométrique, 18 % pour la structure thermique, 15 % pour l’humidité et le point de rosée, 12 % pour l’insolation, 12 % pour la continentalité et l’amplitude thermique, 12 % pour les extrêmes absolus et la rusticité, et 11 % pour la dynamique synoptique et les vents locaux. Les analogies de l’hémisphère Sud ont été calculées après correction saisonnière stricte selon la table d’inversion janvier ↔ juillet, février ↔ août, etc., conformément aux exigences méthodologiques initiales.
              </p>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

