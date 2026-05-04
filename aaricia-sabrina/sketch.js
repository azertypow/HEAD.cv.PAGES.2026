let fonts = [];
let nbTypos = 14;
let pile = [];
let selectedObjects = [null, null, null, null, null];
let started = false;

// --- VARIABLES INTERFACE ---
let bgColorPicker, txtColorPicker, fontSelect, globalFont = 'chaos';
let exportButton, invertButton, randomColorButton;

// --- VARIABLES DRAG & DROP ---
let separators = [];
let draggingSeparator = -1;

// --- DONNÉES ---
const substantifsData = [ { mot: "contexte", g: "m", n: "s" }, { mot: "excès", g: "m", n: "s" }, { mot: "ouverture", g: "f", n: "s" }, { mot: "abolition", g: "f", n: "s" }, { mot: "limites", g: "f", n: "p" }, { mot: "actualité", g: "f", n: "s" }, { mot: "faculté", g: "f", n: "s" }, { mot: "vie", g: "f", n: "s" }, { mot: "mort", g: "f", n: "s" }, { mot: "objet", g: "m", n: "s" }, { mot: "conclusion", g: "f", n: "s" }, { mot: "possibilité", g: "f", n: "s" }, { mot: "nuit", g: "f", n: "s" }, { mot: "temps", g: "m", n: "p" }, { mot: "sensation", g: "f", n: "s" }, { mot: "perception", g: "f", n: "s" }, { mot: "capacité", g: "f", n: "s" }, { mot: "séjour", g: "m", n: "s" }, { mot: "yeux", g: "m", n: "p" }, { mot: "symbole", g: "m", n: "s" }, { mot: "images", g: "f", n: "p" }, { mot: "informations", g: "f", n: "p" }, { mot: "négativité", g: "f", n: "s" }, { mot: "addition", g: "f", n: "s" }, { mot: "accumulation", g: "f", n: "s" }, { mot: "identique", g: "m", n: "s" }, { mot: "présence", g: "f", n: "s" }, { mot: "positivité", g: "f", n: "s" }, { mot: "profusion", g: "f", n: "s" }, { mot: "communication", g: "f", n: "s" }, { mot: "espaces", g: "m", n: "p" }, { mot: "rattachement", g: "m", n: "s" }, { mot: "démantèlement", g: "m", n: "s" }, { mot: "formes", g: "f", n: "p" }, { mot: "surproduction", g: "f", n: "s" }, { mot: "surconsommation", g: "f", n: "s" }, { mot: "origine", g: "f", n: "s" }, { mot: "infarctus", g: "m", n: "s" }, { mot: "système", g: "m", n: "s" }, { mot: "impératif", g: "m", n: "s" }, { mot: "optimisation", g: "f", n: "s" }, { mot: "performance", g: "f", n: "s" }, { mot: "fermeture", g: "f", n: "s" }, { mot: "logiciels", g: "m", n: "p" }, { mot: "applications", g: "f", n: "p" }, { mot: "domaines", g: "m", n: "p" }, { mot: "contrainte", g: "f", n: "s" }, { mot: "education", g: "f", n: "s" }, { mot: "apprentissage", g: "m", n: "s" }, { mot: "production", g: "f", n: "s" }, { mot: "régime", g: "m", n: "s" }, { mot: "productivité", g: "f", n: "s" }, { mot: "action", g: "f", n: "s" }, { mot: "ego", g: "m", n: "p" }, { mot: "statut", g: "m", n: "s" }, { mot: "autoentrepreneurs", g: "m", n: "p" }, { mot: "liens", g: "m", n: "p" }, { mot: "flexibilité", g: "f", n: "s" }, { mot: "force", g: "f", n: "s" }, { mot: "moyen", g: "m", n: "s" }, { mot: "destruction", g: "f", n: "s" }, { mot: "sujet", g: "m", n: "s" }, { mot: "manière", g: "f", n: "s" }, { mot: "rapports", g: "m", n: "p" }, { mot: "narcissisme", g: "m", n: "s" }, { mot: "travail", g: "m", n: "s" }, { mot: "soi", g: "m", n: "s" }, { mot: "escalade", g: "f", n: "s" }, { mot: "exigences", g: "f", n: "p" }, { mot: "présent", g: "m", n: "s" }, { mot: "insatisfaction", g: "f", n: "s" }, { mot: "moment", g: "m", n: "s" }, { mot: "but", g: "m", n: "s" }, { mot: "expériences", g: "f", n: "p" }, { mot: "caractère", g: "m", n: "s" }, { mot: "pulsions", g: "f", n: "p" }, { mot: "trait", g: "m", n: "s" }, { mot: "niveaux", g: "m", n: "p" }, { mot: "société", g: "f", n: "s" }, { mot: "néolibéralisme", g: "m", n: "s" }, { mot: "mondialisation", g: "f", n: "s" }, { mot: "structures", g: "f", n: "p" }, { mot: "cycle", g: "m", n: "s" }, { mot: "capital", g: "m", n: "s" }, { mot: "marchandises", g: "f", n: "p" }, { mot: "monde", g: "m", n: "s" }, { mot: "marché", g: "m", n: "s" }, { mot: "lieu", g: "m", n: "s" }, { mot: "non-lieu", g: "m", n: "s" }, { mot: "connexion", g: "f", n: "s" }, { mot: "internet", g: "m", n: "s" }, { mot: "touristes", g: "m", n: "p" }, { mot: "recueil", g: "m", n: "s" }, { mot: "titre", g: "m", n: "s" }, { mot: "écrivain", g: "m", n: "s" }, { mot: "village", g: "m", n: "s" }, { mot: "centre", g: "m", n: "s" }, { mot: "poirier", g: "m", n: "s" }, { mot: "proximité", g: "f", n: "s" }, { mot: "ordre", g: "m", n: "s" }, { mot: "pesanteur", g: "f", n: "s" }, { mot: "hommes", g: "m", n: "p" }, { mot: "alliance", g: "f", n: "s" }, { mot: "habitants", g: "m", n: "p" }, { mot: "chant", g: "m", n: "s" }, { mot: "nuits", g: "f", n: "p" }, { mot: "été", g: "m", n: "s" }, { mot: "bruit", g: "m", n: "s" }, { mot: "silence", g: "m", n: "s" }, { mot: "sentiment", g: "m", n: "s" }, { mot: "don", g: "m", n: "s" }, { mot: "conscience", g: "f", n: "s" }, { mot: "milieu", g: "m", n: "s" }, { mot: "contemplation", g: "f", n: "s" }, { mot: "contenu", g: "m", n: "s" }, { mot: "rituels", g: "m", n: "p" }, { mot: "localité", g: "f", n: "s" }, { mot: "mapping", g: "m", n: "s" }, { mot: "sillage", g: "m", n: "s" }, { mot: "numérisation", g: "f", n: "s" }, { mot: "villageois", g: "m", n: "p" }, { mot: "actes", g: "m", n: "p" }, { mot: "personne", g: "f", n: "s" }, { mot: "noms", g: "m", n: "p" }, { mot: "genre", g: "m", n: "s" }, { mot: "communauté", g: "f", n: "s" }, { mot: "récit", g: "m", n: "s" }, { mot: "histoire", g: "f", n: "s" }, { mot: "entente", g: "f", n: "s" }, { mot: "opinions", g: "f", n: "p" }, { mot: "écoute", g: "f", n: "s" }, { mot: "attention", g: "f", n: "s" }, { mot: "bénéficiaire", g: "f", n: "s" }, { mot: "appartenance", g: "f", n: "s" }, { mot: "harmonie", g: "f", n: "s" }, { mot: "place", g: "f", n: "s" }, { mot: "caractéristique", g: "f", n: "s" }, { mot: "sens", g: "m", n: "s" }, { mot: "identity", g: "f", n: "s" }, { mot: "phrase", g: "f", n: "s" }, { mot: "filigrane", g: "m", n: "s" }, { mot: "mélancolie", g: "f", n: "s" }, { mot: "essai", g: "m", n: "s" }, { mot: "arbre", g: "m", n: "s" }, { mot: "naissance", g: "f", n: "s" }, { mot: "perte", g: "f", n: "s" }, { mot: "recommencement", g: "m", n: "s" }, { mot: "canal", g: "m", n: "s" }, { mot: "extrémité", g: "f", n: "s" }, { mot: "lumière", g: "f", n: "s" }, { mot: "utérus", g: "m", n: "s" }, { mot: "mère", g: "f", n: "s" }, { mot: "orifice", g: "m", n: "s" }, { mot: "lèvres", g: "f", n: "p" }, { mot: "décennies", g: "f", n: "p" }, { mot: "perspective", g: "f", n: "s" }, { mot: "filière", g: "f", n: "s" }, { mot: "heure", g: "f", n: "s" }, { mot: "conjonction", g: "f", n: "s" }, { mot: "analogie", g: "f", n: "s" }, { mot: "photos", g: "f", n: "p" }, { mot: "saison", g: "f", n: "s" }, { mot: "photographie", g: "f", n: "s" }, { mot: "collectif", g: "m", n: "s" }, { mot: "hospitalité", g: "f", n: "s" }, { mot: "éloge", g: "m", n: "s" }, { mot: "violence", g: "f", n: "s" }, { mot: "nationalisme", g: "m", n: "s" }, { mot: "besoin", g: "m", n: "s" }, { mot: "exclusion", g: "f", n: "s" }, { mot: "étranger", g: "m", n: "s" }, { mot: "être", g: "m", n: "s" }, { mot: "habitat", g: "m", n: "s" }, { mot: "fondamentaliste", g: "m", n: "s" }, { mot: "différences", g: "f", n: "p" }, { mot: "variations", g: "f", n: "p" }, { mot: "altérité", g: "f", n: "s" }, { mot: "étrangeté", g: "f", n: "s" }, { mot: "enfer", g: "m", n: "s" }, { mot: "réaction", g: "f", n: "s" }, { mot: "fondamentalisme", g: "m", n: "s" }, { mot: "culture", g: "f", n: "s" }, { mot: "reason", g: "f", n: "s" }, { mot: "genèse", g: "f", n: "s" }, { mot: "hétérogénéité", g: "f", n: "s" }, { mot: "élément", g: "m", n: "s" }, { mot: "esprit", g: "m", n: "s" }, { mot: "civilisation", g: "f", n: "s" }, { mot: "mythologie", g: "f", n: "s" }, { mot: "sottise", g: "f", n: "s" }, { mot: "développement", g: "m", n: "s" }, { mot: "race", g: "f", n: "s" }, { mot: "sang", g: "m", n: "s" }, { mot: "amitié", g: "f", n: "s" }, { mot: "puissance", g: "f", n: "s" }, { mot: "formation", g: "f", n: "s" }, { mot: "mesure", g: "f", n: "s" }, { mot: "rétrotopie", g: "f", n: "s" }, { mot: "imaginaire", g: "m", n: "s" }, { mot: "hyperculture", g: "f", n: "s" }, { mot: "frontières", g: "f", n: "p" }, { mot: "agrégat", g: "m", n: "s" }, { mot: "distance", g: "f", n: "s" }, { mot: "hypermarché", g: "m", n: "s" }, { mot: "formule", g: "f", n: "s" }, { mot: "consommation", g: "f", n: "s" }, { mot: "rhizome", g: "m", n: "s" }, { mot: "filiation", g: "f", n: "s" }, { mot: "tissu", g: "m", n: "s" }, { mot: "logique", g: "f", n: "s" }, { mot: "prolifération", g: "f", n: "s" }, { mot: "atopie", g: "f", n: "s" }, { mot: "conséquence", g: "f", n: "s" }, { mot: "âges", g: "m", n: "p" }, { mot: "horloge", g: "f", n: "s" }, { mot: "discontinuité", g: "f", n: "s" }, { mot: "transitions", g: "f", n: "p" }, { mot: "existence", g: "f", n: "s" }, { mot: "consommateurs", g: "m", n: "p" }, { mot: "continuité", g: "f", n: "s" }, { mot: "rites", g: "m", n: "p" }, { mot: "passage", g: "m", n: "s" }, { mot: "seuil", g: "m", n: "s" }, { mot: "phase", g: "f", n: "s" }, { mot: "ordre", g: "m", n: "s" }, { mot: "profit", g: "m", n: "s" }, { mot: "langage", g: "m", n: "s" }, { mot: "enchantement", g: "m", n: "s" }, { mot: "résistance", g: "f", n: "s" }, { mot: "circulation", g: "f", n: "s" }, { mot: "clics", g: "m", n: "p" } ];
const adjectifsBase = [ "ouvert", "additif", "spécifique", "contemplatif", "identique", "démesuré", "adipeux", "infini", "conclusif", "néolibéral", "provisoire", "inachevé", "définitif", "fermant", "concluant", "commun", "brutal", "isolé", "efficace", "flexible", "narcissique", "intense", "achevé", "constant", "nouveau", "fini", "existant", "plein", "accompli", "objectif", "propre", "indépendant", "conclu", "essentiel", "fermé", "mondial", "numérique", "dé-localisé", "prudent", "antique", "sauvage", "gigantesque", "passé", "vieux", "profond", "chaud", "intempestif", "personnel", "compréhensible", "individuel", "prémoderne", "collectif", "cognitif", "déterminé", "tacite", "rituel", "primordial", "excessif", "final", "cohérent", "narratif", "élu", "imminent", "vif", "ovale", "mort", "pelvien", "cyclique", "humain", "fruitier", "singulier", "refermé", "aimable", "archaïque", "naïf", "fondamentaliste", "total", "destructeur", "grec", "hétérogène", "beau", "libre", "stabilisé", "constitutif", "dominant", "culturel", "hyperculturel", "cancéreux", "prétendu", "global", "hostile", "inconciliable", "fondamental", "mûr", "infantile", "temporel", "accéléré", "pauvre", "lisse", "rapide" ];
const verbesData = [ { s: "domine", p: "dominent" }, { s: "désapprend", p: "désapprennent" }, { s: "devient", p: "deviennent" }, { s: "suppose", p: "supposent" }, { s: "a fait", p: "ont fait" }, { s: "ôte", p: "ôtent" }, { s: "achèvera", p: "achèveront" }, { s: "court", p: "courent" }, { s: "a perdu", p: "ont perdu" }, { s: "est", p: "sont" }, { s: "assaille", p: "assaillent" }, { s: "empêche", p: "empêchent" }, { s: "aboutit", p: "aboutissent" }, { s: "provoque", p: "provoquent" }, { s: "permet", p: "permettent" }, { s: "rend", p: "rendent" }, { s: "abolit", p: "abolissent" }, { s: "augmente", p: "augmentent" }, { s: "décompose", p: "décomposent" }, { s: "exploite", p: "exploitent" }, { s: "obtient", p: "obtiennent" }, { s: "éprouve", p: "éprouvent" }, { s: "constitue", p: "constituent" }, { s: "évite", p: "évitent" }, { s: "mène", p: "mènent" }, { s: "ressent", p: "ressentent" }, { s: "souhaite", p: "souhaitent" }, { s: "vit", p: "vivent" }, { s: "prolonge", p: "prolongent" }, { s: "dissout", p: "dissolvent" }, { s: "accélère", p: "accélèrent" }, { s: "délimite", p: "délimitent" }, { s: "dé-localise", p: "dé-localisent" }, { s: "fait", p: "font" }, { s: "habite", p: "habitent" }, { s: "surfe", p: "surfent" }, { s: "parcourt", p: "parcourent" }, { s: "circule", p: "circulent" }, { s: "décrit", p: "décrivent" }, { s: "trouve", p: "trouvent" }, { s: "part", p: "partent" }, { s: "regarde", p: "regardent" }, { s: "retourne", p: "retournent" }, { s: "représente", p: "représentent" }, { s: "émane", p: "émanent" }, { s: "unit", p: "unissent" }, { s: "crée", p: "créent" }, { s: "rassemble", p: "rassemblent" }, { s: "entonne", p: "entonnent" }, { s: "chante", p: "chantent" }, { s: "communique", p: "communiquent" }, { s: "perturbe", p: "perturbent" }, { s: "dit", p: "disent" }, { s: "sait", p: "savent" }, { s: "adonne", p: "adonnent" }, { s: "bénit", p: "bénissent" }, { s: "stabilise", p: "stabilisent" }, { s: "voit", p: "voient" }, { s: "entend", p: "entendent" }, { s: "attribue", p: "attribuent" }, { s: "participe", p: "participent" }, { s: "répète", p: "répètent" }, { s: "raconte", p: "racontent" }, { s: "règne", p: "règnent" }, { s: "tente", p: "tentent" }, { s: "attire", p: "attirent" }, { s: "forme", p: "forment" }, { s: "disparaît", p: "disparaissent" }, { s: "cède", p: "cèdent" }, { s: "respecte", p: "respectent" }, { s: "admet", p: "admettent" }, { s: "achève", p: "achèvent" }, { s: "exprime", p: "expriment" }, { s: "intitule", p: "intitulent" }, { s: "aperçoit", p: "aperçoivent" }, { s: "transforme", p: "transforment" }, { s: "glisse", p: "glissent" }, { s: "approche", p: "approchent" }, { s: "vient", p: "viennent" }, { s: "mue", p: "muent" }, { s: "produit", p: "produisent" }, { s: "engendre", p: "engendrent" }, { s: "incarne", p: "incarnent" }, { s: "photographie", p: "photographient" }, { s: "attend", p: "attendent" }, { s: "entraîne", p: "entraînent" }, { s: "conduit", p: "conduisent" }, { s: "oublie", p: "oublient" }, { s: "nivelle", p: "nivellent" }, { s: "contrecare", p: "contrecarrent" }, { s: "éveille", p: "éveillent" }, { s: "note", p: "notent" }, { s: "ignore", p: "ignorent" }, { s: "rattache", p: "rattachent" }, { s: "viendrait", p: "viendraient" }, { s: "imagine", p: "imaginent" }, { s: "résulte", p: "résultent" }, { s: "acquiert", p: "acquièrent" }, { s: "absorbe", p: "absorbent" }, { s: "invoque", p: "invoquent" }, { s: "exclut", p: "excluent" }, { s: "situe", p: "situent" }, { s: "supprime", p: "suppriment" }, { s: "fait imploser", p: "font imploser" }, { s: "superpose", p: "superposent" }, { s: "interpénètre", p: "interpénètrent" }, { s: "présente", p: "présentent" }, { s: "déploie", p: "déploient" }, { s: "impose", p: "imposent" }, { s: "secoue", p: "secouent" }, { s: "déracine", p: "déracinent" }, { s: "désigne", p: "désignent" }, { s: "célèbre", p: "célèbrent" }, { s: "dérobe", p: "dérobent" }, { s: "anime", p: "animent" }, { s: "inspire", p: "inspirent" }, { s: "correspond", p: "correspondent" }, { s: "vieillit", p: "vieillissent" }, { s: "passe", p: "passent" }, { s: "reste", p: "restent" }, { s: "franchit", p: "franchissent" }, { s: "rythme", p: "rythment" }, { s: "articule", p: "articulent" }, { s: "parle", p: "parlent" }, { s: "édifie", p: "édifient" } ];

function preload() {
  for (let i = 1; i <= nbTypos; i++) {
    let path = 'assets/Typo_' + nf(i, 2) + '.otf';
    fonts.push(loadFont(path));
  }
}

function setup() {
  createCanvas(600, 800);
  for (let i = 1; i <= 4; i++) {
    separators.push((height / 5) * i);
  }

  remplirPile();
}

function draw() {
  background(255); // Fond par défaut
  if (!started) {
    drawStartScreen();
    return;
  }

  // Cursor logic
  if (mouseX < width) {
    let onLine = false;
    for (let y of separators) {
      if (abs(mouseY - y) < 10) onLine = true;
    }
    cursor(onLine ? 'ns-resize' : ARROW);
  }

  // Dragging logic
  if (draggingSeparator !== -1) {
    let minY = (draggingSeparator === 0) ? 20 : separators[draggingSeparator - 1] + 20;
    let maxY = (draggingSeparator === 3) ? height - 20 : separators[draggingSeparator + 1] - 20;
    separators[draggingSeparator] = constrain(mouseY, minY, maxY);
  }

  // Rendu des zones
  for (let i = 0; i < 5; i++) {
    let yStart = (i === 0) ? 0 : separators[i - 1];
    let yEnd = (i === 4) ? height : separators[i];
    let h = yEnd - yStart;

    let obj = selectedObjects[i];
    if (!obj) continue;

    // Dessiner le fond de la zone
    fill(obj.bg);
    noStroke();
    rect(0, yStart, width, h);

    // Dessiner le texte
    let ref = (i <= 2) ? selectedObjects[0].data : selectedObjects[3].data;
    fill(obj.txt);
    drawStretchedText(obj, i, ref, width, h, yStart);
  }
}

function drawStretchedText(obj, i, ref, targetW, targetH, targetY) {
  let fullText = getFinalString(obj, i, ref);
  fullText = cleanText(fullText);

  push();
  textFont(obj.font);
  textSize(100);
  textAlign(LEFT, TOP);
  let bbox = obj.font.textBounds(fullText, 0, 0, 100);
  let scaleX = targetW / bbox.w;
  let scaleY = targetH / bbox.h;
  translate(0, targetY);
  scale(scaleX, scaleY);
  text(fullText, -bbox.x, -bbox.y);
  pop();
}

function getFinalString(obj, i, ref) {
  if (i === 0 || i === 3) return getDeterminant(obj.data, (i === 0) ? "defini" : "indefini") + obj.data.mot;
  if (i === 1 || i === 4) return accorderAdjectif(obj.data, ref.g, ref.n);
  if (i === 2) return (ref.n === "p") ? obj.data.p : obj.data.s;
  return "";
}

function getDeterminant(obj, type) {
  if (type === "defini") {
    if (obj.n === "p") return "les ";
    if ("aeiouyh".includes(obj.mot[0].toLowerCase())) return "l'";
    return (obj.g === "m") ? "le " : "la ";
  } else {
    if (obj.n === "p") return "des ";
    return (obj.g === "m") ? "un " : "une ";
  }
}

function mousePressed() {
  if (mouseX > width) return;

  for (let i = 0; i < separators.length; i++) {
    if (abs(mouseY - separators[i]) < 10) {
      draggingSeparator = i;
      return;
    }
  }

  let zone = -1;
  if (mouseY < separators[0]) zone = 0;
  else if (mouseY < separators[1]) zone = 1;
  else if (mouseY < separators[2]) zone = 2;
  else if (mouseY < separators[3]) zone = 3;
  else zone = 4;

  if (!started) {
    started = true;
    for (let i = 0; i < 5; i++) updateZone(i);
  } else {
    updateZone(zone);
  }
}

function mouseReleased() {
  draggingSeparator = -1;
}

function updateZone(i) {
  let data;
  if (i === 0 || i === 3) data = random(substantifsData);
  else if (i === 1 || i === 4) data = random(adjectifsBase);
  else if (i === 2) data = random(verbesData);

  // Génération de couleurs aléatoires contrastées pour la ligne
  colorMode(HSB, 360, 100, 100);
  let h = random(360);
  let cBg = color(h, random(30, 80), random(20, 90));
  // Texte contrasté (soit très sombre, soit très clair par rapport au fond)
  let cTxt = color((h + 180) % 360, random(40, 100), (lightness(cBg) > 50) ? 10 : 95);
  colorMode(RGB, 255);

  selectedObjects[i] = {
    data: data,
    font: getNextFont(),
    bg: cBg,
    txt: cTxt
  };
}

// --- FONCTIONS SECONDAIRES ---

function drawStartScreen() {
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(24);
  textFont('sans-serif');
  text("CLIQUEZ SUR LES ZONES\nFONDS ET TYPOS INDIVIDUELS", width / 2, height / 2);
}

function cleanText(str) { return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase(); }
function remplirPile() { let indices = []; for (let i = 0; i < nbTypos; i++) indices.push(i); pile = shuffle(indices); }
function getNextFont() { if (pile.length === 0) remplirPile(); return fonts[pile.pop()]; }
function accorderAdjectif(adj, genre, nombre) { let res = adj; if (genre === "f") { if (res.endsWith("f")) res = res.slice(0, -1) + "ve"; else if (res.endsWith("el")) res += "le"; else if (res.endsWith("er")) res = res.slice(0, -2) + "ère"; else if (res.endsWith("eux")) res = res.slice(0, -1) + "se"; else if (res === "beau") res = "belle"; else if (res === "vieux") res = "vieille"; else if (!res.endsWith("e")) res += "e"; } if (nombre === "p") { if (res === "beau") res = "beaux"; else if (res.endsWith("al") && res !== "global" && res !== "final") res = res.slice(0, -2) + "aux"; else if (!res.endsWith("s") && !res.endsWith("x")) res += "s"; } return res; }
