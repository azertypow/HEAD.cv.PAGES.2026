let tasks = [];
let table;

// Canvas and layout
// let canvasW = 520;
// let canvasH = 700;

let canvasW = window.innerWidth;
let canvasH = window.innerHeight;

const colMargin = 40;
const fontSize = 14;       // ← smaller font to fit content
const taskSpacing = 12;
let colWidth;

// Fireball strokes
let fireballStrokes = [];

// Fade timing (ms)
const STROKE_DELAY = 3000;
const STROKE_FADE  = 0;

// Track previous touch position manually
let prevTouchX = 0;
let prevTouchY = 0;

function preload() {
  let url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRKTYYwsPFMhGOETM3oTtlvDKN_WWJuRqcZ3B-gY7ssrq7k7AfQHT3HtlsAzqCLbZ44Blv_kJ7dq-Qb/pub?output=csv";
  table = loadTable(url, "csv", "header");
}

function setup() {
  colWidth = canvasW - colMargin * 2;

  createCanvas(canvasW, canvasH);
  pixelDensity(2);
  textFont("Helvetica");
  textSize(fontSize);
  textAlign(LEFT, TOP);
  noStroke();

  // Center the canvas in the page
  let cnv = document.querySelector('canvas');
  if (cnv) {
    cnv.style.touchAction = 'none';
    cnv.style.position = 'fixed';
    cnv.style.top = '50%';
    cnv.style.left = '50%';
    cnv.style.transform = 'translate(-50%, -50%)';
  }
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.height = '100%';
  document.body.style.background = '#FFF';

  let taskList = [];
  for (let r = 0; r < table.getRowCount(); r++) {
    let task = table.getString(r, table.columns[0]).trim();
    if (task !== "") taskList.push(task);
  }

  generateTaskObjects(taskList);
}

function draw() {
  background(255);

  let now = millis();

  fireballStrokes = fireballStrokes.filter(s => {
    let age = now - s.born;
    return age < STROKE_DELAY + STROKE_FADE;
  });

  for (let s of fireballStrokes) {
    let age = now - s.born;
    let alpha = 255;
    if (age > STROKE_DELAY) {
      alpha = map(age, STROKE_DELAY, STROKE_DELAY + STROKE_FADE, 255, 0);
      alpha = constrain(alpha, 0, 255);
    }

    strokeCap(ROUND);
    noFill();

    stroke(0, alpha);
    strokeWeight(s.weight + 4);
    beginShape();
    curveVertex(s.cx0, s.cy0);
    curveVertex(s.x1, s.y1);
    curveVertex(s.mx, s.my);
    curveVertex(s.x2, s.y2);
    curveVertex(s.cx1, s.cy1);
    endShape();

    stroke(255, alpha);
    strokeWeight(s.weight);
    beginShape();
    curveVertex(s.cx0, s.cy0);
    curveVertex(s.x1, s.y1);
    curveVertex(s.mx, s.my);
    curveVertex(s.x2, s.y2);
    curveVertex(s.cx1, s.cy1);
    endShape();
  }

  for (let t of tasks) {
    t.update();
    t.display();
  }
}

// -------------------- Reset --------------------
function resetSketch() {
  fireballStrokes = [];
  for (let t of tasks) {
    for (let l of t.letters) {
      l.offsetX = 0;
      l.offsetY = 0;
      l.velocityX = 0;
      l.velocityY = 0;
      l.angle = 0;
      l.angularVelocity = 0;
      l.state = "idle";
      l.timer = 0;
    }
  }
}

// -------------------- Task Class --------------------
class Task {
  constructor(lines, x, y) {
    this.letters = [];
    this.lines = lines;
    this.x = x;
    this.y = y;

    let offsetY = 0;
    for (let line of lines) {
      let lineWidth = textWidth(line);
      // Center each line within the full canvas width
      let offsetX = (canvasW - lineWidth) / 2 - x;

      for (let i = 0; i < line.length; i++) {
        this.letters.push({
          char: line[i],
          baseX: x + offsetX,
          baseY: y + offsetY,
          offsetX: 0,
          offsetY: 0,
          velocityX: 0,
          velocityY: 0,
          angle: 0,
          angularVelocity: 0,
          state: "idle",
          timer: 0
        });
        offsetX += textWidth(line[i]) + 2.5;
      }
      offsetY += fontSize * 1.4;
    }
    this.height = offsetY;
  }

  update() {
    for (let l of this.letters) {
      if (l.state === "idle") continue;

      if (l.state === "exploding") {
        l.offsetX += l.velocityX;
        l.offsetY += l.velocityY;
        l.angle += l.angularVelocity;
        l.velocityY += 0.05;
        l.timer++;
        if (l.timer > 80) l.state = "rebuilding";
      } else if (l.state === "rebuilding") {
        l.offsetX = lerp(l.offsetX, 0, 0.08);
        l.offsetY = lerp(l.offsetY, 0, 0.08);
        l.angle = lerp(l.angle, 0, 0.08);
        if (abs(l.offsetX) < 0.5 && abs(l.offsetY) < 0.5 && abs(l.angle) < 0.01)
          l.state = "idle";
      }
    }
  }

  display() {
    for (let l of this.letters) {
      push();
      translate(l.baseX + l.offsetX, l.baseY + l.offsetY);
      rotate(l.angle);

      stroke(0);
      strokeWeight(6);
      strokeJoin(ROUND);
      strokeCap(ROUND);
      fill(255);
      text(l.char, 0, 0);

      pop();
    }
  }
}

// -------------------- Generate Tasks --------------------
function generateTaskObjects(list) {
  let x = colMargin;

  // Pre-calculate total height to vertically center all tasks
  let totalHeight = 0;
  for (let i = 0; i < list.length; i++) {
    let wrapped = wrapText(list[i], colWidth);
    totalHeight += wrapped.length * fontSize * 1.4 + taskSpacing;
  }

  let startY = max(40, (canvasH - totalHeight) / 2);
  let y = startY;

  for (let i = 0; i < list.length; i++) {
    let wrapped = wrapText(list[i], colWidth);
    let t = new Task(wrapped, x, y);
    tasks.push(t);
    y += t.height + taskSpacing;
  }
}

function wrapText(str, maxWidth) {
  let words = str.split(' ');
  let lines = [];
  let currentLine = '';

  for (let w of words) {
    let testLine = currentLine ? currentLine + ' ' + w : w;
    if (textWidth(testLine) > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = w;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// -------------------- Shared drag logic --------------------
function applyDrag(tx, ty, prevX, prevY) {
  let distance = dist(tx, ty, prevX, prevY);
  if (distance < 5) return;

  let dragAngle = atan2(ty - prevY, tx - prevX);
  let perpAngle = dragAngle + HALF_PI;
  let behindAngle = dragAngle + PI;

  let numStrokes = 22;
  let bundleSpread = 14;
  let now = millis();

  for (let i = 0; i < numStrokes; i++) {
    let t = (i / (numStrokes - 1)) - 0.5;

    let isDetached = abs(t) > 0.3 && random() < 0.45;
    let detachShift = isDetached ? random(15, 50) * sign(t) : 0;

    let startSpread = abs(t) * 4 + detachShift;
    let sx = tx + cos(perpAngle) * startSpread + random(-2, 2);
    let sy = ty + sin(perpAngle) * startSpread + random(-2, 2);

    let lengthFactor = isDetached ? random(0.4, 1.1) : 1 - abs(t) * 0.3;
    let strokeLen = random(80, 200) * lengthFactor;

    let fanFactor = isDetached ? 5.5 : 3.0;
    let endSpread = t * bundleSpread * fanFactor + detachShift * 1.5;
    let ex = tx + cos(behindAngle) * strokeLen + cos(perpAngle) * endSpread + random(-8, 8);
    let ey = ty + sin(behindAngle) * strokeLen + sin(perpAngle) * endSpread + random(-8, 8);

    let bowAmount = isDetached ? t * random(30, 70) : t * random(12, 28);
    let mx = (sx + ex) / 2 + cos(perpAngle) * bowAmount;
    let my = (sy + ey) / 2 + sin(perpAngle) * bowAmount;

    let cx0 = sx - cos(behindAngle) * 25;
    let cy0 = sy - sin(behindAngle) * 25;
    let cx1 = ex + cos(behindAngle) * 25;
    let cy1 = ey + sin(behindAngle) * 25;

    let w = isDetached
      ? random(0.2, 0.5)
      : map(abs(t), 0, 0.5, random(0.7, 1.3), random(0.3, 0.6));

    fireballStrokes.push({
      x1: sx, y1: sy,
      x2: ex, y2: ey,
      mx: mx, my: my,
      cx0: cx0, cy0: cy0,
      cx1: cx1, cy1: cy1,
      weight: w,
      born: now
    });
  }

  for (let task of tasks) {
    for (let l of task.letters) {
      let d = dist(l.baseX, l.baseY, tx, ty);
      if (d < 60 && l.state === "idle") {
        l.state = "exploding";
        let angle = atan2(l.baseY - ty, l.baseX - tx) + random(-PI / 4, PI / 4);
        let speed = random(2, 4);
        l.velocityX = cos(angle) * speed;
        l.velocityY = sin(angle) * speed;
        l.angularVelocity = random(-0.2, 0.2);
        l.timer = 0;
      }
    }
  }
}

// -------------------- Mouse (desktop) --------------------
function mouseDragged() {
  applyDrag(mouseX, mouseY, pmouseX, pmouseY);
}

// -------------------- Touch (iPad / mobile) --------------------
function touchStarted() {
  if (touches.length > 0) {
    prevTouchX = touches[0].x;
    prevTouchY = touches[0].y;
  }
  return false;
}

function touchMoved() {
  if (touches.length > 0) {
    applyDrag(touches[0].x, touches[0].y, prevTouchX, prevTouchY);
    prevTouchX = touches[0].x;
    prevTouchY = touches[0].y;
  }
  return false;
}

function touchEnded() {
  return false;
}

// -------------------- Helpers --------------------
function sign(x) {
  return x >= 0 ? 1 : -1;
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('dramatic_fireball_continuation', 'png');
  if (key === 'f' || key === 'F') noLoop();
  if (key === 'r' || key === 'R') loop();
  if (key === 'd' || key === 'D') resetSketch();
}
