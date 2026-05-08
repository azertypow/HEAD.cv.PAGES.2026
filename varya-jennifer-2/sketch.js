let regions = [];
let splitVertical = true;
let tasks = [];
let table;

// A0 at 150 DPI
const EXPORT_W = 4967;
const EXPORT_H = 7022;

function preload() {
  let url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRKTYYwsPFMhGOETM3oTtlvDKN_WWJuRqcZ3B-gY7ssrq7k7AfQHT3HtlsAzqCLbZ44Blv_kJ7dq-Qb/pub?output=csv";
  table = loadTable(url, "csv", "header");
}

function setup() {
  createCanvas(560, 792);
  textFont("Arial Black");
  textAlign(LEFT, TOP);
  for (let r = 0; r < table.getRowCount(); r++) {
    let task = table.getString(r, 0).trim();
    if (task !== "") tasks.push(task);
  }
  regions.push(makeRegion(0, 0, width, height));
}

function draw() {
  background(255);
  for (let r of regions) {
    stroke(0); strokeWeight(1); noFill();
    rect(r.x, r.y, r.w, r.h);
    drawFittedText(r.text, r.x, r.y, r.w, r.h);
  }
}

function mousePressed() {
  for (let i = regions.length - 1; i >= 0; i--) {
    let r = regions[i];
    if (mouseX > r.x && mouseX < r.x + r.w && mouseY > r.y && mouseY < r.y + r.h) {
      regions.splice(i, 1);
      if (splitVertical) {
        regions.push(makeRegion(r.x, r.y, mouseX - r.x, r.h));
        regions.push(makeRegion(mouseX, r.y, r.x + r.w - mouseX, r.h));
      } else {
        regions.push(makeRegion(r.x, r.y, r.w, mouseY - r.y));
        regions.push(makeRegion(r.x, mouseY, r.w, r.y + r.h - mouseY));
      }
      splitVertical = !splitVertical;
      break;
    }
  }
}

function makeRegion(x, y, w, h) {
  return { x, y, w, h, text: random(tasks) };
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    exportA0();
  }
}

function exportA0() {
  // Scale factor from screen canvas to A0
  let scaleX = EXPORT_W / width;
  let scaleY = EXPORT_H / height;

  // Create an off-screen graphics buffer at A0 resolution
  let pg = createGraphics(EXPORT_W, EXPORT_H);
  pg.pixelDensity(1);
  pg.textFont("Arial Black");
  pg.textAlign(LEFT, TOP);
  pg.background(255);

  for (let r of regions) {
    // Map each region from screen coords to A0 coords
    let rx = r.x * scaleX;
    let ry = r.y * scaleY;
    let rw = r.w * scaleX;
    let rh = r.h * scaleY;

    pg.stroke(0);
    pg.strokeWeight(1);
    pg.noFill();
    pg.rect(rx, ry, rw, rh);

    drawFittedTextPG(pg, r.text, rx, ry, rw, rh);
  }

  // Save the buffer as PNG
  pg.save('poster_A0_150dpi.jpg');
  pg.remove();
}

// ─── Main entry ───────────────────────────────────────────────────────────────
function drawFittedText(txt, x, y, w, h) {
  fill(0); noStroke();
  textAlign(LEFT, TOP);

  let bestSize = 1;
  let bestLines = [txt];

  for (let numLines = 1; numLines <= txt.split(" ").length; numLines++) {
    let lines = splitIntoLines(txt, numLines);
    let size  = fitFontSize(lines, w, h);
    if (size > bestSize) {
      bestSize  = size;
      bestLines = lines;
    }
  }

  let lineH = h / bestLines.length;
  textSize(bestSize);

  for (let i = 0; i < bestLines.length; i++) {
    stretchLineFillSpace(bestLines[i], x, y + i * lineH, w, lineH);
  }
}

// ─── Version of drawFittedText that works on a p5.Graphics buffer ─────────────
function drawFittedTextPG(pg, txt, x, y, w, h) {
  pg.fill(0); pg.noStroke();
  pg.textAlign(LEFT, TOP);

  let bestSize = 1;
  let bestLines = [txt];

  for (let numLines = 1; numLines <= txt.split(" ").length; numLines++) {
    let lines = splitIntoLines(txt, numLines);
    let size  = fitFontSizePG(pg, lines, w, h);
    if (size > bestSize) {
      bestSize  = size;
      bestLines = lines;
    }
  }

  let lineH = h / bestLines.length;
  pg.textSize(bestSize);

  for (let i = 0; i < bestLines.length; i++) {
    stretchLineFillSpacePG(pg, bestLines[i], x, y + i * lineH, w, lineH);
  }
}

// ─── Font size fitting ────────────────────────────────────────────────────────
function fitFontSize(lines, w, h) {
  let lo = 1, hi = h / lines.length;
  for (let iter = 0; iter < 20; iter++) {
    let mid = (lo + hi) / 2;
    textSize(mid);
    let fits = lines.every(l => textWidth(l) <= w * 1.5);
    if (fits) lo = mid; else hi = mid;
  }
  return lo;
}

function fitFontSizePG(pg, lines, w, h) {
  
  let lo = 1, hi = h / lines.length;
  for (let iter = 0; iter < 20; iter++) {
    let mid = (lo + hi) / 2;
    pg.textSize(mid);
    let fits = lines.every(l => pg.textWidth(l) <= w * 1.5);
    if (fits) lo = mid; else hi = mid;
  }
  return lo;
}

// ─── Split text into n balanced lines ────────────────────────────────────────
function splitIntoLines(txt, n) {
  if (n === 1) return [txt];
  let words = txt.split(" ");
  if (words.length < n) return [txt];
  let lines = [];
  let perLine = Math.ceil(words.length / n);
  for (let i = 0; i < n; i++) {
    lines.push(words.slice(i * perLine, (i + 1) * perLine).join(" "));
  }
  return lines.filter(l => l.length > 0);
}

// ─── Space-filling per-character stretch (main canvas) ───────────────────────
function stretchLineFillSpace(txt, x, y, w, h) {
  textSize(h);
  let chars = txt.split("");
  let n = chars.length;
  if (n === 0) return;

  let nw = chars.map(c => max(textWidth(c), 0.5));
  let totalNatural = nw.reduce((a, b) => a + b, 0);
  let surplus = w - totalNatural;
  let tw = nw.slice();

  if (surplus > 0) {
    let widths = tw.slice();
    let levels = [...new Set(widths)].sort((a, b) => a - b);
    for (let li = 0; li < levels.length - 1 && surplus > 0; li++) {
      let floor = levels[li];
      let ceil  = levels[li + 1];
      let eligible = widths.filter(w => w <= floor + 0.001).length;
      let needed = eligible * (ceil - floor);
      if (needed <= surplus) {
        for (let i = 0; i < n; i++) {
          if (widths[i] <= floor + 0.001) widths[i] = ceil;
        }
        surplus -= needed;
      } else {
        let partialLift = surplus / eligible;
        for (let i = 0; i < n; i++) {
          if (widths[i] <= floor + 0.001) widths[i] += partialLift;
        }
        surplus = 0;
      }
    }
    if (surplus > 0) {
      let perChar = surplus / n;
      widths = widths.map(w => w + perChar);
    }
    tw = widths;
  } else if (surplus < 0) {
    let scale = w / totalNatural;
    tw = nw.map(v => v * scale);
  }

  push();
  translate(x, y);
  let cursorX = 0;
  for (let i = 0; i < n; i++) {
    let sx = tw[i] / nw[i];
    push();
    translate(cursorX, 0);
    scale(sx, 1);
    fill(0); noStroke();
    text(chars[i], 0, 0);
    pop();
    cursorX += tw[i];
  }
  pop();
}

// ─── Space-filling per-character stretch (p5.Graphics buffer) ────────────────
function stretchLineFillSpacePG(pg, txt, x, y, w, h) {
  pg.textSize(h);
  let chars = txt.split("");
  let n = chars.length;
  if (n === 0) return;

  let nw = chars.map(c => max(pg.textWidth(c), 0.5));
  let totalNatural = nw.reduce((a, b) => a + b, 0);
  let surplus = w - totalNatural;
  let tw = nw.slice();

  if (surplus > 0) {
    let widths = tw.slice();
    let levels = [...new Set(widths)].sort((a, b) => a - b);
    for (let li = 0; li < levels.length - 1 && surplus > 0; li++) {
      let floor = levels[li];
      let ceil  = levels[li + 1];
      let eligible = widths.filter(w => w <= floor + 0.001).length;
      let needed = eligible * (ceil - floor);
      if (needed <= surplus) {
        for (let i = 0; i < n; i++) {
          if (widths[i] <= floor + 0.001) widths[i] = ceil;
        }
        surplus -= needed;
      } else {
        let partialLift = surplus / eligible;
        for (let i = 0; i < n; i++) {
          if (widths[i] <= floor + 0.001) widths[i] += partialLift;
        }
        surplus = 0;
      }
    }
    if (surplus > 0) {
      let perChar = surplus / n;
      widths = widths.map(w => w + perChar);
    }
    tw = widths;
  } else if (surplus < 0) {
    let scale = w / totalNatural;
    tw = nw.map(v => v * scale);
  }

  pg.push();
  pg.translate(x, y);
  let cursorX = 0;
  for (let i = 0; i < n; i++) {
    let sx = tw[i] / nw[i];
    pg.push();
    pg.translate(cursorX, 0);
    pg.scale(sx, 1);
    pg.fill(0); pg.noStroke();
    pg.text(chars[i], 0, 0);
    pg.pop();
    cursorX += tw[i];
  }
  pg.pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}