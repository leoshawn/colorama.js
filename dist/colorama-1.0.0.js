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
    // No need to parse hex color as it is already a string.
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

  // Accepts either string (hex) or object
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

var conversions = {
  hexToRgb: function(color) {
    if (color === undefined) {
      return;
    }
    if (typeof color === 'string') {
      color = color.replace('#', '');
      if (color.length < 6) {
        color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
      }
      var r = parseInt(color.substring(0, 2), 16),
          g = parseInt(color.substring(2, 4), 16),
          b = parseInt(color.substring(4, 6), 16);
      return { r: r, g: g, b: b };
    }
    throw new Error('Invalid hex color specified.');
  },
  hsvToRgb: function(color) {
    if (color === undefined) {
      return;
    }
    var rgb = {},
        var_r,
        var_g,
        var_b;
    color.h = color.h / 360;
    if (color.s === 0) {
      rgb['r'] = color.v * 255;
      rgb['g'] = color.v * 255;
      rgb['b'] = color.v * 255;
    } else {
      var var_h = color.h * 6;
      if (var_h === 6) {
        var_h = 0;
      }
      var var_i = parseInt(var_h);
      var var_1 = color.v * (1 - color.s);
      var var_2 = color.v * (1 - color.s * (var_h - var_i));
      var var_3 = color.v * (1 - color.s * (1 - (var_h - var_i)));
      if (var_i == 0) {
        var_r = color.v;
        var_g = var_3;
        var_b = var_1;
      } else if (var_i === 1) {
        var_r = var_2;
        var_g = color.v;
        var_b = var_1;
      } else if (var_i === 2) {
        var_r = var_1;
        var_g = color.v;
        var_b = var_3;
      } else if (var_i === 3) {
        var_r = var_1;
        var_g = var_2;
        var_b = color.v;
      } else if (var_i === 4) {
        var_r = var_3;
        var_g = var_1;
        var_b = color.v
      } else {
        var_r = color.v;
        var_g = var_1;
        var_b = var_2;
      }
      rgb['r'] = Math.round(var_r * 255);
      rgb['g'] = Math.round(var_g * 255);
      rgb['b'] = Math.round(var_b * 255);
    }
    rgb.r = Math.round(rgb.r);
    rgb.g = Math.round(rgb.g);
    rgb.b = Math.round(rgb.b);
    return rgb;
  }
};
},{}]},{},[1])
;