'use strict';

var conversions = require('./conversions');

module.exports = function(color) {
  return new Colorama(color);
};

function Colorama(color) {
  this.rgb = { r: 0, g: 0, b: 0 };
  this.formats = ['hex', 'rgb', 'hsl', 'hsv'];
  switch (typeof color) {
  case 'string':
    if (this._parseHexString(color)) {
      this._set('hex', this._parseHexString(color));
    } else if (this._parseRgbString(color)) {
      this._set('rgb', this._parseRgbString(color));
    } else if (this._parseHslString(color)) {
      this._set('hsl', this._parseHslString(color));
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

  string: function(format) {
    if (format === undefined) {
      format = 'rgb';
    }
    var color;
    if (format === 'rgb') {
      color = this.rgb;
    } else {
      color = this._get(format);
    }
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

  _get: function(key) {
    if (this.formats.indexOf(key) !== -1) {
      if (typeof conversions['rgbTo' + key.charAt(0).toUpperCase() + key.slice(1)] === 'function') {
        return conversions['rgbTo' + key.charAt(0).toUpperCase() + key.slice(1)](this.rgb);
      }
    }
    return false;
  },

  // Accepts either string (hex) or object
  _set: function(key, value) {
    if (this.formats.indexOf(key) !== -1) {
      if (value === undefined) {
        return this._get(key);
      }
      if (key === 'rgb') {
        this.rgb = value;
        return this.rgb;
      } else {
        if (typeof conversions[key + 'ToRgb'] === 'function') {
          this.rgb = conversions[key + 'ToRgb'](value);
          return this.rgb;
        }
      }
      return false;
    }
    return false;
  },

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
    console.log('hsl');
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

  _scale: function(num, min, max) {
    return Math.min(Math.max(min, num), max);
  }
};