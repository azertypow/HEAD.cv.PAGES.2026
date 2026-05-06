let circles = [];
let lines = [];
let allConverted = false;
let displayLineYs = [];
let stableLineYs = [];
let readableAlignMode = false;
let bentYCache = new Map();

// --------------------------------------------
// INTRO TEXT
// --------------------------------------------
const INTRO_TEXT =
  "Le symbolique, consid\u00e9r\u00e9 comme le m\u00e9dia de la communaut\u00e9, dispara\u00eet. aujourd'hui \u00e0 vue d'oeil. D\u00e9symbolisation et d\u00e9ritualisation se conditionnent mutuellement. La socioanthropologue Mary Douglas constate avec \u00e9tonnement : \u201cL'un des plus s\u00e9rieux probl\u00e8mes de notre temps est l'atrophie du lien produit par des symboles communs. [\u2026] S'il s'agissait seulement que la soci\u00e9t\u00e9 s'\u00e9parpille en petits groupes dont chacun d\u00e9velopperait ses propres formes d'alliance symbolique, ce ne serait pas un processus difficile \u00e0 comprendre. Sensiblement moins compr\u00e9hensibles, en revanche, sont l'aversion et la mauvaise volont\u00e9 r\u00e9pandues \u00e0 l'\u00e9gard du rituel. \u00ab\u00a0Rituel\u00a0\u00bb est devenu un mot choquant, une expression d\u00e9signant un conformisme vide\u00a0; nous sommes les t\u00e9moins d'une r\u00e9volte g\u00e9n\u00e9rale contre toute forme de formalisme, mieux, contre la \u00ab\u00a0forme\u00a0\u00bb en g\u00e9n\u00e9ral.\u201d La disparition des symboles renvoie \u00e0 l'atomisation croissante d'une soci\u00e9t\u00e9 qui, dans le m\u00eame temps, devient narcissique.";

// --------------------------------------------
// LAYOUT
// --------------------------------------------
let introMarginX = 24;
let introTopY = 92;
let introLineH = 34;
const INTRO_BASE_FONT_SIZE = 50;                    /// *
let introFontSize = INTRO_BASE_FONT_SIZE;
let introMaxWidth = 0;
const INTRO_MIN_FONT_SIZE = 10;
const INTRO_TARGET_HEIGHT_RATIO = 0.96;
let INTRO_LINE_HEIGHT_RATIO = 1.85;                 /// *
const INTERLINE_MAX = 20;                           /// *
let currentBaseFontSize = INTRO_BASE_FONT_SIZE;

let textBlockBottomY = 0;

// Text margin enforcement constants
const TEXT_MIN_LETTER_SPACING = -1.5;  // Minimum letter compression allowed
const TEXT_MAX_LETTER_SPACING = 6;     // Maximum letter expansion allowed
const MARGIN_SAFETY_BUFFER = 2;        // Safety buffer to keep text inside margins

// --------------------------------------------
// UI STATE  — single hue for circles, bg as full HSL color
// --------------------------------------------
let ui = {
  paletteSat:   0.72,   // 0-1  saturation of word colours
  paletteLight: 0.55,   // 0-1  lightness of word colours
  bgLight:      1.0,    // 0-1  background lightness (white)
  bgSat:        0.0,    // 0-1  background saturation (white)
  bgHue:        0,      // 0-360 background tint (white)
  fontSize:     40,
  lineHeight:   1.85,
  fontWeight:   400,    // 100-900
  letterSpacing: 0,     // in pixels
  fontFamily:   "Times New Roman"  // Current font
};

const AVAILABLE_FONTS = [
  "Times New Roman",
  "Georgia",
  "Helvetica",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Palatino",
];

// Per-word hue map: wordIndex (global across all lines) → hue 0-360
let wordHues = [];

// Slider DOM refs so randomiseAndReset can sync them: { key, sl, valD, fmt, unit }
let sliderRefs = [];

// Inactivity auto-reset
const INACTIVITY_SECONDS = 60;
let lastActivityTime = 0;

// --------------------------------------------
// PHYSICS / FX
// --------------------------------------------
const COLL_RESTITUTION = 0.05;
const COLL_POS_CORRECTION = 0.82;
const COLL_SLOP = 0.6;
const GAP = 2;
const MAX_CIRCLES = 220;
const COOLDOWN = 16;
const PINCH_SPEED = 0.06;
const PINCH_HOLD = 10;
const LOCK_CIRCLES_AFTER_CREATION = false;
const FREEZE_PREVIOUS_CIRCLES_ON_NEW_CLICK = true;
const FREEZE_TEXT_POSITIONS_ON_NEW_CLICK = true;
const LETTER_MAX_PER_SPLIT = 28;
const CHILD_R_MIN = 14;
const CIRCLE_OUTLINE_THICKNESS = 4.2;
const UNDERLINE_TO_CIRCLE_FRAMES = 14;
const TEXT_BEND_MARGIN = 14;
const TEXT_VIEW_TOP_MARGIN = 24;
const TEXT_VIEW_BOTTOM_MARGIN = 12;
const LINE_PUSH_MAX_PER_STEP = 34;
const LINE_ANCHOR_PULL = 0.06;
const TEXT_BEND_STRENGTH = 1.35;
const TEXT_CIRCLE_CLEARANCE = 2.2;
const TEXT_LINE_CIRCLE_CLEARANCE = 0.8;
const LETTER_CELL_TEXT_EXTRA_CLEARANCE_MUL = 0.52;
const LETTER_CELL_TEXT_SEP_GAIN = 0.95;
const LETTER_CELL_TEXT_SEP_STEP_MUL = 1.9;
const LINE_Y_SMOOTH = 0.28;
const TEXT_SEP_MAX_STEP = 0.85;
const TEXT_SEP_DEADZONE = 0.28;
const TEXT_SEP_EVERY_N_FRAMES = 2;
const TEXT_SEP_MAX_LINE_Y_DIST_MUL = 3.8;
const READABLE_ALIGN_LERP = 0.2;
const LETTER_ORBIT_SPEED = 0.016;
const TEXT_BEND_MAX_SHIFT_MUL = 14.0;
const TEXT_BEND_SOFT_RADIUS_MUL = 4.2;
const TEXT_BEND_SOFT_STRENGTH = 0.72;
const TEXT_BEND_SOFT_Y_FALLOFF = 5.5;
const UNDERLINE_OFFSET_RATIO = 0.62;
const KEYWORD_BG_ALPHA = 100;

const FIXED_HIGHLIGHT_KEYWORDS = new Set([
  "symbolique","communaute","desymbolisation","disparait",
  "symbols","rituel","rituels","forme","atomisation","narcissique"
]);

// Semantic groups — each group shares a hue (matched after normalisation)
const SEMANTIC_GROUPS = [
  // Symbole / signe / sens / média     → warm orange-red 12°
  { hue: 12,  words: new Set(["symbolique","symboles","symbole","symbolisme","sens","signe","signes","media","communaute","communs","forme","formes","expression","lien","alliance","symbolique"]) },
  // Disparition / crise / fragmentation → deep violet 270°
  { hue: 270, words: new Set(["disparait","disparition","desymbolisation","deritualisation","atrophie","atomisation","eparpille","petits","groupes","aversion","mauvaise"]) },
  // Rituel / formalisme / conformisme   → teal 175°
  { hue: 175, words: new Set(["rituel","rituels","ritualisation","formalisme","formalites","formel","conformisme","vide","revolte","generale","formalisme","formes"]) },
  // Société / collectif / narcissisme   → warm green 115°
  { hue: 115, words: new Set(["societe","social","communaute","collectif","groupes","narcissique","individualisme","general","volonte","egard"]) },
  // Compréhension / cognition / sens    → sky blue 205°
  { hue: 205, words: new Set(["comprendre","comprehensibles","incomprehensibles","constate","etonnement","problemes","serieux","difficile","sensiblement","revanche","constat"]) },
  // Temps / modernité                   → amber 38°
  { hue: 38,  words: new Set(["temps","aujourd","oeil","croissante","meme","tandis","notre","mutuellement","conditionnent"]) },
  // Personnes / acteurs / témoins       → rose 340°
  { hue: 340, words: new Set(["mary","douglas","socioanthropologue","nous","temoins","sommes","leur","chacun","temoins","douglas"]) },
];
const SEMANTIC_DEFAULT_HUE = 215; // fallback blue-grey

// --------------------------------------------
// SETUP
// --------------------------------------------
function setup() {
    const posterRatio = 600 / 800
    const posterHeight = 2000
    // const posterHeight = 800
    const posterWidth = posterHeight * posterRatio
  createCanvas(posterWidth, posterHeight);
  pixelDensity(4)
  textFont(ui.fontFamily);
  textStyle(NORMAL);
  introMaxWidth = width - introMarginX * 2;
  buildIntroLines();
  buildPanel();
}

// --------------------------------------------
// DRAW
// --------------------------------------------
function draw() {
  // Inactivity auto-reset
  let elapsed = (millis() - lastActivityTime) / 1000;
  let remaining = max(0, INACTIVITY_SECONDS - elapsed);
  let inactEl = document.getElementById("inact-display");
  if (inactEl) {
    if (circles.length > 0 || lines.some(l => l.gone)) {
      inactEl.textContent = "reset dans " + ceil(remaining) + "s";
    } else {
      inactEl.textContent = "";
    }
  }
  if (remaining <= 0 && (circles.length > 0 || lines.some(l => l.gone))) {
    randomiseAndReset();
  }

  // Colorful background from HSL
  background(255, 255, 255);  // Pure white #FFFFFF
  bentYCache.clear();

  updateCircleAppearances();
  solveCircleCollisions();
  updateDisplayLineYs();

  let hasLetterCells = circles.some(c => c.isLetterCell);
  let shouldSep = hasLetterCells || circles.length < 8 || (frameCount % TEXT_SEP_EVERY_N_FRAMES === 0);
  if (shouldSep) { resolveCircleTextSeparation(); updateDisplayLineYs(); }

  drawIntroText();

  for (let c of circles) { if (!c.isAppearing) updateLettersInCircle(c); }
  for (let c of circles) {
    if (c.pinch) drawPinchedBalloon(c); else drawNormalCircle(c);
    if (c.cd && c.cd > 0) c.cd--;
  }
}

// --------------------------------------------
// COLOUR HELPERS
// --------------------------------------------
function hslToColor(h, s, l, a) {
  h = h % 360;
  let c2 = (1 - abs(2*l - 1)) * s;
  let x  = c2 * (1 - abs((h/60) % 2 - 1));
  let m  = l - c2/2;
  let r, g, b;
  if      (h < 60)  { r=c2; g=x;  b=0;  }
  else if (h < 120) { r=x;  g=c2; b=0;  }
  else if (h < 180) { r=0;  g=c2; b=x;  }
  else if (h < 240) { r=0;  g=x;  b=c2; }
  else if (h < 300) { r=x;  g=0;  b=c2; }
  else              { r=c2; g=0;  b=x;  }
  let col = color((r+m)*255, (g+m)*255, (b+m)*255);
  if (a !== undefined) col.setAlpha(a);
  return col;
}

// Colour for a specific word index
function wordColor(wIdx, alpha_=220) {
  let h = wordHues[wIdx % wordHues.length] || 0;
  return hslToColor(h, ui.paletteSat, ui.paletteLight, alpha_);
}

// Hover highlight uses word hue, lighter
function hoverHighlightColor(wIdx) {
  let h = wordHues[wIdx % wordHues.length] || 0;
  return hslToColor(h, ui.paletteSat * 0.8, ui.paletteLight + 0.18, KEYWORD_BG_ALPHA + 30);
}

// Text always black
function textBodyColor() {
  return color(18, 18, 18, 240);
}

// --------------------------------------------
// HTML PANEL
// --------------------------------------------
function buildPanel() {
  let panel = createElement("div");
  panel.id("ctrl-panel");
  panel.style("position",       "fixed");
  panel.style("top",            "50%");
  panel.style("right",          "12px");
  panel.style("transform",      "translateY(-50%)");
  panel.style("background",     "rgba(12,12,12,0.92)");
  panel.style("border",         "1px solid rgba(255,255,255,0.10)");
  panel.style("border-radius",  "12px");
  panel.style("padding",        "16px 18px");
  panel.style("display",        "flex");
  panel.style("flex-direction", "column");
  panel.style("gap",            "14px");
  panel.style("min-width",      "190px");
  panel.style("font-family",    "monospace");
  panel.style("font-size",      "11px");
  panel.style("color",          "#bbb");
  panel.style("z-index",        "999");
  panel.style("user-select",    "none");
  panel.style("box-shadow",     "0 4px 24px rgba(0,0,0,0.6)");

  let title = createElement("div", "Contr\u00f4les");
  title.style("font-size","12px"); title.style("color","#fff");
  title.style("letter-spacing","0.08em"); title.style("text-transform","uppercase");
  title.style("opacity","0.6"); title.parent(panel);

  // Typo
  addSlider(panel,"Taille typo",  INTRO_BASE_FONT_SIZE / 3,   INTRO_BASE_FONT_SIZE * 3,     INTRO_BASE_FONT_SIZE,     1,    v=>{ ui.fontSize=v;   applyTypoFromUI(); },"px",  null,"fontSize");
  addSlider(panel,"Interlignage", INTRO_LINE_HEIGHT_RATIO / 2,  INTRO_LINE_HEIGHT_RATIO * 2,    INTRO_LINE_HEIGHT_RATIO,   0.01, v=>{ ui.lineHeight=v; applyTypoFromUI(); },"\u00d7",null,"lineHeight");
  addSlider(panel,"Graisse",      100,  900,    400,    100,  v=>{ ui.fontWeight=v; },null, v=>v,"fontWeight");
  addSlider(panel,"Interlettrage",0,    INTERLINE_MAX,      0,      0.1,  v=>{ ui.letterSpacing=v; applyTypoFromUI(); },"px",null,"letterSpacing");

  // Font selector
  addFontSelector(panel);

  // Inactivity countdown display
  let inactEl = createElement("div","");
  inactEl.id("inact-display");
  inactEl.style("opacity","0.28"); inactEl.style("font-size","9px"); inactEl.style("text-align","center");
  inactEl.parent(panel);

  sep(panel);

  // Buttons
  let btnRow = createElement("div");
  btnRow.style("display","flex"); btnRow.style("gap","8px"); btnRow.parent(panel);
  let bReset = createElement("button","Random reset"); styleBtn(bReset); bReset.mousePressed(randomiseAndReset); bReset.parent(btnRow);
  let bSave  = createElement("button","Save (S)");     styleBtn(bSave);  bSave.mousePressed(()=>saveCanvas("sketch","png")); bSave.parent(btnRow);

  // Keys reminder
  let hint = createElement("div","R = lisible  |  X = reset");
  hint.style("opacity","0.3"); hint.style("font-size","9px"); hint.style("text-align","center");
  hint.parent(panel);
}

function sep(parent) {
  let d = createElement("div");
  d.style("border-top","1px solid rgba(255,255,255,0.07)");
  d.parent(parent);
}

function styleBtn(btn) {
  btn.style("flex","1"); btn.style("background","rgba(255,255,255,0.06)");
  btn.style("border","1px solid rgba(255,255,255,0.15)"); btn.style("border-radius","6px");
  btn.style("color","#ddd"); btn.style("padding","6px 4px");
  btn.style("cursor","pointer"); btn.style("font-family","monospace"); btn.style("font-size","10px");
}

function addSlider(parent, label, mn, mx, val, step, onChange, unit, fmtFn, uiKey) {
  let wrap = createElement("div");
  wrap.style("display","flex"); wrap.style("flex-direction","column"); wrap.style("gap","4px");
  wrap.parent(parent);

  let header = createElement("div");
  header.style("display","flex"); header.style("justify-content","space-between");
  header.parent(wrap);
  createElement("span", label).parent(header);

  let fmt = fmtFn ? fmtFn : (v => Number.isInteger(v) ? v : parseFloat(v).toFixed(2));
  let valD = createElement("span", fmt(val)+(unit||""));
  valD.style("opacity","0.5"); valD.style("font-size","10px"); valD.parent(header);

  let sl = createSlider(mn, mx, val, step);
  sl.style("width","100%"); sl.style("cursor","pointer"); sl.style("accent-color","#87ceeb");
  sl.parent(wrap);
  sl.input(()=>{ let v=sl.value(); valD.html(fmt(v)+(unit||"")); onChange(v); });

  if (uiKey) sliderRefs.push({ key:uiKey, sl, valD, fmt, unit:unit||"" });
}

function addFontSelector(parent) {
  let wrap = createElement("div");
  wrap.style("display","flex"); wrap.style("flex-direction","column"); wrap.style("gap","4px");
  wrap.parent(parent);

  let label = createElement("div", "Police");
  label.style("font-size","11px"); label.style("opacity","0.8");
  label.parent(wrap);

  let sel = createSelect();
  sel.style("width","100%"); sel.style("padding","4px"); sel.style("cursor","pointer");
  sel.style("background","rgba(255,255,255,0.05)"); sel.style("border","1px solid rgba(255,255,255,0.15)");
  sel.style("color","#bbb"); sel.style("border-radius","4px");

  for (let font of AVAILABLE_FONTS) {
    sel.option(font);
  }
  sel.value(ui.fontFamily);
  sel.parent(wrap);

  sel.changed(() => {
    ui.fontFamily = sel.value();
    textFont(ui.fontFamily);
    applyTypoFromUI();
  });
}

function applyTypoFromUI() {
  // Save which words have been removed already (blank slots)
  let savedWords = lines.map(l => l.words ? l.words.slice() : []);

  currentBaseFontSize     = ui.fontSize;
  INTRO_LINE_HEIGHT_RATIO = ui.lineHeight;
  buildIntroLines();
  displayLineYs = []; stableLineYs = [];

  // Re-apply blank slots: flatten saved words and new words by original text,
  // mark positions that were already blanked
  let savedFlat = savedWords.flat();
  let newFlat   = lines.map(l => l.words || []).flat();
  // Match 1:1 — same total word count since text doesn't change
  let minLen = Math.min(savedFlat.length, newFlat.length);
  let newIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].words) continue;
    for (let k = 0; k < lines[i].words.length; k++) {
      if (newIdx < minLen) {
        // If the saved slot was blanked (all spaces), blank the new one too
        let wasBlank = savedFlat[newIdx].trim().length === 0 && savedFlat[newIdx].length > 0;
        if (wasBlank) {
          lines[i].words[k] = lines[i].words[k].replace(/[^\s]/g, " ");
        }
        newIdx++;
      }
    }
    lines[i].text = lines[i].words.join(" ");
    lines[i].gone = !lines[i].words.some(w => w.trim().length > 0);
  }
}

// --------------------------------------------
// INTRO LINES
// --------------------------------------------
function buildIntroLines() {
  let targetBottomY = height * INTRO_TARGET_HEIGHT_RATIO;
  let wrapped=[], chosenFS=currentBaseFontSize, chosenLH=introLineH;
  for (let fs=currentBaseFontSize; fs>=INTRO_MIN_FONT_SIZE; fs-=0.5) {
    let lh=fs*INTRO_LINE_HEIGHT_RATIO, trial=wrapIntroWords(fs);
    let trialBot=introTopY+(trial.length-1)*lh+lh*0.6;
    wrapped=trial; chosenFS=fs; chosenLH=lh;
    if (trialBot<=targetBottomY) break;
  }
  introFontSize=chosenFS; introLineH=chosenLH; lines=wrapped;
  let n=max(1,lines.length);
  let blockH=(n-1)*introLineH+introLineH*1.1;
  introTopY=(height-blockH)*0.5+introLineH*0.5;
  // Assign hue by semantic group, with small per-word jitter
  wordHues = [];
  for (let i=0;i<lines.length;i++) {
    if (!lines[i].words) continue;
    for (let w of lines[i].words) {
      let norm = w.toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"").replace(/[^a-z]/g,"");
      let foundHue = SEMANTIC_DEFAULT_HUE;
      for (let grp of SEMANTIC_GROUPS) {
        if (grp.words.has(norm)) { foundHue = grp.hue; break; }
      }
      wordHues.push((foundHue + random(-12,12) + 360) % 360);
    }
  }

  let globalWIdx = 0;
  for (let i=0;i<lines.length;i++) {
    lines[i].y=introTopY+i*introLineH; lines[i].gone=false;
    lines[i].wordIdxOffset = globalWIdx;
    globalWIdx += lines[i].words ? lines[i].words.length : 0;
  }
  textBlockBottomY=introTopY+(lines.length-1)*introLineH+introLineH*0.6;
}

function wrapIntroWords(fontSize) {
  let result=[],current="",cw=[];
  textSize(fontSize); textAlign(LEFT,CENTER);
  let spaceW = textWidth(" ");

  for (let w of INTRO_TEXT.split(/\s+/).filter(Boolean)) {
    let test=current.length?current+" "+w:w;

    // Calculate width accounting for letter-spacing only within words, not between words
    let testWords = test.split(/\s+/);
    let testWidth = testWords.reduce((sum, word) => {
      return sum + textWidth(word) + ui.letterSpacing * max(0, word.length - 1);
    }, 0) + spaceW * (testWords.length - 1);

    // Check if line would exceed margins with current letter spacing
    if (testWidth <= introMaxWidth) {
      current=test;
      cw.push(w);
    }
    else {
      // If single word is too long, try fitting it with reduced letter-spacing
      let wWidth = textWidth(w) + ui.letterSpacing * max(0, w.length - 1);
      if (current.length === 0 && wWidth > introMaxWidth) {
        // Word is longer than margin, must add it anyway and mark for adjustment
        result.push({text:w, words:[w], y:0, gone:false, overflowWord:true});
        current="";
        cw=[];
      } else {
        // Start new line
        if (current.length) result.push({text:current, words:cw.slice(), y:0, gone:false});
        current=w;
        cw=[w];
      }
    }
  }
  if (current.length) result.push({text:current, words:cw.slice(), y:0, gone:false});
  return result;
}

// --------------------------------------------
// DISPLAY LINE Y
// --------------------------------------------
function updateDisplayLineYs() {
  displayLineYs=[]; let visIdx=[];
  for (let i=0;i<lines.length;i++) { if(lines[i].gone)continue; displayLineYs[i]=lines[i].y; visIdx.push(i); }
  if (!visIdx.length) return;
  let hasC=circles.length>0;
  resolveLineGapPass(visIdx, introLineH*(hasC?1.02:1.2), LINE_PUSH_MAX_PER_STEP*(hasC?0.72:1.0), hasC?3:2);
  if (hasC) for (let i of visIdx) displayLineYs[i]=lerp(displayLineYs[i],lines[i].y,LINE_ANCHOR_PULL);
  let fi=visIdx[0], li=visIdx[visIdx.length-1];
  let topY=displayLineYs[fi], botY=displayLineYs[li];
  let minT=TEXT_VIEW_TOP_MARGIN, maxB=height-TEXT_VIEW_BOTTOM_MARGIN;
  let span=botY-topY, allowed=maxB-minT;
  if (span>allowed&&span>0.0001) {
    let k=allowed/span; for (let i of visIdx) displayLineYs[i]=minT+(displayLineYs[i]-topY)*k;
  } else {
    let off=0; if(botY>maxB)off=maxB-botY; if(topY+off<minT)off+=minT-(topY+off);
    if(abs(off)>0.0001) for(let i of visIdx) displayLineYs[i]+=off;
  }
  resolveLineGapPass(visIdx, introLineH*(hasC?0.92:1.08), LINE_PUSH_MAX_PER_STEP*(hasC?0.56:0.6), hasC?3:2);
  topY=displayLineYs[fi]; botY=displayLineYs[li];
  let off2=0; if(botY>maxB)off2=maxB-botY; if(topY+off2<minT)off2+=minT-(topY+off2);
  if(abs(off2)>0.0001) for(let i of visIdx) displayLineYs[i]+=off2;
  let maxStep=max(1.2,introLineH*0.22);
  for (let i of visIdx) {
    let target=displayLineYs[i];
    if(stableLineYs[i]===undefined){stableLineYs[i]=target;}
    else{let prev=stableLineYs[i];stableLineYs[i]=constrain(lerp(prev,target,LINE_Y_SMOOTH),prev-maxStep,prev+maxStep);}
    displayLineYs[i]=stableLineYs[i];
  }
  for(let i=0;i<lines.length;i++) if(lines[i].gone) stableLineYs[i]=undefined;
}

function resolveLineGapPass(visIdx, minGap, maxPush, iter=1) {
  for (let p=0;p<iter;p++) {
    for (let k=1;k<visIdx.length;k++) {
      let up=visIdx[k-1],lo=visIdx[k];
      let gap=minBentGapBetweenLines(displayLineYs[up],displayLineYs[lo]);
      if(gap<minGap){let push=min(minGap-gap,maxPush);displayLineYs[up]-=push*0.5;displayLineYs[lo]+=push-push*0.5;}
    }
  }
}

function getDisplayLineY(i) { return displayLineYs[i]!==undefined?displayLineYs[i]:lines[i].y; }

// --------------------------------------------
// CIRCLE-TEXT SEPARATION
// --------------------------------------------
function resolveCircleTextSeparation() {
  if (!circles.length) return;
  let tL=introMarginX, tR=introMarginX+introMaxWidth;
  for (let c of circles) {
    if(c.isAppearing||c.fixed) continue;
    let extra=c.isLetterCell?introLineH*LETTER_CELL_TEXT_EXTRA_CLEARANCE_MUL:0;
    let need=c.cr+TEXT_CIRCLE_CLEARANCE+extra;
    let xMin=max(tL,c.x-need), xMax=min(tR,c.x+need);
    if(xMax<=xMin) continue;
    let pushX=0,pushY=0,hits=0;
    for(let i=0;i<lines.length;i++){
      if(lines[i].gone) continue;
      let baseY=getDisplayLineY(i);
      if(abs(baseY-c.y)>need+introLineH*TEXT_SEP_MAX_LINE_Y_DIST_MUL) continue;
      let stepW=c.isLetterCell?max(5,need*0.32):max(10,need*0.55);
      let segN=max(4,int((xMax-xMin)/stepW));
      for(let s=0;s<=segN;s++){
        let px=lerp(xMin,xMax,s/segN),py=getBentYAtXExceptCircle(px,baseY,c);
        let dx=c.x-px,dy=c.y-py,d=sqrt(dx*dx+dy*dy);
        if(d>=need) continue;
        if(d<0.0001){dx=0;dy=(c.y>=py)?1:-1;d=1;}
        let ov=need-d; pushX+=(dx/d)*ov; pushY+=(dy/d)*ov; hits++;
      }
    }
    if(hits>0){
      let mx=pushX/hits,my=pushY/hits,m=sqrt(mx*mx+my*my);
      if(m<TEXT_SEP_DEADZONE) continue;
      let gain=c.isLetterCell?LETTER_CELL_TEXT_SEP_GAIN:0.42;
      let sMax=c.isLetterCell?TEXT_SEP_MAX_STEP*LETTER_CELL_TEXT_SEP_STEP_MUL:TEXT_SEP_MAX_STEP;
      let step=min(sMax,m*gain); mx=(mx/m)*step; my=(my/m)*step;
      c.x+=mx;c.y+=my;c.vx=c.vx*0.84+mx*0.008;c.vy=c.vy*0.84+my*0.008;
      c.x=constrain(c.x,c.cr+2,width-c.cr-2);c.y=constrain(c.y,c.cr+2,height-c.cr-2);
    }
  }
}

function minBentGapBetweenLines(uY,lY) {
  let s=circles.length>0?12:18, minG=Infinity;
  for(let i=0;i<=s;i++){let x=lerp(introMarginX,introMarginX+introMaxWidth,i/s);minG=min(minG,getBentYAtX(x,lY)-getBentYAtX(x,uY));}
  return minG;
}

// --------------------------------------------
// DRAW TEXT
// --------------------------------------------
function drawIntroText() {
  textSize(introFontSize); textAlign(LEFT,CENTER); noStroke();
  textStyle(ui.fontWeight >= 500 ? BOLD : NORMAL);
  let hoverHit=pickWordHit(mouseX,mouseY);
  let visIdx=[]; for(let i=0;i<lines.length;i++) if(!lines[i].gone) visIdx.push(i);
  let lastVis=visIdx.length?visIdx[visIdx.length-1]:-1;
  for(let i=0;i<lines.length;i++){
    let L=lines[i]; if(L.gone) continue;
    let baseY=getDisplayLineY(i), justify=(i!==lastVis);
    if(hoverHit&&hoverHit.lineIndex===i)
      drawHoverHighlight({x:hoverHit.wordX,w:hoverHit.wordW,wordIdx:hoverHit.wordIdx},baseY);
    drawBentTextLine(L,introMarginX,baseY,justify);
  }
  textStyle(NORMAL); // reset
}

// Hover highlight uses circle accent hue
function drawHoverHighlight(seg, baseY) {
  let cx=seg.x+seg.w*0.5, bW=seg.w+introFontSize*0.42, bH=introFontSize*0.98;
  let left=cx-bW*0.5, right=cx+bW*0.5;
  let segN=max(12,int(bW/7));
  push();
  let c=hoverHighlightColor(seg.wordIdx||0); noStroke(); fill(c);
  beginShape();
  for(let s=0;s<=segN;s++){let x=lerp(left,right,s/segN);vertex(x,getBentYAtX(x,baseY)-bH*0.52);}
  for(let s=segN;s>=0;s--){let x=lerp(left,right,s/segN);vertex(x,getBentYAtX(x,baseY)+bH*0.48);}
  endShape(CLOSE); pop();
}

function getUnderlineY(baseY){return baseY+introLineH*UNDERLINE_OFFSET_RATIO;}

function normalizeKeywordToken(t){
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/^[^a-z0-9]+|[^a-z0-9]+$/g,"");
}
function isFixedHighlightKeyword(t){return FIXED_HIGHLIGHT_KEYWORDS.has(normalizeKeywordToken(t));}

function computeLineWordLayout(lineObj, justify=false){
  let words=(lineObj&&lineObj.words)?lineObj.words.slice():String(lineObj?.text||"").split(/\s+/).filter(Boolean);
  if(!words.length) return [];

  let spW=textWidth(" ");

  // Calculate widths with current letter-spacing
  let tWs=words.map(w=>textWidth(w)+ui.letterSpacing*max(0,w.length-1));
  let natW=tWs.reduce((a,b)=>a+b,0)+spW*max(0,words.length-1);

  // Calculate optimal letter-spacing to fit within margins
  let optimalLS = ui.letterSpacing;
  let availableWidth = introMaxWidth - MARGIN_SAFETY_BUFFER * 2;

  if (natW > availableWidth && words.length > 1) {
    // Text is too wide - need to tighten letter-spacing
    let textWidthWithoutLS = words.reduce((sum,w)=>sum+textWidth(w),0) + spW*(words.length-1);
    let totalLetters = words.join("").length;
    if (textWidthWithoutLS < availableWidth) {
      optimalLS = (availableWidth - textWidthWithoutLS) / max(1, totalLetters - words.length);
      optimalLS = constrain(optimalLS, TEXT_MIN_LETTER_SPACING, ui.letterSpacing);
    } else {
      // Even with minimum spacing, text is too long - use minimum allowed
      optimalLS = TEXT_MIN_LETTER_SPACING;
    }
  } else if (natW < availableWidth && justify && words.length > 1) {
    // Text is narrower - can widen letter-spacing for justification
    let textWidthWithoutLS = words.reduce((sum,w)=>sum+textWidth(w),0) + spW*(words.length-1);
    let totalLetters = words.join("").length;
    optimalLS = (availableWidth - textWidthWithoutLS) / max(1, totalLetters - words.length);
    optimalLS = constrain(optimalLS, ui.letterSpacing, TEXT_MAX_LETTER_SPACING);
  }

  // Recalculate widths with optimal letter-spacing
  tWs = words.map(w=>textWidth(w)+optimalLS*max(0,w.length-1));
  natW = tWs.reduce((a,b)=>a+b,0)+spW*max(0,words.length-1);

  // Calculate inter-word gaps (ensure text still fits within margins)
  let gapE=0;
  if(justify&&words.length>1) {
    let requiredGap = (availableWidth - natW) / (words.length - 1);
    gapE = max(0, requiredGap);
  }

  let layout=[],x=introMarginX + MARGIN_SAFETY_BUFFER;
  for(let i=0;i<words.length;i++){
    layout.push({token:words[i],x,w:tWs[i],letterSpacing:optimalLS});
    x+=tWs[i];
    if(i<words.length-1)x+=spW+gapE;
  }

  // Ensure layout doesn't exceed right margin
  if (layout.length > 0) {
    let lastWord = layout[layout.length - 1];
    let rightEdge = lastWord.x + lastWord.w;
    if (rightEdge > introMarginX + introMaxWidth - MARGIN_SAFETY_BUFFER) {
      // Adjust all positions to fit within margin
      let overflow = rightEdge - (introMarginX + introMaxWidth - MARGIN_SAFETY_BUFFER);
      for (let item of layout) {
        item.x -= overflow;
      }
    }
  }

  return layout;
}

function drawBentTextLine(lineObj,bX,baseY,justify=false){
  fill(textBodyColor()); // always black
  let layout=computeLineWordLayout(lineObj,justify);
  if(!layout.length) return;

  for(let k=0;k<layout.length;k++){
    let x=layout[k].x;
    let letterSpacing = layout[k].letterSpacing !== undefined ? layout[k].letterSpacing : ui.letterSpacing;
    let chars = layout[k].token;
    for(let j=0; j<chars.length; j++){
      let ch = chars[j];
      let cw=textWidth(ch);
      text(ch,x,getBentYAtX(x+cw*0.5,baseY));
      x+=cw;
      // Only add letter-spacing between characters, not after the last one
      if(j < chars.length - 1) x += letterSpacing;
    }
  }
}

// --------------------------------------------
// BENT-Y
// --------------------------------------------
function getBentYAtX(x,baseY){
  let key=int(x*2)+"|"+int(baseY*2);
  if(bentYCache.has(key)) return bentYCache.get(key);
  let out=getBentYAtXExceptCircle(x,baseY,null);
  bentYCache.set(key,out); return out;
}

function getBentYAtXExceptCircle(x,baseY,ignoreC){
  let outY=baseY, maxShift=introLineH*TEXT_BEND_MAX_SHIFT_MUL;
  for(let pass=0;pass<4;pass++){
    for(let c of circles){
      if(ignoreC&&c===ignoreC) continue;
      let bs=c.isLetterCell?0.75:1.0, rr=c.cr+TEXT_BEND_MARGIN*bs, dx=x-c.x;
      let sR=rr*TEXT_BEND_SOFT_RADIUS_MUL*(c.isLetterCell?0.85:1.0);
      if(abs(dx)<sR){
        let tx=1-abs(dx)/sR, ty=exp(-abs(baseY-c.y)/max(1,introLineH*TEXT_BEND_SOFT_Y_FALLOFF));
        outY+=(baseY<=c.y?-1:1)*introLineH*TEXT_BEND_SOFT_STRENGTH*tx*ty*bs;
      }
      if(abs(dx)>=rr) continue;
      let hc=sqrt(max(0,rr*rr-dx*dx)), lc=TEXT_LINE_CIRCLE_CLEARANCE*(c.isLetterCell?0.75:1.0);
      let top=c.y-hc-lc, bot=c.y+hc+lc;
      if(outY>top&&outY<bot) outY=lerp(outY,(baseY<=c.y)?top:bot,TEXT_BEND_STRENGTH);
    }
  }
  return constrain(constrain(outY,baseY-maxShift,baseY+maxShift),12,height-12);
}

// --------------------------------------------
// MOUSE
// --------------------------------------------
function mousePressed(){ lastActivityTime = millis();
  let hi=pickSplittableCircleIndex(mouseX,mouseY);
  if(hi!==-1){splitCircleIntoLettersBalloon(hi);return;}
  if(!allConverted){
    let hit=pickWordHit(mouseX,mouseY);
    if(hit){
      if(FREEZE_TEXT_POSITIONS_ON_NEW_CLICK) freezeCurrentTextLayout();
      if(FREEZE_PREVIOUS_CIRCLES_ON_NEW_CLICK) freezeExistingCircles();
      convertWordToCircle(hit.lineIndex,hit.wordIndex,hit.anchorY,hit.wordX,hit.wordW);
      removeWordFromLine(hit.lineIndex,hit.wordIndex);
      allConverted=lines.every(l=>l.gone);
    }
  }
}

function freezeExistingCircles(){for(let c of circles){if(c.isAppearing)continue;c.fixed=true;c.vx=0;c.vy=0;}}
function freezeCurrentTextLayout(){
  for(let i=0;i<lines.length;i++){if(lines[i].gone)continue;lines[i].y=getDisplayLineY(i);stableLineYs[i]=lines[i].y;}
}

function pickWordHit(mx,my){
  textSize(introFontSize); textAlign(LEFT,CENTER);
  let visIdx=[]; for(let i=0;i<lines.length;i++) if(!lines[i].gone) visIdx.push(i);
  let lastVis=visIdx.length?visIdx[visIdx.length-1]:-1;
  for(let i=0;i<lines.length;i++){
    let L=lines[i]; if(L.gone||!L.words||!L.words.length) continue;
    let layout=computeLineWordLayout(L,i!==lastVis);
    if(!layout.length) continue;
    let lineY=getDisplayLineY(i);
    for(let k=0;k<layout.length;k++){
      if(!cleanWord(layout[k].token).length) continue;
      let tX=layout[k].x, tW=layout[k].w;
      let y=getBentYAtX(tX+tW*0.5,lineY);
      if(mx>=tX&&mx<=tX+tW&&my>=y-introLineH*0.55&&my<=y+introLineH*0.55){
        let wIdx=(lines[i].wordIdxOffset||0)+k;
        return{lineIndex:i,wordIndex:k,anchorY:lineY,wordX:tX,wordW:tW,wordIdx:wIdx};
      }
    }
  }
  return null;
}

function removeWordFromLine(li,wi){
  let L=lines[li]; if(!L||!L.words||wi<0||wi>=L.words.length) return;
  L.words[wi]=L.words[wi].replace(/[^\s]/g," ");
  L.text=L.words.join(" ");
  L.gone=!L.words.some(w=>cleanWord(w).length>0);
}

function pickSplittableCircleIndex(mx,my){
  for(let i=circles.length-1;i>=0;i--){
    let c=circles[i]; if(c.isAppearing||c.isLetterCell) continue;
    if(dist(mx,my,c.x,c.y)<=c.cr+2) return i;
  }
  return -1;
}

// --------------------------------------------
// WORD → CIRCLE
// --------------------------------------------
function convertWordToCircle(li,wi,anchorY,wordX,wordW){
  if(circles.length>=MAX_CIRCLES) return;
  let L=lines[li]; if(!L||!L.words||wi<0||wi>=L.words.length) return;
  textSize(introFontSize); textAlign(LEFT,CENTER);
  let raw=L.words[wi], word=cleanWord(raw);
  if(!word.length) return;
  let wIdx=(L.wordIdxOffset||0)+wi;
  let wHue=wordHues[wIdx%max(1,wordHues.length)]||0;
  let cx=wordX+wordW*0.5+random(-3,3), cy=anchorY+random(-10,10);
  let ss=map(word.length,1,12,0.9,1.02,true)*random(0.9,1.0);
  let eR=estimateWordRadius(word);
  cx=constrain(cx,eR+6,width-eR-6); cy=constrain(cy,eR+6,height-eR-6);
  let sX=wordX+wordW*0.5+random(-6,6), sY=getUnderlineY(anchorY)+random(-2,2);
  circles.push(makeWordCircle(word,cx,cy,wHue,null,sX,sY,ss));
}

function estimateWordRadius(w){return constrain(13+max(1,w.length)*3.6,28,58);}
function cleanWord(w){return w.replace(/^[\s"'""''\(\)\[\]\{\}]+|[\s"'""''\(\)\[\]\{\}\.,;:!?]+$/g,"");}

// --------------------------------------------
// CIRCLE FACTORY
// --------------------------------------------
function makeWordCircle(word,x,y,bOut,bIn,srcX,srcY,ss=1){
  let len=max(1,word.length);
  let r=constrain((11+len*4.8)*ss,22,90);
  let ringW=random(4.8,map(r,22,90,8.7,16.2,true));
  let cr=r+ringW*0.5;
  // wordHue is passed in via bOut which we repurpose as a hue number in this version
  let wh = (typeof bOut === "number") ? bOut : random(360);
  let oCol=color(200,200,200,200); // unused but kept for compat
  let iCol=color(100,100,100,170);
  let ts=constrain(introFontSize*0.92,10,introFontSize*1.05);
  let ang=random(TWO_PI),spd=random(0.2,0.9);
  let hasSrc=srcX!==undefined&&srcY!==undefined;
  let sR=max(3,ringW*0.55);
  let obj={
    x:hasSrc?srcX:x,y:hasSrc?srcY:y,r:hasSrc?sR:r,ringW,cr:hasSrc?sR+ringW*0.5:cr,
    outerCol:oCol,innerCol:iCol,ts,vx:cos(ang)*spd,vy:sin(ang)*spd,
    fixed:false,letters:[],word,isLetterCell:false,cd:0,pinch:null,
    wordHue:wh,
    isAppearing:hasSrc,appearT:hasSrc?0:1,
    appearSpeed:hasSrc?(1/UNDERLINE_TO_CIRCLE_FRAMES)*random(1.0,1.25):1,
    startX:hasSrc?srcX:x,startY:hasSrc?srcY:y,startR:hasSrc?sR:r,
    targetX:x,targetY:y,targetR:r,spinAngle:random(TWO_PI),spinSpeed:LETTER_ORBIT_SPEED
  };
  buildLetters(obj,word); return obj;
}

// --------------------------------------------
// RENDER
// --------------------------------------------
function drawNormalCircle(c){
  let hov=dist(mouseX,mouseY,c.x,c.y)<=c.r+6;
  let wh=c.wordHue!==undefined?c.wordHue:200;
  drawRing(c.x,c.y,c.r,c.ringW,hov,1,c.isLetterCell,wh);
  noStroke();
  fill(18,18,18,230);
  textAlign(CENTER,CENTER); textSize(c.ts);
  for(let L of c.letters) text(L.ch,c.x+L.lx,c.y+L.ly);
}

function drawPinchedBalloon(c){
  let hov=dist(mouseX,mouseY,c.x,c.y)<=c.r+10;
  let t=c.pinch.t,nx=c.pinch.nx,ny=c.pinch.ny;
  let sep=c.r*0.95*t,lobeR=c.r*(1-0.18*t);
  let ax=c.x+nx*sep*0.5,ay=c.y+ny*sep*0.5,bx=c.x-nx*sep*0.5,by=c.y-ny*sep*0.5;
  drawRing(ax,ay,lobeR,c.ringW,hov,1,false);
  drawRing(bx,by,lobeR,c.ringW,hov,-1,false);
  drawRing(c.x,c.y,max(6,c.r*(0.28*(1-t))+4),max(4,c.ringW*0.45),hov,1,false);
  noStroke(); fill(textBodyColor()); textAlign(CENTER,CENTER); textSize(c.ts);
  let pull=1-0.7*t;
  for(let L of c.letters){
    let proj=L.lx*nx+L.ly*ny, cx2=(proj>=0)?ax:bx, cy2=(proj>=0)?ay:by;
    text(L.ch,cx2+L.lx*pull,cy2+L.ly*pull);
  }
}

// Each circle carries its own hue stored in c.wordHue
function hueToOuterCol(hue) {
  colorMode(HSB, 360, 100, 100, 255);
  let c = color(hue, 62, 88, 200);
  colorMode(RGB, 255, 255, 255, 255);
  return c;
}
function hueToInnerCol(hue) {
  colorMode(HSB, 360, 100, 100, 255);
  let c = color(hue, 78, 38, 170);
  colorMode(RGB, 255, 255, 255, 255);
  return c;
}

function drawGradientRing(cx, cy, r, colOuter, colInner, ringW) {
  let ring = max(1.2, ringW), steps = max(10, int(map(ring, 3, 12, 14, 30)));
  let outerR = r, innerR = max(0.5, r - ring);
  noFill(); strokeWeight(max(1, ring / steps) * 1.15);
  for (let i = 0; i < steps; i++) {
    let t = i / max(1, steps - 1), col = lerpColor(colOuter, colInner, t);
    col.setAlpha(lerp(alpha(col), alpha(col) * 0.75, t));
    stroke(col); circle(cx, cy, lerp(outerR, innerR, t) * 2);
  }
  noStroke();
}

function drawRing(cx,cy,r,ringW,isTurning=false,turnDir=1,isLetterCell=false,wordHue=200){
  let colOuter = hueToOuterCol(wordHue);
  let colInner = hueToInnerCol(wordHue);
  drawGradientRing(cx, cy, r, colOuter, colInner, ringW);
}

// --------------------------------------------
// LETTERS
// --------------------------------------------
function buildLetters(c,word){
  c.letters=[];
  let il=c.r-c.ringW-c.ts*0.5;
  for(let ch of Array.from(word)){
    let a=random(TWO_PI),rr=sqrt(random())*max(4,il);
    c.letters.push({ch,lx:cos(a)*rr,ly:sin(a)*rr,vx:random(-0.8,0.8),vy:random(-0.8,0.8),rad:c.ts*0.35});
  }
}

function updateLettersInCircle(c){
  if(readableAlignMode){alignLettersReadable(c);return;}
  if(!c.letters||!c.letters.length) return;
  if(c.spinAngle===undefined)c.spinAngle=random(TWO_PI);
  if(c.spinSpeed===undefined)c.spinSpeed=LETTER_ORBIT_SPEED;
  c.spinAngle+=c.spinSpeed;
  let n=c.letters.length,oR=max(2,c.r-c.ringW-c.ts*0.65);
  for(let i=0;i<n;i++){
    let L=c.letters[i],a=c.spinAngle+(TWO_PI*i)/n-HALF_PI;
    L.lx=lerp(L.lx,cos(a)*oR,0.32);L.ly=lerp(L.ly,sin(a)*oR,0.32);L.vx*=0.4;L.vy*=0.4;
  }
}

function alignLettersReadable(c){
  if(!c.letters||!c.letters.length) return;
  let il=max(8,c.r-c.ringW-c.ts*0.5-2);
  textSize(c.ts);textAlign(CENTER,CENTER);
  let ws=c.letters.map(L=>max(2,textWidth(L.ch))),tw=ws.reduce((a,b)=>a+b,0),gap=c.ts*0.2;
  let span=tw+gap*(c.letters.length-1),fit=span>il*1.75?(il*1.75)/span:1;
  let x=-(span*fit)*0.5;
  for(let i=0;i<c.letters.length;i++){
    let L=c.letters[i],w=ws[i]*fit;
    L.lx=lerp(L.lx,x+w*0.5,READABLE_ALIGN_LERP);L.ly=lerp(L.ly,0,READABLE_ALIGN_LERP);
    L.vx*=0.7;L.vy*=0.7;x+=w+gap*fit;
  }
}

// --------------------------------------------
// COLLISIONS
// --------------------------------------------
function solveCircleCollisions(){
  if(LOCK_CIRCLES_AFTER_CREATION) return;
  for(let i=0;i<circles.length;i++){
    for(let j=i+1;j<circles.length;j++){
      let a=circles[i],b=circles[j];
      if(a.isAppearing||b.isAppearing||a.fixed&&b.fixed) continue;
      let dx=b.x-a.x,dy=b.y-a.y,d=sqrt(dx*dx+dy*dy),minD=(a.cr+b.cr)+GAP;
      if(d<minD&&d>0){
        let nx=dx/d,ny=dy/d,corr=max(0,(minD-d)-COLL_SLOP)*COLL_POS_CORRECTION;
        if(corr>0){
          if(!a.fixed&&!b.fixed){a.x-=nx*corr*0.5;a.y-=ny*corr*0.5;b.x+=nx*corr*0.5;b.y+=ny*corr*0.5;}
          else if(a.fixed){b.x+=nx*corr;b.y+=ny*corr;}else{a.x-=nx*corr;a.y-=ny*corr;}
        }
        if(!a.fixed){a.vx*=0.85;a.vy*=0.85;} if(!b.fixed){b.vx*=0.85;b.vy*=0.85;}
      }
    }
  }
}

// --------------------------------------------
// PINCH
// --------------------------------------------
function handleMousePinch(){
  if(dist(mouseX,mouseY,pmouseX,pmouseY)<0.5||circles.length>=MAX_CIRCLES) return;
  circles.sort((a,b)=>b.r-a.r);
  for(let i=0;i<circles.length;i++){
    let c=circles[i];if(c.isLetterCell||c.isAppearing||c.pinch||(c.cd&&c.cd>0)) continue;
    if(distPointToSegment(c.x,c.y,pmouseX,pmouseY,mouseX,mouseY)<=c.cr+2){startPinch(i);break;}
  }
}
function startPinch(idx){
  let c=circles[idx];if(c.pinch) return;
  let mx=mouseX-pmouseX,my=mouseY-pmouseY,ml=sqrt(mx*mx+my*my);
  if(ml<0.0001) return; mx/=ml;my/=ml;
  c.pinch={nx:-my,ny:mx,t:0,hold:0};c.cd=COOLDOWN;
}
function updatePinches(){
  let ts=[];
  for(let i=0;i<circles.length;i++){let c=circles[i];if(!c.pinch)continue;c.pinch.t=min(1,c.pinch.t+PINCH_SPEED);if(c.pinch.t>=1){c.pinch.hold++;if(c.pinch.hold>=PINCH_HOLD)ts.push(i);}}
  for(let k=ts.length-1;k>=0;k--) splitCircleIntoLettersBalloon(ts[k]);
}

// --------------------------------------------
// SPLIT → LETTER CELLS
// --------------------------------------------
function splitCircleIntoLettersBalloon(idx){
  let p=circles[idx];if(!p.word) return;
  let chars=Array.from(p.word).slice(0,LETTER_MAX_PER_SPLIT);
  if(chars.length<=1){p.pinch=null;return;}
  if(circles.length+(chars.length-1)>=MAX_CIRCLES){p.pinch=null;return;}
  let bTs=constrain(p.ts*0.9,12,36),den=constrain(map(chars.length,2,10,1.15,0.85),0.8,1.2);
  let bR=max(CHILD_R_MIN*0.78,(bTs*0.9+2)*den),spR=p.r*0.55;
  circles.splice(idx,1);
  for(let k=0;k<chars.length;k++){
    let a=random(TWO_PI),rr=sqrt(random())*spR,ox=cos(a)*rr,oy=sin(a)*rr;
    let dirx=ox/max(rr,0.001),diry=oy/max(rr,0.001),push=random(0.7,1.8)+map(p.r,60,170,0.0,0.6);
    let lc=color(200,200,200,200);
    let obj={
      x:p.x+ox,y:p.y+oy,r:bR,ringW:0,cr:bR,outerCol:lc,innerCol:lc,ts:bTs,
      vx:p.vx+dirx*push+random(-0.18,0.18),vy:p.vy+diry*push+random(-0.18,0.18),
      letters:[],word:chars[k],isLetterCell:true,flatGray:false,
      wordHue:p.wordHue!==undefined?p.wordHue:random(360),
      cd:COOLDOWN,pinch:null,spinAngle:random(TWO_PI),spinSpeed:LETTER_ORBIT_SPEED
    };
    buildLetters(obj,obj.word);circles.push(obj);
  }
}

// --------------------------------------------
// HELPERS
// --------------------------------------------
function updateCircleAppearances(){
  for(let c of circles){
    if(!c.isAppearing) continue;
    c.appearT=min(1,c.appearT+c.appearSpeed);
    let t=easeOutCubic(c.appearT);
    c.x=lerp(c.startX,c.targetX,t);c.y=lerp(c.startY,c.targetY,t);
    c.r=lerp(c.startR,c.targetR,t);c.cr=c.r+c.ringW*0.5;
    if(c.appearT>=1){c.isAppearing=false;c.x=c.targetX;c.y=c.targetY;c.r=c.targetR;c.cr=c.r+c.ringW*0.5;}
  }
}
function easeOutCubic(t){let k=constrain(t,0,1);return 1-pow(1-k,3);}
function distPointToSegment(px,py,x1,y1,x2,y2){
  let vx=x2-x1,vy=y2-y1,vv=vx*vx+vy*vy;
  if(vv<0.000001) return dist(px,py,x1,y1);
  let t=constrain(((px-x1)*vx+(py-y1)*vy)/vv,0,1);
  return dist(px,py,x1+t*vx,y1+t*vy);
}
function tweakColor(c,amt){
  let r0=red(c),g0=green(c),b0=blue(c);
  let isG=abs(r0-g0)<=2&&abs(g0-b0)<=2&&abs(r0-b0)<=2;
  if(isG){let v=constrain((r0+g0+b0)/3+random(-amt,amt),0,255);return color(v,v,v,alpha(c));}
  return color(constrain(r0+random(-amt,amt),0,255),constrain(g0+random(-amt,amt),0,255),constrain(b0+random(-amt,amt),0,255),alpha(c));
}

// --------------------------------------------
// KEYS + RESET
// --------------------------------------------
function mouseMoved(){ lastActivityTime = millis(); }
function mouseClicked(){ lastActivityTime = millis(); }

function keyPressed(){ lastActivityTime = millis();
  if(key==="r"||key==="R"){readableAlignMode=!readableAlignMode;return;}
  if(key==="s"||key==="S"){saveCanvas("sketch","png");return;}
  if(key==="e"||key==="E"){exportA0HighRes();return;}
  if(key==="x"||key==="X") randomiseAndReset();
}

function randomiseAndReset(){
  circles=[];allConverted=false;displayLineYs=[];stableLineYs=[];readableAlignMode=false;
  lastActivityTime = millis();

  // Randomise every ui parameter
  ui.fontSize      = random(16, 52);
  ui.lineHeight    = random(1.1, 3.2);
  ui.paletteSat    = random(0.45, 0.95);
  ui.paletteLight  = random(0.35, 0.65);
  ui.bgHue         = random(0, 360);
  ui.bgSat         = random(0.0, 0.12);
  ui.bgLight       = random(0.88, 0.98);
  ui.fontFamily    = random(AVAILABLE_FONTS);

  currentBaseFontSize     = ui.fontSize;
  INTRO_LINE_HEIGHT_RATIO = ui.lineHeight;
  textFont(ui.fontFamily);

  // Sync every registered slider DOM element
  for (let ref of sliderRefs) {
    let v = ui[ref.key];
    ref.sl.value(v);
    ref.valD.html(ref.fmt(v) + ref.unit);
  }

  // Sync font selector
  let fontsel = document.querySelector("select");
  if (fontsel) fontsel.value = ui.fontFamily;

  buildIntroLines();
}

function exportA0HighRes() {
  // A0 dimensions: 841mm x 1189mm at 300 DPI = 9921 x 14043 pixels
  let exportWidth = 9921;
  let exportHeight = 14043;
  let origWidth = width;
  let origHeight = height;

  // Create high-res canvas
  resizeCanvas(exportWidth, exportHeight);
  pixelDensity(1);
  background(255);

  // Scale all drawing parameters
  let scale = exportWidth / origWidth;
  introMarginX *= scale;
  introTopY *= scale;
  introLineH *= scale;
  introFontSize *= scale;

  // Redraw everything at high resolution
  bentYCache.clear();
  drawIntroText();
  for (let c of circles) {
    if (c.isAppearing) continue;
    updateLettersInCircle(c);
  }
  for (let c of circles) {
    drawNormalCircle(c);
  }

  // Save the high-res image
  saveCanvas("sketch_A0_300dpi", "png");

  // Restore original canvas
  introMarginX /= scale;
  introTopY /= scale;
  introLineH /= scale;
  introFontSize /= scale;
  resizeCanvas(origWidth, origHeight);
  pixelDensity(2);
}
