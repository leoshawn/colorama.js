'use strict';

/*
(The MIT License)

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
module.exports = function(color) {
  return new Colorama(color);
};

/*
 * The constructor for a Colorama color. Tries to find out what you passed it
 * and begins the conversions of this value to fill its attributes for later.
 */
function Colorama(color) {
  this.attributes = {
    rgb: [0, 0, 0],
    hsl: [0, 0, 0],
    hsv: [0, 0, 0],
    cmyk: [0, 0, 0, 0]
  };
  switch (typeof color) {
    case 'string':
      var values = this.parseRgb(color)
      if (values) {
        this.set('rgb', values);
      } else {
        values = this.parseHsl(color)
        this.set('hsl', values);
      }
      return this;
    case 'object':
      if (color['r'] || color['red']) {
        this.set('rgb', color);
      } else if (color['l'] || color['lightness']) {
        this.set('hsl', color);
      } else if (color['v'] || color['value']) {
        this.set('hsv', color);
      } else if (color['c'] || color['cyan']) {
        this.set('cmyk', color);
      }
      return this;
  };
  return false;
};

Colorama.prototype = {
  /*
   * Methods for getting or setting all values in a color type, e.g.
   * rgb([20, 30, 40]).
   */
  rgb: function(color) {
    return this.set('rgb', color);
  },
  hsl: function(color) {
    return this.set('hsl', color);
  },
  hsv: function(color) {
    return this.set('hsv', color);
  },
  cmyk: function(color) {
    return this.set('cmyk', color);
  },

  /*
   * Methods for getting or setting string versions of color types, e.g.
   * "rgb(20, 30, 40)".
   */
  rgbString: function() {
    var rgb = this.get('rgb');
    return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
  },
  hslString: function() {
    var hsl = this.get('hsl');
    return 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
  },
  hsvString: function() {
    var hsv = this.get('hsv');
    return 'hsv(' + hsv.h + ', ' + hsv.s + '%, ' + hsv.v + '%)';
  },
  cmykString: function() {
    var cmyk = this.get('cmyk');
    return 'cmyk(' + cmyk.c + ', ' + cmyk.m + ', ' + cmyk.y + ', ' + cmyk.k + ')';
  },

  /*
   * Methods for getting and setting color channel values.
   */
  red: function(value) {
    return this.setChannel('rgb', 0, value);
  },
  green: function(value) {
    return this.setChannel('rgb', 1, value);
  },
  blue: function(value) {
    return this.setChannel('rgb', 2, value);
  },
  hue: function(value) {
    return this.setChannel('hsl', 0, value);
  },
  saturation: function(value) {
    return this.setChannel('hsl', 1, value);
  },
  lightness: function(value) {
    return this.setChannel('hsl', 2, value);
  },
  saturationv: function(value) {
    return this.setChannel("hsv", 1, value);
  },
  value: function(value) {
    return this.setChannel('hsv', 2, value);
  },
  cyan: function(value) {
    return this.setChannel('cmyk', 0, value);
  },
  magenta: function(value) {
    return this.setChannel('cmyk', 1, value);
  },
  yellow: function(value) {
    return this.setChannel('cmyk', 2, value);
  },
  black: function(value) {
    return this.setChannel('cmyk', 3, value);
  },

  /*
   * Methods for the manipulation of an existing color.
   */
  negate: function() {
    var rgb = [];
    for (var i = 0; i < 3; i++)
       rgb[i] = 255 - this.attributes.rgb[i];
    this.set("rgb", rgb);
    return this;
  },
  lighten: function(ratio) {
    this.attributes.hsl[2] += this.attributes.hsl[2] * ratio;
    this.set("hsl", this.attributes.hsl);
    return this;
  },
  darken: function(ratio) {
    this.attributes.hsl[2] -= this.attributes.hsl[2] * ratio;
    this.set("hsl", this.attributes.hsl);
    return this;
  },
  saturate: function(ratio) {
    this.attributes.hsl[1] += this.attributes.hsl[1] * ratio;
    this.set("hsl", this.attributes.hsl);
    return this;
  },
  desaturate: function(ratio) {
    this.attributes.hsl[1] -= this.attributes.hsl[1] * ratio;
    this.set("hsl", this.attributes.hsl);
    return this;
  },
  greyscale: function() {
    return this.desaturate(1);
  },

  /*
   * Methods to retrieve information about the current color.
   */
  dark: function() {
    var rgb = this.attributes.rgb,
        yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return yiq < 128;
  },
  light: function() {
    return !this.dark();
  },

  /*
   * Get the color's value based on a color type.
   */
  get: function(key) {
    var values = {};
    for (var i = 0; i < key.length; i++)
      values[key[i]] = this.attributes[key][i];
    return values;
  },

  /*
   * Sets a color's value based on a color type. This function then proceeds to
   * convert the color from the type given to all types, and adds these values
   * to the color too. E.g. set('rgb', { r: 20, g: 30, b: 40 }) will firstly
   * set the current color's 'rgb' attribute to [20, 30, 40], and then will
   * proceed to convert and store the value in 'hsl', 'hsv' and 'cmyk' formats.
   */
  set: function(key, value) {
    // Return existing value if value is not specified (getter).
    if (value === undefined)
      return this.get(key);
    var keys = {
      'rgb': ['red', 'green', 'blue'],
      'hsl': ['hue', 'saturation', 'lightness'],
      'hsv': ['hue', 'saturation', 'value'],
      'cmyk': ['cyan', 'magenta', 'yellow', 'black']
    };
    var max = {
      'rgb': [255, 255, 255],
      'hsl': [360, 100, 100],
      'hsv': [360, 100, 100],
      'cmyk': [100, 100, 100, 100]
    };
    if (value.length) { // Array
      this.attributes[key] = value.slice(0, key.length);
    } else if (value[key[0]] !== undefined) { // Object, e.g. { r: 255, g: 255, b: 255 }.
      for (var i = 0; i < key.length; i++) {
        this.attributes[key][i] = value[key[i]];
      }
    } else if (value[keys[key][0]] != undefined) { // Object, e.g. { red: 255, green: 255, blue: 255 }.
      var channels = keys[key];
      for (var i = 0; i < key.length; i++) {
        this.attributes[key][i] = value[channels[i]];
      }
    }
    for (var keyName in keys) {
      if (keyName != key) {
        // Bit of a hack. Converts to specific formats with the conversion methods.
        if (typeof this[key + '2' + keyName] == 'function')
          this.attributes[keyName] = this[key + '2' + keyName](this.attributes[key]);
        else
          this.attributes[keyName] = this[keyName + '2' + key](this.attributes[key]);
      }
      // Ensure values don't exceed upper limit.
      for (var i = 0; i < keyName.length; i++) {
        var limited = this.scale(this.attributes[keyName][i], 0, max[keyName][i]);
        this.attributes[keyName][i] = Math.round(limited);
      }
    }
    return true;
  },

  /*
   * Sets a color channel with a specific value. This function then proceeds to
   * update all of the other color formats to reflect the new color.
   */
  setChannel: function(key, index, value) {
    // Return existing value if value is not specified (getter).
    if (value === undefined)
      return this.attributes[key][index];
    this.attributes[key][index] = value;
    this.set(key, this.attributes[key]);
    return this;
  },

  /*
   * Methods used for parsing colors in string form. E.g. "rgb(20, 30, 40)".
   */
  parseRgb: function(color) {
    if (!color)
      return;
    var rgb = [0, 0, 0],
        hexShortMatch = color.match(/^#([a-fA-F0-9]{3})$/),
        hexMatch = color.match(/^#([a-fA-F0-9]{6})$/),
        rgbMatch = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d\.]+)\s*)?\)$/);
    if (hexShortMatch) {
      hexShortMatch = hexShortMatch[1];
      for (var i = 0; i < rgb.length; i++)
        rgb[i] = parseInt(hexShortMatch[i] + hexShortMatch[i], 16);
    } else if (hexMatch) {
      hexMatch = hexMatch[1];
      for (var i = 0; i < rgb.length; i++)
        rgb[i] = parseInt(hexMatch.slice(i * 2, i * 2 + 2), 16);
    } else if (rgbMatch) {
      for (var i = 0; i < rgb.length; i++)
        rgb[i] = parseInt(rgbMatch[i + 1]);
    } else {
      rgb = null;
    }
    if (rgb)
      for (var i = 0; i < rgb.length; i++)
        rgb[i] = this.scale(rgb[i], 0, 255);
    return rgb;
  },
  parseHsl: function(color) {
    if (!color)
      return;
    var hslMatch = color.match(/^hsla?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d\.]+)\s*)?\)/);
    if (hslMatch) {
      var h = this.scale(parseInt(hslMatch[1]), 0, 360),
          s = this.scale(parseFloat(hslMatch[2]), 0, 100),
          l = this.scale(parseFloat(hslMatch[3]), 0, 100);
      return [h, s, l];
    }
  },

  /*
   * Retrieve an array of colors based on the current color. Useful for
   * creating palettes and using related colors.
   */
  triad: function() {
    var hsl = this.get('hsl');
    return [
      new Colorama(hsl),
      new Colorama({ h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l }),
      new Colorama({ h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l })
    ];
  },
  tetrad: function() {
    var hsl = this.get('hsl');
    return [
      new Colorama(hsl),
      new Colorama({ h: (hsl.h + 90) % 360, s: hsl.s, l: hsl.l }),
      new Colorama({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }),
      new Colorama({ h: (hsl.h + 270) % 360, s: hsl.s, l: hsl.l })
    ];
  },
  splitComplement: function() {
    var hsl = this.get('hsl');
    return [
      new Colorama(hsl),
      new Colorama({ h: (hsl.h + 72) % 360, s: hsl.s, l: hsl.l }),
      new Colorama({ h: (hsl.h + 216) % 360, s: hsl.s, l: hsl.l })
    ];
  },
  analogous: function(results, slices) {
    results = results || 6;
    slices = slices || 30;
    var hsl = this.get('hsl'),
        array = [new Colorama(color)];
    for (hsl.h = ((hsl.h - ((360 / slices) * results >> 1)) + 720) % 360; --results;) {
        hsl.h = (hsl.h + (360 / slices)) % 360;
        array.push(new Colorama(hsl));
    }
    return array;
  },
  // TODO
  monochromatic: function(results) {
    results = results || 6;
    var hsv = this.get('hsv');
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
   * Methods to convert a specified color into a different format.
   */
  rgb2hsl: function(rgb) {
    var r = rgb[0] / 255,
        g = rgb[1] / 255,
        b = rgb[2] / 255,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        delta = max - min,
        h, s, l;
    if (max == min)
      h = 0;
    else if (r == max)
      h = (g - b) / delta; 
    else if (g == max)
      h = 2 + (b - r) / delta; 
    else if (b == max)
      h = 4 + (r - g)/ delta;
    h = Math.min(h * 60, 360);
    if (h < 0)
      h += 360;
    l = (min + max) / 2;
    if (max == min)
      s = 0;
    else if (l <= 0.5)
      s = delta / (max + min);
    else
      s = delta / (2 - max - min);
    return [h, s * 100, l * 100];
  },
  rgb2hsv: function(rgb) {
    var r = rgb[0],
        g = rgb[1],
        b = rgb[2],
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        delta = max - min,
        h, s, v;
    if (max == 0)
      s = 0;
    else
      s = (delta/max * 1000)/10;
    if (max == min)
      h = 0;
    else if (r == max)
      h = (g - b) / delta; 
    else if (g == max)
      h = 2 + (b - r) / delta; 
    else if (b == max)
      h = 4 + (r - g) / delta;
    h = Math.min(h * 60, 360);
    if (h < 0)
      h += 360;
    v = ((max / 255) * 1000) / 10;
    return [h, s, v];
  },
  rgb2cmyk: function(rgb) {
    var r = rgb[0] / 255,
        g = rgb[1] / 255,
        b = rgb[2] / 255,
        c, m, y, k;
    k = Math.min(1 - r, 1 - g, 1 - b);
    c = (1 - r - k) / (1 - k);
    m = (1 - g - k) / (1 - k);
    y = (1 - b - k) / (1 - k);
    return [c * 100, m * 100, y * 100, k * 100];
  },
  hsl2rgb: function(hsl) {
    var h = hsl[0] / 360,
        s = hsl[1] / 100,
        l = hsl[2] / 100,
        t1, t2, t3, rgb, val;
    if (s == 0) {
      val = l * 255;
      return [val, val, val];
    }
    if (l < 0.5)
      t2 = l * (1 + s);
    else
      t2 = l + s - l * s;
    t1 = 2 * l - t2;
    rgb = [0, 0, 0];
    for (var i = 0; i < 3; i++) {
      t3 = h + 1 / 3 * - (i - 1);
      t3 < 0 && t3++;
      t3 > 1 && t3--;
      if (6 * t3 < 1)
        val = t1 + (t2 - t1) * 6 * t3;
      else if (2 * t3 < 1)
        val = t2;
      else if (3 * t3 < 2)
        val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
      else
        val = t1;
      rgb[i] = val * 255;
    }
    return rgb;
  },
  hsl2hsv: function(hsl) {
    var h = hsl[0],
        s = hsl[1] / 100,
        l = hsl[2] / 100,
        sv, v;
    l *= 2;
    s *= (l <= 1) ? l : 2 - l;
    v = (l + s) / 2;
    sv = (2 * s) / (l + s);
    return [h, sv * 100, v * 100];
  },
  hsl2cmyk: function(args) {
    return this.rgb2cmyk(this.hsl2rgb(args));
  },
  hsv2rgb: function(hsv) {
    var h = hsv[0] / 60,
        s = hsv[1] / 100,
        v = hsv[2] / 100,
        hi = Math.floor(h) % 6,
        f = h - Math.floor(h),
        p = 255 * v * (1 - s),
        q = 255 * v * (1 - (s * f)),
        t = 255 * v * (1 - (s * (1 - f))),
        v = 255 * v;
    switch(hi) {
      case 0:
        return [v, t, p];
      case 1:
        return [q, v, p];
      case 2:
        return [p, v, t];
      case 3:
        return [p, q, v];
      case 4:
        return [t, p, v];
      case 5:
        return [v, p, q];
    };
  },
  hsv2hsl: function(hsv) {
    var h = hsv[0],
        s = hsv[1] / 100,
        v = hsv[2] / 100,
        sl, l;
    l = (2 - s) * v;  
    sl = s * v;
    sl /= (l <= 1) ? l : 2 - l;
    l /= 2;
    return [h, sl * 100, l * 100];
  },
  hsv2cmyk: function(args) {
    return this.rgb2cmyk(this.hsv2rgb(args));
  },
  cmyk2rgb: function(cmyk) {
    var c = cmyk[0] / 100,
        m = cmyk[1] / 100,
        y = cmyk[2] / 100,
        k = cmyk[3] / 100,
        r, g, b;
    r = 1 - Math.min(1, c * (1 - k) + k);
    g = 1 - Math.min(1, m * (1 - k) + k);
    b = 1 - Math.min(1, y * (1 - k) + k);
    return [r * 255, g * 255, b * 255];
  },
  cmyk2hsl: function(args) {
    return this.rgb2hsl(this.cmyk2rgb(args));
  },
  cmyk2hsv: function(args) {
    return this.rgb2hsv(this.cmyk2rgb(args));
  },

  /*
   * Utility methods.
   */
  scale: function(num, min, max) {
    return Math.min(Math.max(min, num), max);
  }
};