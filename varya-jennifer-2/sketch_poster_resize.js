/**
 * Renders a letter-grid poster into a p5.Graphics buffer.
 * Works inside any p5 instance — does NOT create its own canvas.
 *
 * Usage:
 *   const renderer = new PosterGraphicsRenderer(p);
 *   let g = renderer.render('apprendre\nà\nconclure', 400, 600);
 *   p.image(g, 0, 0);
 *   g.remove(); // when no longer needed
 */
class PosterGraphicsRenderer {
    constructor(p) {
        this._p = p;
        this._letters = {};
        this._colorForeground = '#000';
        this._colorBackground = '#FFF';
        this._lineHeight = 0.5;

        p.textFont("Arial Black");
        p.textSize(1000);

        // We don't want too much white space around the letters...
        let letterWidth      = p.textWidth("0");
        let letterHeight     = p.textAscent() * this._lineHeight;
        // ...but we don't want letters to be cropped either ("A", "W")...
        let letterTempWidth  = p.textWidth("W");
        let letterTempHeight = p.textAscent() + p.textDescent();
        // ...so we keep the ratio to compensate later on
        this._letterWidthRatio  = letterTempWidth  / letterWidth;
        this._letterHeightRatio = letterTempHeight / letterHeight;
        this._letterTempWidth   = letterTempWidth;
        this._letterTempHeight  = letterTempHeight;
    }

    /**
     * Render inputWords into a new p5.Graphics of size w×h and return it.
     * Caller is responsible for calling .remove() on the returned graphics when done.
     * @param {string} inputWords - newline-separated words
     * @param {number} w
     * @param {number} h
     * @returns {p5.Graphics}
     */
    render(inputWords, w, h) {

        const p  = this._p;
        let copy = p.createGraphics(w, h);
        copy.background(this._colorBackground);

        let words = inputWords.split("\n");
        let y     = (h / (2.5 * words.length ));
        // let y     = (h / 5);
        // let y     = (h / 7.25);
        // let y     = (h / 10);


        let rowH  = h / words.length;

        for (let i = 0; i < words.length; i++) {
            let word = words[i].toUpperCase();
            if (word.trim()) {
                let x    = 0;
                let colW = w / word.length;
                for (let j = 0; j < word.length; j++) {
                    this._prepareLetter(word[j]);
                    if (this._letters[word[j]]) {
                        copy.push();
                        copy.translate(x + colW / 2, y + rowH / 2);
                        copy.image(
                            this._letters[word[j]],
                            -colW * this._letterWidthRatio / 2,
                            -rowH * this._letterHeightRatio / 2,
                            colW  * this._letterWidthRatio,
                            rowH  * this._letterHeightRatio
                        );
                        copy.pop();
                    }
                    x += colW;
                }
            }
            y += rowH;
        }

        return copy;
    }

    /**
     * We pre-render the letters at a large size so they don't look ugly when
     * stretched. Letters are cached across calls.
     */
    _prepareLetter(letter) {
        const p = this._p;
        if (this._letters[letter] !== undefined || !letter) return;
        let g = p.createGraphics(this._letterTempWidth, this._letterTempHeight);
        g.fill(this._colorForeground);
        g.noStroke();
        g.textAlign(p.CENTER, p.TOP);
        g.textFont("Arial Black");
        g.textSize(1000);
        g.text(letter, this._letterTempWidth / 2, 0);
        this._letters[letter] = g;
    }
}
