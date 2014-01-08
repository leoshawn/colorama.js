(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
Colorama = require("./lib/colorama");
},{"./lib/colorama":2}],2:[function(require,module,exports){
var Colorama = function(color) {
  this._init(color);
};

Colorama.prototype = {

  _init: function(color) {
    this.values = {
      rgb: [0, 0, 0],
      hsl: [0, 0, 0],
      hsv: [0, 0, 0],
      cmyk: [0, 0, 0, 0]
    }

    switch (typeof color) {
      case 'string':
        if (values = this.getRgb(color))
          this.set('rgb', values);
        else if (values = this.getHsl(color))
          this.set('hsl', values);
        break;
    }
  },

  get: function(key) {
    var values = {};

    for (var i = 0; i < key.length; i++) {
      values[key[i]] = this.values[key][i];
    }
    return values;
  },

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
      this.values[key] = value.slice(0, key.length);
    } else if (value[key[0]] !== undefined) { // Object, e.g. { r: 255, g: 255, b: 255 }.
      for (var i = 0; i < key.length; i++) {
        this.values[key][i] = value[key[i]];
      }
    } else if (value[keys[key][0]] != undefined) { // Object, e.g. { red: 255, green: 255, blue: 255 }.
      var channels = keys[key];
      for (var i = 0; i < key.length; i++) {
        this.values[key][i] = value[channels[i]];
      }
    }

    /* for (var keyName in keys) {
      if (keyName != value)
        this.values[keyName] = convert[key][keyName](this.values[key]);

      // Ensure values don't exceed upper limit.
      for (var i = 0; i < keyName.length; i++) {
        var limited = this.scale(this.values[keyName][i], 0, max[keyName][i]);
        this.values[keyName][i] = Math.round(limited);
      }
    } */

    return true;
  },

  getRgb: function(string) {
    if (!string)
      return;

    var rgb = [0, 0, 0];

    if (match = string.match(/^#([a-fA-F0-9]{3})$/)) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
        rgb[i] = parseInt(match[i] + match[i], 16);
      }
    } else if (match = string.match(/^#([a-fA-F0-9]{6})$/)) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
        rgb[i] = parseInt(match.slice(i * 2, i * 2 + 2), 16);
      }
    } else if (match = string.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d\.]+)\s*)?\)$/)) {
      for (var i = 0; i < rgb.length; i++) {
        rgb[i] = parseInt(match[i + 1]);
      }
    } else if (match = string.match(/^rgba?\(\s*([\d\.]+)\%\s*,\s*([\d\.]+)\%\s*,\s*([\d\.]+)\%\s*(?:,\s*([\d\.]+)\s*)?\)$/)) {
      for (var i = 0; i < rgb.length; i++) {
        rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
      }
    } else {
      rgb = null;
    }

    for (var i = 0; i < rgb.length; i++) {
      rgb[i] = this.scale(rgb[i], 0, 255);
    }

    return rgb;
  },

  scale: function(num, min, max) {
    return Math.min(Math.max(min, num), max);
  },

  convertions: {



  }

}

module.exports = function(color) {
  return new Colorama(color);
};
},{}]},{},[1])