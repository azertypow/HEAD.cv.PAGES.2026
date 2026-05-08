new p5((p) => {
    let regions       = [];
    let splitVertical = true;
    let tasks         = [
        "trouver\nun\ncollectif",
        "avoir\nun     sejour\ncontemplatif",
        "fermer\nles\nyeux",
        "cesser\nles clics",
        "apprendre\na conclure",
        "accepter\nle passage\ndu temps",
        "retrouver\nla\nstructure",
        "abandonner\nl'ego",
        "se\ndeconnecter\nd'internet",
        "penser\na      ma\nmort",
        "perdre\nl'opinion\npersonnelle",
        "finir",
        "creer\nun\nrecit",
        "fuire\nl'identique",
        "construire\nune harmonie\ndu silence",
        "ralentir\nles\ntransitions",
        "chercher\nl'autre",
        "achever",
        "figer\nle moment",
    ];
    let renderer;

    // Maps each region object to its rendered p5.Graphics buffer
    const regionGraphics = new Map();

    const EXPORT_W = 4967;
    const EXPORT_H = 7022;

    p.setup = function() {
        p.createCanvas(window.innerWidth, window.innerHeight);
        renderer = new PosterGraphicsRenderer(p);

        addRegion(makeRegion(0, 0, p.width, p.height));
    };

    p.draw = function() {
        p.background(255);
        for (let r of regions) {
            let g = regionGraphics.get(r);
            if (g) p.image(g, r.x, r.y, r.w, r.h);
            p.stroke(255); p.strokeWeight(5); p.noFill();
            p.rect(r.x, r.y, r.w, r.h);
        }
    };

    p.mousePressed = function() {
        for (let i = regions.length - 1; i >= 0; i--) {
            let r = regions[i];
            if (p.mouseX > r.x && p.mouseX < r.x + r.w &&
                p.mouseY > r.y && p.mouseY < r.y + r.h) {

                removeRegion(i);

                let newRegions;
                if (splitVertical) {
                    newRegions = [
                        makeRegion(r.x,       r.y, p.mouseX - r.x,       r.h),
                        makeRegion(p.mouseX,  r.y, r.x + r.w - p.mouseX, r.h),
                    ];
                } else {
                    newRegions = [
                        makeRegion(r.x, r.y,       r.w, p.mouseY - r.y),
                        makeRegion(r.x, p.mouseY,  r.w, r.y + r.h - p.mouseY),
                    ];
                }

                for (let nr of newRegions) addRegion(nr);
                splitVertical = !splitVertical;
                break;
            }
        }
    };

    p.keyPressed = function() {
        if (p.key === 's' || p.key === 'S') exportA0();

    };

   p.keyPressed = function () {
  if (p.key === 'f' || p.key === 'F') {
    p.fullscreen(true); // toggle fullscreen
  }
}

    p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    function makeRegion(x, y, w, h) {
        // Each word of the task becomes a row in the poster grid
        let text = p.random(tasks);
        return { x, y, w, h, text };
    }

    function addRegion(r) {
        regions.push(r);
        regionGraphics.set(r, renderer.render(r.text, r.w, r.h));
    }

    function removeRegion(i) {
        let r = regions[i];
        let g = regionGraphics.get(r);
        if (g) g.remove();
        regionGraphics.delete(r);
        regions.splice(i, 1);
    }

    // ─── Export ───────────────────────────────────────────────────────────────────

    function exportA0() {
        let scaleX = EXPORT_W / p.width;
        let scaleY = EXPORT_H / p.height;

        let pg = p.createGraphics(EXPORT_W, EXPORT_H);
        pg.pixelDensity(1);
        pg.background(255);

        for (let r of regions) {
            let rx = r.x * scaleX;
            let ry = r.y * scaleY;
            let rw = r.w * scaleX;
            let rh = r.h * scaleY;

            let g = renderer.render(r.text, rw, rh);
            pg.image(g, rx, ry);
            g.remove();

            pg.stroke(0); pg.strokeWeight(1); pg.noFill();
            pg.rect(rx, ry, rw, rh);
        }

        pg.save('poster_A0_150dpi.jpg');
        pg.remove();
    }


});


