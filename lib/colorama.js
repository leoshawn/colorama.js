'use strict';

var conversions = require('./conversions');

module.exports = function(color) {
  return new Colorama(color);
};

/*
 * The constructor for a Colorama color. Tries to find out what you passed it
 * and begins the conversions of this value to fill its attributes for later.
 */
function Colorama(color) {
  this.attributes = {
    hex: '000000',
    rgb: [0, 0, 0],
    hsl: [0, 0, 0],
    hsv: [0, 0, 0]
  };
  switch (typeof color) {
  case 'string':
    if (this._parseHex(color)) {
      this._set('hex', this._parseHex(color));
    } else if (this._parseRgb(color)) {
      this._set('rgb', this._parseRgb(color));
    } else {
      this._set('hsl', this._parseHsl(color));
    }
    return this;
  case 'object':
    if (color.r || color.red) {
      this._set('rgb', color);
    } else if (color.l || color.lightness) {
      this._set('hsl', color);
    } else if (color.v || color.value) {
      this._set('hsv', color);
    }
    return this;
  }
  return false;
}

Colorama.prototype = {
  /*
   * Methods for getting or setting all values in a color type, e.g.
   * rgb([20, 30, 40]).
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

  /*
   * Methods for getting or setting string versions of color types, e.g.
   * 'rgb(20, 30, 40)'.
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
    return false;
  },

  /*
   * Methods for getting and setting color channel values.
   */
  red: function(value) {
    return this._setChannel('rgb', 0, value);
  },
  green: function(value) {
    return this._setChannel('rgb', 1, value);
  },
  blue: function(value) {
    return this._setChannel('rgb', 2, value);
  },
  hue: function(value) {
    return this._setChannel('hsl', 0, value);
  },
  saturation: function(value) {
    return this._setChannel('hsl', 1, value);
  },
  lightness: function(value) {
    return this._setChannel('hsl', 2, value);
  },
  saturationv: function(value) {
    return this._setChannel('hsv', 1, value);
  },
  value: function(value) {
    return this._setChannel('hsv', 2, value);
  },

  /*
   * Methods for the manipulation of an existing color.
   */
  negate: function() {
    var rgb = [],
        i;
    for (i = 0; i < 3; i++) {
      rgb[i] = 255 - this.attributes.rgb[i];
    }
    this._set('rgb', rgb);
    return this;
  },
  lighten: function(ratio) {
    this.attributes.hsl[2] += this.attributes.hsl[2] * (ratio || 0.5);
    this._set('hsl', this.attributes.hsl);
    return this;
  },
  darken: function(ratio) {
    this.attributes.hsl[2] -= this.attributes.hsl[2] * (ratio || 0.5);
    this._set('hsl', this.attributes.hsl);
    return this;
  },
  saturate: function(ratio) {
    this.attributes.hsl[1] += this.attributes.hsl[1] * (ratio || 0.5);
    this._set('hsl', this.attributes.hsl);
    return this;
  },
  desaturate: function(ratio) {
    this.attributes.hsl[1] -= this.attributes.hsl[1] * (ratio || 0.5);
    this._set('hsl', this.attributes.hsl);
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
  _get: function(key) {
    var values = {},
        i;
    if (typeof this.attributes[key] === 'string') {
      return this.attributes[key];
    }
    for (i = 0; i < key.length; i++) {
      values[key[i]] = this.attributes[key][i];
    }
    return values;
  },

  /*
   * Sets a color's value based on a color type. This function then proceeds to
   * convert the color from the type given to all types, and adds these values
   * to the color too. E.g. set('rgb', { r: 20, g: 30, b: 40 }) will firstly
   * set the current color's 'rgb' attribute to [20, 30, 40], and then will
   * proceed to convert and store the value in 'hsl' and 'hsv' formats.
   */
  _set: function(key, value) {
    // Return existing value if value is not specified (getter).
    if (value === undefined) {
      return this._get(key);
    }
    var max = {
      'rgb': [255, 255, 255],
      'hsl': [360, 100, 100],
      'hsv': [360, 100, 100]
    };
    var i;
    if (typeof value === 'string') {
      value = value.replace(/\b\#\w+/g, ''); // Remove # from hex string.
      this.attributes[key] = value;
    } else if (value.length) {
      this.attributes[key] = value.slice(0, key.length);
    } else if (value[key[0]] !== undefined) { // Object, e.g. { r: 255, g: 255, b: 255 }.
      for (i = 0; i < key.length; i++) {
        this.attributes[key][i] = value[key[i]];
      }
    }
    for (var keyName in max) {
      if (max.hasOwnProperty(keyName)) {
        if (keyName !== key) {
          // Bit of a hack. Converts to specific formats with the conversion methods.
          if (typeof conversions[key + '2' + keyName] === 'function') {
            this.attributes[keyName] = conversions[key + '2' + keyName](this.attributes[key]);
          } else {
            this.attributes[keyName] = conversions[keyName + '2' + key](this.attributes[key]);
          }
        }
        // Ensure values don't exceed upper limit.
        for (i = 0; i < keyName.length; i++) {
          var limited = this._scale(this.attributes[keyName][i], 0, max[keyName][i]);
          this.attributes[keyName][i] = Math.round(limited);
        }
      }
    }
    return true;
  },

  /*
   * Sets a color channel with a specific value. This function then proceeds to
   * update all of the other color formats to reflect the new color.
   */
  _setChannel: function(key, index, value) {
    // Return existing value if value is not specified (getter).
    if (value === undefined) {
      return this.attributes[key][index];
    }
    this.attributes[key][index] = value;
    this._set(key, this.attributes[key]);
    return this;
  },

  /*
   * Methods used for parsing colors in string form. E.g. 'rgb(20, 30, 40)'.
   */
  _parseHex: function(color) {
    if (!color) {
      return;
    }
    color = color.replace('#', '');
    var rgb = [0, 0, 0],
        hexShortMatch = color.match(/^([a-fA-F0-9]{3})$/),
        hexMatch = color.match(/^([a-fA-F0-9]{6})$/),
        i;
    if (hexShortMatch) {
      hexShortMatch = hexShortMatch[1];
      for (i = 0; i < rgb.length; i++) {
        rgb[i] = parseInt(hexShortMatch[i] + hexShortMatch[i], 16);
      }
    } else if (hexMatch) {
      hexMatch = hexMatch[1];
      for (i = 0; i < rgb.length; i++) {
        rgb[i] = parseInt(hexMatch.slice(i * 2, i * 2 + 2), 16);
      }
    } else {
      rgb = null;
    }
    if (rgb) {
      for (i = 0; i < rgb.length; i++) {
        rgb[i] = this._scale(rgb[i], 0, 255);
      }
    }
    return rgb;
  },
  _parseRgb: function(color) {
    if (!color) {
      return;
    }
    var rgb = [0, 0, 0],
        rgbMatch = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d\.]+)\s*)?\)$/),
        i;
    if (rgbMatch) {
      for (i = 0; i < rgb.length; i++) {
        rgb[i] = parseInt(rgbMatch[i + 1], 10);
      }
    } else {
      rgb = null;
    }
    if (rgb) {
      for (i = 0; i < rgb.length; i++) {
        rgb[i] = this._scale(rgb[i], 0, 255);
      }
    }
    return rgb;
  },
  _parseHsl: function(color) {
    if (!color) {
      return;
    }
    var hslMatch = color.match(/^hsla?\(\s*(\d+)\s*,\s*([\d\.]+)%\s*,\s*([\d\.]+)%\s*(?:,\s*([\d\.]+)\s*)?\)/);
    if (hslMatch) {
      var h = this._scale(parseInt(hslMatch[1], 10), 0, 360),
          s = this._scale(parseFloat(hslMatch[2]), 0, 100),
          l = this._scale(parseFloat(hslMatch[3]), 0, 100);
      return [h, s, l];
    }
    return null;
  },

  /*
   * Retrieve an array of colors based on the current color. Useful for
   * creating palettes and using related colors.
   */
  triad: function() {
    var hsl = this._get('hsl');
    return [
      new Colorama(hsl),
      new Colorama({ h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l }),
      new Colorama({ h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l })
    ];
  },
  tetrad: function() {
    var hsl = this._get('hsl');
    return [
      new Colorama(hsl),
      new Colorama({ h: (hsl.h + 90) % 360, s: hsl.s, l: hsl.l }),
      new Colorama({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }),
      new Colorama({ h: (hsl.h + 270) % 360, s: hsl.s, l: hsl.l })
    ];
  },
  splitComplement: function() {
    var hsl = this._get('hsl');
    return [
      new Colorama(hsl),
      new Colorama({ h: (hsl.h + 72) % 360, s: hsl.s, l: hsl.l }),
      new Colorama({ h: (hsl.h + 216) % 360, s: hsl.s, l: hsl.l })
    ];
  },
  analogous: function(results, slices) {
    results = results || 6;
    slices = slices || 30;
    var hsl = this._get('hsl'),
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
    var hsv = this._get('hsv');
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
   * Utility methods.
   */
  _scale: function(num, min, max) {
    return Math.min(Math.max(min, num), max);
  },
  clone: function() {
    return new Colorama(this.hex());
  }
};