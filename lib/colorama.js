'use strict';

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
      var values = this.getRgb(color)
      if (values) {
        this.set('rgb', values);
      } else {
        values = this.getHsl(color)
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
   * Get or set all values in a color type, e.g. rgb([20, 30, 40]).
   */
  rgb: function(color) {
    if (typeof color == 'undefined')
      return this.get('rgb');
    return this.set('rgb', color);
  },
  hsl: function(color) {
    if (typeof color == 'undefined')
      return this.get('hsl');
    return this.set('hsl', color);
  },
  hsv: function(color) {
    if (typeof color == 'undefined')
      return this.get('hsv');
    return this.set('hsv', color);
  },
  cmyk: function(color) {
    if (typeof color == 'undefined')
      return this.get('cmyk');
    return this.set('cmyk', color);
  },

  /*
   * Get or set string versions of color types, e.g. "rgb(20, 30, 40)".
   */
  rgbString: function() {
    var rgb = this.get('rgb');
    return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
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
   * Methods used for parsing colors in string form. E.g. "rgb(20, 30, 40)".
   */
  getRgb: function(color) {
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
  getHsl: function(color) {
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

    if (max == min) {
      h = 0;
    } else if (r == max) {
      h = (g - b) / delta; 
    } else if (g == max) {
      h = 2 + (b - r) / delta; 
    } else if (b == max) {
      h = 4 + (r - g)/ delta;
    }

    h = Math.min(h * 60, 360);

    if (h < 0) {
      h += 360;
    }

    l = (min + max) / 2;

    if (max == min) {
      s = 0;
    } else if (l <= 0.5) {
      s = delta / (max + min);
    } else {
      s = delta / (2 - max - min);
    }

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

    if (max == 0) {
      s = 0;
    } else {
      s = (delta/max * 1000)/10;
    }

    if (max == min) {
      h = 0;
    } else if (r == max) {
      h = (g - b) / delta; 
    } else if (g == max) {
      h = 2 + (b - r) / delta; 
    } else if (b == max) {
      h = 4 + (r - g) / delta;
    }

    h = Math.min(h * 60, 360);

    if (h < 0) {
      h += 360;
    }

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

    if (l < 0.5) {
      t2 = l * (1 + s);
    } else {
      t2 = l + s - l * s;
    }

    t1 = 2 * l - t2;
    rgb = [0, 0, 0];

    for (var i = 0; i < 3; i++) {
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
        hi = Math.floor(h) % 6;

    var f = h - Math.floor(h),
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
    }
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