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
},{"./conversions":3}],3:[function(require,module,exports){
'use strict';

module.exports = {
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
  }
};
},{}]},{},[1])
;