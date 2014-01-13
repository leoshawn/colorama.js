/*
Colorama v1.0.0

Copyright (c) 2014 David Gauld (@dcgauld)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
Colorama = module.exports = require("./lib/colorama");
},{"./lib/colorama":2}],2:[function(require,module,exports){
'use strict';

var conversions = require('./conversions');

module.exports = function(color) {
  return new Colorama(color);
};

/*
 * The constructor for a Colorama color. Tries to find out what you passed it
 * and attempts to convert it to rgb format (storing it in this.base).
 */
function Colorama(color) {
  this.base = { r: 0, g: 0, b: 0 };
  this.formats = ['hex', 'rgb', 'hsl', 'hsv'];
  switch (typeof color) {
  case 'string':
    if (this._parseHexString(color)) {
      this._set('hex', this._parseHexString(color));
    } else if (this._parseRgbString(color)) {
      this._set('rgb', this._parseRgbString(color));
    } else if (this._parseHslString(color)) {
      this._set('hsl', this._parseHslString(color));
    } else if (this._parseHsvString(color)) {
      this._set('hsv', this._parseHsvString(color));
    } else {
      return false;
    }
    return this;
  case 'object':
    if (color.r || color.red) {
      this._set('rgb', color);
    } else if (color.l || color.lightness) {
      this._set('hsl', color);
    } else if (color.v || color.value) {
      this._set('hsv', color);
    } else {
      return false;
    }
    return this;
  }
}

Colorama.prototype = {
  /*
   * Clones a Colorama object, useful for when a user wants to manipulate a
   * color but keep the original. Modified objects are edited by reference e.g.
   *
   *    var c = Colorama('#ff0000');
   *    var c2 = c;
   *    c2.darken();
   *
   * Both c and c2 will be updated as the variables are pointing to the same
   * object. The following example shows the correct method.
   *
   *    var c = Colorama('#ff0000');
   *    var c2 = c.clone();
   *    c2.darken();
   *
   * Boom!
   */
  clone: function() {
    return new Colorama(this.hex());
  },

  /*
   * Methods for getting or setting all values within a particular color type,
   * e.g. rgb([20, 30, 40]).
   */
  hex: function(color) {
    return this._set('hex', color);
  },
  rgb: function(color) {
    return this._set('rgb', color);
  },
  hsl: function(color) {
    return this._set('hsl', color);
  },
  hsv: function(color) {
    return this._set('hsv', color);
  },
  css: function() {
    return this.string('hex');
  },

  /*
   * Methods for getting a string version of a particular color types, e.g.
   * 'rgb(20, 30, 40)'. Useful for CSS and debugging.
   */
  string: function(format) {
    if (format === undefined) {
      format = 'rgb';
    }
    var color = this._get(format);
    switch (format) {
    case 'hex':
      return '#' + color;
    case 'rgb':
      return 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
    case 'hsl':
      return 'hsl(' + color.h + ', ' + color.s + '%, ' + color.l + '%)';
    case 'hsv':
      return 'hsv(' + color.h + ', ' + color.s + '%, ' + color.v + '%)';
    }
    return null;
  },

  /*
   * Methods for manipulating a color. These methods can also be chained, but
   * remember: some of the following implementations modify the existing color.
   * E.g. using c.negate() will set the values of c to the negation of the
   * original color.
   *
   * This does mean that you can write c.negate().darken().css(), for example.
   * Which is quite nice.
   */
  negate: function() {
    var rgb = this.rgb();
    var rgbNew = {
      r: 255 - rgb.r,
      g: 255 - rgb.g,
      b: 255 - rgb.b
    };
    this.rgb(rgbNew);
    return this;
  },
  lighten: function(ratio) {
    var hsl = this.hsl();
    hsl.l += hsl.l * (ratio || 0.5);
    this._set('hsl', hsl);
    return this;
  },
  darken: function(ratio) {
    var hsl = this.hsl();
    hsl.l -= hsl.l * (ratio || 0.5);
    this._set('hsl', hsl);
    return this;
  },
  saturate: function(ratio) {
    var hsl = this.hsl();
    hsl.s += hsl.s * (ratio || 0.5);
    this._set('hsl', hsl);
    return this;
  },
  desaturate: function(ratio) {
    var hsl = this.hsl();
    hsl.s -= hsl.s * (ratio || 0.5);
    this._set('hsl', hsl);
    return this;
  },
  greyscale: function() {
    return this.desaturate(1);
  },

  /*
   * Methods for creating a list of colors that are related (sometimes called
   * palettes). 
   */
  triad: function() {
    var hsl = this.hsl();
    return [
      new Colorama(hsl),
      new Colorama({ h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l }),
      new Colorama({ h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l })
    ];
  },
  tetrad: function() {
    var hsl = this.hsl();
    return [
      new Colorama(hsl),
      new Colorama({ h: (hsl.h + 90) % 360, s: hsl.s, l: hsl.l }),
      new Colorama({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }),
      new Colorama({ h: (hsl.h + 270) % 360, s: hsl.s, l: hsl.l })
    ];
  },
  splitComplement: function() {
    var hsl = this.hsl();
    return [
      new Colorama(hsl),
      new Colorama({ h: (hsl.h + 72) % 360, s: hsl.s, l: hsl.l }),
      new Colorama({ h: (hsl.h + 216) % 360, s: hsl.s, l: hsl.l })
    ];
  },
  analogous: function(results, slices) {
    results = results || 6;
    slices = slices || 30;
    var hsl = this.hsl(),
        array = [new Colorama(hsl)];
    for (hsl.h = ((hsl.h - ((360 / slices) * results >> 1)) + 720) % 360; --results;) {
      hsl.h = (hsl.h + (360 / slices)) % 360;
      array.push(new Colorama(hsl));
    }
    return array;
  },
  // TODO
  monochromatic: function(results) {
    results = results || 6;
    var hsv = this.hsv();
    var h = hsv.h, s = hsv.s, v = hsv.v;
    var array = [];
    var modification = 1 / results;
    while (results--) {
      array.push(new Colorama({ h: h, s: s, v: v}));
      v = (v + modification) % 1;
    }
    return array;
  },

  /*
   * Retrieve the color's base color in a particular format. Converts this.base
   * into the format specified.
   */
  _get: function(key) {
    if (this.formats.indexOf(key) !== -1) {
      if (key === 'rgb') {
        return this.base;
      } else if (typeof conversions['rgbTo' + key.charAt(0).toUpperCase() + key.slice(1)] === 'function') {
        return conversions['rgbTo' + key.charAt(0).toUpperCase() + key.slice(1)](this.base);
      }
    }
    return false;
  },

  /*
   * Sets this.base to a particular color, after converting it to a specified
   * format. Particularly useful for editing existing colors.
   */
  _set: function(key, value) {
    if (this.formats.indexOf(key) !== -1) {
      if (value === undefined) {
        return this._get(key);
      }
      if (value instanceof Array) {
        switch (key) {
        case 'hex':
          this.base = conversions.hexToRgb(value);
          break;
        case 'rgb':
          this.base = { r: value[0], g: value[1], b: value[2] };
          break;
        case 'hsl':
          this.base = conversions.hslToRgb({ h: value[0], s: value[1], l: value[2] });
          break;
        case 'hsv':
          this.base = conversions.hsvToRgb({ h: value[0], s: value[1], v: value[2] });
          break;
        }
        return this.base;
      } else {
        if (key === 'rgb') {
          this.base = value;
          return this.base;
        } else {
          if (typeof conversions[key + 'ToRgb'] === 'function') {
            this.base = conversions[key + 'ToRgb'](value);
            return this.base;
          }
        }
      }
      return false;
    }
    return false;
  },

  /*
   * Methods used for parsing colors from string form. E.g. 'rgb(20, 30, 40)'
   * and '#ff00ff'.
   */
  _parseHexString: function(color) {
    if (!color) {
      return;
    }
    var match = color.match(/^#?(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$/);
    if (match) {
      return match[1];
    }
    return false;
  },
  _parseRgbString: function(color) {
    if (!color) {
      return;
    }
    var rgb = {},
        match = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d\.]+)\s*)?\)$/);
    if (match) {
      rgb.r = this._scale(parseInt(match[1], 10), 0, 255);
      rgb.g = this._scale(parseInt(match[2], 10), 0, 255);
      rgb.b = this._scale(parseInt(match[3], 10), 0, 255);
      return rgb;
    }
    return false;
  },
  _parseHslString: function(color) {
    if (!color) {
      return;
    }
    var hsl = {},
        match = color.match(/^hsla?\(\s*(\d+)\s*,\s*([\d\.]+)%\s*,\s*([\d\.]+)%\s*(?:,\s*([\d\.]+)\s*)?\)/);
    if (match) {
      hsl.h = this._scale(parseInt(match[1], 10), 0, 360),
      hsl.s = this._scale(parseFloat(match[2]), 0, 100),
      hsl.l = this._scale(parseFloat(match[3]), 0, 100);
      return hsl;
    }
    return false;
  },

  /*
   * Utility methods. Always seem to be left until last, but pretty important.
   */
  _scale: function(num, min, max) {
    return Math.min(Math.max(min, num), max);
  }
};
},{"./conversions":3}],3:[function(require,module,exports){
'use strict';

module.exports = {
  rgbToHex: function(color) {
    var hex = '';
    var pad = function(n) {
      while (n.length < 2) {
        n = '0' + n;
      }
      return n;
    };
    hex += pad(Math.round(color.r).toString(16));
    hex += pad(Math.round(color.g).toString(16));
    hex += pad(Math.round(color.b).toString(16));
    return hex;
  },
  rgbToHsl: function(color) {
    var r = color.r / 255,
        g = color.g / 255,
        b = color.b / 255,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        delta = max - min,
        h, s, l;
    if (max === min) {
      h = 0;
    } else if (r === max) {
      h = (g - b) / delta; 
    } else if (g === max) {
      h = 2 + (b - r) / delta; 
    } else if (b === max) {
      h = 4 + (r - g) / delta;
    }
    h = Math.min(h * 60, 360);
    if (h < 0) {
      h += 360;
    }
    l = (min + max) / 2;
    if (max === min) {
      s = 0;
    } else if (l <= 0.5) {
      s = delta / (max + min);
    } else {
      s = delta / (2 - max - min);
    }
    return { h: this.roundNumber(h), s: this.roundNumber(s * 100), l: this.roundNumber(l * 100) };
  },
  rgbToHsv: function(color) {
    var r = color.r,
        g = color.g,
        b = color.b,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        delta = max - min,
        h, s, v;

    if (max === 0) {
      s = 0;
    } else {
      s = (delta/max * 1000)/10;
    }
    if (max === min) {
      h = 0;
    } else if (r === max) {
      h = (g - b) / delta; 
    } else if (g === max) {
      h = 2 + (b - r) / delta; 
    } else if (b === max) {
      h = 4 + (r - g) / delta;
    }
    h = Math.min(h * 60, 360);
    if (h < 0) {
      h += 360;
    }
    v = ((max / 255) * 1000) / 10;
    return { h: this.roundNumber(h), s: this.roundNumber(s), v: this.roundNumber(v) };
  },
  hexToRgb: function(color) {
    if (color === undefined) {
      return;
    }
    color = color.replace('#', '');
    if (color.length < 6) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    var r = parseInt(color.substring(0, 2), 16),
        g = parseInt(color.substring(2, 4), 16),
        b = parseInt(color.substring(4, 6), 16);
    return { r: r, g: g, b: b };
  },
  hslToRgb: function(color) {
    var rgb = {},
        array = [],
        h = color.h / 360,
        s = color.s / 100,
        l = color.l / 100,
        t1, t2, t3, val, i;
    if (s === 0) {
      val = l * 255;
      rgb.r = val;
      rgb.g = val;
      rgb.b = val;
      return rgb;
    }
    if (l < 0.5) {
      t2 = l * (1 + s);
    } else {
      t2 = l + s - l * s;
    }
    t1 = 2 * l - t2;
    for (i = 0; i < 3; i++) {
      t3 = h + 1 / 3 * - (i - 1);
      t3 < 0 && t3++;
      t3 > 1 && t3--;
      if (6 * t3 < 1) {
        val = t1 + (t2 - t1) * 6 * t3;
      } else if (2 * t3 < 1) {
        val = t2;
      } else if (3 * t3 < 2) {
        val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
      } else {
        val = t1;
      }
      array[i] = val * 255;
    }
    rgb.r = this.roundNumber(array[0]);
    rgb.g = this.roundNumber(array[1]);
    rgb.b = this.roundNumber(array[2]);
    return rgb;
  },
  hsvToRgb: function(color) {
    var h = color.h / 60,
        s = color.s / 100,
        v = color.v / 100,
        hi = Math.floor(h) % 6,
        f = h - Math.floor(h),
        p = 255 * v * (1 - s),
        q = 255 * v * (1 - (s * f)),
        t = 255 * v * (1 - (s * (1 - f)));
    v = 255 * v;
    switch(hi) {
    case 0:
      return { r: this.roundNumber(v), g: this.roundNumber(t), b: this.roundNumber(p) };
    case 1:
      return { r: this.roundNumber(q), g: this.roundNumber(v), b: this.roundNumber(p) };
    case 2:
      return { r: this.roundNumber(p), g: this.roundNumber(v), b: this.roundNumber(t) };
    case 3:
      return { r: this.roundNumber(p), g: this.roundNumber(q), b: this.roundNumber(v) };
    case 4:
      return { r: this.roundNumber(t), g: this.roundNumber(p), b: this.roundNumber(v) };
    case 5:
      return { r: this.roundNumber(v), g: this.roundNumber(p), b: this.roundNumber(q) };
    }
  },
  roundNumber: function(num) {
    return Math.round(num * 10) / 10;
  }
};
},{}]},{},[1])
;