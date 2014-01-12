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