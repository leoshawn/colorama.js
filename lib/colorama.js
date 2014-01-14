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
    } else if (this._parseNameString(color)) {
      this._set('hex', this._parseNameString(color));
    }
      else {
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
  _parseNameString: function(color) {
    if (!color) {
      return;
    }
    var colors = { aliceblue: 'f0f8ff', antiquewhite: 'faebd7', aqua: '0ff', aquamarine: '7fffd4', azure: 'f0ffff', beige: 'f5f5dc', bisque: 'ffe4c4', black: '000', blanchedalmond: 'ffebcd', blue: '00f', blueviolet: '8a2be2', brown: 'a52a2a', burlywood: 'deb887', burntsienna: 'ea7e5d', cadetblue: '5f9ea0', chartreuse: '7fff00', chocolate: 'd2691e', coral: 'ff7f50', cornflowerblue: '6495ed', cornsilk: 'fff8dc', crimson: 'dc143c', cyan: '0ff', darkblue: '00008b', darkcyan: '008b8b', darkgoldenrod: 'b8860b', darkgray: 'a9a9a9', darkgreen: '006400', darkgrey: 'a9a9a9', darkkhaki: 'bdb76b', darkmagenta: '8b008b', darkolivegreen: '556b2f', darkorange: 'ff8c00', darkorchid: '9932cc', darkred: '8b0000', darksalmon: 'e9967a', darkseagreen: '8fbc8f', darkslateblue: '483d8b', darkslategray: '2f4f4f', darkslategrey: '2f4f4f', darkturquoise: '00ced1', darkviolet: '9400d3', deeppink: 'ff1493', deepskyblue: '00bfff', dimgray: '696969', dimgrey: '696969', dodgerblue: '1e90ff', firebrick: 'b22222', floralwhite: 'fffaf0', forestgreen: '228b22', fuchsia: 'f0f', gainsboro: 'dcdcdc', ghostwhite: 'f8f8ff', gold: 'ffd700', goldenrod: 'daa520', gray: '808080', green: '008000', greenyellow: 'adff2f', grey: '808080', honeydew: 'f0fff0', hotpink: 'ff69b4', indianred: 'cd5c5c', indigo: '4b0082', ivory: 'fffff0', khaki: 'f0e68c', lavender: 'e6e6fa', lavenderblush: 'fff0f5', lawngreen: '7cfc00', lemonchiffon: 'fffacd', lightblue: 'add8e6', lightcoral: 'f08080', lightcyan: 'e0ffff', lightgoldenrodyellow: 'fafad2', lightgray: 'd3d3d3', lightgreen: '90ee90', lightgrey: 'd3d3d3', lightpink: 'ffb6c1', lightsalmon: 'ffa07a', lightseagreen: '20b2aa', lightskyblue: '87cefa', lightslategray: '789', lightslategrey: '789', lightsteelblue: 'b0c4de', lightyellow: 'ffffe0', lime: '0f0', limegreen: '32cd32', linen: 'faf0e6', magenta: 'f0f', maroon: '800000', mediumaquamarine: '66cdaa', mediumblue: '0000cd', mediumorchid: 'ba55d3', mediumpurple: '9370db', mediumseagreen: '3cb371', mediumslateblue: '7b68ee', mediumspringgreen: '00fa9a', mediumturquoise: '48d1cc', mediumvioletred: 'c71585', midnightblue: '191970', mintcream: 'f5fffa', mistyrose: 'ffe4e1', moccasin: 'ffe4b5', navajowhite: 'ffdead', navy: '000080', oldlace: 'fdf5e6', olive: '808000', olivedrab: '6b8e23', orange: 'ffa500', orangered: 'ff4500', orchid: 'da70d6', palegoldenrod: 'eee8aa', palegreen: '98fb98', paleturquoise: 'afeeee', palevioletred: 'db7093', papayawhip: 'ffefd5', peachpuff: 'ffdab9', peru: 'cd853f', pink: 'ffc0cb', plum: 'dda0dd', powderblue: 'b0e0e6', purple: '800080', red: 'f00', rosybrown: 'bc8f8f', royalblue: '4169e1', saddlebrown: '8b4513', salmon: 'fa8072', sandybrown: 'f4a460', seagreen: '2e8b57', seashell: 'fff5ee', sienna: 'a0522d', silver: 'c0c0c0', skyblue: '87ceeb', slateblue: '6a5acd', slategray: '708090', slategrey: '708090', snow: 'fffafa', springgreen: '00ff7f', steelblue: '4682b4', tan: 'd2b48c', teal: '008080', thistle: 'd8bfd8', tomato: 'ff6347', turquoise: '40e0d0', violet: 'ee82ee', wheat: 'f5deb3', white: 'fff', whitesmoke: 'f5f5f5', yellow: 'ff0', yellowgreen: '9acd32' };
    color = color.toLowerCase();
    if (colors.hasOwnProperty(color)) {
      return colors[color];
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