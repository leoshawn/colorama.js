'use strict';

var conversions = require('./conversions');

module.exports = function(color) {
  return new Colorama(color);
};

function Colorama(color) {
  this.rgb = {
    r: 0,
    g: 0,
    b: 0
  };
  this.formats = ['hex', 'rgb', 'hsl', 'hsv'];
  switch (typeof color) {
  case 'string':
    if (conversions.hexToRgb(color)) {
      this._set('hex', color);
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
  return null;
}

Colorama.prototype = {
  _get: function(key) {
    if (this.formats.indexOf(key) !== -1) {
      if (typeof conversions[key + 'ToRgb'] === 'function') {
        return conversions['rgbTo' + key]();
      }
    }
    throw new Error('Invalid color format specified.');
  },

  // Accepts either string or object
  _set: function(key, value) {
    if (this.formats.indexOf(key) !== -1) {
      if (value === undefined) {
        return this._get(key);
      }
      if (typeof conversions[key + 'ToRgb'] === 'function') {
        this.rgb = conversions[key + 'ToRgb'](value);
      }
      return true;
    }
    throw new Error('Invalid color format specified.');
  },

  _scale: function(num, min, max) {
    return Math.min(Math.max(min, num), max);
  },

  string: function() {
    return this.rgb;
  }
};